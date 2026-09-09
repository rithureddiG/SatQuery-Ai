'use client';

import React from 'react';
import {
  MousePointer,
  Move,
  Ruler,
  Hexagon,
  Plus,
  Minus,
  RotateCcw,
  Grid,
  Crosshair,
  MapPin,
  Clock,
  Eye,
} from 'lucide-react';
import { useWorkspace, MapTool } from '../../context/WorkspaceContext';

export const ScientificLeftRail: React.FC = () => {
  const ws = useWorkspace();

  return (
    <aside className="select-none pointer-events-auto">
      {/* Precision Single-Column Instrument Rail */}
      <div className="w-10 bg-[#121212]/90 backdrop-blur-md border border-white/10 rounded-md p-1 flex flex-col items-center gap-1 shadow-lg text-neutral-400">
        {/* Pointer / Select */}
        <button
          onClick={() => ws.setActiveTool('select')}
          title="Pointer / Select"
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.activeTool === 'select'
              ? 'bg-white text-black font-bold'
              : 'hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Phase 2: Spectral & Pixel Inspector */}
        <button
          id="tool-spectral-inspector-btn"
          onClick={() => {
            ws.setActiveTool('inspect');
            ws.setIsSpectralInspectorActive(!ws.isSpectralInspectorActive);
          }}
          title="Spectral & Pixel Inspector (Sentinel-2 13-band BOA curve & SAR C-Band)"
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.isSpectralInspectorActive || ws.activeTool === 'inspect'
              ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
              : 'hover:text-cyan-400 hover:bg-neutral-800'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>

        {/* Phase 1: Custom AOI Importer */}
        <button
          id="tool-aoi-importer-btn"
          onClick={() => ws.setIsAoiModalOpen(true)}
          title={`Custom AOI Importer ${ws.customAoi ? `(${ws.customAoi.name})` : '(GeoJSON / KML / Shapefile)'}`}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.customAoi
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
              : 'hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Phase 3: Multi-Epoch Timeline */}
        <button
          id="tool-timeline-toggle-btn"
          onClick={() => ws.setIsTimelineOpen(!ws.isTimelineOpen)}
          title={`Multi-Epoch Timeline (${ws.timelineEpochs.length} passes)`}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.isTimelineOpen
              ? 'bg-blue-600 text-white font-bold'
              : 'hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Phase 5: Sentinel Watch Monitoring */}
        <button
          id="tool-sentinel-watch-btn"
          onClick={() => ws.setIsSentinelWatchOpen(!ws.isSentinelWatchOpen)}
          title={`Sentinel Watchdog Monitoring (${ws.watches.length} active watches)`}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors relative ${
            ws.isSentinelWatchOpen
              ? 'bg-amber-600 text-white font-bold'
              : 'hover:text-amber-400 hover:bg-neutral-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5 stroke-[2]" />
          {ws.watches.some((w) => w.status === 'Alert Triggered') && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
          )}
        </button>

        <div className="w-5 h-px bg-neutral-800 my-0.5" />

        {/* Pan Viewport */}
        <button
          onClick={() => ws.setActiveTool('pan')}
          title="Pan Viewport"
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.activeTool === 'pan'
              ? 'bg-white text-black font-bold'
              : 'hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Move className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Geodesic Distance Tool */}
        <button
          onClick={() => ws.setActiveTool('measure')}
          title="Geodesic Distance Ruler (Point A → Point B with Bearing)"
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.activeTool === 'measure'
              ? 'bg-emerald-500 text-black font-bold'
              : 'hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Ruler className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Polygon Area Tool */}
        <button
          onClick={() => ws.setActiveTool('measure_area')}
          title="Polygon Area Calculator (Hectares & Square Meters)"
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.activeTool === 'measure_area'
              ? 'bg-emerald-500 text-black font-bold'
              : 'hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Hexagon className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        <div className="w-5 h-px bg-neutral-800 my-0.5" />

        {/* Zoom In */}
        <button
          onClick={() => ws.zoomIn()}
          title="Zoom In (+)"
          className="w-8 h-8 rounded flex items-center justify-center hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => ws.zoomOut()}
          title="Zoom Out (-)"
          className="w-8 h-8 rounded flex items-center justify-center hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Reset View */}
        <button
          onClick={() => ws.resetZoom()}
          title="Reset Scale & Viewport"
          className="w-8 h-8 rounded flex items-center justify-center hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        <div className="w-5 h-px bg-neutral-800 my-0.5" />

        {/* Grid Overlay Toggle */}
        <button
          onClick={() => ws.toggleOverlay('grid')}
          title={ws.overlays.grid ? 'Hide Coordinate Grid' : 'Show Coordinate Grid'}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
            ws.overlays.grid
              ? 'text-emerald-400 bg-neutral-800'
              : 'hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>
    </aside>
  );
};
