import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backendProxy';
export async function POST(req: NextRequest) { return proxyJson(req, '/api/v1/query'); }
