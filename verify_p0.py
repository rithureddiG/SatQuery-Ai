from pathlib import Path
import sys

root = Path(__file__).parent / "satquery-ai"
sys.path.insert(0, str(root))

from backend.models.registry import model_registry
from backend.models.geochat.adapter import geochat_adapter
from backend.models.dofa.adapter import dofa_adapter
from backend.evidence.confidence import compute_vqa_confidence, compute_multimodal_confidence
from backend.pipelines.optical_sar import validate_cross_modal_pair

assert {"geochat_7b", "changenet", "dofa", "sar_calibrator", "sam_rs"}.issubset(
    {item["id"] for item in model_registry.list_models()}
)
assert geochat_adapter.vqa(__file__, "test", strict_real=False)["model_confidence"] is None
assert compute_vqa_confidence(None).overall is None
assert compute_multimodal_confidence(None, None).overall is None
assert geochat_adapter.ground(__file__, "water", strict_real=False)["boxes"] == []
assert dofa_adapter.extract_optical_features(__file__)["supported"] is False
print("P0 verification passed")
