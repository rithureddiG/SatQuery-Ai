import { NextRequest, NextResponse } from 'next/server';

/**
 * Scientific change detection is owned by the backend ChangeNet/GIS pipeline.
 * This route must not manufacture masks, areas, confidence, timings, or provenance.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    job_id: null,
    image_before_id: body.image_before_id ?? null,
    image_after_id: body.image_after_id ?? null,
    decision: 'ABSTAIN',
    change_percent: null,
    total_area_m2: null,
    total_area_ha: null,
    cluster_count: null,
    regions_geojson: { type: 'FeatureCollection', features: [] },
    is_trained: false,
    confidence: null,
    evidence: [],
    provenance: null,
    limitations: ['No verified backend ChangeNet execution was supplied.'],
    execution_mode: 'unsupported_frontend_stub',
  }, { status: 501 });
}
