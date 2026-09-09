import { NextRequest, NextResponse } from 'next/server';

/** Grounding is only valid when supplied by a verified image-conditioned backend model. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    job_id: null,
    image_id: body.image_id ?? null,
    referring_expression: body.referring_expression ?? null,
    decision: 'ABSTAIN',
    regions_geojson: { type: 'FeatureCollection', features: [] },
    total_area_m2: null,
    total_area_ha: null,
    confidence: null,
    evidence: [],
    provenance: null,
    limitations: ['No verified backend grounding execution was supplied.'],
    execution_mode: 'unsupported_frontend_stub',
  }, { status: 501 });
}
