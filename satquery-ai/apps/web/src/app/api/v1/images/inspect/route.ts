import { NextRequest } from 'next/server';
import { proxyFormData } from '@/lib/backendProxy';
export async function POST(req: NextRequest) { return proxyFormData(req, '/api/v1/images/inspect'); }
