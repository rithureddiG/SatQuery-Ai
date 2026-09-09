# Temporal Pairing

A temporal pair is valid only when both observations cover the same AOI and the pairing policy has evaluated sensor, processing level, spatial resolution, cloud fraction, coverage, acquisition geometry, and temporal relevance.

The default optical change pair should use equivalent Sentinel-2 L2A observations. If sensor or product equivalence cannot be established, the result must be labeled `CROSS_SENSOR_CHANGE` and must not be presented as ordinary optical temporal change.

Provider-returned STAC metadata is the source of truth for timestamp, sensor, product, cloud fraction, source URI, and observation identity. No fallback fixture dates or synthetic observation records are valid production inputs.
