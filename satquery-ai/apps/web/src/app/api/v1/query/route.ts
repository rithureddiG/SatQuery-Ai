import { NextRequest, NextResponse } from 'next/server';

/** The browser routes queries to the backend; it never performs scientific inference. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    query: body.query ?? null,
    intent: null,
    task: null,
    decision: 'ABSTAIN',
    answer: null,
    pipeline_result: null,
    confidence: null,
    evidence: [],
    provenance: null,
    limitations: ['No backend execution graph was supplied to the frontend route.'],
    execution_mode: 'unsupported_frontend_stub',
  }, { status: 501 });
}
