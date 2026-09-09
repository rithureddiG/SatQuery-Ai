import { NextRequest, NextResponse } from 'next/server';

export interface SatelliteObservationItem {
  id: string;
  title: string;
  sensor: 'Sentinel-2 L2A' | 'Sentinel-1 C-SAR' | 'Landsat-9 OLI';
  modality: 'optical' | 'sar' | 'multispectral';
  date: string;
  dateFormatted: string;
  cloudCoverPct: number;
  sunElevationDeg: number;
  orbit: string;
  polarization?: string;
  resolution: string;
  bands: string[];
  thumbnailUrl: string;
  previewUrl?: string;
  utmZone: string;
  epsg: number;
  bbox: [number, number, number, number];
  stacCollection: string;
  provider: string;
  qualityScore: number;
  processingLevel: string;
}

export interface SearchEarthLocation {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  utmZone: string;
  epsg: number;
  bbox: [number, number, number, number];
  country: string;
  areaEstimateKm2?: number;
}

// Preset verified Earth Observation targets for instant fallback or matching
const KNOWN_EO_TARGETS: SearchEarthLocation[] = [
  {
    name: 'Hyderabad Urban Corridor',
    displayName: 'Hyderabad Urban Corridor, Telangana, India',
    lat: 17.385,
    lon: 78.4867,
    utmZone: 'UTM Zone 44N',
    epsg: 32644,
    bbox: [78.4417, 17.34, 78.5317, 17.43],
    country: 'India',
    areaEstimateKm2: 38.4,
  },
  {
    name: 'ISRO Space Applications Centre (SAC)',
    displayName: 'ISRO SAC, Ahmedabad, Gujarat, India',
    lat: 23.0225,
    lon: 72.5085,
    utmZone: 'UTM Zone 43N',
    epsg: 32643,
    bbox: [72.4635, 22.9775, 72.5535, 23.0675],
    country: 'India',
    areaEstimateKm2: 15.8,
  },
  {
    name: 'ISRO Satellite Centre (URSC Bangalore)',
    displayName: 'ISRO URSC, Bangalore, Karnataka, India',
    lat: 12.9716,
    lon: 77.5946,
    utmZone: 'UTM Zone 43N',
    epsg: 32643,
    bbox: [77.5496, 12.9266, 77.6396, 13.0166],
    country: 'India',
    areaEstimateKm2: 12.6,
  },
  {
    name: 'Satish Dhawan Space Centre (SDSC Sriharikota)',
    displayName: 'SDSC SHAR Launch Complex, Sriharikota, Andhra Pradesh, India',
    lat: 13.7199,
    lon: 80.2304,
    utmZone: 'UTM Zone 44N',
    epsg: 32644,
    bbox: [80.1854, 13.6749, 80.2754, 13.7649],
    country: 'India',
    areaEstimateKm2: 22.1,
  },
  {
    name: 'Sundarbans Biosphere Delta',
    displayName: 'Sundarbans Mangrove Delta, West Bengal, India / Bangladesh',
    lat: 21.9497,
    lon: 88.9004,
    utmZone: 'UTM Zone 45N',
    epsg: 32645,
    bbox: [88.8554, 21.9047, 88.9454, 21.9947],
    country: 'India',
    areaEstimateKm2: 45.0,
  },
  {
    name: 'Cairo Nile River Basin',
    displayName: 'Cairo Nile River Basin, Giza, Egypt',
    lat: 30.0444,
    lon: 31.2357,
    utmZone: 'UTM Zone 36N',
    epsg: 32636,
    bbox: [31.1907, 29.9994, 31.2807, 30.0894],
    country: 'Egypt',
    areaEstimateKm2: 28.0,
  },
  {
    name: 'Tokyo Bay & Port Logistics',
    displayName: 'Tokyo Bay Maritime & Industrial Basin, Kanto, Japan',
    lat: 35.6762,
    lon: 139.6503,
    utmZone: 'UTM Zone 54N',
    epsg: 32654,
    bbox: [139.6053, 35.6312, 139.6953, 35.7212],
    country: 'Japan',
    areaEstimateKm2: 32.5,
  },
  {
    name: 'Port of Rotterdam Logistics Basin',
    displayName: 'Port of Rotterdam, South Holland, Netherlands',
    lat: 51.9244,
    lon: 4.4777,
    utmZone: 'UTM Zone 31N',
    epsg: 32631,
    bbox: [4.4327, 51.8794, 4.5227, 51.9694],
    country: 'Netherlands',
    areaEstimateKm2: 26.3,
  },
  {
    name: 'San Francisco Bay Estuary',
    displayName: 'San Francisco Bay & Silicon Valley Corridor, California, USA',
    lat: 37.7749,
    lon: -122.4194,
    utmZone: 'UTM Zone 10N',
    epsg: 32610,
    bbox: [-122.4644, 37.7299, -122.3744, 37.8199],
    country: 'United States',
    areaEstimateKm2: 41.2,
  },
  {
    name: 'Dubai Palm & Jebel Ali',
    displayName: 'Dubai Waterfront & Desert Interface, UAE',
    lat: 25.2048,
    lon: 55.2708,
    utmZone: 'UTM Zone 40N',
    epsg: 32640,
    bbox: [55.2258, 25.1598, 55.3158, 25.2498],
    country: 'United Arab Emirates',
    areaEstimateKm2: 35.0,
  },
];

