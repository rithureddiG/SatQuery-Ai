# Change Product Specification

A verified temporal analysis exposes separate products: before observation, after observation, continuous change probability, binary change mask, change magnitude, vectorized change regions, change statistics, and evidence.

For optical pairs, change magnitude may include backend-derived spectral deltas such as NDVI, NDWI, NDBI, and spectral distance when the required bands are present. Missing bands result in reduced capability rather than invented values. The binary mask is vectorized by the backend GIS engine, and each polygon carries area, centroid, bounding box, source observation IDs, and the measurement CRS.

The frontend may toggle and render these products, but it must not compute indices, create polygons, estimate areas, or attach confidence values locally. Every visible layer carries its source observation metadata and is rejected when its metadata conflicts with the selected viewport bindings.
