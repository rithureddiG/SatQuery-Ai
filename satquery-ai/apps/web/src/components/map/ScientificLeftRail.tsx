'use client';

import React from 'react';
import {
  Layers,
  Eye,
  Activity,
  Radio,
  Sparkles,
  Target,
  Move,
  MousePointer,
  Ruler,
  Maximize2,
  Hexagon,
  Droplet,
  Building2,
  TreePine,
  Compass,
} from 'lucide-react';
import { useWorkspace, LensMode, MapTool } from '../../context/WorkspaceContext';

export const ScientificLeftRail: React.FC = () => {
  const ws = useWorkspace();

  const lenses: {
    id: LensMode;
    label: string;
    description: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'True Color',
      label: 'RGB',
      description: 'Sentinel-2 B04-B03-B02 Natural True Color Surface Reflectance',
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      id: 'NIR',
      label: 'NIR',
      description: 'False Color B08-B04-B03 High Chlorophyll Vegetation Dynamics',
      icon: <TreePine className="w-3.5 h-3.5 text-rose-500" />,
    },
    {
      id: 'SWIR',
      label: 'SWIR',
      description: 'Short-Wave Infrared B12-B8A-B04 Soil & Moisture Contrast',
      icon: <Compass className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'SAR',
      label: 'SAR',
      description: 'Sentinel-1 C-band Backscatter (σ⁰ dB) VV/VH Double-Bounce',
      badge: 'C-BAND',
      icon: <Radio className="w-3.5 h-3.5 text-satblue-400" />,
    },
    {
      id: 'NDVI',
      label: 'NDVI',
      description: 'Normalized Difference Vegetation Index (NIR - RED) / (NIR + RED)',
      icon: <Activity className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      id: 'NDWI',
      label: 'NDWI',
      description: 'Normalized Difference Water Index (GREEN - NIR) / (GREEN + NIR)',
      icon: <Droplet className="w-3.5 h-3.5 text-cyan-500" />,
    },
    {
      id: 'NDBI',
      label: 'NDBI',
      description: 'Normalized Difference Built-Up Index (SWIR - NIR) / (SWIR + NIR)',
      icon: <Building2 className="w-3.5 h-3.5 text-orange-500" />,
    },
    {
      id: 'CHANGE',
      label: 'CHANGE',
      description: 'Siamese ChangeNet 2D CNN Probability Map & Vector Contours',
      badge: 'ML',
      icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
    },
    {
      id: 'EVIDENCE',
      label: 'EVID.',
      description: 'Multi-Modal Corroborated Evidence Spotlight & Bounding Box',
      badge: '94%',
      icon: <Target className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  return (
    <aside className="flex flex-col gap-2.5 select-none pointer-events-auto">
      {/* Spectral Lenses Rail */}
      <div className="bg-white/95 backdrop-blur-md border border-[#E6E6E1] rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 w-20">
        <div className="px-1.5 py-1 text-[9px] font-mono font-bold tracking-wider text-[#888888] uppercase text-center border-b border-[#F0EFEA]">
          LENSES
        </div>

        <div className="flex flex-col gap-0.5 pt-0.5">
          {lenses.map((lens) => {
            const isActive = ws.activeLens === lens.id;
            return (
              <button
                key={lens.id}
                onClick={() => ws.setActiveLens(lens.id)}
                title={`${lens.label}: ${lens.description}`}
                className={`relative px-2 py-1.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-sm ring-1 ring-[#111111]'
                    : 'text-[#555555] hover:bg-[#F4F3EE] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {lens.icon}
                  <span className="text-[11px] font-mono font-bold">{lens.label}</span>
                </div>
                {lens.badge && (
                  <span
                    className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded leading-none ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#EAE8E1] text-[#6F6F6A]'
                    }`}
                  >
                    {lens.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Geospatial Tools Rail */}
      <div className="bg-white/95 backdrop-blur-md border border-[#E6E6E1] rounded-2xl shadow-xl p-1.5 flex flex-col gap-1 w-20">
        <div className="px-1.5 py-1 text-[9px] font-mono font-bold tracking-wider text-[#888888] uppercase text-center border-b border-[#F0EFEA]">
          TOOLS
        </div>

        <div className="flex flex-col gap-0.5 pt-0.5">
          {/* Pan Tool */}
          <button
            onClick={() => ws.setActiveTool('pan')}
            title="Pan Viewport"
            className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              ws.activeTool === 'pan'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#555555] hover:bg-[#F4F3EE] hover:text-[#111111]'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">Pan</span>
          </button>

          {/* Select Tool */}
          <button
            onClick={() => ws.setActiveTool('select')}
            title="Select & Inspect Features"
            className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              ws.activeTool === 'select'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#555555] hover:bg-[#F4F3EE] hover:text-[#111111]'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">Select</span>
          </button>

          {/* Geodesic Distance Tool */}
          <button
            onClick={() => ws.setActiveTool('measure')}
            title="Geodesic Distance Ruler (Point A → Point B with Bearing)"
            className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              ws.activeTool === 'measure'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700'
                : 'text-[#555555] hover:bg-[#F4F3EE] hover:text-[#111111]'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">Dist</span>
          </button>

          {/* Polygon Area Tool */}
          <button
            onClick={() => ws.setActiveTool('measure_area')}
            title="Polygon Area Calculator (Hectares & Square Meters)"
            className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              ws.activeTool === 'measure_area'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700'
                : 'text-[#555555] hover:bg-[#F4F3EE] hover:text-[#111111]'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">Area</span>
          </button>

          {/* Reset Zoom */}
          <button
            onClick={() => ws.resetZoom()}
            title="Reset Scale & Viewport"
            className="p-1.5 rounded-xl text-xs flex items-center gap-1.5 text-[#6F6F6A] hover:bg-[#F4F3EE] hover:text-[#111111] transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">Reset</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
