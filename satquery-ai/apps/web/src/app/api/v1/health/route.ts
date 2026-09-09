import { proxyGet } from '@/lib/backendProxy';
export async function GET() { return proxyGet('/api/v1/health'); }
