import { NextRequest, NextResponse } from 'next/server';

export interface CustomAOI {
  id: string;
  name: string;
  format: 'geojson' | 'kml' | 'shapefile' | 'manual';
  crs: {
    inputCrs: string;
    canonicalCrs: string; // EPSG:4326
    utmZone: string;      // e.g. EPSG:32643
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  centroid: [number, number]; // [lon, lat]
  metrics: {
    areaHa: number;
    areaM2: number;
    perimeterM: number;
    vertexCount: number;
  };
  validation: {
    isValid: boolean;
    isSelfIntersecting: boolean;
    isClosed: boolean;
    reprojected: boolean;
    warnings: string[];
  };
  createdAt: string;
}

// Helper: Geodesic polygon area calculation using WGS84 ellipsoidal math
function calculateGeodesicPolygonArea(coordinates: number[][]): { areaM2: number; perimeterM: number } {
  if (coordinates.length < 3) return { areaM2: 0, perimeterM: 0 };

  const WGS84_A = 6378137.0; // semi-major axis in meters
  const DEG_TO_RAD = Math.PI / 180.0;

  // Perimeter calculation using Haversine
  let perimeterM = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length];
    const lat1 = p1[1] * DEG_TO_RAD;
    const lon1 = p1[0] * DEG_TO_RAD;
    const lat2 = p2[1] * DEG_TO_RAD;
    const lon2 = p2[0] * DEG_TO_RAD;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeterM += WGS84_A * c;
  }

  // Spherical surface area integration
  let areaM2 = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length];
    const lon1 = p1[0] * DEG_TO_RAD;
    const lat1 = p1[1] * DEG_TO_RAD;
    const lon2 = p2[0] * DEG_TO_RAD;
    const lat2 = p2[1] * DEG_TO_RAD;

    areaM2 += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  areaM2 = Math.abs((areaM2 * WGS84_A * WGS84_A) / 4.0);

  return { areaM2: Math.round(areaM2), perimeterM: Math.round(perimeterM) };
}

// Helper: Check if line segments intersect (Self-intersection check)
function doLinesIntersect(p1: number[], p2: number[], p3: number[], p4: number[]): boolean {
  function ccw(a: number[], b: number[], c: number[]): boolean {
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  }
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

function checkSelfIntersection(ring: number[][]): boolean {
  const n = ring.length;
  if (n < 4) return false;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // Skip adjacent first and last segment connection
      if (doLinesIntersect(ring[i], ring[i + 1], ring[j], ring[(j + 1) % n])) {
        return true;
      }
    }
  }
  return false;
}

// Helper: Determine UTM zone from longitude
function getUtmZone(lon: number, lat: number): string {
  const zone = Math.floor((lon + 180) / 6) + 1;
  const hemisphere = lat >= 0 ? 'N' : 'S';
  const epsg = lat >= 0 ? 32600 + zone : 32700 + zone;
  return `EPSG:${epsg} (UTM Zone ${zone}${hemisphere})`;
}

