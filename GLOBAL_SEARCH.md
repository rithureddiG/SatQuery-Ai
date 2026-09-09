# Global Search

Search must resolve places through a provider-backed geocoder or accept validated coordinates. A result contains place ID, name, coordinates, bounding box/geometry, country, region, and source. The flow is `place → selected geocoder result → AOI → STAC search → provider observations → T1/T2 selection`.

Hardcoded city dictionaries and synthetic observation records are forbidden. If geocoding or STAC retrieval fails, the UI must show the provider error or `NO_DATA`; it must not invent observations or thumbnails.
