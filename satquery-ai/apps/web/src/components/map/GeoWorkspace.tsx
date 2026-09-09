'use client';

import React, { useRef } from 'react';
import { MapToolbar, LensMode } from './MapToolbar';
import { ScientificLeftRail } from './ScientificLeftRail';
import { TemporalController } from './TemporalController';
import { MapMetadata } from './MapMetadata';
import { InteractiveEarthViewer } from './InteractiveEarthViewer';
import { FloatingFindingSurface } from '../intelligence/FloatingFindingSurface';
import { Ruler, X, Layers, Pentagon } from 'lucide-react';
import { useWorkspace, ChangeCluster, CursorCoordinates } from '../../context/WorkspaceContext';
import { AoiImportModal } from '../AoiImportModal';
import { SpectralInspectorPanel } from '../SpectralInspectorPanel';
import { MultiEpochTimeline } from '../MultiEpochTimeline';
import { SentinelWatchDrawer } from '../SentinelWatchDrawer';
import { SynchronizedDualViewport } from './SynchronizedDualViewport';

interface GeoWorkspaceProps {
  previewUrl?: string | null;
  activeLens?: LensMode;
  onSelectLens?: (lens: LensMode) => void;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string | null) => void;
  clusters?: ChangeCluster[];
  dateT1?: string;
  dateT2?: string;
}

