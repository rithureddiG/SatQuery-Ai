# SatQuery AI Result Contract

Every completed analytical result must identify the mission that produced it and expose the evidence used to derive it.

| Field | Requirement |
|---|---|
| `mission_id` | Immutable identifier from the mission plan. |
| `query_hash` | SHA-256 hash of normalized query text. |
| `result_hash` | Hash of the selected result/winner payload. |
| `intent` | Semantic intent selected by the backend planner. |
| `target` | Physical target, such as `water_body` or `built_up`. |
| `operation` | Requested operation, such as `largest`. |
| `measurement` | Metric used for ranking, such as `area`. |
| `mission_plan` | Immutable plan and declared tool chain. |
| `regions_geojson` | Backend-produced result geometry only. |
| `winner` | Selected candidate with source, area, centroid, bounding box, and geometry. |
| `candidates` | All evidence-gated candidates in rank order. |
| `evidence` | Evidence object with execution steps and source references. |
| `confidence` | Measured score, or `null`/`N/A` when calibration or model probability is unavailable. |

The frontend must not create fallback polygons, rectangles, area values, model confidence, calibration claims, source assets, or finding titles. AOI geometry, result geometry, and evidence geometry are separate concepts. A result from an earlier mission must not be displayed for a later query.

For a water-ranking mission, the minimum canonical tool chain is `WaterBodyAnalyzer → SpatialRanking → GeodesicArea → EvidenceGate`. A result claiming temporal change, ChangeNet, or SAR corroboration for this mission is invalid and must be rejected.
