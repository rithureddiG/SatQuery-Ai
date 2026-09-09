# Temporal Architecture

Temporal comparison must bind both viewports to immutable observation records. A normal temporal change requires equivalent sensor and product characteristics, such as Sentinel-2 L2A before Sentinel-2 L2A after. Optical plus SAR is a multimodal corroboration workflow, not an ordinary before/after comparison.

The browser must consume observation metadata returned by the imagery provider and must not synthesize dates, sensors, products, thumbnails, or observation IDs. Provider failure is represented as `NO_DATA` or `ERROR`; a blank canvas is not a valid ready state.

The backend change endpoint produces the derived change mask, vector geometry, measured areas, and execution evidence. The frontend renders those products and does not calculate scientific change or fabricate overlays.

The existing split viewer remains a rendering component and should receive the same verified before/after pair as the change request. The next integration step is to replace any remaining static timeline controls with provider-returned observation records and add explicit `SWIPE`, `SPLIT`, `FLICKER`, `DIFF`, `MASK`, and `VECTOR` layer state.