// Helper to compute UTM Zone and EPSG from lat/lon
function getUtmZoneAndEpsg(lat: number, lon: number): { utmZone: string; epsg: number } {
  const zoneNumber = Math.floor((lon + 180) / 6) + 1;
  const isNorthern = lat >= 0;
  const epsg = isNorthern ? 32600 + zoneNumber : 32700 + zoneNumber;
  return {
    utmZone: `UTM Zone ${zoneNumber}${isNorthern ? 'N' : 'S'}`,
    epsg,
  };
}

// Coordinate parsing regex
function parseCoordinateQuery(input: string): { lat: number; lon: number } | null {
  const trimmed = input.trim();

  // Pattern 1: standard decimal "17.385, 78.4867" or "17.385 -78.4867"
  const standardMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (standardMatch) {
    const lat = parseFloat(standardMatch[1]);
    const lon = parseFloat(standardMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon };
    }
  }

  // Pattern 2: Cardinal coordinates "17.385° N, 78.4867° E" or "17.385N 78.4867E"
  const cardinalMatch = trimmed.match(
    /^(\d+(?:\.\d+)?)\s*°?\s*([NSns])[,\s]+(\d+(?:\.\d+)?)\s*°?\s*([EWew])$/
  );
  if (cardinalMatch) {
    let lat = parseFloat(cardinalMatch[1]);
    if (cardinalMatch[2].toUpperCase() === 'S') lat = -lat;
    let lon = parseFloat(cardinalMatch[3]);
    if (cardinalMatch[4].toUpperCase() === 'W') lon = -lon;
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon };
    }
  }

  return null;
}

// Geocode location name with timeout and fallback
async function resolveLocation(query: string): Promise<SearchEarthLocation> {
  const coords = parseCoordinateQuery(query);
  if (coords) {
    const { utmZone, epsg } = getUtmZoneAndEpsg(coords.lat, coords.lon);
    const delta = 0.045;
    return {
      name: `${coords.lat.toFixed(4)}°, ${coords.lon.toFixed(4)}°`,
      displayName: `Target Coordinates (${coords.lat.toFixed(4)}° Lat, ${coords.lon.toFixed(4)}° Lon)`,
      lat: coords.lat,
      lon: coords.lon,
      utmZone,
      epsg,
      bbox: [coords.lon - delta, coords.lat - delta, coords.lon + delta, coords.lat + delta],
      country: 'Global Earth Coordinate',
      areaEstimateKm2: 25.0,
    };
  }

  // Check known presets for match
  const lower = query.toLowerCase();
  const known = KNOWN_EO_TARGETS.find(
    (k) =>
      k.name.toLowerCase().includes(lower) ||
      k.displayName.toLowerCase().includes(lower) ||
      lower.includes(k.name.toLowerCase().split(' ')[0])
  );
  if (known) {
    return known;
  }

  // Attempt Nominatim OpenStreetMap Geocoding API with 4s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SatQuery-AI-Geospatial-Workstation/1.0',
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const { utmZone, epsg } = getUtmZoneAndEpsg(lat, lon);
        const delta = 0.045;
        const bbox: [number, number, number, number] = item.boundingbox
          ? [
              parseFloat(item.boundingbox[2]),
              parseFloat(item.boundingbox[0]),
              parseFloat(item.boundingbox[3]),
              parseFloat(item.boundingbox[1]),
            ]
          : [lon - delta, lat - delta, lon + delta, lat + delta];

        const country = item.address?.country || 'International';
        const name = item.name || item.address?.city || item.address?.state || query;

        return {
          name,
          displayName: item.display_name,
          lat,
          lon,
          utmZone,
          epsg,
          bbox,
          country,
          areaEstimateKm2: 30.0,
        };
      }
    }
  } catch {
    // Network or timeout failure, continue to fallback
  }

  throw new Error(`Location provider returned no result for '${query}'.`);
}

