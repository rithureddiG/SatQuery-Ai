# SatQuery AI Architecture

## Target execution invariant

```text
USER QUERY
  -> query normalizer / intent classifier
  -> capability planner
  -> source and modality resolver
  -> specialist model or deterministic GIS engine
  -> canonical result
  -> evidence contract
  -> evidence gate (ANSWER | QUALIFY | ABSTAIN)
  -> response, map, and report
```

The language model may interpret imagery and select tools. It must not estimate exact area, distance, indices, overlap, or other scientific measurements. Deterministic engines calculate those values from validated source assets. The frontend renders backend geometry and measurements; it must not invent scientific values.

## Runtime states

A model is not `READY` merely because an adapter exists. `READY` requires a verified checkpoint, successful loading, and a successful inference/health check. Until then, the adapter must expose an explicit unavailable, fallback, or untrained state. Fallback output is never equivalent to a trained model output.

## Evidence contract

Each analytical result should carry source asset identifiers, query and task, selected tool/model, dataset and experiment references when applicable, geometry, raw and derived measurements, units, evidence items, uncertainty, provenance, execution mode, runtime timings, input/output hashes, and replay identifiers. Missing evidence is represented by `null`; it is not replaced by a default score.

## Specialist boundaries

| Capability | Primary owner | Scientific responsibility |
|---|---|---|
| VQA, captioning, scene interpretation | Verified GeoChat runtime | Perception and language only |
| Grounding | Verified grounding-capable model/SAM | Produce only model-derived detections |
| Temporal change | ChangeNet plus vectorizer | Predict change; GIS calculates area |
| Optical/SAR representation | Verified DOFA/fusion runtime or deterministic corroboration | Validate alignment and modality provenance |
| Water/vegetation/built-up indices | Raster/GIS engines | Metadata-aware bands, masks, thresholds, measurements |
| Area/distance/ranking | Projected/geodesic GIS engines | Exact scientific computation |
| Truth decision | Evidence gate | ANSWER, QUALIFY, or ABSTAIN based on explicit evidence |

## Current boundary after P0 hardening

The repository can run deterministic paths for supported raster inputs and can represent explicit offline/unavailable states. It cannot yet claim real GeoChat, ChangeNet, DOFA, or SAM production readiness because checkpoints, official runtime verification, manifests, and benchmark results are incomplete. The conservative behavior is deliberate: unsupported input produces unknown values and an abstention/qualification path rather than synthetic evidence.

## Next implementation sequence

1. Make `EvidenceContract` require explicit provenance and remove default reliability values.
2. Replace the minimal registry with one canonical record per model, including checkpoint hash, source URI, device, precision, health, and evaluation status.
3. Install the official GeoChat implementation and verify image-conditioned inference on real images before registering `READY`.
4. Isolate synthetic fixtures from benchmark/evaluation manifests and mark them as test-only.
5. Harden SAM fallback and all report/frontend contracts against fabricated geometry or confidence.
6. Add tests for unknown evidence, source validation, replay hashes, checkpoint readiness, and frontend/backend contract compliance.
