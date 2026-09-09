# GeoChat

Target model: [MBZUAI/geochat-7B](https://huggingface.co/MBZUAI/geochat-7B), using the official GeoChat/LLaVA-compatible runtime rather than a fake replacement. Readiness requires checkpoint presence, SHA-256 verification, tokenizer and image processor loading, vision-tower/image-token compatibility, real image generation, grounding support, and image-conditioning tests: same image/different question, different image/same question, blank image, and noise image.

Current status: `CHECKPOINT_MISSING`. The adapter is registered and fail-closed. It does not claim real VQA or grounding until the official runtime and checkpoint are installed.
