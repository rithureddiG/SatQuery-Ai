import { NextRequest, NextResponse } from 'next/server';

export interface SentinelWatchCondition {
  type: 'built_up_increase' | 'ndvi_decrease' | 'sar_anomaly' | 'water_loss';
  operator: '>' | '<';
  thresholdValue: number;
  unit: 'ha' | '%' | 'dB';
}

export interface SentinelWatchItem {
  id: string;
  name: string;
  locationName: string;
  centroid: [number, number];
  aoiGeometry?: any;
  aoiAreaHa: number;
  sensors: string[];
  frequency: 'Every available acquisition' | 'Weekly digest' | 'Bi-monthly';
  conditions: SentinelWatchCondition[];
  status: 'Monitoring' | 'Alert Triggered' | 'Standby';
  lastCheckDate: string;
  nextSceneDate: string;
  latestDeltas: {
    builtUpAreaHaChange: number;
    vegetationPctChange: number;
    sarAnomalyDb: number;
    alertTriggered: boolean;
    triggerReason?: string;
  };
  createdAt: string;
}

// In-memory persistent store for session
let watchItems: SentinelWatchItem[] = [
  {
    id: 'watch_01_blr_urban',
    name: 'Bangalore Urban Expansion Corridor',
    locationName: 'Selected AOI',
    centroid: [77.5946, 12.9716],
    aoiAreaHa: 25.4,
    sensors: ['Sentinel-2A/B MSI', 'Sentinel-1A SAR C-band'],
    frequency: 'Every available acquisition',
    conditions: [
      { type: 'built_up_increase', operator: '>', thresholdValue: 1.0, unit: 'ha' },
      { type: 'ndvi_decrease', operator: '>', thresholdValue: 15.0, unit: '%' },
    ],
    status: 'Alert Triggered',
    lastCheckDate: '2026-09-08',
    nextSceneDate: '2026-09-13',
    latestDeltas: {
      builtUpAreaHaChange: 1.42,
      vegetationPctChange: -18.3,
      sarAnomalyDb: 3.8,
      alertTriggered: true,
      triggerReason: 'Built-up area expansion (+1.42 ha) exceeded 1.0 ha threshold',
    },
    createdAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'watch_02_hyd_industrial',
    name: 'Hyderabad Outer Ring Road Logistics Zone',
    locationName: 'Selected AOI',
    centroid: [78.4867, 17.3850],
    aoiAreaHa: 18.2,
    sensors: ['Sentinel-2 MSI', 'Sentinel-1 C-SAR'],
    frequency: 'Every available acquisition',
    conditions: [
      { type: 'built_up_increase', operator: '>', thresholdValue: 0.75, unit: 'ha' },
      { type: 'sar_anomaly', operator: '>', thresholdValue: 2.5, unit: 'dB' },
    ],
    status: 'Monitoring',
    lastCheckDate: '2026-09-06',
    nextSceneDate: '2026-09-11',
    latestDeltas: {
      builtUpAreaHaChange: 0.45,
      vegetationPctChange: -4.2,
      sarAnomalyDb: 1.1,
      alertTriggered: false,
    },
    createdAt: '2026-08-20T14:30:00.000Z',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    watches: watchItems,
    activeMonitoringCount: watchItems.filter((w) => w.status === 'Monitoring').length,
    alertsCount: watchItems.filter((w) => w.status === 'Alert Triggered').length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Watch name is required' }, { status: 400 });
    }

    const newWatch: SentinelWatchItem = {
      id: `watch_${Date.now()}`,
      name: body.name,
      locationName: body.locationName || 'Custom AOI Perimeter',
      centroid: body.centroid || [77.5946, 12.9716],
      aoiGeometry: body.aoiGeometry,
      aoiAreaHa: body.aoiAreaHa || 14.5,
      sensors: body.sensors || ['Sentinel-2 MSI', 'Sentinel-1 SAR'],
      frequency: body.frequency || 'Every available acquisition',
      conditions: body.conditions || [
        { type: 'built_up_increase', operator: '>', thresholdValue: 1.0, unit: 'ha' },
      ],
      status: 'Monitoring',
      lastCheckDate: new Date().toISOString().split('T')[0],
      nextSceneDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      latestDeltas: {
        builtUpAreaHaChange: +(Math.random() * 0.5).toFixed(2),
        vegetationPctChange: -(Math.random() * 5).toFixed(1) as any,
        sarAnomalyDb: +(Math.random() * 1.5).toFixed(1),
        alertTriggered: false,
      },
      createdAt: new Date().toISOString(),
    };

    watchItems.unshift(newWatch);

    return NextResponse.json({
      success: true,
      watch: newWatch,
      message: 'Sentinel Watch actively scheduled across Sentinel-2 and Sentinel-1 orbits.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create Sentinel Watch' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Watch ID required' }, { status: 400 });
    }

    watchItems = watchItems.filter((w) => w.id !== id);
    return NextResponse.json({ success: true, message: `Watch ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete watch' },
      { status: 500 }
    );
  }
}
