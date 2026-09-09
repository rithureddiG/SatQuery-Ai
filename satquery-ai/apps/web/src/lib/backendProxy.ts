import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.SATQUERY_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function forward(upstream: Response): Promise<NextResponse> {
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  });
}

function unavailable(error: unknown): NextResponse {
  return NextResponse.json({ error: `SatQuery backend unavailable: ${String(error)}` }, { status: 503 });
}

export async function proxyJson(req: NextRequest, path: string): Promise<NextResponse> {
  try {
    return forward(await fetch(`${BACKEND_URL}${path}`, {
      method: req.method,
      headers: { 'content-type': 'application/json' },
      body: await req.text(),
      cache: 'no-store',
    }));
  } catch (error) { return unavailable(error); }
}

export async function proxyGet(path: string): Promise<NextResponse> {
  try { return forward(await fetch(`${BACKEND_URL}${path}`, { cache: 'no-store' })); }
  catch (error) { return unavailable(error); }
}

export async function proxyFormData(req: NextRequest, path: string): Promise<NextResponse> {
  try {
    return forward(await fetch(`${BACKEND_URL}${path}`, {
      method: req.method,
      headers: { 'content-type': req.headers.get('content-type') || '' },
      body: await req.arrayBuffer(),
      cache: 'no-store',
    }));
  } catch (error) { return unavailable(error); }
}
