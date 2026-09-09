import { NextRequest, NextResponse } from 'next/server';

/** Optical-SAR corroboration is calculated by the backend with validated paired assets. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    job_id: null,
    optical_image_id: body.optical_image_id ?? null,
    sar_image_id: body.sar_image_id ?? null,
    decision: 'ABSTAIN',
    corroboration_score: null,
    joint_claim: null,
    confidence: null,
    evidence: [],
    provenance: null,
    limitations: ['No verified backend optical-SAR execution was supplied.'],
    execution_mode: 'unsupported_frontend_stub',
  }, { status: 501 });
}
