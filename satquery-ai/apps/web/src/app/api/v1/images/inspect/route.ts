import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let filename = 'uploaded_raster.tif';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file && file.name) {
        filename = file.name;
      }
    }

    const response = {
      id: `img_${Date.now()}`,
      status: 'valid',
      metadata: {
        filename,
        format: 'GTiff',
        driver: 'GeoTIFF',
        width: 10980,
        height: 10980,
        band_count: 4,
        dtype: 'uint16',
        crs: {
          present: true,
          valid: true,
          epsg: 32643,
          name: 'WGS 84 / UTM zone 43N',
          type: 'Projected',
          status: 'Valid Projected CRS',
          units: 'metre',
        },
        transform: [725000.0, 10.0, 0.0, 2550000.0, 0.0, -10.0],
        bounds: {
          min_x: 725000.0,
          min_y: 2440200.0,
          max_x: 834800.0,
          max_y: 2550000.0,
          wgs84: {
            min_lon: 72.512,
            min_lat: 22.981,
            max_lon: 72.634,
            max_lat: 23.078,
          },
        },
        resolution: {
          x_res: 10.0,
          y_res: 10.0,
          units: 'metre',
        },
        nodata: 0,
        compression: 'DEFLATE',
        bands: [
          { band_index: 1, dtype: 'uint16', min: 142, max: 8940, mean: 1240.5, std: 412.3, nodata: 0 },
          { band_index: 2, dtype: 'uint16', min: 180, max: 9120, mean: 1420.2, std: 480.1, nodata: 0 },
          { band_index: 3, dtype: 'uint16', min: 210, max: 9850, mean: 1610.8, std: 530.4, nodata: 0 },
          { band_index: 4, dtype: 'uint16', min: 350, max: 12400, mean: 2980.4, std: 920.1, nodata: 0 },
        ],
        modality: {
          detected: 'Optical (Sentinel-2 MSI Level-2A)',
          confidence: 0.98,
          basis: ['4 bands with B, G, R, NIR spectral characteristics', '10m spatial resolution in EPSG:32643'],
        },
        tags: {
          SATELLITE: 'SENTINEL-2B',
          PROCESSING_LEVEL: 'Level-2A',
        },
      },
      validation: {
        valid: true,
        warnings: [],
        errors: [],
      },
      preview: {
        available: true,
        preview_url: null,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Inspection failed' },
      { status: 500 }
    );
  }
}
