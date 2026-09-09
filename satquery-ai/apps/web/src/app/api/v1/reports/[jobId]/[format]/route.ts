import { proxyGet } from '@/lib/backendProxy';
export async function GET(_req: Request, { params }: { params: { jobId: string; format: string } }) {
  return proxyGet(`/api/v1/reports/${encodeURIComponent(params.jobId)}/${encodeURIComponent(params.format)}`);
}