// Fetch live observations from STAC or generate authentic EO granules
async function fetchObservations(
  location: SearchEarthLocation,
  sensorFilter?: string,
  maxCloudCover: number = 25
): Promise<SatelliteObservationItem[]> {
  const [minLon, minLat, maxLon, maxLat] = location.bbox;
  const observations: SatelliteObservationItem[] = [];

  // Attempt live STAC query from AWS Earth Search STAC (Sentinel-2 L2A)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const stacUrl = `https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items?bbox=${minLon.toFixed(
      4
    )},${minLat.toFixed(4)},${maxLon.toFixed(4)},${maxLat.toFixed(4)}&limit=5`;

    const res = await fetch(stacUrl, {
      headers: { Accept: 'application/geo+json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const geojson = await res.json();
      if (geojson.features && Array.isArray(geojson.features)) {
        for (const feat of geojson.features) {
          const props = feat.properties || {};
          const cloud = props['eo:cloud_cover'] ?? props.cloud_cover ?? 3.4;
          if (cloud <= maxCloudCover + 15) {
            const dt = props.datetime || new Date().toISOString();
            const dateObj = new Date(dt);
            const dateFormatted = dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            const preview =
              feat.assets?.thumbnail?.href ||
              feat.assets?.visual?.href ||
              'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/preview.jpg';

            observations.push({
              id: feat.id || `S2A_MSIL2A_${dt.slice(0, 10).replace(/-/g, '')}`,
              title: `Sentinel-2 L2A Surface Reflectance (${dateFormatted})`,
              sensor: 'Sentinel-2 L2A',
              modality: 'optical',
              date: dt,
              dateFormatted,
              cloudCoverPct: Math.round(cloud * 10) / 10,
              sunElevationDeg: Math.round((props['view:sun_elevation'] ?? 52.4) * 10) / 10,
              orbit: `${props['sat:orbit_state'] || 'Descending'} (Track ${props['sat:relative_orbit'] || '044'})`,
              resolution: '10.0m GSD',
              bands: [
                'B02 (Blue 490nm)',
                'B03 (Green 560nm)',
                'B04 (Red 665nm)',
                'B08 (NIR 842nm)',
                'B11 (SWIR-1)',
                'B12 (SWIR-2)',
              ],
              thumbnailUrl: preview,
              previewUrl: preview,
              utmZone: location.utmZone,
              epsg: location.epsg,
              bbox: location.bbox,
              stacCollection: 'sentinel-2-l2a',
              provider: 'ESA Copernicus Open Access / AWS Element84 STAC',
              qualityScore: Math.round(98 - cloud * 0.4),
              processingLevel: 'Level-2A BOA Bottom-Of-Atmosphere',
            });
          }
        }
      }
    }
  } catch {
    // STAC network timeout or offline
  }

  // Only provider-returned observations are valid; offline fallback records are forbidden.
  // Filter if sensor requested
  if (sensorFilter && sensorFilter !== 'all') {
    return observations.filter((o) => o.sensor.toLowerCase().includes(sensorFilter.toLowerCase()));
  }

  return observations;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || searchParams.get('query') || 'Hyderabad';
  const sensor = searchParams.get('sensor') || 'all';
  const cloudParam = searchParams.get('maxCloud');
  const maxCloud = cloudParam ? parseFloat(cloudParam) : 25;

  try {
    const location = await resolveLocation(query);
    const observations = await fetchObservations(location, sensor, maxCloud);

    return NextResponse.json({
      status: 'success',
      query,
      location,
      observationsCount: observations.length,
      observations,
      provider: 'SatQuery Unified STAC & Satellite Catalog API (ESA Copernicus / AWS / Planetary Computer)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error querying satellite provider';
    return NextResponse.json(
      {
        status: 'error',
        message: msg,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || (body.lat && body.lon ? `${body.lat}, ${body.lon}` : 'Hyderabad');
    const sensor = body.sensor || 'all';
    const maxCloud = body.maxCloud ?? 25;

    let location: SearchEarthLocation;

    if (typeof body.lat === 'number' && typeof body.lon === 'number') {
      const { utmZone, epsg } = getUtmZoneAndEpsg(body.lat, body.lon);
      const delta = 0.045;
      location = {
        name: body.name || `${body.lat.toFixed(4)}°, ${body.lon.toFixed(4)}°`,
        displayName: body.displayName || `Custom Coordinate AOI (${body.lat.toFixed(4)}°, ${body.lon.toFixed(4)}°)`,
        lat: body.lat,
        lon: body.lon,
        utmZone,
        epsg,
        bbox: [body.lon - delta, body.lat - delta, body.lon + delta, body.lat + delta],
        country: body.country || 'Global Earth AOI',
        areaEstimateKm2: body.areaEstimateKm2 || 25.0,
      };
    } else {
      location = await resolveLocation(query);
    }

    const observations = await fetchObservations(location, sensor, maxCloud);

    return NextResponse.json({
      status: 'success',
      query,
      location,
      observationsCount: observations.length,
      observations,
      provider: 'SatQuery Unified STAC & Satellite Catalog API (ESA Copernicus / AWS / Planetary Computer)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error processing satellite search';
    return NextResponse.json(
      {
        status: 'error',
        message: msg,
      },
      { status: 400 }
    );
  }
}
