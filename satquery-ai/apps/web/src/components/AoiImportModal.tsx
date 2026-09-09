'use client';

import React, { useState, useRef } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CustomAOI } from '../types';

const SAMPLE_AOIS = [
  {
    name: 'Bangalore Tech Corridor East',
    type: 'Feature',
    properties: { site: 'SEZ Perimeter', crs: 'EPSG:4326' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.585, 12.965],
          [77.612, 12.965],
          [77.612, 12.982],
          [77.585, 12.982],
          [77.585, 12.965],
        ],
      ],
    },
  },
  {
    name: 'Hyderabad Outer Ring Logistics Zone',
    type: 'Feature',
    properties: { site: 'Inland Hub', crs: 'EPSG:4326' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [78.472, 17.375],
          [78.505, 17.375],
          [78.505, 17.398],
          [78.472, 17.398],
          [78.472, 17.375],
        ],
      ],
    },
  },
];

export const AoiImportModal: React.FC = () => {
  const { isAoiModalOpen, setIsAoiModalOpen, setCustomAoi } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const [aoiName, setAoiName] = useState('Custom AOI Perimeter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedAoi, setParsedAoi] = useState<CustomAOI | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isAoiModalOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setParsedAoi(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/v1/aoi/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to parse AOI file');
      }
      setParsedAoi(data.aoi);
      setAoiName(data.aoi.name);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing geometry');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleParsePasted = async (contentToParse?: string) => {
    const raw = contentToParse || pastedContent;
    if (!raw.trim()) {
      setErrorMessage('Please paste valid GeoJSON or KML text');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setParsedAoi(null);

    try {
      const res = await fetch('/api/v1/aoi/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: raw,
          name: aoiName,
          format: raw.includes('<kml') ? 'kml' : 'geojson',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to parse geometry text');
      }
      setParsedAoi(data.aoi);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid format or structure');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_AOIS[0]) => {
    setAoiName(sample.name);
    setPastedContent(JSON.stringify(sample, null, 2));
    handleParsePasted(JSON.stringify(sample));
  };

  const handleApplyAoi = () => {
    if (!parsedAoi) return;
    setCustomAoi(parsedAoi);
    setIsAoiModalOpen(false);
  };

  return (
    <div
      id="aoi-import-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        id="aoi-import-dialog"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.512a2 2 0 011.053-1.764L9 1l6 3 5.447-2.724A2 2 0 0121 3.036v9.976a2 2 0 01-1.053 1.764L15 17l-6 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100 tracking-wide uppercase">
                Custom Area of Interest (AOI) Importer
              </h2>
              <p className="text-xs text-neutral-400">
                Deterministic CRS reprojection, topological geometry validation & area engine
              </p>
            </div>
          </div>
          <button
            id="close-aoi-modal-btn"
            onClick={() => setIsAoiModalOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/80 px-5 pt-3 gap-2">
          <button
            id="aoi-tab-upload"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Upload File (GeoJSON / KML / Shapefile)
          </button>
          <button
            id="aoi-tab-paste"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Paste GeoJSON / KML Text
          </button>
          <button
            id="aoi-tab-samples"
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition ${
              activeTab === 'samples'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Preset Operational AOIs
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'upload' && (
            <div
              id="aoi-dropzone"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-neutral-700 hover:border-neutral-500 bg-neutral-950/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.geojson,.kml,.zip"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-200">
                  Drag and drop your AOI boundary file here, or{' '}
                  <span className="text-cyan-400 underline">browse files</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Supports standard GeoJSON (.geojson, .json), Google Earth KML (.kml), and ESRI Shapefile archives (.zip)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 tracking-wider mb-1">
                  AOI Identifier Name
                </label>
                <input
                  type="text"
                  value={aoiName}
                  onChange={(e) => setAoiName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. Bangalore Urban Outer Belt"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 tracking-wider mb-1">
                  Raw Geometry Text (Feature, FeatureCollection, Polygon, or KML)
                </label>
                <textarea
                  rows={6}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder={`{\n  "type": "Polygon",\n  "coordinates": [[[77.58, 12.96], [77.61, 12.96], [77.61, 12.98], [77.58, 12.98], [77.58, 12.96]]]\n}`}
                />
              </div>
              <button
                id="parse-pasted-aoi-btn"
                onClick={() => handleParsePasted()}
                disabled={isProcessing || !pastedContent.trim()}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-xs font-medium text-neutral-200 rounded border border-neutral-600 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Validating Topological Geometry...' : 'Validate & Reproject Geometry'}
              </button>
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-2">
              <p className="text-xs text-neutral-400 mb-2">
                Select a verified operational perimeter to load directly into the analysis pipeline:
              </p>
              {SAMPLE_AOIS.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className="p-3 bg-neutral-950 border border-neutral-800 hover:border-cyan-500/50 rounded cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-medium text-neutral-200">{sample.name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      WGS84 Coordinates • 5 Vertices • Verified Closed Polygon
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">Select AOI →</span>
                </div>
              ))}
            </div>
          )}

          {/* Validation Feedback & Warnings */}
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded text-xs text-red-300 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {parsedAoi && (
            <div className="p-4 bg-cyan-950/20 border border-cyan-800/60 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-semibold text-neutral-100 uppercase tracking-wider">
                    {parsedAoi.name} (Verified Canonical AOI)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {parsedAoi.crs.utmZone}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="bg-neutral-900/90 p-2.5 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Geodesic Area</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">{parsedAoi.metrics.areaHa} ha</div>
                  <div className="text-[10px] text-neutral-500">{parsedAoi.metrics.areaM2.toLocaleString()} m²</div>
                </div>
                <div className="bg-neutral-900/90 p-2.5 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Perimeter</div>
                  <div className="text-neutral-200 font-bold text-sm mt-0.5">{parsedAoi.metrics.perimeterM.toLocaleString()} m</div>
                  <div className="text-[10px] text-neutral-500">Ellipsoidal WGS84</div>
                </div>
                <div className="bg-neutral-900/90 p-2.5 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Vertices</div>
                  <div className="text-neutral-200 font-bold text-sm mt-0.5">{parsedAoi.metrics.vertexCount}</div>
                  <div className="text-[10px] text-emerald-400">Topology Closed</div>
                </div>
                <div className="bg-neutral-900/90 p-2.5 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">Centroid</div>
                  <div className="text-neutral-200 font-bold text-xs mt-0.5 truncate">
                    {parsedAoi.centroid[1].toFixed(4)}°N
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">{parsedAoi.centroid[0].toFixed(4)}°E</div>
                </div>
              </div>

              {parsedAoi.validation.warnings.length > 0 && (
                <div className="p-2 bg-amber-950/30 border border-amber-800/50 rounded text-[11px] text-amber-300 space-y-1">
                  {parsedAoi.validation.warnings.map((w, idx) => (
                    <div key={idx}>• {w}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-950">
          <button
            id="cancel-aoi-btn"
            onClick={() => setIsAoiModalOpen(false)}
            className="px-4 py-2 rounded text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            id="apply-canonical-aoi-btn"
            disabled={!parsedAoi}
            onClick={handleApplyAoi}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white rounded text-xs font-semibold tracking-wide uppercase transition shadow-lg shadow-cyan-900/30 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Set as Canonical Mission AOI
          </button>
        </div>
      </div>
    </div>
  );
};
