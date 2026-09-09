'use client';

import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export const SpectralInspectorPanel: React.FC = () => {
  const {
    spectralInspection,
    clearSpectralInspection,
    isSpectralInspectorActive,
    setIsSpectralInspectorActive,
    isInspectingPixel,
  } = useWorkspace();

  if (!isSpectralInspectorActive && !spectralInspection) return null;

  const inspection = spectralInspection;

  // Wavelength chart coordinates mapping
  const chartW = 340;
  const chartH = 110;
  const padL = 30;
  const padR = 15;
  const padT = 15;
  const padB = 25;

  const minWave = 400;
  const maxWave = 2250;
  const minRef = 0.0;
  const maxRef = 0.65;

  const points = inspection?.bands.map((b) => {
    const x = padL + ((b.wavelengthNm - minWave) / (maxWave - minWave)) * (chartW - padL - padR);
    const y = padT + (1 - (b.reflectance - minRef) / (maxRef - minRef)) * (chartH - padT - padB);
    return { ...b, x, y };
  });

  const pathD = points
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  return (
    <div
      id="spectral-inspector-floating-panel"
      className="absolute top-16 right-4 z-40 w-96 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-lg shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-right-2 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-950/90 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
            Spectral & Pixel Inspector
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSpectralInspectorActive(!isSpectralInspectorActive)}
            title="Toggle Inspection Cursor Tool"
            className={`px-2 py-0.5 text-[10px] font-mono rounded border transition ${
              isSpectralInspectorActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            {isSpectralInspectorActive ? 'TOOL ACTIVE' : 'INACTIVE'}
          </button>
          <button
            id="close-spectral-inspector-btn"
            onClick={() => {
              clearSpectralInspection();
              setIsSpectralInspectorActive(false);
            }}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {isInspectingPixel && (
        <div className="p-4 text-center text-xs text-cyan-400 font-mono flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          Extracting calibrated Sentinel-2 BOA & Sentinel-1 backscatter...
        </div>
      )}

      {!inspection && !isInspectingPixel && (
        <div className="p-5 text-center text-xs text-neutral-400 space-y-2">
          <svg className="w-8 h-8 text-neutral-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="font-medium text-neutral-300">Click anywhere on the map raster</p>
          <p className="text-[11px] text-neutral-500">
            Extracts point reflectance curve across 13 VNIR/SWIR bands and Sentinel-1 SAR polarimetric signature.
          </p>
        </div>
      )}

      {inspection && (
        <div className="p-3.5 space-y-3.5 max-h-[78vh] overflow-y-auto">
          {/* Location & Sensor Banner */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-neutral-800/80 pb-2">
            <div>
              <span className="text-neutral-200 font-semibold">{inspection.location.lat.toFixed(5)}°N</span>,{' '}
              <span className="text-neutral-200 font-semibold">{inspection.location.lon.toFixed(5)}°E</span>
            </div>
            <div className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] text-cyan-400">
              GSD: {inspection.location.gsdM}m
            </div>
          </div>

          {/* Spectral Reflectance Curve (Sentinel-2 Level-2A) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                Sentinel-2 BOA Surface Reflectance (ρ)
              </span>
              <span className="text-[10px] font-mono text-neutral-500">400nm - 2200nm</span>
            </div>

            <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
              <svg width="100%" height="110" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
                {/* Horizontal Grid lines */}
                {[0.0, 0.2, 0.4, 0.6].map((refVal) => {
                  const y = padT + (1 - (refVal - minRef) / (maxRef - minRef)) * (chartH - padT - padB);
                  return (
                    <g key={refVal}>
                      <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#262626" strokeDasharray="3 3" />
                      <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#737373" fontFamily="monospace">
                        {refVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis labels */}
                {[500, 850, 1600, 2200].map((wv) => {
                  const x = padL + ((wv - minWave) / (maxWave - minWave)) * (chartW - padL - padR);
                  return (
                    <text key={wv} x={x} y={chartH - 8} textAnchor="middle" fontSize="8" fill="#737373" fontFamily="monospace">
                      {wv}
                    </text>
                  );
                })}

                {/* Curve line */}
                <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points */}
                {points?.map((p) => (
                  <circle
                    key={p.band}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill={p.category === 'RedEdge' ? '#f59e0b' : p.category === 'SWIR' ? '#8b5cf6' : '#10b981'}
                    stroke="#0a0a0a"
                    strokeWidth="1.5"
                  >
                    <title>{`${p.band} (${p.name}): ${p.reflectance} BOA at ${p.wavelengthNm}nm`}</title>
                  </circle>
                ))}
              </svg>

              <div className="flex justify-between text-[9px] font-mono text-neutral-500 pt-1 border-t border-neutral-900 mt-1">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>VNIR</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Red Edge</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>SWIR</span>
              </div>
            </div>
          </div>

          {/* Computed Spectral Indices */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
              Computed Biophysical Indices
            </span>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="text-[10px] text-neutral-400">NDVI</div>
                <div className={`font-bold text-sm mt-0.5 ${inspection.indices.ndvi > 0.4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {inspection.indices.ndvi.toFixed(2)}
                </div>
                <div className="text-[9px] text-neutral-500">Vegetation</div>
              </div>
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="text-[10px] text-neutral-400">NDBI</div>
                <div className={`font-bold text-sm mt-0.5 ${inspection.indices.ndbi > 0.0 ? 'text-cyan-400' : 'text-neutral-400'}`}>
                  {inspection.indices.ndbi.toFixed(2)}
                </div>
                <div className="text-[9px] text-neutral-500">Built-Up</div>
              </div>
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="text-[10px] text-neutral-400">NDWI</div>
                <div className={`font-bold text-sm mt-0.5 ${inspection.indices.ndwi > 0.0 ? 'text-blue-400' : 'text-neutral-400'}`}>
                  {inspection.indices.ndwi.toFixed(2)}
                </div>
                <div className="text-[9px] text-neutral-500">Water Index</div>
              </div>
            </div>
          </div>

          {/* Radar Backscatter Signature (Sentinel-1 C-SAR) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                Sentinel-1 SAR C-Band Radar
              </span>
              <span className="text-[10px] font-mono text-cyan-400">GRD Dual-Pol</span>
            </div>
            <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 space-y-2">
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="bg-neutral-900/80 p-1.5 rounded">
                  <div className="text-[9px] text-neutral-400">σ° VV</div>
                  <div className="text-xs font-bold text-neutral-200 mt-0.5">{inspection.sar.vvDb} dB</div>
                </div>
                <div className="bg-neutral-900/80 p-1.5 rounded">
                  <div className="text-[9px] text-neutral-400">σ° VH</div>
                  <div className="text-xs font-bold text-neutral-200 mt-0.5">{inspection.sar.vhDb} dB</div>
                </div>
                <div className="bg-neutral-900/80 p-1.5 rounded">
                  <div className="text-[9px] text-neutral-400">VV/VH Ratio</div>
                  <div className="text-xs font-bold text-cyan-400 mt-0.5">{inspection.sar.vvVhRatioDb} dB</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-900">
                <span className="text-neutral-400">Polarimetric Scattering:</span>
                <span className="font-medium text-emerald-400 text-right truncate max-w-[200px]">
                  {inspection.sar.scatteringMechanism}
                </span>
              </div>
            </div>
          </div>

          {/* Polygon Zonal Statistics (If active) */}
          {inspection.zonalStats && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Zonal Statistics (Region Analysis)
                </span>
                <span className="text-[10px] font-mono text-neutral-400">{inspection.zonalStats.areaHa} ha</span>
              </div>
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded p-2.5 text-xs font-mono space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-400 text-[10px]">Mean NDVI:</span>{' '}
                    <span className="text-emerald-300 font-bold">{inspection.zonalStats.meanNdvi.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px]">Std Dev (σ):</span>{' '}
                    <span className="text-neutral-200">{inspection.zonalStats.stdDevNdvi.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px]">Min / Max NDVI:</span>{' '}
                    <span className="text-neutral-200">{inspection.zonalStats.minNdvi} / {inspection.zonalStats.maxNdvi}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px]">Sampled Pixels:</span>{' '}
                    <span className="text-neutral-200">{inspection.zonalStats.pixelCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
