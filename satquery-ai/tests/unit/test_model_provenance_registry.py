"""Unit tests verifying ModelRegistry auditable dataset and model provenance taxonomy."""

import pytest
from backend.models.registry import model_registry, ModelMetadata


class TestModelProvenanceRegistry:

    def test_all_provenance_fields_present_in_registry(self):
        """Verify that every registered model provides the complete provenance taxonomy."""
        models = model_registry.list_models()
        assert len(models) >= 4

        required_keys = [
            "name",
            "task",
            "architecture",
            "pretrained_source",
            "task_finetuned",
            "training_dataset",
            "validation_dataset",
            "checkpoint",
            "checkpoint_sha256",
            "runtime_status",
            "evaluation_metrics",
        ]

        for m in models:
            for key in required_keys:
                assert key in m, f"Model '{m.get('name')}' missing required provenance key '{key}'"

    def test_geochat_provenance_truthfulness(self):
        """Verify that GeoChat is truthfully registered as pretrained zero-shot, not falsely trained from scratch."""
        geochat_meta = model_registry.get_provenance("geochat")
        assert geochat_meta is not None
        assert geochat_meta.pretrained_source == "MBZUAI/geochat-7b"
        # Truth state: SatQuery does not falsely claim to have trained GeoChat from scratch
        assert geochat_meta.task_finetuned is False
        assert "RSVQA" in geochat_meta.training_dataset
        assert "VRSBench" in geochat_meta.validation_dataset

    def test_changenet_provenance_fine_tuning(self):
        """Verify that ChangeNet is registered with LEVIR-CD training provenance and SHA-256."""
        changenet_meta = model_registry.get_provenance("changenet")
        assert changenet_meta is not None
        assert changenet_meta.task_finetuned is True
        assert "LEVIR-CD" in changenet_meta.training_dataset
        assert changenet_meta.checkpoint_sha256 is not None
        assert len(changenet_meta.checkpoint_sha256) == 64  # Valid SHA-256 hex string

    def test_water_body_analyzer_provenance(self):
        """Verify that WaterBodyAnalyzer is documented as a deterministic GIS specialist."""
        water_meta = model_registry.get_provenance("water_body_analyzer")
        assert water_meta is not None
        assert "MNDWI" in water_meta.architecture
        assert water_meta.runtime_status == "READY_CPU"