export const GeoWorkspace: React.FC<GeoWorkspaceProps> = ({
  activeLens: propActiveLens,
  onSelectLens: propOnSelectLens,
  selectedRegionId: propSelectedRegionId,
  onSelectRegion: propOnSelectRegion,
  clusters: propClusters,
  dateT1: propDateT1,
  dateT2: propDateT2,
}) => {
  const ws = useWorkspace();

  const activeLens = propActiveLens || ws.activeLens;
  const onSelectLens = propOnSelectLens || ws.setActiveLens;
  const selectedRegionId =
    propSelectedRegionId !== undefined ? propSelectedRegionId : ws.selectedClusterId;
  const onSelectRegion = propOnSelectRegion || ws.selectCluster;
  const clusters = propClusters || ws.clusters;
  const dateT1 = propDateT1 || ws.dateT1;
  const dateT2 = propDateT2 || ws.dateT2;

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const normX = x / rect.width;
    const normY = y / rect.height;

    // Projected UTM Zone coordinates derived from current mission
    const utmE = Math.round(485000 + normX * 10980 * 10);
    const utmN = Math.round(1387000 - normY * 10980 * 10);
    const lat = +(ws.currentMission.lat + (0.5 - normY) * 0.08).toFixed(5);
    const lon = +(ws.currentMission.lon + (normX - 0.5) * 0.08).toFixed(5);

    const coords: CursorCoordinates = { lat, lon, utmE, utmN, normX, normY };
    ws.setCursorCoords(coords);

    // Pan handling if in pan tool or dragging
    if (isDraggingRef.current && (ws.activeTool === 'pan' || e.buttons === 1)) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      ws.setPan((prev) => ({ x: prev.x + dx * 0.4, y: prev.y + dy * 0.4 }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ws.activeTool === 'pan' || ws.activeTool === 'select') {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (ws.activeTool === 'measure' && ws.cursorCoords) {
      ws.handleCanvasMeasurementClick(ws.cursorCoords);
    } else if (ws.activeTool === 'measure_area' && ws.cursorCoords) {
      ws.addPolygonVertex(ws.cursorCoords);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#080808] select-none overflow-hidden relative">
      {/* Central Satellite Map Canvas Frame */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Main Map Box */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          className={`relative w-full h-full bg-[#080808] overflow-hidden flex items-center justify-center ${
            ws.activeTool === 'measure' || ws.activeTool === 'measure_area'
              ? 'cursor-crosshair'
              : ws.activeTool === 'pan'
              ? 'cursor-grab active:cursor-grabbing'
              : 'cursor-default'
          }`}
        >
          {/* Top-Left: Compact Observation Tray (No Giant Catalogue Box) */}
          <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#121212]/90 backdrop-blur-md border border-white/10 shadow-lg text-[11px] font-mono text-neutral-400">
              <button
                onClick={() => ws.toggleDrawer('scene')}
                className="flex items-center gap-1 px-2 py-1 rounded hover:text-white hover:bg-neutral-800 transition-colors font-bold text-neutral-300"
                title="Open Observations Catalog Drawer"
              >
                <Layers className="w-3 h-3 text-neutral-400" />
                <span>{ws.datasets.length} OBSERVATIONS</span>
              </button>

              <div className="flex items-center gap-0.5 pl-1 border-l border-white/10">
                {ws.datasets.map((d, idx) => {
                  const isActive = ws.activeDatasetIndex === idx;
                  const label = idx === 0 ? 'T1 14 MAR 2024' : idx === 1 ? 'T2 19 MAR 2026' : 'SAR 21 MAR 2026';
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        ws.setActiveDatasetIndex(idx);
                        if (d.modality === 'sar') ws.setActiveLens('SAR');
                        else ws.setActiveLens('True Color');
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                        isActive
                          ? 'bg-white text-black font-bold'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Left Vertical Instrument Rail */}
          <div className="absolute top-14 left-4 z-20 pointer-events-auto">
            <ScientificLeftRail />
          </div>

          {/* Top Center: Minimal Segmented Spectral Lens Controller */}
          <MapToolbar
            activeLens={activeLens}
            onSelectLens={onSelectLens}
          />

          {/* Floating Spatial Finding Readout (Right Side) */}
          <FloatingFindingSurface onInspectEvidence={() => ws.toggleDrawer('evidence')} />

          {/* Geodetic Map Reference Grid */}
          {ws.overlays.grid && (
            <div className="absolute inset-0 map-cross-grid pointer-events-none opacity-20 z-10" />
          )}

          {/* Real Interactive Earth Observation Satellite Viewer or Synchronized Dual Viewport */}
          <div className="absolute inset-0 w-full h-full z-0">
            {ws.temporalMode === 'Side by Side' ? (
              <SynchronizedDualViewport />
            ) : (
              <InteractiveEarthViewer
                activeLens={activeLens}
                activeDatasetIndex={ws.activeDatasetIndex}
                temporalMode={ws.temporalMode}
                sliderPos={ws.sliderPos}
                onSliderChange={ws.setSliderPos}
                clusters={clusters}
                selectedClusterId={selectedRegionId}
                onSelectCluster={onSelectRegion}
                dateT1={dateT1}
                dateT2={dateT2}
              />
            )}
          </div>

          {/* Spectral & Pixel Inspector Floating Analytics Card */}
          <SpectralInspectorPanel />

          {/* Multi-Epoch Observation Timeline Strip */}
          <div className="absolute bottom-12 left-4 right-4 z-20 pointer-events-auto max-w-5xl mx-auto">
            <MultiEpochTimeline />
          </div>

          {/* Precision Distance Ruler Callout */}
          {ws.activeMeasurement && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#121212]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-md shadow-xl z-30 flex items-center gap-2.5 border border-white/10 text-xs font-mono">
              <Ruler className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                DIST:{' '}
                <strong className="text-white">
                  {ws.activeMeasurement.distM.toLocaleString()} m
                </strong>{' '}
                ({ws.activeMeasurement.distKm} km)
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">BEARING: {ws.activeMeasurement.bearing}°</span>
              <button
                onClick={() => ws.resetMeasurement()}
                className="text-neutral-400 hover:text-white ml-1"
                title="Clear Measurement"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Precision Polygon Area Callout */}
          {ws.polygonMeasurement && ws.polygonMeasurement.points.length > 0 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#121212]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-md shadow-xl z-30 flex items-center gap-2.5 border border-white/10 text-xs font-mono">
              <Pentagon className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                VERTICES: <strong className="text-white">{ws.polygonMeasurement.points.length}</strong>
              </span>
              {ws.polygonMeasurement.points.length >= 3 ? (
                <>
                  <span className="text-neutral-600">·</span>
                  <span>
                    AREA: <strong className="text-emerald-400">{ws.polygonMeasurement.areaHa} ha</strong> ({ws.polygonMeasurement.areaM2.toLocaleString()} m²)
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-neutral-400">PERIMETER: {ws.polygonMeasurement.perimeterM.toLocaleString()} m</span>
                </>
              ) : (
                <>
                  <span className="text-neutral-600">·</span>
                  <span className="text-amber-400">Place ≥3 vertices</span>
                </>
              )}
              <button
                onClick={() => ws.clearPolygonMeasurement()}
                className="text-neutral-400 hover:text-white ml-1 px-1.5 py-0.5 rounded bg-neutral-800 text-[10px]"
                title="Clear Polygon"
              >
                Clear
              </button>
            </div>
          )}

          {/* Map Metadata Status Strip */}
          <MapMetadata coordinates={ws.cursorCoords} />
        </div>
      </div>

      {/* Precision Scientific Temporal Controller Bar */}
      <TemporalController
        sliderPos={ws.sliderPos}
        onSliderChange={ws.setSliderPos}
        temporalMode={ws.temporalMode}
        onSelectTemporalMode={ws.setTemporalMode}
        dateT1={dateT1}
        dateT2={dateT2}
      />

      {/* Phase 1: Custom AOI Importer Modal */}
      <AoiImportModal />

      {/* Phase 5: Sentinel Watch Autonomous Monitoring Drawer */}
      <SentinelWatchDrawer />
    </div>
  );
};
export type { ChangeCluster };
