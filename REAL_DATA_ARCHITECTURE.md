# Real-Data Architecture

SatQuery uses a single canonical data plane:

`place/coordinate → provider geocoder → AOI → provider STAC observation → verified asset → analysis engine → evidence contract → truth gate → UI/report`

Only provider-returned observations or user-uploaded, validated assets may enter the observation registry. Frontend components, chat handlers, demo helpers, and fallback branches cannot create Sentinel, Landsat, or SAR observations.

The language layer normalizes queries, classifies intent, selects tools, and summarizes evidence. It does not calculate area, distance, spectral indices, raster statistics, IoU, or change area. Deterministic GIS engines perform those measurements and attach source, method, units, geometry, and parameters.

A result is releasable only when its mission identity, source observations, tool chain, evidence, and model status pass the truth gate. Missing checkpoints, provider failures, invalid CRS, invalid geometry, unsupported modalities, and uncalibrated probabilities produce an explicit unavailable or abstained result.
