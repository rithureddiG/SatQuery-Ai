"""Canonical model registry with honest lifecycle and provenance metadata."""
from typing import Protocol, List, Dict, Any, Optional, runtime_checkable
from dataclasses import dataclass

@runtime_checkable
class ModelAdapter(Protocol):
    name: str; task: str; capabilities: List[str]; vram_estimate_mb: int
    @property
    def status(self) -> str: ...
    def load(self, device: str = "cpu") -> None: ...
    def unload(self) -> None: ...
    def health(self) -> Dict[str, Any]: ...

@dataclass
class ModelMetadata:
    name: str; task: str; description: str; capabilities: List[str]; vram_estimate_mb: int; status: str; notes: str = ""

class StubModelAdapter:
    """Explicit unavailable adapter; never produces analytical output."""
    def __init__(self, name: str, task: str, description: str, capabilities: List[str], vram_estimate_mb: int, phase_target: str = "Phase 1"):
        self.name, self.task, self.description, self.capabilities = name, task, description, capabilities
        self.vram_estimate_mb, self.phase_target, self._is_loaded = vram_estimate_mb, phase_target, False
    @property
    def status(self) -> str: return "not_installed"
    def load(self, device: str = "cpu") -> None:
        raise NotImplementedError(f"Model '{self.name}' is unavailable; scheduled for {self.phase_target}.")
    def unload(self) -> None: self._is_loaded = False
    def health(self) -> Dict[str, Any]:
        return {"name": self.name, "task": self.task, "status": "UNAVAILABLE", "installed": False, "checkpoint_verified": False, "vram_estimate_mb": self.vram_estimate_mb, "message": f"Model '{self.name}' is unavailable; scheduled for {self.phase_target}."}

class ModelRegistry:
    """One authoritative runtime registration for each supported model key."""
    _ALIASES = {"geochat": "geochat_7b", "dofa_foundation": "dofa"}
    def __init__(self):
        self._models: Dict[str, ModelAdapter] = {}; self._register_default_models()
    def _register_default_models(self) -> None:
        planned = [
            ("geochat_7b", "GeoChat-7B", "vqa_and_grounding", ["vqa", "grounding", "scene_description"], 4500),
            ("changenet", "ChangeNet", "temporal_change_detection", ["change_detection"], 4000),
            ("dofa", "DOFA", "cross_modal_representation", ["optical_feature_extraction", "sar_feature_extraction"], 2500),
            ("sar_calibrator", "SAR Calibrator", "sar_calibration", ["sar_analysis"], 1000),
            ("sam_rs", "SAM-RS", "grounding_refinement", ["segmentation", "grounding"], 2500),
        ]
        for key, name, task, caps, vram in planned: self.register(key, StubModelAdapter(name, task, f"{name} runtime", caps, vram))
    def register(self, key: str, adapter: ModelAdapter) -> None:
        if key in self._ALIASES: raise ValueError(f"Register canonical key instead of alias '{key}'")
        self._models[key] = adapter
    def get(self, key: str) -> Optional[ModelAdapter]: return self._models.get(self._ALIASES.get(key, key))
    def list_models(self) -> List[Dict[str, Any]]:
        result = []
        for key, model in self._models.items():
            health = model.health() if hasattr(model, "health") else {}
            result.append({"id": key, "key": key, "entity_type": "MODEL", "name": getattr(model, "name", key), "task": getattr(model, "task", "unknown"), "status": model.status, "runtime_status": health.get("status", model.status), "installation_status": health.get("installed", False), "checkpoint_status": "VERIFIED" if health.get("checkpoint_verified") else "UNVERIFIED", "checkpoint_path": health.get("checkpoint_path"), "checkpoint_sha256": health.get("checkpoint_sha256"), "source_uri": health.get("source_uri"), "dataset_id": health.get("dataset_id"), "training_status": health.get("training_status"), "experiment_id": health.get("experiment_id"), "code_commit": health.get("code_commit"), "config_hash": health.get("config_hash"), "evaluation_status": health.get("evaluation_status"), "evaluation_metrics": health.get("evaluation_metrics"), "fallback_mode": health.get("fallback_mode", model.status == "FALLBACK"), "device": health.get("device"), "precision": health.get("precision"), "memory_requirement": getattr(model, "vram_estimate_mb", 0), "last_healthcheck": health.get("last_healthcheck"), "capabilities": getattr(model, "capabilities", [])})
        # Backward-compatible lookup label; it is an alias, not a second registration.
        if "geochat_7b" in self._models:
            result.append({**next(item for item in result if item["id"] == "geochat_7b"), "id": "geochat", "key": "geochat", "alias_of": "geochat_7b"})
        return result

model_registry = ModelRegistry()
