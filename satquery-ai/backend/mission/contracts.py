"""Canonical mission plan and result consistency checks."""
from __future__ import annotations
from typing import Any, Dict


class ExecutionPlanMismatch(ValueError):
    code = "EXECUTION_PLAN_MISMATCH"


class ResultContractMismatch(ValueError):
    code = "RESULT_CONTRACT_MISMATCH"


def validate_result_against_mission(mission: Dict[str, Any], result: Dict[str, Any]) -> None:
    if result.get("mission_id") != mission.get("mission_id"):
        raise ResultContractMismatch("mission_id does not match the immutable execution plan")
    for key in ("intent", "target", "operation", "measurement"):
        expected = mission.get(key)
        actual = result.get(key)
        if expected is not None and actual is not None and expected != actual:
            raise ResultContractMismatch(f"{key}: expected {expected}, received {actual}")
    if mission.get("intent") == "spatial_ranking" and result.get("task") == "temporal_change":
        raise ResultContractMismatch("spatial-ranking mission cannot return temporal-change output")


def validate_tool_for_mission(mission: Dict[str, Any], tool_name: str) -> None:
    if mission.get("intent") == "spatial_ranking" and tool_name.lower() in {"changenet", "changenetmodeladapter", "sar_corroboration", "spatialfusionengine"}:
        raise ExecutionPlanMismatch(f"{tool_name} is incompatible with spatial-ranking mission")
