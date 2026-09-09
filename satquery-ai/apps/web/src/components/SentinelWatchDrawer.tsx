'use client';

import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export const SentinelWatchDrawer: React.FC = () => {
  const {
    isSentinelWatchOpen,
    setIsSentinelWatchOpen,
    watches,
    createWatch,
    deleteWatch,
    customAoi,
    currentMission,
    updateMissionLocation,
    selectMission,
  } = useWorkspace();

  const [isCreating, setIsCreating] = useState(false);
  const [watchName, setWatchName] = useState('');
  const [thresholdHa, setThresholdHa] = useState(1.0);
  const [thresholdNdvi, setThresholdNdvi] = useState(15.0);
  const [thresholdSar, setThresholdSar] = useState(2.5);

  if (!isSentinelWatchOpen) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchName.trim()) return;

    const centroid: [number, number] = customAoi
      ? customAoi.centroid
      : [currentMission.lon, currentMission.lat];

    const aoiAreaHa = customAoi ? customAoi.metrics.areaHa : 15.0;

    await createWatch({
      name: watchName,
      locationName: customAoi ? customAoi.name : currentMission.name,
      centroid,
      aoiAreaHa,
      conditions: [
        { type: 'built_up_increase', operator: '>', thresholdValue: thresholdHa, unit: 'ha' },
        { type: 'ndvi_decrease', operator: '>', thresholdValue: thresholdNdvi, unit: '%' },
        { type: 'sar_anomaly', operator: '>', thresholdValue: thresholdSar, unit: 'dB' },
      ],
    });

    setWatchName('');
    setIsCreating(false);
  };

  const handleInvestigateWatch = (w: typeof watches[0]) => {
    updateMissionLocation({
      name: w.name,
      lat: w.centroid[1],
      lon: w.centroid[0],
      utmZone: 'EPSG:32643 (UTM Zone 43N)',
      areaAoi: `${w.aoiAreaHa} ha`,
    });
    setIsSentinelWatchOpen(false);
  };

  return (
    <div
      id="sentinel-watch-drawer"
      className="fixed inset-y-0 right-0 z-50 w-96 bg-neutral-900/98 backdrop-blur-md border-l border-neutral-700 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-neutral-100 tracking-wide uppercase">
              Sentinel Watch Monitoring
            </h2>
            <p className="text-[11px] text-neutral-400">Autonomous Orbit Watchdog & Alerts</p>
          </div>
        </div>
        <button
          id="close-sentinel-watch-btn"
          onClick={() => setIsSentinelWatchOpen(false)}
          className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Action Header */}
      <div className="p-3 bg-neutral-950/60 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-mono text-neutral-400">
          {watches.length} Active Automated Monitors
        </span>
        <button
          id="new-watch-toggle-btn"
          onClick={() => setIsCreating(!isCreating)}
          className="px-2.5 py-1 text-xs font-medium rounded bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{isCreating ? 'Cancel' : 'New Watch'}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Create Watch Form */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="p-4 bg-neutral-950 border border-cyan-800/60 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wide">
              <span>Create Orbital Monitor</span>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 uppercase font-mono mb-1">
                Monitor Title
              </label>
              <input
                type="text"
                required
                value={watchName}
                onChange={(e) => setWatchName(e.target.value)}
                placeholder={customAoi ? `Monitor: ${customAoi.name}` : 'e.g. Industrial Expansion Watch'}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="text-[11px] text-neutral-400 font-mono bg-neutral-900 p-2 rounded border border-neutral-800">
              <div>AOI: {customAoi ? customAoi.name : currentMission.name}</div>
              <div className="text-neutral-500 text-[10px] mt-0.5">
                Area: {customAoi ? `${customAoi.metrics.areaHa} ha` : currentMission.areaAoi}
              </div>
            </div>

            {/* Threshold sliders */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Trigger on Built-up Increase &gt;</span>
                  <span className="text-amber-400 font-bold">{thresholdHa} ha</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={thresholdHa}
                  onChange={(e) => setThresholdHa(parseFloat(e.target.value))}
                  className="w-full h-1 bg-neutral-700 rounded appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Trigger on NDVI Loss &gt;</span>
                  <span className="text-emerald-400 font-bold">{thresholdNdvi}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={thresholdNdvi}
                  onChange={(e) => setThresholdNdvi(parseFloat(e.target.value))}
                  className="w-full h-1 bg-neutral-700 rounded appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold uppercase tracking-wider transition"
            >
              Deploy Watchdog Trigger
            </button>
          </form>
        )}

        {/* Existing Watches List */}
        <div className="space-y-3">
          {watches.map((w) => (
            <div
              key={w.id}
              className={`p-3.5 rounded-lg border transition ${
                w.status === 'Alert Triggered'
                  ? 'bg-amber-950/20 border-amber-800/80 shadow-lg shadow-amber-950/30'
                  : 'bg-neutral-950/80 border-neutral-800'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    w.status === 'Alert Triggered'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {w.status.toUpperCase()}
                </span>
                <button
                  onClick={() => deleteWatch(w.id)}
                  title="Delete Watch"
                  className="text-neutral-500 hover:text-red-400 p-1 rounded transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Title & AOI */}
              <div className="mt-2">
                <h3 className="text-xs font-semibold text-neutral-200">{w.name}</h3>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{w.locationName}</p>
              </div>

              {/* Alert Reason Banner */}
              {w.latestDeltas.alertTriggered && w.latestDeltas.triggerReason && (
                <div className="mt-2 p-2 bg-amber-900/30 border border-amber-700/60 rounded text-[11px] text-amber-200">
                  <span className="font-semibold text-amber-300">TRIGGER: </span>
                  {w.latestDeltas.triggerReason}
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-neutral-850 font-mono text-[11px]">
                <div className="bg-neutral-900/90 p-1.5 rounded">
                  <div className="text-[9px] text-neutral-500 uppercase">Δ Built Surface</div>
                  <div className="font-bold text-amber-300 mt-0.5">
                    +{w.latestDeltas.builtUpAreaHaChange} ha
                  </div>
                </div>
                <div className="bg-neutral-900/90 p-1.5 rounded">
                  <div className="text-[9px] text-neutral-500 uppercase">Next Overpass</div>
                  <div className="font-bold text-cyan-400 mt-0.5">{w.nextSceneDate}</div>
                </div>
              </div>

              {/* Investigate Action */}
              <button
                onClick={() => handleInvestigateWatch(w)}
                className="mt-3 w-full py-1.5 bg-neutral-800 hover:bg-cyan-600 hover:text-white text-neutral-300 rounded text-xs font-semibold font-mono tracking-wider transition flex items-center justify-center gap-1.5"
              >
                <span>Investigate In Map →</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