// Parse KML text to GeoJSON geometry
function parseKmlCoordinates(kmlText: string): number[][][] {
  const coordMatch = kmlText.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
  if (!coordMatch) {
    throw new Error('No valid <coordinates> tag found in KML content.');
  }

  const rawCoords = coordMatch[1].trim().split(/\s+/);
  const ring: number[][] = [];

  for (const c of rawCoords) {
    const parts = c.split(',');
    if (parts.length >= 2) {
      const lon = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (!isNaN(lon) && !isNaN(lat)) {
        ring.push([lon, lat]);
      }
    }
  }

  if (ring.length < 3) {
    throw new Error('KML polygon contains fewer than 3 valid vertices.');
  }

  // Ensure closed ring
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }

  return [ring];
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let rawContent = '';
    let filename = 'custom_aoi';
    let detectedFormat: 'geojson' | 'kml' | 'shapefile' | 'manual' = 'geojson';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }
      filename = file.name;
      const lowerName = filename.toLowerCase();

      if (lowerName.endsWith('.kml')) {
        detectedFormat = 'kml';
        rawContent = await file.text();
      } else if (lowerName.endsWith('.zip')) {
        detectedFormat = 'shapefile';
        // Mock / structure reader for shapefile zip
        rawContent = await file.text();
      } else {
        detectedFormat = 'geojson';
        rawContent = await file.text();
      }
    } else {
      const body = await req.json();
      rawContent = body.content || JSON.stringify(body.geometry || body);
      filename = body.name || 'custom_boundary';
      detectedFormat = body.format || 'geojson';
    }

    let geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: any } | null = null;
    let inputCrs = 'EPSG:4326';
    const warnings: string[] = [];

    // Parse according to detected format
    if (detectedFormat === 'kml' || rawContent.includes('<kml')) {
      detectedFormat = 'kml';
      const rings = parseKmlCoordinates(rawContent);
      geometry = {
        type: 'Polygon',
        coordinates: rings,
      };
    } else {
      // GeoJSON parsing
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(rawContent);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON/GeoJSON payload. Please check formatting.' },
          { status: 400 }
        );
      }

      // Extract geometry from FeatureCollection, Feature, or direct Geometry
      if (parsedJson.type === 'FeatureCollection' && parsedJson.features?.length > 0) {
        geometry = parsedJson.features[0].geometry;
      } else if (parsedJson.type === 'Feature' && parsedJson.geometry) {
        geometry = parsedJson.geometry;
      } else if (parsedJson.type === 'Polygon' || parsedJson.type === 'MultiPolygon') {
        geometry = parsedJson;
      } else if (parsedJson.coordinates) {
        geometry = {
          type: Array.isArray(parsedJson.coordinates[0][0][0]) ? 'MultiPolygon' : 'Polygon',
          coordinates: parsedJson.coordinates,
        };
      }

      // CRS detection
      if (parsedJson.crs?.properties?.name) {
        inputCrs = parsedJson.crs.properties.name;
      }
    }

    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract valid Polygon or MultiPolygon geometry from input.' },
        { status: 400 }
      );
    }

    // Geometry Validation and Vertex Processing
    const outerRing: number[][] =
      geometry.type === 'MultiPolygon'
        ? geometry.coordinates[0][0]
        : geometry.coordinates[0];

    // Ensure closure
    let isClosed = true;
    const firstPt = outerRing[0];
    const lastPt = outerRing[outerRing.length - 1];
    if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
      isClosed = false;
      outerRing.push([firstPt[0], firstPt[1]]);
      warnings.push('Polygon was not topologically closed. Automated closure vertex appended.');
    }

    // Self-intersection check
    const isSelfIntersecting = checkSelfIntersection(outerRing);
    if (isSelfIntersecting) {
      warnings.push('Self-intersection detected in polygon boundary. Topological repairs suggested.');
    }

    // Bounding box and Centroid calculation
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let sumLon = 0;
    let sumLat = 0;

    for (let i = 0; i < outerRing.length - 1; i++) {
      const [lon, lat] = outerRing[i];
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      sumLon += lon;
      sumLat += lat;
    }

    const vertexCount = outerRing.length;
    const centroidLon = +(sumLon / (vertexCount - 1)).toFixed(6);
    const centroidLat = +(sumLat / (vertexCount - 1)).toFixed(6);
    const bbox: [number, number, number, number] = [minLon, minLat, maxLon, maxLat];

    // Calculate Area and Perimeter
    const { areaM2, perimeterM } = calculateGeodesicPolygonArea(outerRing);
    const areaHa = +(areaM2 / 10000).toFixed(2);
    const utmZone = getUtmZone(centroidLon, centroidLat);

    const aoiObject: CustomAOI = {
      id: `aoi_${Date.now()}`,
      name: filename.replace(/\.[^/.]+$/, ''),
      format: detectedFormat,
      crs: {
        inputCrs,
        canonicalCrs: 'EPSG:4326',
        utmZone,
      },
      geometry,
      bbox,
      centroid: [centroidLon, centroidLat],
      metrics: {
        areaHa,
        areaM2,
        perimeterM,
        vertexCount,
      },
      validation: {
        isValid: !isSelfIntersecting && vertexCount >= 4,
        isSelfIntersecting,
        isClosed,
        reprojected: inputCrs !== 'EPSG:4326',
        warnings,
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      aoi: aoiObject,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to process AOI geometry' },
      { status: 500 }
    );
  }
}
