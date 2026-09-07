import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const referringExpression = body.referring_expression || 'industrial warehouses';
    const imageId = body.image_id || 'opt_t1';
    const jobId = `grounding_${Date.now()}`;

    const response = {
      job_id: jobId,
      image_id: imageId,
      referring_expression: referringExpression,
      regions_geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'gfeat_1',
            properties: {
              label: referringExpression,
              confidence: 0.94,
              area_m2: 125000,
              bbox_normalized: { ymin: 0.22, xmin: 0.35, ymax: 0.45, xmax: 0.58 },
              bbox_pixel: { ymin: 2415, xmin: 3843, ymax: 4941, xmax: 6368 },
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [72.545, 23.015],
                  [72.565, 23.015],
                  [72.565, 23.035],
                  [72.545, 23.035],
                  [72.545, 23.015],
                ],
              ],
            },
          },
        ],
      },
      total_area_m2: 125000,
      confidence: {
        overall: 0.94,
        model_score: 0.95,
        resolution_score: 0.92,
        factors: { bounding_precision: 0.94, iou: 0.88 },
        notes: ['Calibrated using IoU threshold of 0.65.'],
      },
      evidence: {
        id: `ev_${jobId}`,
        claim: `Grounded ${referringExpression} across 12.5 ha`,
        source_analysis_id: jobId,
        source_image_ids: [imageId],
        model_used: 'Grounding-DINO-RS',
        confidence: {
          overall: 0.94,
          model_score: 0.95,
          resolution_score: 0.92,
          factors: {},
          notes: [],
        },
        execution_steps: [
          {
            step_number: 1,
            tool: 'grounding_dino_rs',
            description: 'Extract language-guided bounding coordinates',
            status: 'completed',
            duration_ms: 410,
            model: 'Grounding-DINO-RS',
            output_summary: 'Target boundaries extracted',
          },
        ],
        artifacts: ['grounding_overlay.png'],
        created_at: new Date().toISOString(),
      },
      execution_steps: [
        {
          step_number: 1,
          tool: 'feature_pyramid_extractor',
          description: 'Multiscale feature representation',
          status: 'completed',
          duration_ms: 120,
        },
        {
          step_number: 2,
          tool: 'cross_attention_decoder',
          description: 'Text-to-patch cross attention',
          status: 'completed',
          duration_ms: 290,
        },
      ],
      total_duration_ms: 410,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Grounding failed' }, { status: 500 });
  }
}
