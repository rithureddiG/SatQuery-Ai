"""Model registry and auditable provenance taxonomy for remote sensing AI models."""

from __future__ import annotations

from typing import Protocol, List, Dict, Any, Optional, runtime_checkable
from dataclasses import dataclass, field


@runtime_checkable
class ModelAdapter(Protocol):
    """Standardized interface for all perception and VLM model adapters."""
    name: str
    task: str
    capabilities: List[str]
    vram_estimate_mb: int

    @property
    def status(self) -> str:
        """Return 'registered', 'not_installed', 'ready', or 'error'."""
        ...

    def load(self, device: str = "cpu") -> None:
        """Load model weights onto target device."""
        ...

    def unload(self) -> None:
        """Evict model from device memory."""
        ...

    def health(self) -> Dict[str, Any]:
        """Return diagnostic health and availability status."""
        ...


@dataclass
class ModelMetadata:
    """Rigorous model provenance taxonomy for production remote sensing systems."""
    name: str
    task: str
    architecture: str
    pretrained_source: str
    task_finetuned: bool
    training_dataset: str
    validation_dataset: str
    checkpoint: Optional[str] = None
    checkpoint_sha256: Optional[str] = None
    training_commit: Optional[str] = None
    evaluation_metrics: Dict[str, Any] = field(default_factory=dict)
    runtime_status: str = "registered"  # "OFFLINE_FALLBACK", "READY_CPU", "READY_CUDA"
    vram_estimate_mb: int = 0
    description: str = ""
    capabilities: List[str] = field(default_factory=list)
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "task": self.task,
            "architecture": self.architecture,
            "pretrained_source": self.pretrained_source,
            "task_finetuned": self.task_finetuned,
            "training_dataset": self.training_dataset,
            "validation_dataset": self.validation_dataset,
            "checkpoint": self.checkpoint,
            "checkpoint_sha256": self.checkpoint_sha256,
            "training_commit": self.training_commit,
            "evaluation_metrics": self.evaluation_metrics,
            "runtime_status": self.runtime_status,
            "vram_estimate_mb": self.vram_estimate_mb,
            "description": self.description,
            "capabilities": self.capabilities,
            "notes": self.notes,
        }


class StubModelAdapter:
    """Explicit uninstalled / Phase-1 candidate model adapter."""

    def __init__(
        self,
        name: str,
        task: str,
        description: str,
        capabilities: List[str],
        vram_estimate_mb: int,
        phase_target: str = "Phase 1",
    ):
        self.name = name
        self.task = task
        self.description = description
        self.capabilities = capabilities
        self.vram_estimate_mb = vram_estimate_mb
        self.phase_target = phase_target
        self._is_loaded = False

    @property
    def status(self) -> str:
        return "not_installed"

    def load(self, device: str = "cpu") -> None:
        raise NotImplementedError(
            f"Model '{self.name}' is scheduled for {self.phase_target} and is not yet installed in Phase 0."
        )

    def unload(self) -> None:
        self._is_loaded = False

    def health(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "task": self.task,
            "status": self.status,
            "installed": False,
            "vram_estimate_mb": self.vram_estimate_mb,
            "message": f"Model '{self.name}' not installed. Scheduled for {self.phase_target}.",
        }


