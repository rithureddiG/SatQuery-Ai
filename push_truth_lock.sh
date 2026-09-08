#!/bin/bash
# SatQuery AI - Truth Lock v1 Push Script
set -e

echo "=== SatQuery AI: Staging and Pushing SATQUERY TRUTH LOCK v1 ==="

# Stage all backend confidence sweep, truth lock verification, and model registry changes
git add satquery-ai/backend/pipelines/single_image.py
git add satquery-ai/backend/evidence/confidence.py
git add satquery-ai/backend/agent/tools.py
git add satquery-ai/backend/models/sam/adapter.py
git add satquery-ai/backend/evidence/gate.py
git add satquery-ai/backend/mission/executor.py
git add satquery-ai/backend/engines/fusion.py
git add satquery-ai/backend/models/geochat/adapter.py
git add satquery-ai/backend/models/registry.py
git add satquery-ai/backend/reports/generator.py

# Stage manifest and status documentation
git add satquery-ai/models_manifest.json
git add models_manifest.json
git add satquery-ai/SYSTEM_STATUS.yaml
git add SYSTEM_STATUS.yaml
git add satquery-ai/truth_lock_report.json
git add truth_lock_report.json
git add satquery-ai/scripts/verify_truth_lock.py

# Stage UI redesign and debug lens modes
git add satquery-ai/apps/web/src/components/intelligence/FloatingFindingSurface.tsx
git add satquery-ai/apps/web/src/components/map/InteractiveEarthViewer.tsx
git add satquery-ai/apps/web/src/components/map/CompactViewSelector.tsx
git add satquery-ai/apps/web/src/context/WorkspaceContext.tsx
git add satquery-ai/apps/web/src/components/modals/SystemHubModal.tsx

# Stage all Truth Lock test suites
git add satquery-ai/tests/unit/test_model_provenance_registry.py
git add satquery-ai/tests/integration/test_real_water_body_brahmaputra.py
git add satquery-ai/tests/integration/test_water_body_urban_abstain.py
git add satquery-ai/tests/integration/test_behavioral_matrix_water.py
git add satquery-ai/tests/unit/test_geochat_multimodal_tensor_verification.py
git add satquery-ai/tests/integration/test_golden_mission_artifact_chain.py
git add satquery-ai/tests/integration/test_report_format_integrity.py
git add satquery-ai/tests/integration/test_analysis_replay_bitwise.py
git add satquery-ai/tests/integration/test_adversarial_queries.py

# Stage push scripts
git add push_truth_lock.ps1
git add push_truth_lock.sh

# Commit
git commit -m "feat(truth-lock): enforce real-data validation, behavioral matrix, honest abstention, and finding card redesign" || true

git add -A
git status

echo "=== Pushing to GitHub Remote ==="
git push origin main || git push origin master

echo "=== Truth Lock v1 Pushed Successfully! ==="
