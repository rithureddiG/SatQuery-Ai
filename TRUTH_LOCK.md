# Truth Lock

Release is blocked when any of the following is true: a required model or checkpoint is missing; checkpoint hash is absent; a synthetic observation enters production; an unknown observation is represented as real; the frontend generates a measurement; a claim lacks source evidence; a cross-modal claim lacks a second modality; benchmark labels leak into tuning; CRS or geometry is invalid; or a deterministic score is labeled as calibrated probability without a held-out calibration experiment.

Current state is intentionally non-release-ready for learned-model claims. GeoChat VQA and grounding fail closed with HTTP 503 when the official checkpoint is unavailable. Provider failures must return `NO_DATA` or `PROVIDER_UNAVAILABLE`; they must never construct substitute Sentinel or Landsat records.

Deterministic water ranking is available on verified raster assets and is not a learned-model benchmark claim. Its measurements remain evidence-derived and geometry-bound.