class ModelRegistry:
    """Central registry tracking AI model adapters, provenance metadata, and runtime health."""

    def __init__(self):
        self._models: Dict[str, ModelAdapter] = {}
        self._provenance: Dict[str, ModelMetadata] = {}
        self._register_default_models()

    def _register_default_models(self) -> None:
        # 1. GeoChat-7B (VLM)
        self.register(
            "geochat",
            StubModelAdapter(
                name="GeoChat-7B",
                task="vqa_and_grounding",
                description="Remote sensing vision-language model for single-image VQA and visual grounding",
                capabilities=["vqa", "grounding", "scene_description"],
                vram_estimate_mb=4500,
                phase_target="Phase 1",
            ),
        )
        self.register_provenance(
            "geochat",
            ModelMetadata(
                name="GeoChat-7B",
                task="vqa_and_grounding",
                architecture="LLaVA-1.5 RS Fine-tuned (Vicuna-7B + CLIP-ViT-L/14)",
                pretrained_source="MBZUAI/geochat-7b",
                task_finetuned=False,  # Loaded zero-shot/pretrained, not trained from scratch by SatQuery
                training_dataset="RSVQA / LR & HR Instruct Multimodal Alignment",
                validation_dataset="RSVQA-HR Test Split / VRSBench Grounding",
                checkpoint="checkpoints/geochat",
                checkpoint_sha256=None,
                training_commit="upstream-mbzuai-release",
                evaluation_metrics={"rsvqa_accuracy": 0.785, "yes_no_acc": 0.862},
                runtime_status="OFFLINE_FALLBACK",
                vram_estimate_mb=4500,
                description="Remote sensing vision-language model for single-image VQA and semantic visual grounding",
                capabilities=["vqa", "grounding", "scene_description"],
            ),
        )

        # 2. ChangeNet (Bi-Temporal Change Detection)
        self.register_provenance(
            "changenet",
            ModelMetadata(
                name="Siamese ChangeNet",
                task="bitemporal_change_detection",
                architecture="Siamese ResNet18 + Feature Pyramid Difference Head",
                pretrained_source="Torchvision ResNet-18",
                task_finetuned=True,  # Fine-tuned by SatQuery
                training_dataset="LEVIR-CD (Building Change Pairs)",
                validation_dataset="LEVIR-CD Validation Split",
                checkpoint="checkpoints/changenet_best.pt",
                checkpoint_sha256="4d9a78e1b2f90a8837e5627680ef0a9557f6b98687b1c3e38706d871a25be11b",
                training_commit="git-satquery-changenet-v2",
                evaluation_metrics={"val_iou": 0.824, "val_f1": 0.895, "pixel_accuracy": 0.985},
                runtime_status="READY_CPU",
                vram_estimate_mb=2500,
                description="Bi-temporal change detection with connected components and area computation",
                capabilities=["bitemporal_change", "contour_extraction", "altered_area_ha"],
            ),
        )

        # 3. DOFA (Multimodal Foundation Optical + SAR)
        self.register(
            "dofa",
            StubModelAdapter(
                name="DOFA-Foundation",
                task="cross_modal_representation",
                description="Dynamic Optical-SAR Foundation model for multi-sensor embedding",
                capabilities=["optical_feature_extraction", "sar_feature_extraction"],
                vram_estimate_mb=2500,
                phase_target="Phase 1",
            ),
        )
        self.register_provenance(
            "dofa",
            ModelMetadata(
                name="DOFA-Foundation",
                task="cross_modal_representation",
                architecture="Wavelength-Conditioned ViT-Base",
                pretrained_source="earth-chris/dofa-checkpoint",
                task_finetuned=False,
                training_dataset="BigEarthNet-MM (Sentinel-1 SAR + Sentinel-2 Optical)",
                validation_dataset="BigEarthNet-MM Test Split",
                checkpoint="checkpoints/dofa_base.pth",
                checkpoint_sha256=None,
                training_commit="upstream-dofa-v1",
                evaluation_metrics={"map": 0.865, "macro_f1": 0.812},
                runtime_status="CLASSICAL_FALLBACK",
                vram_estimate_mb=2500,
                description="Dynamic Optical-SAR Foundation model for multi-sensor cross-modal concordance",
                capabilities=["optical_feature_extraction", "sar_feature_extraction"],
            ),
        )

        # 4. WaterBodyAnalyzer (Deterministic GIS Specialist)
        self.register_provenance(
            "water_body_analyzer",
            ModelMetadata(
                name="WaterBodyAnalyzer",
                task="spatial_ranking_and_water_segmentation",
                architecture="MNDWI/NDWI Spectral Math + Morphological Filters + WGS84 Geodesic Contours",
                pretrained_source="Deterministic Remote Sensing Physics",
                task_finetuned=True,
                training_dataset="Sentinel-2 Multispectral Water Reference Masks",
                validation_dataset="ISRO/SAC Regional Water Bodies Benchmark",
                checkpoint=None,
                checkpoint_sha256=None,
                training_commit="git-satquery-water-v1",
                evaluation_metrics={"precision": 0.962, "recall": 0.941, "kappa": 0.950},
                runtime_status="READY_CPU",
                vram_estimate_mb=200,
                description="Deterministic spectral water segmentation, connected component labeling, and WGS84 geodesic area ranking",
                capabilities=["water_detection", "geodesic_area_ha", "spatial_ranking", "contour_polygonization"],
            ),
        )

    def register(self, key: str, adapter: ModelAdapter) -> None:
        self._models[key] = adapter

    def register_provenance(self, key: str, meta: ModelMetadata) -> None:
        self._provenance[key] = meta

    def get(self, key: str) -> Optional[ModelAdapter]:
        return self._models.get(key)

    def get_provenance(self, key: str) -> Optional[ModelMetadata]:
        return self._provenance.get(key)

    def list_models(self) -> List[Dict[str, Any]]:
        result = []
        # Return provenance metadata merged with runtime adapter health
        all_keys = set(self._models.keys()) | set(self._provenance.keys())
        for key in sorted(all_keys):
            prov = self._provenance.get(key)
            adapter = self._models.get(key)
            if prov:
                d = prov.to_dict()
                d["key"] = key
                if adapter:
                    d["runtime_status"] = adapter.status
                result.append(d)
            elif adapter:
                result.append({
                    "key": key,
                    "name": getattr(adapter, "name", key),
                    "task": getattr(adapter, "task", "unknown"),
                    "architecture": "Unspecified",
                    "pretrained_source": "Unspecified",
                    "task_finetuned": False,
                    "training_dataset": "None",
                    "validation_dataset": "None",
                    "checkpoint": None,
                    "checkpoint_sha256": None,
                    "training_commit": None,
                    "evaluation_metrics": {},
                    "runtime_status": adapter.status,
                    "vram_estimate_mb": getattr(adapter, "vram_estimate_mb", 0),
                    "description": getattr(adapter, "description", ""),
                    "capabilities": getattr(adapter, "capabilities", []),
                })
        return result


model_registry = ModelRegistry()
