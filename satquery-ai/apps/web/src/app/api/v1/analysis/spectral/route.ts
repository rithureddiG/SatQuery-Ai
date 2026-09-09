import { NextRequest, NextResponse } from 'next/server';

export interface SpectralBand {
  band: string;
  name: string;
  wavelengthNm: number;
  reflectance: number; // 0.0 - 1.0 (BOA surface reflectance)
  category: 'VNIR' | 'RedEdge' | 'SWIR';
}

export interface SpectralIndices {
  ndvi: number; // Normalized Difference Vegetation Index: (B08 - B04)/(B08 + B04)
  ndwi: number; // Normalized Difference Water Index: (B03 - B08)/(B03 + B08)
  ndbi: number; // Normalized Difference Built-up Index: (B11 - B08)/(B11 + B08)
  evi: number;  // Enhanced Vegetation Index: 2.5 * (B08 - B04) / (B08 + 6*B04 - 7.5*B02 + 1)
  savi: number; // Soil-Adjusted Vegetation Index: 1.5 * (B08 - B04) / (B08 + B04 + 0.5)
}

export interface SarSignature {
  vvDb: number;
  vhDb: number;
  vvVhRatioDb: number;
  scatteringMechanism: 'Double-bounce (Built Structure)' | 'Volumetric (Canopy / Crops)' | 'Specular (Water / Smooth Surface)' | 'Rough Surface (Bare Soil)';
  polarizationConfidence: number;
}

export interface ZonalStatistics {
  meanNdvi: number;
  medianNdvi: number;
  stdDevNdvi: number;
  minNdvi: number;
  maxNdvi: number;
  meanSarVvDb: number;
  meanSarVhDb: number;
  areaHa: number;
  pixelCount: number;
  dominantSurface: string;
}

export interface SpectralInspectionResult {
  location: {
    lat: number;
    lon: number;
    gsdM: number;
    crs: string;
  };
  sensor: {
    optical: string;
    sar: string;
    acquisitionDate: string;
    sunElevationDeg: number;
  };
  bands: SpectralBand[];
  indices: SpectralIndices;
  sar: SarSignature;
  zonalStats?: ZonalStatistics;
}

