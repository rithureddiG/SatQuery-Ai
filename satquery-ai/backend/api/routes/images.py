"""Image ingestion, inspection, and preview routes."""

from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ...db import get_db
from ...models_db import ImageRecord
from ...config import settings
from ...geospatial import (
    extract_raster_metadata,
    validate_file_path,
    validate_raster_metadata,
    ValidationResult,
)
from ...assets import InputSanitizer, AssetFactory, CompatibilityEngine
from ...storage import storage_manager, generate_raster_preview
from ..schemas import (
    ImageInspectionResponse,
    ValidationResultSchema,
    PreviewInfoSchema,
    RasterMetadataSchema,
    CompatibilityCheckRequest,
    CompatibilityReportSchema,
)

router = APIRouter(prefix="/api/v1/images", tags=["images"])


@router.post("/inspect", response_model=ImageInspectionResponse)
async def inspect_image(
    file: UploadFile = File(...),
    aoi_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Upload and inspect a GeoTIFF or satellite image, extracting metadata, CRS, and generating a preview."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    image_id = storage_manager.generate_image_id()

    try:
        # 1. Save uploaded file safely
        saved_path = storage_manager.save_upload_file(file, image_id)

        # 2. Input sanitization & security checks
        sanitizer = InputSanitizer()
        san_res = sanitizer.sanitize(saved_path, original_filename=file.filename)
        if not san_res.safe:
            return ImageInspectionResponse(
                id=image_id,
                status="invalid",
                metadata=None,
                validation=ValidationResultSchema(
                    valid=False,
                    warnings=san_res.warnings,
                    errors=san_res.errors,
                ),
                preview=PreviewInfoSchema(available=False),
            )

        # 3. Path validation check
        path_validation = validate_file_path(saved_path, max_size_mb=settings.max_upload_size_mb)
        if not path_validation.valid:
            return ImageInspectionResponse(
                id=image_id,
                status="invalid",
                metadata=None,
                validation=ValidationResultSchema(
                    valid=False,
                    warnings=path_validation.warnings + san_res.warnings,
                    errors=path_validation.errors + san_res.errors,
                ),
                preview=PreviewInfoSchema(available=False),
            )

        # 4. Extract comprehensive raster metadata & EarthObservationAsset descriptor
        eo_asset_dict = None
        try:
            eo_asset = AssetFactory.from_file(saved_path, image_id)
            eo_asset_dict = eo_asset.to_dict()
        except Exception as e:
            san_res.warnings.append(f"EOAsset descriptor extraction notice: {str(e)}")

        try:
            metadata = extract_raster_metadata(saved_path)
        except Exception as e:
            return ImageInspectionResponse(
                id=image_id,
                status="error",
                metadata=None,
                validation=ValidationResultSchema(
                    valid=False,
                    warnings=san_res.warnings,
                    errors=[f"Raster parsing failed: {str(e)}"],
                ),
                preview=PreviewInfoSchema(available=False),
            )

        # 5. Validate extracted metadata
        raster_validation = validate_raster_metadata(metadata)
        combined_warnings = path_validation.warnings + raster_validation.warnings + san_res.warnings
        combined_errors = path_validation.errors + raster_validation.errors + san_res.errors

        # 6. Generate Web-compatible preview PNG
        preview_path = storage_manager.get_preview_path(image_id)
        preview_available = False
        try:
            generate_raster_preview(saved_path, preview_path)
            preview_available = preview_path.exists()
        except Exception as e:
            combined_warnings.append(f"Preview generation failed: {str(e)}")

        preview_url = f"/api/v1/images/{image_id}/preview" if preview_available else None

        # 7. Store metadata & asset record in database
        meta_dict = metadata.to_dict()
        if eo_asset_dict:
            meta_dict["asset_descriptor"] = eo_asset_dict

        db_image = ImageRecord(
            id=image_id,
            aoi_id=aoi_id,
            filename=file.filename,
            path=str(saved_path.resolve()),
            preview_path=str(preview_path.resolve()) if preview_available else None,
            format=metadata.format,
            modality=metadata.modality.modality,
            width=metadata.width,
            height=metadata.height,
            band_count=metadata.band_count,
            dtype=metadata.dtype,
            crs=metadata.crs.name,
            epsg=metadata.crs.epsg,
            bounds=metadata.bounds.wgs84 if metadata.bounds else None,
            resolution={
                "x_res": metadata.resolution.x_res,
                "y_res": metadata.resolution.y_res,
                "units": metadata.resolution.units,
            },
            metadata_json=meta_dict,
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        return ImageInspectionResponse(
            id=image_id,
            status="ready" if raster_validation.valid else "invalid",
            metadata=RasterMetadataSchema(**metadata.to_dict()),
            validation=ValidationResultSchema(
                valid=raster_validation.valid,
                warnings=combined_warnings,
                errors=combined_errors,
            ),
            preview=PreviewInfoSchema(
                available=preview_available,
                preview_url=preview_url,
            ),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error processing image: {str(e)}",
        )


@router.post("/compatibility", response_model=CompatibilityReportSchema)
def check_images_compatibility(
    req: CompatibilityCheckRequest,
    db: Session = Depends(get_db),
):
    """Validate scientific compatibility between two EO assets (spatial overlap, CRS, resolution, modality)."""
    img1 = db.get(ImageRecord, req.image_id_1)
    if not img1:
        raise HTTPException(status_code=404, detail=f"Image 1 not found: {req.image_id_1}")
    img2 = db.get(ImageRecord, req.image_id_2)
    if not img2:
        raise HTTPException(status_code=404, detail=f"Image 2 not found: {req.image_id_2}")

    try:
        asset1 = AssetFactory.from_file(Path(img1.path), img1.id)
        asset2 = AssetFactory.from_file(Path(img2.path), img2.id)

        engine = CompatibilityEngine()
        report = engine.check_compatibility(asset1, asset2, intended_task=req.intended_task or "change_detection")

        return CompatibilityReportSchema(
            compatible=report.compatible,
            overall_score=report.overall_score,
            spatial_overlap=report.spatial_overlap,
            crs_compatible=report.crs_compatible,
            crs_same=report.crs_same,
            resolution_ratio=report.resolution_ratio,
            resolution_compatible=report.resolution_compatible,
            temporal_gap_days=report.temporal_gap_days,
            modality_pair=report.modality_pair,
            warnings=report.warnings,
            errors=report.errors,
            recommendations=report.recommendations,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check compatibility: {str(e)}",
        )


@router.get("/{image_id}/preview")
def get_image_preview(image_id: str):
    """Serve the generated web preview PNG for a given image ID."""
    preview_path = storage_manager.get_preview_path(image_id)
    if not preview_path.exists():
        raise HTTPException(status_code=404, detail="Preview image not found")
    return FileResponse(preview_path, media_type="image/png")


@router.get("/{image_id}")
def get_image_metadata(image_id: str, db: Session = Depends(get_db)):
    """Retrieve metadata record for an image."""
    db_image = db.get(ImageRecord, image_id)
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    return {
        "id": db_image.id,
        "filename": db_image.filename,
        "format": db_image.format,
        "modality": db_image.modality,
        "width": db_image.width,
        "height": db_image.height,
        "band_count": db_image.band_count,
        "dtype": db_image.dtype,
        "crs": db_image.crs,
        "epsg": db_image.epsg,
        "bounds": db_image.bounds,
        "resolution": db_image.resolution,
        "metadata": db_image.metadata_json,
        "created_at": db_image.created_at,
    }


@router.get("")
def list_images(db: Session = Depends(get_db)):
    """List all ingested images."""
    images = db.query(ImageRecord).order_by(ImageRecord.created_at.desc()).limit(50).all()
    return [
        {
            "id": img.id,
            "filename": img.filename,
            "format": img.format,
            "modality": img.modality,
            "width": img.width,
            "height": img.height,
            "band_count": img.band_count,
            "crs": img.crs,
            "preview_url": f"/api/v1/images/{img.id}/preview" if img.preview_path else None,
            "created_at": img.created_at,
        }
        for img in images
    ]
