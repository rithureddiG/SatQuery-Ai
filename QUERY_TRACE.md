# SatQuery AI Query Trace

## Canonical execution path

The browser submits the query and selected verified image IDs to `POST /api/v1/query`. The Next.js route is a transport proxy only; it does not classify, calculate, synthesize geometry, or create findings. FastAPI validates the image records and passes the request to `AgentOrchestrator`.

`MissionParser` evaluates explicit linguistic semantics before workspace context. Ranking language such as “largest”, “biggest”, or “which water body is largest” is classified as `spatial_ranking` when a water or built-up target is present. Asset count and active visualization mode cannot override this explicit intent.

For water ranking, the orchestrator creates an immutable mission plan containing `spatial_ranking`, `water_body`, `largest`, and `area`, then executes `WaterBodyAnalyzer`. The analyzer validates Green and SWIR availability, masks nodata, computes MNDWI, extracts connected components, vectorizes geometries, transforms them to WGS84, calculates geodesic area, ranks candidates, and passes the result through the evidence contract. ChangeNet and SAR are not part of this tool chain unless explicitly requested by another query.

The API returns the canonical result with `mission_id`, `query_hash`, `result_hash`, `mission_plan`, candidate geometry, selected winner, measured area, evidence, and execution steps. The frontend consumes these fields and renders backend geometry directly. It does not generate analytical polygons, confidence values, areas, or findings locally. If no verified backend result exists, the UI displays no finding rather than a stale or synthetic result.

## Guardrails

`validate_result_against_mission()` rejects mission/result target or intent mismatches. `validate_tool_for_mission()` rejects ChangeNet and SAR-corroboration tools when the mission is spatial ranking. Unknown model confidence is represented as `N/A` or `null`; deterministic segmentation does not claim calibration.
