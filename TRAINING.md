# Training Plan

GeoChat adaptation must use the official MBZUAI/geochat-7B checkpoint and LoRA/QLoRA rather than full-model retraining. The adaptation mixture is BigEarthNet.txt plus verified remote-sensing VQA, grounding, tool-selection, and abstention examples. Exact-area reasoning remains a GIS-tool responsibility; training examples teach the model to request measurement tools.

No training run is claimed in the current repository. A valid run must record dataset checksums, split boundaries, hyperparameters, adapter hash, base checkpoint hash, code commit, and held-out evaluation. LEVIR-CD ChangeNet training follows the same provenance policy and must report precision, recall, F1, IoU, Dice, and boundary metrics on a blind split.
