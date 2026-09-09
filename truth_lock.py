from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "satquery-ai" / "apps" / "web" / "src"
sys.path.insert(0, str(ROOT / "satquery-ai"))
from backend.models.geochat import geochat_adapter


def main() -> int:
    failures: list[str] = []
    health = geochat_adapter.health()
    if health["status"] == "ready" and not health["checkpoint_available"]:
        failures.append("GeoChat reports ready without a checkpoint")

    manifest = json.loads((ROOT / "benchmark_manifest.json").read_text())
    if manifest.get("status") == "READY":
        for item in manifest.get("benchmarks", []):
            if item.get("status") != "READY":
                failures.append(f"benchmark manifest READY but {item.get('dataset')} is not READY")

    forbidden = [
        "generatePhysicalSpectrum",
        "KNOWN_EO_TARGETS",
        "Hyderabad Urban Corridor",
        "Bangalore Urban Corridor",
        "Phase 2 Commercial Tech Park",
    ]
    for path in SRC.rglob("*"):
        if path.suffix not in {".ts", ".tsx"}:
            continue
        text = path.read_text(errors="ignore")
        for token in forbidden:
            if token in text:
                failures.append(f"forbidden production token {token!r} in {path.relative_to(ROOT)}")

    if failures:
        print("TRUTH LOCK FAILED")
        print("\n".join(f"- {item}" for item in failures))
        return 1
    print("TRUTH LOCK PASSED: no invalid readiness or forbidden production claims detected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
