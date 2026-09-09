"""CRS inspection, validation, and coordinate reference management."""
from dataclasses import dataclass
from typing import Optional, Dict, Any
try:
    import rasterio.crs
    import pyproj
    HAS_GEO = True
except ImportError:
    HAS_GEO = False

@dataclass
class CRSInfo:
    present: bool
    valid: bool
    epsg: Optional[int]
    name: Optional[str]
    crs_type: str
    status: str
    wkt: Optional[str] = None
    proj4: Optional[str] = None
    units: Optional[str] = None
    def to_dict(self) -> Dict[str, Any]:
        return {"present": self.present, "valid": self.valid, "epsg": self.epsg, "name": self.name, "type": self.crs_type, "status": self.status, "units": self.units}

def inspect_crs(crs_input: Any) -> CRSInfo:
    if crs_input is None:
        return CRSInfo(False, False, None, None, "missing", "warning")
    try:
        if HAS_GEO:
            source = pyproj.CRS.from_user_input(crs_input)
            epsg = source.to_epsg()
            is_projected = source.is_projected
            name = f"EPSG:{epsg} ({source.name})" if epsg else source.name
            units = source.axis_info[0].unit_name if source.axis_info else ("metre" if is_projected else "degree")
            return CRSInfo(True, True, epsg, name, "projected" if is_projected else "geographic" if source.is_geographic else "unknown", "ok", source.to_wkt(), source.to_proj4(), units)
        text = str(crs_input)
        epsg = int(text.upper().split("EPSG:")[-1].split()[0]) if "EPSG:" in text.upper() else None
        return CRSInfo(True, True, epsg, text, "projected" if epsg and epsg != 4326 else "geographic", "ok", units="metre" if epsg and epsg != 4326 else "degree")
    except Exception as exc:
        return CRSInfo(True, False, None, str(crs_input), "unknown", "warning", wkt=str(exc))

def detect_crs_from_tags(tags: Dict[str, Any]) -> CRSInfo:
    return inspect_crs(tags.get("CRS") or tags.get("crs") or tags.get("EPSG") or tags.get("epsg"))

def is_projected_crs(crs_input: Any) -> bool:
    return inspect_crs(crs_input).crs_type == "projected" and inspect_crs(crs_input).valid

def reproject_bounds_wgs84(bounds: Dict[str, float], crs_input: Any) -> Dict[str, float]:
    if not bounds:
        raise ValueError("Bounds are required")
    if not HAS_GEO:
        raise RuntimeError("pyproj is required for reprojection")
    source = pyproj.CRS.from_user_input(crs_input)
    transformer = pyproj.Transformer.from_crs(source, pyproj.CRS.from_epsg(4326), always_xy=True)
    corners = [transformer.transform(bounds["min_x"], bounds["min_y"]), transformer.transform(bounds["max_x"], bounds["max_y"])]
    return {"min_lon": min(c[0] for c in corners), "min_lat": min(c[1] for c in corners), "max_lon": max(c[0] for c in corners), "max_lat": max(c[1] for c in corners)}
