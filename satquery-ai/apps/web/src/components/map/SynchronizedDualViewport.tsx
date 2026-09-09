'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace, LensMode } from '../../context/WorkspaceContext';

const AVAILABLE_LENSES: LensMode[] = ['True Color', 'NIR', 'SWIR', 'SAR', 'NDVI', 'NDBI', 'NDWI'];

export const SynchronizedDualViewport: React.FC = () => {
  const ws = useWorkspace();
  const [leftLens, setLeftLens] = useState<LensMode>(ws.splitConfig.leftLens);
  const [rightLens, setRightLens] = useState<LensMode>(ws.splitConfig.rightLens);
  const [leftEpochId, setLeftEpochId] = useState<string>(ws.splitConfig.leftEpochId);
  const [rightEpochId, setRightEpochId] = useState<string>(ws.splitConfig.rightEpochId);
  const [splitRatio, setSplitRatio] = useState<number>(ws.splitConfig.splitRatio);
  const [isFlickering, setIsFlickering] = useState<boolean>(false);
  const [flickerActivePane, setFlickerActivePane] = useState<'left' | 'right'>('left');

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplitRef = useRef(false);

  // Sync with workspace context
  useEffect(() => {
    ws.setSplitConfig({
      leftLens,
      rightLens,
      leftEpochId,
      rightEpochId,
      splitRatio,
      syncPanZoom: true,
      crosshairSync: true,
    });
  }, [leftLens, rightLens, leftEpochId, rightEpochId, splitRatio]);

  // Blink comparator (Flicker mode at 2Hz = 500ms)
  useEffect(() => {
    if (!isFlickering) return;
    const interval = setInterval(() => {
      setFlickerActivePane((prev) => (prev === 'left' ? 'right' : 'left'));
    }, 500);
    return () => clearInterval(interval);
  }, [isFlickering]);

  // Filter styles per lens
  const getFilterForLens = (lens: LensMode) => {
    switch (lens) {
      case 'NIR':
        return 'saturate(2.2) hue-rotate(-55deg) contrast(1.35) brightness(0.95)';
      case 'SWIR':
        return 'sepia(0.4) contrast(1.4) hue-rotate(15deg) brightness(1.05)';
      case 'SAR':
        return 'grayscale(100%) contrast(2.4) brightness(1.25)';
      case 'NDVI':
        return 'contrast(1.6) saturate(2.4) hue-rotate(60deg) brightness(1.1)';
      case 'NDBI':
        return 'contrast(2.0) saturate(2.2) hue-rotate(330deg) brightness(1.05)';
      case 'NDWI':
        return 'contrast(1.8) saturate(2.5) hue-rotate(185deg) brightness(1.15)';
      default:
        return 'none';
    }
  };

  const handleMouseDownDivider = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplitRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(100, Math.min(e.clientX - rect.left, rect.width - 100));
      const ratio = Math.round((x / rect.width) * 100);
      setSplitRatio(ratio);
    };

    const handleMouseUp = () => {
      isDraggingSplitRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const leftEpoch = ws.timelineEpochs.find((e) => e.id === leftEpochId) || ws.timelineEpochs[0];
  const rightEpoch = ws.timelineEpochs.find((e) => e.id === rightEpochId) || ws.timelineEpochs[ws.timelineEpochs.length - 1];

  return (
    <div
      ref={containerRef}
      id="synchronized-dual-viewport-container"
      className="absolute inset-0 w-full h-full z-10 flex overflow-hidden select-none bg-black"
    >
      {/* Top Controls Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700 shadow-xl font-mono text-xs text-neutral-300">
        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
          Synchronized Dual Viewport
        </span>
        <span className="text-neutral-600">|</span>
        <button
          onClick={() => setIsFlickering(!isFlickering)}
          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition flex items-center gap-1 ${
            isFlickering
              ? 'bg-amber-500 text-black animate-pulse'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Toggle 2Hz Blink Comparator between Viewport A and B"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Blink 2Hz ({isFlickering ? 'ACTIVE' : 'OFF'})</span>
        </button>
        <span className="text-neutral-600">|</span>
        <button
          onClick={() => {
            ws.setTemporalMode('Swipe');
          }}
          className="text-neutral-400 hover:text-white text-[10px] uppercase underline"
        >
          Return to Single / Swipe
        </button>
      </div>

      {/* Left Viewport Pane */}
      <div
        className={`relative h-full overflow-hidden transition-all duration-75 border-r border-neutral-700 ${
          isFlickering && flickerActivePane !== 'left' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ width: `${isFlickering ? 100 : splitRatio}%` }}
      >
        {/* Viewport A Header Strip */}
        <div className="absolute top-12 left-4 z-20 flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md px-2.5 py-1 rounded border border-neutral-800 shadow text-[11px] font-mono">
          <span className="text-emerald-400 font-bold">VIEWPORT A</span>
          <select
            value={leftLens}
            onChange={(e) => setLeftLens(e.target.value as LensMode)}
            className="bg-neutral-900 text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
          >
            {AVAILABLE_LENSES.map((lens) => (
              <option key={lens} value={lens}>
                {lens}
              </option>
            ))}
          </select>
          {ws.timelineEpochs.length > 0 && (
            <select
              value={leftEpochId}
              onChange={(e) => setLeftEpochId(e.target.value)}
              className="bg-neutral-900 text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
            >
              {ws.timelineEpochs.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.date} ({ep.sensor})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Raster Tile Simulation with Applied Spectral Filter */}
        <div
          className="w-full h-full bg-cover bg-center transition-all"
          style={{
            backgroundImage: `url('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/14/11723/7625.jpg')`,
            filter: getFilterForLens(leftLens),
          }}
        />

        {/* Sync Crosshair */}
        {ws.cursorCoords && (
          <div
            className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${ws.cursorCoords.normX * 100}%`,
              top: `${ws.cursorCoords.normY * 100}%`,
            }}
          >
            <div className="w-5 h-5 border border-emerald-400/80 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        )}

        <div className="absolute bottom-12 left-4 text-[10px] font-mono text-neutral-400 bg-black/70 px-2 py-0.5 rounded border border-neutral-800">
          A: {leftEpoch?.date || ws.dateT1} • {leftLens}
        </div>
      </div>

      {/* Center Draggable Split Handle */}
      {!isFlickering && (
        <div
          onMouseDown={handleMouseDownDivider}
          className="absolute inset-y-0 z-30 w-3 -ml-1.5 cursor-col-resize flex items-center justify-center group"
          style={{ left: `${splitRatio}%` }}
        >
          <div className="w-0.5 h-full bg-cyan-500/80 group-hover:bg-cyan-400 group-hover:w-1 shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all"></div>
          <div className="absolute w-6 h-6 rounded-full bg-neutral-900 border border-cyan-400 text-cyan-300 text-[9px] flex items-center justify-center font-mono font-bold shadow-lg">
            ⇄
          </div>
        </div>
      )}

      {/* Right Viewport Pane */}
      {!isFlickering && (
        <div
          className="relative h-full overflow-hidden flex-1"
          style={{ width: `${100 - splitRatio}%` }}
        >
          {/* Viewport B Header Strip */}
          <div className="absolute top-12 left-4 z-20 flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md px-2.5 py-1 rounded border border-neutral-800 shadow text-[11px] font-mono">
            <span className="text-blue-400 font-bold">VIEWPORT B</span>
            <select
              value={rightLens}
              onChange={(e) => setRightLens(e.target.value as LensMode)}
              className="bg-neutral-900 text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
            >
              {AVAILABLE_LENSES.map((lens) => (
                <option key={lens} value={lens}>
                  {lens}
                </option>
              ))}
            </select>
            {ws.timelineEpochs.length > 0 && (
              <select
                value={rightEpochId}
                onChange={(e) => setRightEpochId(e.target.value)}
                className="bg-neutral-900 text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
              >
                {ws.timelineEpochs.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.date} ({ep.sensor})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Raster Tile Simulation with Applied Spectral Filter */}
          <div
            className="w-full h-full bg-cover bg-center transition-all"
            style={{
              backgroundImage: `url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/7625/11723')`,
              filter: getFilterForLens(rightLens),
            }}
          />

          {/* Sync Crosshair */}
          {ws.cursorCoords && (
            <div
              className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${ws.cursorCoords.normX * 100}%`,
                top: `${ws.cursorCoords.normY * 100}%`,
              }}
            >
              <div className="w-5 h-5 border border-blue-400/80 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          )}

          <div className="absolute bottom-12 right-4 text-[10px] font-mono text-neutral-400 bg-black/70 px-2 py-0.5 rounded border border-neutral-800">
            B: {rightEpoch?.date || ws.dateT2} • {rightLens}
          </div>
        </div>
      )}
    </div>
  );
};
