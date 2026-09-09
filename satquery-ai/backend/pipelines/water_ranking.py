"""Evidence-first water-body detection and spatial ranking."""
from __future__ import annotations

import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import rasterio
from pyproj import Geod, Transformer
from rasterio.features import shapes
from shapely.geometry import shape, mapping
from shapely.ops import transform as shapely_transform

from ..models_db import ImageRecord, AnalysisJob
from ..evidence import build_evidence, ExecutionStep, compute_vqa_confidence


def _band_indices(ds) -> tuple[int, int, str]:
    """Return zero-based green/SWIR bands and method, or raise reduced capability."""
    if ds.count >= 5:
        return 1, 4, "MNDWI"
    raise ValueError("REDUCED_CAPABILITY: water-body analysis requires Green and SWIR bands (at least 5 bands).")


def run_water_ranking_pipeline(image_ids: List[str], db, query: str, operation: str = "largest", mission_id: Optional[str] = None) -> Dict[str, Any]:
    start = time.perf_counter()
    rows = [db.get(ImageRecord, image_id) for image_id in image_ids]
    rows = [row for row in rows if row is not None]
    if not rows:
        raise ValueError("No valid imagery supplied for water-body ranking.")

    candidates: List[Dict[str, Any]] = []
    steps: List[ExecutionStep] = []
    for row in rows:
        path = Path(row.path)
        if not path.exists():
            raise FileNotFoundError(f"Image raster not found: {path}")
        with rasterio.open(path) as ds:
            green_idx, swir_idx, method = _band_indices(ds)
            green = ds.read(green_idx + 1).astype(np.float32)
            swir = ds.read(swir_idx + 1).astype(np.float32)
            nodata = ds.nodata
            valid = np.isfinite(green) & np.isfinite(swir)
            if nodata is not None:
                valid &= (green != nodata) & (swir != nodata)
            denominator = green + swir
            index = np.zeros_like(green, dtype=np.float32)
            np.divide(green - swir, denominator, out=index, where=denominator != 0)
            water_mask = valid & (index > 0.0)
            transform = ds.transform
            crs = ds.crs
            width, height = ds.width, ds.height
            if crs is None:
                raise ValueError("REDUCED_CAPABILITY: water-body geometry requires a georeferenced CRS.")
            to_wgs84 = Transformer.from_crs(crs, "EPSG:4326", always_xy=True).transform
            geod = Geod(ellps="WGS84")
            for geom_json, value in shapes(water_mask.astype(np.uint8), mask=water_mask, transform=transform):
                if value != 1:
                    continue
                geom = shape(geom_json)
                if geom.is_empty or geom.area <= 0:
                    continue
                geom_wgs84 = shapely_transform(to_wgs84, geom)
                area_m2 = abs(geod.geometry_area_perimeter(geom_wgs84)[0])
                if area_m2 < max(100.0, abs(transform.a * transform.e) * 4):
                    continue
                centroid = geom_wgs84.centroid
                minx, miny, maxx, maxy = geom_wgs84.bounds
                candidates.append({
                    "source_image_id": row.id,
                    "source_filename": row.filename,
                    "area_m2": round(float(area_m2), 3),
                    "area_ha": round(float(area_m2 / 10000.0), 5),
                    "centroid": {"lon": round(centroid.x, 7), "lat": round(centroid.y, 7)},
                    "bbox": {"min_lon": minx, "min_lat": miny, "max_lon": maxx, "max_lat": maxy},
                    "geometry": mapping(geom_wgs84),
                    "method": method,
                    "crs": "EPSG:4326",
                })
            steps.append(ExecutionStep(step_number=len(steps) + 1, tool="WaterBodyAnalyzer", description=f"Validated {row.filename} with {method} and vectorized water candidates", status="completed", duration_ms=int((time.perf_counter() - start) * 1000), model="Deterministic WaterBodyAnalyzer", output_summary=f"Candidates from source: {sum(1 for c in candidates if c['source_image_id'] == row.id)}"))

    candidates.sort(key=lambda item: item["area_m2"], reverse=True)
    for idx, candidate in enumerate(candidates, start=1):
        candidate["rank"] = idx
    winner = candidates[0] if candidates else None
    features = [{"type": "Feature", "id": f"water_candidate_{c['rank']}", "properties": {k: v for k, v in c.items() if k not in ("geometry",)}, "geometry": c["geometry"]} for c in candidates]
    feature_collection = {"type": "FeatureCollection", "features": features}
    job_id = f"job_water_{uuid.uuid4().hex[:10]}"
    mission_id = mission_id or f"msn_{uuid.uuid4().hex[:10]}"
    claim = (f"Largest detected water body covers {winner['area_ha']} ha in {winner['source_filename']}." if winner else "No valid water-body candidate was detected.")
    confidence = compute_vqa_confidence(model_confidence=None, x_res=10.0, y_res=10.0)
    evidence = build_evidence(claim=claim, source_analysis_id=job_id, source_image_ids=[c["source_image_id"] for c in candidates], model_used="deterministic_water_body_analyzer", confidence=confidence, output_geometry=feature_collection, execution_steps=steps, artifacts=[])
    result = {"query": query, "intent": "spatial_ranking", "target": "water_body", "operation": operation, "measurement": "area", "mission_id": mission_id, "job_id": job_id, "answer": claim, "winner": winner, "candidates": candidates, "regions_geojson": feature_collection, "method": "MNDWI → threshold → connected components → vectorization → WGS84 geodesic area", "model": "Deterministic WaterBodyAnalyzer", "confidence": confidence.to_dict(), "evidence": evidence.to_dict(), "execution_steps": [s.to_dict() for s in steps], "warnings": [] if candidates else ["No water body satisfied the spectral and minimum-area evidence gate."], "total_duration_ms": int((time.perf_counter() - start) * 1000)}
    db.add(AnalysisJob(id=job_id, aoi_id=winner and next((r.aoi_id for r in rows if r.id == winner["source_image_id"]), None), task="spatial_ranking", status="completed", question=query, result=result, confidence=None))
    db.commit()
    return result
