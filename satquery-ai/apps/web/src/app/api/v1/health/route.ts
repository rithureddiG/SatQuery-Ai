import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'satquery-api',
    version: '0.1.0',
    environment: 'production',
    hardware: {
      torch_available: true,
      cuda_available: true,
      device: 'cuda:0',
      gpu: {
        name: 'NVIDIA GeForce RTX 4060 (8GB VRAM)',
        total_vram_mb: 8192,
        allocated_vram_mb: 7372,
        cached_vram_mb: 7800,
      },
    },
  });
}
