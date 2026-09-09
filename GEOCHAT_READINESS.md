# GeoChat Readiness Audit

**Audit date:** 2026-09-09

## Result

GeoChat is **registered in the model registry but not connected for real inference**. The adapter is present and the VQA/grounding routes can resolve the `geochat_7b` adapter, but no checkpoint is installed or loaded.

| Check | Result |
|---|---|
| Registry entry | Present as `geochat_7b` and alias `geochat` |
| Adapter health | `checkpoint_missing` |
| Model loaded | No |
| Checkpoint directory | `/home/ubuntu/SatQuery-Ai/checkpoints/geochat` |
| Checkpoint present | No |
| `transformers` installed | No |
| `accelerate` installed | No |
| `bitsandbytes` installed | No |
| RSVQA-HR configured dataset path | `data/benchmarks/rsvqa_hr` |
| RSVQA-HR dataset present | No |
| Training metadata | None |
| Evaluation metrics | None |
| Strict-real inference | Correctly refuses with a missing-checkpoint error |

The repository contains an experiment configuration for an RSVQA-HR baseline and a historical smoke-test JSON, but that JSON explicitly records `is_real_weights_resident: false` and `status: ready_for_checkpoint_activation`. It is not evidence that GeoChat was trained or that weights are currently resident.

## Current behavior

Without a checkpoint, non-strict development calls return an explicitly labeled offline response with `fallback_used: true`, `is_real_weights: false`, and no fabricated confidence. Strict-real calls fail rather than pretending to answer from a model.

## Required activation steps

Install the model runtime dependencies, obtain the authorized `MBZUAI/geochat-7b` checkpoint, place or configure it at the checkpoint directory, obtain the declared RSVQA-HR dataset, run the evaluation/training workflow, and record checkpoint hash, dataset identity, experiment ID, commit, and metrics in the model registry. Only after those checks pass should the adapter status be changed to ready.
