'use client';

import React, { useRef, useEffect } from 'react';
import { LensMode, TemporalViewMode, ChangeCluster } from '../../context/WorkspaceContext';

interface RealisticSatelliteCanvasProps {
  activeLens: LensMode;
  activeDatasetIndex: number;
  temporalMode: TemporalViewMode;
  sliderPos: number;
  onSliderChange?: (pos: number) => void;
  clusters: ChangeCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (id: string | null) => void;
  dateT1: string;
  dateT2: string;
}

export const RealisticSatelliteCanvas: React.FC<RealisticSatelliteCanvasProps> = ({
  activeLens,
  activeDatasetIndex,
  temporalMode,
  sliderPos,
  clusters,
  selectedClusterId,
  onSelectCluster,
  dateT1,
  dateT2,
}) => {
  const canvasT1Ref = useRef<HTMLCanvasElement>(null);
  const canvasT2Ref = useRef<HTMLCanvasElement>(null);
  const canvasNIRRef = useRef<HTMLCanvasElement>(null);
  const canvasSARRef = useRef<HTMLCanvasElement>(null);
  const canvasChangeRef = useRef<HTMLCanvasElement>(null);

  // Render high-fidelity, natural remote-sensing imagery
  useEffect(() => {
    const width = 1200;
    const height = 1200;

    const renderScene = (
      ctx: CanvasRenderingContext2D,
      mode: 'T1' | 'T2' | 'NIR' | 'SAR' | 'CHANGE'
    ) => {
      // 1. Natural Terrain Base
      if (mode === 'SAR') {
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, width, height);
      } else if (mode === 'NIR') {
        ctx.fillStyle = '#8B263E'; // High vegetative reflectance in NIR
        ctx.fillRect(0, 0, width, height);
      } else {
        // Natural Sentinel-2 Earth Surface
        ctx.fillStyle = '#3E4D38';
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Agricultural Parcels Grid
      const parcelColorsT1 = ['#4A5A42', '#3D4D35', '#52634A', '#45553E', '#5B6B52', '#3A4832'];
      const parcelColorsT2 = ['#4A5A42', '#3D4D35', '#52634A', '#45553E', '#5B6B52', '#3A4832'];
      const parcelColorsNIR = ['#A8324E', '#942B44', '#BD3C5A', '#7A2237', '#B03552'];

      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const px = c * 100;
          const py = r * 100;

          // Skip lake area
          if ((c >= 7 && r <= 4) || (c <= 3 && r >= 8)) continue;
          // Skip change tech-park area for T2
          if (mode === 'T2' && ((c >= 4 && c <= 6 && r >= 5 && r <= 7) || (c >= 7 && c <= 8 && r >= 5 && r <= 7))) continue;

          ctx.fillStyle =
            mode === 'SAR'
              ? (c + r) % 2 === 0 ? '#383838' : '#2A2A2A'
              : mode === 'NIR'
              ? parcelColorsNIR[(c * 3 + r * 5) % parcelColorsNIR.length]
              : parcelColorsT1[(c * 3 + r * 5) % parcelColorsT1.length];

          ctx.fillRect(px + 3, py + 3, 94, 94);
        }
      }

      // 3. Natural Lake / Water Reservoir (Sabarmati Basin)
      ctx.beginPath();
      ctx.moveTo(750, 80);
      ctx.bezierCurveTo(900, 40, 1100, 120, 1150, 320);
      ctx.bezierCurveTo(1180, 480, 1040, 560, 920, 500);
      ctx.bezierCurveTo(800, 440, 740, 320, 720, 200);
      ctx.closePath();

      if (mode === 'SAR') {
        ctx.fillStyle = '#080808'; // Specular microwave absorption
      } else if (mode === 'NIR') {
        ctx.fillStyle = '#060A0D'; // Complete NIR water absorption
      } else {
        const waterGrad = ctx.createRadialGradient(950, 280, 40, 950, 280, 260);
        waterGrad.addColorStop(0, '#10242B');
        waterGrad.addColorStop(1, '#1A333D');
        ctx.fillStyle = waterGrad;
      }
      ctx.fill();

      // Southwest lake
      ctx.beginPath();
      ctx.arc(200, 980, 140, 0, Math.PI * 2);
      ctx.fillStyle = mode === 'SAR' ? '#080808' : mode === 'NIR' ? '#060A0D' : '#142830';
      ctx.fill();

      // 4. Highway Transportation Corridor
      ctx.beginPath();
      ctx.moveTo(0, 520);
      ctx.bezierCurveTo(350, 560, 750, 480, 1200, 470);
      ctx.lineWidth = 14;
      ctx.strokeStyle = mode === 'SAR' ? '#555555' : mode === 'NIR' ? '#33444A' : '#262523';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(520, 0);
      ctx.lineTo(540, 1200);
      ctx.lineWidth = 6;
      ctx.strokeStyle = mode === 'SAR' ? '#444444' : mode === 'NIR' ? '#33444A' : '#3D3B37';
      ctx.stroke();

      // 5. Baseline Settlements (Pre-existing in both T1 and T2)
      const renderSettlement = (bx: number, by: number, bw: number, bh: number) => {
        ctx.fillStyle = mode === 'SAR' ? '#777777' : mode === 'NIR' ? '#5C7D85' : '#6E685E';
        ctx.fillRect(bx, by, bw, bh);
      };
      renderSettlement(180, 220, 180, 160);
      renderSettlement(780, 680, 200, 160);
      renderSettlement(540, 360, 140, 100);

      // 6. Post-Expansion Built-Up Clusters (T2, SAR, NIR, CHANGE only)
      if (mode === 'T2' || mode === 'SAR' || mode === 'NIR' || mode === 'CHANGE') {
        // Cluster 01: Tech Park Complex (1.82 ha)
        const c1X = 420;
        const c1Y = 560;
        const c1W = 220;
        const c1H = 190;

        if (mode === 'SAR') {
          // Intense Double-Bounce Radar Backscatter (-14.5 dB)
          ctx.fillStyle = '#F0F0F0';
          ctx.fillRect(c1X, c1Y, c1W, c1H);
        } else if (mode === 'NIR') {
          ctx.fillStyle = '#6E9BA6'; // Cyan built-up
          ctx.fillRect(c1X, c1Y, c1W, c1H);
        } else if (mode === 'T2') {
          // Modern White/Grey Clean Industrial Roofs
          ctx.fillStyle = '#C8C2B8';
          ctx.fillRect(c1X, c1Y, c1W, c1H);
          ctx.fillStyle = '#EBE6DE';
          ctx.fillRect(c1X + 15, c1Y + 15, 85, 75);
          ctx.fillRect(c1X + 115, c1Y + 15, 85, 75);
          ctx.fillRect(c1X + 15, c1Y + 105, 185, 70);
        }

        // Cluster 02: Highway Earthwork & Logistics Depot (0.74 ha)
        const c2X = 690;
        const c2Y = 550;
        const c2W = 200;
        const c2H = 190;

        if (mode === 'SAR') {
          ctx.fillStyle = '#E8E8E8';
          ctx.fillRect(c2X, c2Y, c2W, c2H);
        } else if (mode === 'NIR') {
          ctx.fillStyle = '#6E9BA6';
          ctx.fillRect(c2X, c2Y, c2W, c2H);
        } else if (mode === 'T2') {
          ctx.fillStyle = '#C8C2B8';
          ctx.fillRect(c2X, c2Y, c2W, c2H);
          ctx.fillStyle = '#E0DAD0';
          ctx.fillRect(c2X + 15, c2Y + 15, 170, 75);
          ctx.fillRect(c2X + 15, c2Y + 105, 170, 70);
        }

        // Continuous Sigmoid Heatmap Overlay for CHANGE lens
        if (mode === 'CHANGE') {
          const heat1 = ctx.createRadialGradient(c1X + 110, c1Y + 95, 20, c1X + 110, c1Y + 95, 130);
          heat1.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          heat1.addColorStop(0.7, 'rgba(249, 115, 22, 0.50)');
          heat1.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          ctx.fillStyle = heat1;
          ctx.beginPath();
          ctx.arc(c1X + 110, c1Y + 95, 130, 0, Math.PI * 2);
          ctx.fill();

          const heat2 = ctx.createRadialGradient(c2X + 100, c2Y + 95, 20, c2X + 100, c2Y + 95, 130);
          heat2.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          heat2.addColorStop(0.7, 'rgba(249, 115, 22, 0.50)');
          heat2.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          ctx.fillStyle = heat2;
          ctx.beginPath();
          ctx.arc(c2X + 100, c2Y + 95, 130, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    if (canvasT1Ref.current) {
      const ctx = canvasT1Ref.current.getContext('2d');
      if (ctx) renderScene(ctx, 'T1');
    }
    if (canvasT2Ref.current) {
      const ctx = canvasT2Ref.current.getContext('2d');
      if (ctx) renderScene(ctx, 'T2');
    }
    if (canvasNIRRef.current) {
      const ctx = canvasNIRRef.current.getContext('2d');
      if (ctx) renderScene(ctx, 'NIR');
    }
    if (canvasSARRef.current) {
      const ctx = canvasSARRef.current.getContext('2d');
      if (ctx) renderScene(ctx, 'SAR');
    }
    if (canvasChangeRef.current) {
      const ctx = canvasChangeRef.current.getContext('2d');
      if (ctx) renderScene(ctx, 'CHANGE');
    }
  }, []);

  const isT1Active = activeDatasetIndex === 0;
  const isSARActive = activeDatasetIndex === 2 || activeLens === 'SAR';

  return (
    <div className="relative w-full h-full select-none overflow-hidden flex items-center justify-center bg-[#0A0A0A]">
      {/* 1. Temporal Swipe Mode: Before (2024) ↔ After (2026) Comparison */}
      {temporalMode === 'Swipe' && (activeLens === 'CHANGE' || activeLens === 'True Color') ? (
        <div className="relative w-full h-full overflow-hidden">
          {/* Base Layer: T2 (2026) */}
          <canvas
            ref={canvasT2Ref}
            width={1200}
            height={1200}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* ChangeNet Probability Heatmap overlay on T2 */}
          {activeLens === 'CHANGE' && (
            <canvas
              ref={canvasChangeRef}
              width={1200}
              height={1200}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-5"
            />
          )}

          {/* Clipped Top Layer: T1 (2024) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-[0_0_16px_rgba(255,255,255,0.8)] z-10"
            style={{ width: `${sliderPos}%` }}
          >
            <div
              className="absolute inset-y-0 left-0 h-full"
              style={{ width: `${100 / (sliderPos / 100)}%` }}
            >
              <canvas
                ref={canvasT1Ref}
                width={1200}
                height={1200}
                className="w-full h-full object-cover"
              />
            </div>

            {/* T1 Badge */}
            <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border border-white/20">
              T1 · {dateT1}
            </div>
          </div>

          {/* T2 Badge */}
          <div className="absolute top-16 right-4 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border border-white/20 z-5">
            T2 · {dateT2}
          </div>
        </div>
      ) : temporalMode === 'SideBySide' ? (
        /* 2. Side-by-Side Dual Viewports */
        <div className="grid grid-cols-2 w-full h-full divide-x divide-white/20">
          <div className="relative w-full h-full overflow-hidden">
            <canvas
              ref={canvasT1Ref}
              width={1200}
              height={1200}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border border-white/20">
              T1 · {dateT1}
            </div>
          </div>
          <div className="relative w-full h-full overflow-hidden">
            <canvas
              ref={canvasT2Ref}
              width={1200}
              height={1200}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-16 left-4 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border border-white/20">
              T2 · {dateT2}
            </div>
          </div>
        </div>
      ) : activeLens === 'NIR' ? (
        /* 3. False Color NIR Multispectral */
        <canvas
          ref={canvasNIRRef}
          width={1200}
          height={1200}
          className="w-full h-full object-cover"
        />
      ) : isSARActive ? (
        /* 4. Sentinel-1 SAR C-band Radar Backscatter */
        <canvas
          ref={canvasSARRef}
          width={1200}
          height={1200}
          className="w-full h-full object-cover"
        />
      ) : activeLens === 'CHANGE' ? (
        /* 5. Direct ChangeNet Heatmap over T2 */
        <div className="relative w-full h-full">
          <canvas
            ref={canvasT2Ref}
            width={1200}
            height={1200}
            className="w-full h-full object-cover"
          />
          <canvas
            ref={canvasChangeRef}
            width={1200}
            height={1200}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </div>
      ) : isT1Active ? (
        /* 6. Single Optical T1 */
        <canvas
          ref={canvasT1Ref}
          width={1200}
          height={1200}
          className="w-full h-full object-cover"
        />
      ) : (
        /* 7. Single Optical T2 */
        <canvas
          ref={canvasT2Ref}
          width={1200}
          height={1200}
          className="w-full h-full object-cover"
        />
      )}

      {/* Vector Polygons & Spatial Annotations */}
      {activeLens === 'CHANGE' && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 1200 1200"
          preserveAspectRatio="none"
        >
          {clusters.map((cluster) => {
            const x = cluster.bbox.xmin * 1200;
            const y = cluster.bbox.ymin * 1200;
            const w = (cluster.bbox.xmax - cluster.bbox.xmin) * 1200;
            const h = (cluster.bbox.ymax - cluster.bbox.ymin) * 1200;
            const isSelected = selectedClusterId === cluster.id;

            return (
              <g
                key={cluster.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCluster(isSelected ? null : cluster.id);
                }}
                className="pointer-events-auto cursor-pointer group"
              >
                {/* Change Region Outline */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={isSelected ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.18)'}
                  stroke="#EF4444"
                  strokeWidth={isSelected ? '3' : '2'}
                  strokeDasharray="6 4"
                  className="transition-all duration-200"
                />

                {/* Annotation Tag: 01 · +1.82 ha */}
                <g transform={`translate(${x}, ${y - 8})`}>
                  <rect
                    x="0"
                    y="-18"
                    width={cluster.area_ha ? 115 : 85}
                    height="22"
                    rx="5"
                    fill="#111111"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    className="drop-shadow-md"
                  />
                  <text
                    x="8"
                    y="-4"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    {cluster.tag} · +{cluster.area_ha} ha
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
