# Model Registry

The runtime registry is canonical. A model may be labeled `READY` only when its checkpoint exists, hash is recorded, runtime loads, supported inference works on a real image, and evaluation provenance is available.

| Model | Tasks | Current status | Blocker |
|---|---|---|---|
| `geochat_7b` | VQA, grounding, captioning | `CHECKPOINT_MISSING` | Official checkpoint, runtime dependencies, image-conditioning verification |
| `changenet` | Temporal change detection | `UNVERIFIED` | Real LEVIR-CD checkpoint and blind evaluation |
| `dofa` | Optical/SAR representation | `UNVERIFIED` | Official checkpoint and cross-modal validation |
| `sam_rs` | Segmentation/grounding refinement | `UNVERIFIED` | Verified checkpoint and image-conditioned evaluation |
| `sar_calibrator` | SAR calibration | `UNVERIFIED` | Calibrated model and held-out validation |

Every future registration must include model ID, version, source, checkpoint path, SHA-256, dataset ID, experiment ID, code commit, configuration hash, runtime, device, precision, supported tasks, health, and evaluation status. Deterministic corroboration is not a learned-model readiness claim.
