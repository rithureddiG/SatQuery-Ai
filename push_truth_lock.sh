#!/bin/bash
# SatQuery AI - Truth Lock v2 Push Script
set -e

echo "=== SatQuery AI: Staging and Pushing SATQUERY TRUTH LOCK v2 ==="

# Stage backend entity taxonomy, scoring decoupling, and generalized query engine
git add satquery-ai/backend/models/registry.py
git add satquery-ai/backend/agent/query_planner.py
git add satquery-ai/backend/mission/parser.py
git add satquery-ai/backend/agent/orchestrator.py
git add satquery-ai/backend/geospatial/target_analyzers.py
git add satquery-ai/backend/engines/spatial_ranking.py
git add satquery-ai/training/trainers/changenet.py

# Stage runtime verification and canonical status generator scripts
git add satquery-ai/scripts/verify_geochat_runtime.py
git add satquery-ai/scripts/generate_system_status.py
git add satquery-ai/scripts/verify_truth_lock.py

# Stage test suites
git add satquery-ai/tests/unit/test_query_planner_scoring.py
git add satquery-ai/tests/unit/test_general_spatial_ranking.py
git add satquery-ai/tests/unit/test_model_provenance_registry.py
git add satquery-ai/tests/benchmarks/test_blind_validation.py

# Stage manifest, status, reports, and documentation
git add satquery-ai/models_manifest.json
git add models_manifest.json
git add satquery-ai/SYSTEM_STATUS.yaml
git add SYSTEM_STATUS.yaml
git add satquery-ai/docs/SIH_REQUIREMENT_MATRIX.md
git add docs/SIH_REQUIREMENT_MATRIX.md
git add satquery-ai/truth_lock_report.json
git add truth_lock_report.json
git add satquery-ai/blind_validation_report.json
git add blind_validation_report.json

# Stage push scripts
git add push_truth_lock.ps1
git add push_truth_lock.sh

# Commit
git commit -m "feat(truth-lock-v2): real model verification, blind data validation, general query engine, scoring decoupling, and canonical status generation" || true

git add -A
git status

echo "=== Pushing to GitHub Remote ==="
git push origin main || git push origin master

echo "=== Truth Lock v2 Pushed Successfully! ==="
