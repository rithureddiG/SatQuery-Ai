# Dataset Registry

Raw datasets are not committed to Git. Each download must be recorded with source URL, license, version, checksum, sample count, modalities, sensors, annotation types, split strategy, and local storage URI.

| Dataset | Role | Current status |
|---|---|---|
| BigEarthNet.txt | Primary S1/S2/text adaptation dataset | Configured conceptually; raw data not installed; checksum and sample manifest pending |
| VRSBench | Single-image captioning, grounding, and VQA evaluation | Adapter directory exists; data and benchmark manifest pending |
| RSVQA | Remote-sensing VQA evaluation | Experiment config exists; data not installed |
| CDVQA | Bi-temporal semantic change VQA evaluation | Adapter not yet populated with a verified local split |
| LEVIR-CD | Change model training/evaluation | Training code exists; real dataset/checkpoint/metrics pending |

Training, validation, benchmark, and blind-test labels must remain separate. Test labels must never be used for threshold selection, prompt tuning, or training.
