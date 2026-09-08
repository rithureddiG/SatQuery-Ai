#!/usr/bin/env bash
set -e

echo "=== SatQuery AI: Staging and Pushing 6 Commits ==="

# Commit 1: Scientific truth purge & canonical EvidenceContract authority
echo -e "\n[1/6] Committing Scientific Truth Purge & Canonical EvidenceContract..."
git add satquery-ai/apps/web/next.config.js
git add satquery-ai/backend/evidence/contract.py
git add satquery-ai/backend/models_db.py
git add satquery-ai/backend/reports/generator.py
git add satquery-ai/backend/assets/descriptor.py
git add satquery-ai/backend/geospatial/registration.py
git add satquery-ai/backend/api/routes/__init__.py
git commit -m "fix(core): purge mock routes, enforce EvidenceContract authority and truthful fallback states"

# Commit 2: Real Model Registry & Checkpoint Verification Harness
echo -e "\n[2/6] Committing Real Model Registry & Verification Harness..."
git add satquery-ai/backend/models/registry.py
git add satquery-ai/backend/api/routes/models.py
git add satquery-ai/scripts/verify_models.py
git add satquery-ai/models_manifest.json
git add models_manifest.json
git commit -m "feat(models): implement truthful model registry, manifest generator, and runtime health audit"

# Commit 3: Deterministic Analyst GIS Tools & AOI Ingestion
echo -e "\n[3/6] Committing Deterministic Analyst GIS Tools & AOI Ingestion..."
git add satquery-ai/backend/geospatial/aoi_importer.py
git add satquery-ai/backend/api/routes/aoi.py
git add satquery-ai/backend/api/routes/images.py
git add satquery-ai/backend/ingestion/stac_client.py
git add satquery-ai/backend/api/routes/stac.py
git add satquery-ai/tests/unit/test_raster_metadata.py
git add satquery-ai/tests/integration/test_image_inspection_endpoint.py
git commit -m "feat(gis): add secure multi-format AOI ingestion, pixel microscope inspector, and STAC discovery"

# Commit 4: 19-Stage Golden Mission & Analysis Replay Engine
echo -e "\n[4/6] Committing Golden Mission Pipeline & Analysis Replay Engine..."
git add satquery-ai/backend/pipelines/golden_mission.py
git add satquery-ai/scripts/run_golden_mission.py
git add satquery-ai/scripts/reproduce_analysis.py
git add satquery-ai/backend/api/routes/analysis.py
git commit -m "feat(pipeline): complete 19-stage Golden Mission with SAR corroboration and bitwise analysis replay"

# Commit 5: 'One Screen. Four Concepts' Scientific Workstation UI
echo -e "\n[5/6] Committing Scientific Workstation UI Redesign..."
git add satquery-ai/apps/web/src/components/
git add satquery-ai/apps/web/package.json
git add satquery-ai/apps/web/package-lock.json
git commit -m "feat(ui): redesign workspace into 'One Screen. Four Concepts' scientific instrument"

# Commit 6: Automated 5-Gate Master Release Verification & Auditable Documentation
echo -e "\n[6/6] Committing Master Verification Report & Documentation..."
git add satquery-ai/scripts/run_all_verification.py
git add satquery-ai/verification_report.json
git add verification_report.json
git add satquery-ai/docs/
git add docs/
git add satquery-ai/README.md
git add README.md
git commit -m "docs(release): add 5-gate master verification report, clean-machine audit, and SIH26167 documentation"

# Final clean staging for any remaining untracked helper files
git add -A
git status

echo -e "\n=== Pushing to GitHub Remote ==="
git push origin main || git push origin master

echo -e "\n=== All 6 Commits Pushed Successfully! ==="
