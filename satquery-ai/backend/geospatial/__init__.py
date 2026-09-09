"""Geospatial core module for SatQuery AI."""

from .crs import inspect_crs, CRSInfo, detect_crs_from_tags, is_projected_crs, reproject_bounds_wgs84
from .raster import (
    compute_band_stats,
    detect_modality,
    BandStatistics,
    ModalityDetection,
    compute_ndvi,
    compute_ndwi,
    compute_ndbi,
    compute_sar_backscatter_sigma0,
)
from .metadata import extract_raster_metadata, RasterMetadata, BoundingBox, SpatialResolution
from .validation import validate_file_path, validate_raster_metadata, ValidationResult
from .geometry import pixel_to_coords, coords_to_pixel, bbox_to_geojson_polygon
from .tiling import generate_raster_tiles, RasterTileWindow
from .registration import align_image_pairs
from .isro_formats import detect_isro_sensor, get_isro_sensor_catalog, ISROSensorProfile
from .sar_processor import SARProcessor

__all__ = [
    "inspect_crs",
    "CRSInfo",
    "detect_crs_from_tags",
    "is_projected_crs",
    "reproject_bounds_wgs84",
    "compute_band_stats",
    "detect_modality",
    "BandStatistics",
    "ModalityDetection",
    "compute_ndvi",
    "compute_ndwi",
    "compute_ndbi",
    "compute_sar_backscatter_sigma0",
    "extract_raster_metadata",
    "RasterMetadata",
    "BoundingBox",
    "SpatialResolution",
    "validate_file_path",
    "validate_raster_metadata",
    "ValidationResult",
    "pixel_to_coords",
    "coords_to_pixel",
    "bbox_to_geojson_polygon",
    "generate_raster_tiles",
    "RasterTileWindow",
    "align_image_pairs",
    "detect_isro_sensor",
    "get_isro_sensor_catalog",
    "ISROSensorProfile",
    "SARProcessor",
]
