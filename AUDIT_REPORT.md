# SatQuery AI Repository Truth Audit

**Audit date:** 2026-09-09  
**Scope:** backend, frontend, models, pipelines, evidence, tests, demo scripts, and evaluation artifacts.

## Executive summary

The repository contains a substantial prototype with useful geospatial and API components, but it does not yet satisfy the master build specification's production or scientific-integrity requirements. The most serious defects were fabricated fallback outputs and conflation of routing/model/evidence confidence. Safe P0 hardening has been applied to prevent unsupported claims from becoming numeric results.

## Findings

| Severity | Location | Finding | Remediation | Status |
|---|---|---|---|---|
| P0 | `backend/models/geochat/adapter.py` | Offline grounding returned keyword-selected static boxes and fixed confidence. | Return an empty detection set, `unsupported=true`, and `model_confidence=null` unless a real image-conditioned runtime produces output. | Fixed |
| P0 | `backend/models/geochat/adapter.py` | GeoChat generation assigned fixed `0.90` confidence. | Confidence is now `null`; decoding success is not a calibrated probability. | Fixed |
| P0 | `backend/pipelines/optical_sar.py` | Registration defaulted to `iou_score = 0.92` when bounds were absent. | Missing or malformed geometry now yields `None`, warning, and invalid registration. | Fixed |
| P0 | `backend/models/dofa/adapter.py` | Non-TIFF inputs returned fixed spectral/SAR statistics. | Unsupported formats now return explicit unsupported metadata and null measurements. | Fixed |
| P0 | `backend/evidence/confidence.py` | Missing model/registration evidence could be replaced by composite scores. | Confidence functions now preserve unknown values and return `overall=null` when required evidence is absent. | Fixed |
| P1 | `backend/evidence/contract.py` | Factory default reliability factors and score (`0.85`) are not evidence-derived. | Replace defaults with required explicit inputs or an unknown state in the next change. | Open |
| P1 | `backend/pipelines/single_image.py` | Pipeline defaulted missing VLM confidence to `0.85`. | Removed; pipeline now passes `null` through. | Fixed |
| P1 | `backend/models/registry.py` | Registry exposes minimal metadata and uses multiple naming conventions. | Canonical registry schema and model lifecycle metadata still required. | Open |
| P1 | `backend/models/geochat/adapter.py` | Generic Transformers loading and tokenization do not yet prove official GeoChat image-token/vision-tower compatibility. | Install and verify the official implementation/checkpoint on a suitable host before marking READY. | Open |
| P1 | `backend/models/sam/adapter.py` | GrabCut/Otsu fallback assigns fixed confidence values and creates a box-shaped mask when neural SAM is unavailable. | Fallback must be explicitly deterministic segmentation with confidence null, or unsupported for grounding claims. | Open |
| P1 | `backend/models/change`, `scripts/train_changenet_synthetic.py` | Synthetic training fixtures/scripts exist alongside production evaluation paths. | Keep synthetic data test-only and prevent it from entering benchmark metrics/manifests. | Open |
| P1 | `apps/web/src/lib/geospatial.ts` and related UI code | Frontend geospatial utilities require a full audit to ensure they only render backend scientific values. | Audit and add contract tests before production use. | Open |
| P2 | `tests/fixtures/*synthetic*`, `scripts/run_offline_demo.py` | Synthetic/demo data is present and useful for tests, but must be labelled and isolated. | Add explicit `synthetic=true` metadata and reject it in production benchmark/evidence paths. | Open |

## Repository search evidence

The initial search found occurrences in `backend/models/sam/adapter.py`, `backend/evidence/gate.py`, `backend/evidence/contract.py`, `backend/pipelines/single_image.py`, `backend/pipelines/optical_sar.py`, `backend/models/dofa/adapter.py`, synthetic training scripts, and synthetic test fixtures. Fixed constants found included `0.85`, `0.88`, `0.92`, and `0.94` in paths that can be mistaken for scientific confidence or registration evidence.

## Exact blockers

1. No verified GeoChat checkpoint is present in the repository; real image-conditioned inference cannot be claimed.
2. The current environment does not have `pytest` installed, so the complete suite could not be executed during this pass.
3. A production-ready model registry, checkpoint manifest, official GeoChat runtime verification, LEVIR-CD training/evaluation, and BigEarthNet optical-SAR provenance are not present.
4. The frontend, report generator, SAM fallback, and all evidence factories require additional contract hardening before the system can claim full single-computation-path compliance.

## Safe P0 changes completed

Unsupported or unverified paths now return explicit unknown/unsupported states rather than fabricated boxes, measurements, confidence, or registration IoU. This is intentionally conservative: it may reduce demo output, but it prevents the UI and reports from presenting invented scientific evidence.

## Verification note

The repository was cloned successfully from the selected GitHub integration repository. A baseline test command was attempted, but `pytest` is not installed in the environment. No claim of complete test-suite success is made.
