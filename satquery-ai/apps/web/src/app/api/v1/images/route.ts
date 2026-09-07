import { NextResponse } from 'next/server';

const demoImages = [
  {
    id: 'opt_t1',
    filename: 'ahmedabad_sentinel2_t1_2024.tif',
    status: 'valid',
    modality: 'optical',
    width: 10980,
    height: 10980,
    crs_epsg: 32643,
  },
  {
    id: 'opt_t2',
    filename: 'ahmedabad_sentinel2_t2_2026.tif',
    status: 'valid',
    modality: 'optical',
    width: 10980,
    height: 10980,
    crs_epsg: 32643,
  },
  {
    id: 'sar_s1',
    filename: 'ahmedabad_sentinel1_sar_2026.tif',
    status: 'ready',
    modality: 'sar',
    width: 10980,
    height: 10980,
    crs_epsg: 32643,
  },
];

export async function GET() {
  return NextResponse.json(demoImages);
}
