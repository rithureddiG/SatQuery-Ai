import { NextRequest, NextResponse } from 'next/server';

export interface EpochObservation {
  id: string;
  date: string;          // YYYY-MM-DD
  year: number;
  month: string;         // 'Jan', 'Apr', etc.
  sensor: 'Sentinel-2A' | 'Sentinel-2B' | 'Sentinel-1A' | 'Landsat-9';
  modality: 'optical' | 'sar';
  cloudCoverPct: number; // 0.0 - 100.0 (0 for SAR)
  resolutionM: number;
  orbitPass: string;     // e.g. 'Relative Orbit 43 (Descending)'
  sunElevationDeg: number;
  tileId: string;
  isBaseline?: boolean;
  isLatest?: boolean;
  cumulativeChangeHa: number;
  thumbnailUrl: string;
  quality: 'Excellent' | 'Good' | 'Cloudy' | 'Radar High-Fidelity';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mission = searchParams.get('mission') || 'bangalore';
    const locationName = searchParams.get('location') || 'Bangalore Urban Corridor';

    const observations: EpochObservation[] = [
      {
        id: 'epoch_2024_03',
        date: '2024-03-15',
        year: 2024,
        month: 'Mar',
        sensor: 'Sentinel-2A',
        modality: 'optical',
        cloudCoverPct: 1.2,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 43 (Descending)',
        sunElevationDeg: 62.1,
        tileId: 'T43PGP_20240315',
        isBaseline: true,
        cumulativeChangeHa: 0.0,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Excellent',
      },
      {
        id: 'epoch_2024_07',
        date: '2024-07-22',
        year: 2024,
        month: 'Jul',
        sensor: 'Sentinel-1A',
        modality: 'sar',
        cloudCoverPct: 0.0,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 116 (Ascending)',
        sunElevationDeg: 0,
        tileId: 'S1A_IW_GRDH_20240722',
        cumulativeChangeHa: 0.35,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Radar High-Fidelity',
      },
      {
        id: 'epoch_2024_11',
        date: '2024-11-08',
        year: 2024,
        month: 'Nov',
        sensor: 'Sentinel-2B',
        modality: 'optical',
        cloudCoverPct: 3.4,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 43 (Descending)',
        sunElevationDeg: 49.3,
        tileId: 'T43PGP_20241108',
        cumulativeChangeHa: 0.62,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Good',
      },
      {
        id: 'epoch_2025_02',
        date: '2025-02-18',
        year: 2025,
        month: 'Feb',
        sensor: 'Sentinel-2A',
        modality: 'optical',
        cloudCoverPct: 0.8,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 43 (Descending)',
        sunElevationDeg: 55.6,
        tileId: 'T43PGP_20250218',
        cumulativeChangeHa: 0.89,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Excellent',
      },
      {
        id: 'epoch_2025_06',
        date: '2025-06-25',
        year: 2025,
        month: 'Jun',
        sensor: 'Sentinel-1A',
        modality: 'sar',
        cloudCoverPct: 0.0,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 116 (Ascending)',
        sunElevationDeg: 0,
        tileId: 'S1A_IW_GRDH_20250625',
        cumulativeChangeHa: 1.15,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Radar High-Fidelity',
      },
      {
        id: 'epoch_2025_10',
        date: '2025-10-14',
        year: 2025,
        month: 'Oct',
        sensor: 'Sentinel-2B',
        modality: 'optical',
        cloudCoverPct: 4.1,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 43 (Descending)',
        sunElevationDeg: 52.0,
        tileId: 'T43PGP_20251014',
        cumulativeChangeHa: 1.48,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Good',
      },
      {
        id: 'epoch_2026_01',
        date: '2026-01-22',
        year: 2026,
        month: 'Jan',
        sensor: 'Sentinel-2A',
        modality: 'optical',
        cloudCoverPct: 1.5,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 43 (Descending)',
        sunElevationDeg: 46.8,
        tileId: 'T43PGP_20260122',
        cumulativeChangeHa: 1.74,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Excellent',
      },
      {
        id: 'epoch_2026_05',
        date: '2026-05-19',
        year: 2026,
        month: 'May',
        sensor: 'Sentinel-1A',
        modality: 'sar',
        cloudCoverPct: 0.0,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 116 (Ascending)',
        sunElevationDeg: 0,
        tileId: 'S1A_IW_GRDH_20260519',
        cumulativeChangeHa: 2.12,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Radar High-Fidelity',
      },
      {
        id: 'epoch_2026_08',
        date: '2026-08-30',
        year: 2026,
        month: 'Aug',
        sensor: 'Sentinel-2B',
        modality: 'optical',
        cloudCoverPct: 2.3,
        resolutionM: 10,
        orbitPass: 'Rel Orbit 43 (Descending)',
        sunElevationDeg: 59.4,
        tileId: 'T43PGP_20260830',
        isLatest: true,
        cumulativeChangeHa: 2.56,
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/9344/6020',
        quality: 'Excellent',
      },
    ];

    return NextResponse.json({
      success: true,
      mission,
      locationName,
      baselineEpochId: 'epoch_2024_03',
      latestEpochId: 'epoch_2026_08',
      count: observations.length,
      observations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch timeline catalog' },
      { status: 500 }
    );
  }
}