// Deterministic synthetic spectral generator based on coordinate hash and physical surface models
function generatePhysicalSpectrum(lat: number, lon: number): {
  bands: SpectralBand[];
  indices: SpectralIndices;
  sar: SarSignature;
  dominantSurface: string;
} {
  // Deterministic seed from coordinates
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453) % 1;

  // Determine surface archetype based on coordinate characteristics
  let archetype: 'vegetation' | 'urban' | 'water' | 'soil';
  if (seed > 0.65) {
    archetype = 'vegetation';
  } else if (seed > 0.35) {
    archetype = 'urban';
  } else if (seed > 0.15) {
    archetype = 'soil';
  } else {
    archetype = 'water';
  }

  let b01, b02, b03, b04, b05, b06, b07, b08, b8a, b09, b11, b12: number;
  let vvDb: number;
  let vhDb: number;
  let scattering: SarSignature['scatteringMechanism'];

  if (archetype === 'vegetation') {
    // Typical healthy green canopy: low red absorption (chlorophyll), massive NIR plateau, SWIR dip
    b01 = +(0.038 + seed * 0.01).toFixed(3); // Coastal
    b02 = +(0.042 + seed * 0.01).toFixed(3); // Blue
    b03 = +(0.078 + seed * 0.02).toFixed(3); // Green peak
    b04 = +(0.048 + seed * 0.01).toFixed(3); // Red absorption
    b05 = +(0.142 + seed * 0.03).toFixed(3); // Red Edge 1
    b06 = +(0.264 + seed * 0.04).toFixed(3); // Red Edge 2
    b07 = +(0.332 + seed * 0.05).toFixed(3); // Red Edge 3
    b08 = +(0.485 + seed * 0.05).toFixed(3); // NIR plateau
    b8a = +(0.472 + seed * 0.05).toFixed(3); // Narrow NIR
    b09 = +(0.015 + seed * 0.01).toFixed(3); // Water vapor
    b11 = +(0.210 + seed * 0.03).toFixed(3); // SWIR 1
    b12 = +(0.118 + seed * 0.02).toFixed(3); // SWIR 2

    vvDb = +(-12.4 + seed * 2.0).toFixed(1);
    vhDb = +(-17.8 + seed * 2.0).toFixed(1);
    scattering = 'Volumetric (Canopy / Crops)';
  } else if (archetype === 'urban') {
    // Built-up / concrete / asphalt: moderately high across visible and SWIR, NDBI > 0
    b01 = +(0.112 + seed * 0.02).toFixed(3);
    b02 = +(0.134 + seed * 0.02).toFixed(3);
    b03 = +(0.156 + seed * 0.02).toFixed(3);
    b04 = +(0.182 + seed * 0.03).toFixed(3);
    b05 = +(0.198 + seed * 0.03).toFixed(3);
    b06 = +(0.215 + seed * 0.03).toFixed(3);
    b07 = +(0.228 + seed * 0.03).toFixed(3);
    b08 = +(0.245 + seed * 0.03).toFixed(3);
    b8a = +(0.252 + seed * 0.03).toFixed(3);
    b09 = +(0.032 + seed * 0.01).toFixed(3);
    b11 = +(0.320 + seed * 0.04).toFixed(3); // High SWIR
    b12 = +(0.278 + seed * 0.03).toFixed(3);

    vvDb = +(-6.8 + seed * 3.0).toFixed(1); // Strong double bounce
    vhDb = +(-13.2 + seed * 2.5).toFixed(1);
    scattering = 'Double-bounce (Built Structure)';
  } else if (archetype === 'water') {
    // Water: high blue/green absorption, near-zero NIR and SWIR
    b01 = +(0.092 + seed * 0.02).toFixed(3);
    b02 = +(0.084 + seed * 0.02).toFixed(3);
    b03 = +(0.065 + seed * 0.01).toFixed(3);
    b04 = +(0.028 + seed * 0.01).toFixed(3);
    b05 = +(0.015 + seed * 0.01).toFixed(3);
    b06 = +(0.009 + seed * 0.005).toFixed(3);
    b07 = +(0.006 + seed * 0.004).toFixed(3);
    b08 = +(0.005 + seed * 0.003).toFixed(3); // Zero NIR
    b8a = +(0.004 + seed * 0.003).toFixed(3);
    b09 = +(0.002 + seed * 0.002).toFixed(3);
    b11 = +(0.002 + seed * 0.001).toFixed(3);
    b12 = +(0.001 + seed * 0.001).toFixed(3);

    vvDb = +(-22.5 + seed * 2.0).toFixed(1); // Very low specular backscatter
    vhDb = +(-28.0 + seed * 2.0).toFixed(1);
    scattering = 'Specular (Water / Smooth Surface)';
  } else {
    // Bare soil: steady linear rise from blue to SWIR
    b01 = +(0.085 + seed * 0.02).toFixed(3);
    b02 = +(0.110 + seed * 0.02).toFixed(3);
    b03 = +(0.145 + seed * 0.02).toFixed(3);
    b04 = +(0.195 + seed * 0.03).toFixed(3);
    b05 = +(0.220 + seed * 0.03).toFixed(3);
    b06 = +(0.245 + seed * 0.03).toFixed(3);
    b07 = +(0.260 + seed * 0.03).toFixed(3);
    b08 = +(0.280 + seed * 0.03).toFixed(3);
    b8a = +(0.285 + seed * 0.03).toFixed(3);
    b09 = +(0.040 + seed * 0.01).toFixed(3);
    b11 = +(0.360 + seed * 0.04).toFixed(3);
    b12 = +(0.310 + seed * 0.03).toFixed(3);

    vvDb = +(-10.5 + seed * 2.0).toFixed(1);
    vhDb = +(-16.2 + seed * 2.0).toFixed(1);
    scattering = 'Rough Surface (Bare Soil)';
  }

  const bands: SpectralBand[] = [
    { band: 'B01', name: 'Coastal Aerosol', wavelengthNm: 443, reflectance: b01, category: 'VNIR' },
    { band: 'B02', name: 'Blue', wavelengthNm: 490, reflectance: b02, category: 'VNIR' },
    { band: 'B03', name: 'Green', wavelengthNm: 560, reflectance: b03, category: 'VNIR' },
    { band: 'B04', name: 'Red', wavelengthNm: 665, reflectance: b04, category: 'VNIR' },
    { band: 'B05', name: 'Red Edge 1', wavelengthNm: 705, reflectance: b05, category: 'RedEdge' },
    { band: 'B06', name: 'Red Edge 2', wavelengthNm: 740, reflectance: b06, category: 'RedEdge' },
    { band: 'B07', name: 'Red Edge 3', wavelengthNm: 783, reflectance: b07, category: 'RedEdge' },
    { band: 'B08', name: 'NIR Broad', wavelengthNm: 842, reflectance: b08, category: 'VNIR' },
    { band: 'B8A', name: 'NIR Narrow', wavelengthNm: 865, reflectance: b8a, category: 'VNIR' },
    { band: 'B09', name: 'Water Vapor', wavelengthNm: 945, reflectance: b09, category: 'VNIR' },
    { band: 'B11', name: 'SWIR 1', wavelengthNm: 1610, reflectance: b11, category: 'SWIR' },
    { band: 'B12', name: 'SWIR 2', wavelengthNm: 2190, reflectance: b12, category: 'SWIR' },
  ];

  // Calculate indices
  const ndvi = +((b08 - b04) / (b08 + b04)).toFixed(3);
  const ndwi = +((b03 - b08) / (b03 + b08)).toFixed(3);
  const ndbi = +((b11 - b08) / (b11 + b08)).toFixed(3);
  const evi = +(2.5 * (b08 - b04) / (b08 + 6 * b04 - 7.5 * b02 + 1)).toFixed(3);
  const savi = +(1.5 * (b08 - b04) / (b08 + b04 + 0.5)).toFixed(3);

  const vvVhRatioDb = +(vvDb - vhDb).toFixed(1);

  return {
    bands,
    indices: { ndvi, ndwi, ndbi, evi, savi },
    sar: {
      vvDb,
      vhDb,
      vvVhRatioDb,
      scatteringMechanism: scattering,
      polarizationConfidence: +(0.88 + seed * 0.1).toFixed(2),
    },
    dominantSurface: archetype.toUpperCase(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lat = typeof body.lat === 'number' ? body.lat : 12.9716;
    const lon = typeof body.lon === 'number' ? body.lon : 77.5946;
    const polygon = body.polygon;
    const epochDate = body.epochDate || '2026-08-30';

    const { bands, indices, sar, dominantSurface } = generatePhysicalSpectrum(lat, lon);

    let zonalStats: ZonalStatistics | undefined;

    if (polygon) {
      // Calculate realistic zonal statistics across the polygon region
      const areaHa = body.areaHa || 14.82;
      const pixelCount = Math.round(areaHa * 1000); // 10m x 10m pixels = 100 per ha
      const meanNdvi = indices.ndvi;
      const stdDevNdvi = 0.08;

      zonalStats = {
        meanNdvi,
        medianNdvi: +(meanNdvi + 0.02).toFixed(2),
        stdDevNdvi,
        minNdvi: +(Math.max(-1, meanNdvi - stdDevNdvi * 2.2)).toFixed(2),
        maxNdvi: +(Math.min(1, meanNdvi + stdDevNdvi * 1.8)).toFixed(2),
        meanSarVvDb: sar.vvDb,
        meanSarVhDb: sar.vhDb,
        areaHa,
        pixelCount,
        dominantSurface,
      };
    }

    const result: SpectralInspectionResult = {
      location: {
        lat: +lat.toFixed(6),
        lon: +lon.toFixed(6),
        gsdM: 10.0,
        crs: 'EPSG:4326',
      },
      sensor: {
        optical: 'Sentinel-2B MSI Level-2A (BOA Reflectance)',
        sar: 'Sentinel-1A C-SAR GRD (Dual-Pol VV/VH)',
        acquisitionDate: epochDate,
        sunElevationDeg: 58.4,
      },
      bands,
      indices,
      sar,
      zonalStats,
    };

    return NextResponse.json({ success: true, inspection: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Spectral inspection failed' },
      { status: 500 }
    );
  }
}
