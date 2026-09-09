"""Deterministic evidence scoring from measurable signals only."""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from .calibration import platt_scale


@dataclass
class ConfidenceScore:
    overall: Optional[float]
    model_score: Optional[float]
    resolution_score: Optional[float]
    registration_score: Optional[float] = None
    sar_agreement_score: Optional[float] = None
    calibrated_probability: Optional[float] = None
    score_type: str = "deterministic_evidence_score"
    factors: Dict[str, Any] = field(default_factory=dict)
    notes: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall": self.overall,
            "evidence_score": self.overall,
            "calibrated_probability": self.calibrated_probability,
            "score_type": self.score_type,
            "description": "Evidence Score — Resolution, Registration & Model Evidence",
            "model_score": self.model_score,
            "resolution_score": self.resolution_score,
            "registration_score": self.registration_score,
            "sar_agreement_score": self.sar_agreement_score,
            "factors": self.factors,
            "notes": self.notes,
        }


def calculate_spatial_resolution_score(x_res: float, y_res: float, task_type: str = "vqa") -> float:
    avg_res = (abs(x_res) + abs(y_res)) / 2.0
    if avg_res <= 1.0:
        return 1.0
    if avg_res <= 5.0:
        return 0.95
    if avg_res <= 10.0:
        return 0.90
    if avg_res <= 30.0:
        return 0.75
    return 0.55


def compute_vqa_confidence(
    model_confidence: Optional[float],
    x_res: float = 10.0,
    y_res: float = 10.0,
    box_area_ratio: Optional[float] = None,
) -> ConfidenceScore:
    res_score = calculate_spatial_resolution_score(x_res, y_res, task_type="vqa")
    if model_confidence is None:
        return ConfidenceScore(
            overall=None,
            model_score=None,
            resolution_score=round(res_score, 2),
            calibrated_probability=None,
            factors={"model": None, "resolution": round(res_score, 2)},
            notes=["Model confidence is unavailable; no composite evidence score was fabricated."],
        )

    weights = {"model": 0.70, "resolution": 0.30}
    overall = round(max(0.0, min(1.0, (model_confidence * weights["model"]) + (res_score * weights["resolution"]))), 2)
    notes = [
        f"Model certainty: {int(model_confidence * 100)}%",
        f"Spatial resolution rating: {int(res_score * 100)}% (GSD: {round(x_res, 1)}m)",
        f"Evidence score: {int(overall * 100)}% (Resolution & Model Composite)",
    ]
    if box_area_ratio is not None and box_area_ratio < 0.001:
        notes.append("Warning: Grounded object is extremely small relative to scene dimensions.")
    return ConfidenceScore(
        overall=overall,
        calibrated_probability=platt_scale(overall),
        model_score=round(model_confidence, 2),
        resolution_score=round(res_score, 2),
        factors=weights,
        notes=notes,
    )


def compute_multimodal_confidence(
    model_confidence: Optional[float],
    registration_quality: Optional[float],
    sar_agreement: Optional[float] = None,
    x_res: float = 10.0,
    y_res: float = 10.0,
) -> ConfidenceScore:
    res_score = calculate_spatial_resolution_score(x_res, y_res)
    if model_confidence is None or registration_quality is None:
        return ConfidenceScore(
            overall=None,
            model_score=None,
            resolution_score=round(res_score, 2),
            registration_score=registration_quality,
            sar_agreement_score=sar_agreement,
            calibrated_probability=None,
            factors={},
            notes=["Required model or registration evidence is unavailable; score is unknown."],
        )

    if sar_agreement is not None:
        weights = {"model": 0.45, "registration": 0.30, "sar": 0.15, "resolution": 0.10}
        overall = (model_confidence * weights["model"] + registration_quality * weights["registration"] + sar_agreement * weights["sar"] + res_score * weights["resolution"])
    else:
        weights = {"model": 0.55, "registration": 0.30, "resolution": 0.15}
        overall = model_confidence * weights["model"] + registration_quality * weights["registration"] + res_score * weights["resolution"]
    overall = round(max(0.0, min(1.0, overall)), 2)
    notes = [
        f"Model probability: {int(model_confidence * 100)}%",
        f"Co-registration quality: {int(registration_quality * 100)}%",
        f"Evidence score: {int(overall * 100)}% (Resolution, Registration & Model Composite)",
    ]
    if sar_agreement is not None:
        notes.append(f"SAR cross-modal agreement: {int(sar_agreement * 100)}%")
    return ConfidenceScore(
        overall=overall,
        calibrated_probability=platt_scale(overall),
        model_score=round(model_confidence, 2),
        resolution_score=round(res_score, 2),
        registration_score=round(registration_quality, 2),
        sar_agreement_score=round(sar_agreement, 2) if sar_agreement is not None else None,
        factors=weights,
        notes=notes,
    )
