'use client';

import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export const MultiEpochTimeline: React.FC = () => {
  const {
    timelineEpochs,
    activeEpochId,
    setActiveEpochId,
    timelineBaselineId,
    setTimelineBaselineId,
    timelineTargetId,
    setTimelineTargetId,
    isTimelinePlaying,
    toggleTimelinePlayback,
    timelineSpeed,
    setTimelineSpeed,
    jumpToNextClearScene,
    isTimelineOpen,
    setIsTimelineOpen,
  } = useWorkspace();

  if (!isTimelineOpen || timelineEpochs.length === 0) return null;

  return (
    <div
      id="multi-epoch-timeline-bar"
      className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-lg shadow-2xl p-2.5 space-y-2 font-sans select-none"
    >
      {/* Control Strip */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Multi-Epoch Observation Timeline
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
            {timelineEpochs.length} Passes (2024–2026)
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex items-center bg-neutral-950 rounded border border-neutral-800 p-0.5 text-[10px] font-mono">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setTimelineSpeed(spd)}
                className={`px-1.5 py-0.5 rounded transition ${
                  timelineSpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            id="timeline-play-pause-btn"
            onClick={toggleTimelinePlayback}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              isTimelinePlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isTimelinePlaying ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Time-Lapse</span>
              </>
            )}
          </button>

          {/* Jump to Clear Scene */}
          <button
            id="timeline-clear-scene-btn"
            onClick={jumpToNextClearScene}
            title="Jump to next cloud-free (<2%) optical scene"
            className="px-2 py-1 rounded text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Next Clear</span>
          </button>

          {/* Collapse */}
          <button
            id="close-timeline-btn"
            onClick={() => setIsTimelineOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition"
            title="Collapse Timeline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Observation Epoch Carousel / Track */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-neutral-700">
        {timelineEpochs.map((epoch) => {
          const isActive = epoch.id === activeEpochId;
          const isBaseline = epoch.id === timelineBaselineId;
          const isTarget = epoch.id === timelineTargetId;

          return (
            <div
              key={epoch.id}
              onClick={() => setActiveEpochId(epoch.id)}
              className={`shrink-0 w-36 rounded-md p-2 cursor-pointer transition border flex flex-col justify-between text-left ${
                isActive
                  ? 'bg-neutral-800 border-cyan-500 shadow-md shadow-cyan-950/40'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {/* Header: Date + Modality Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold font-mono text-neutral-200">
                  {epoch.date}
                </span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded font-medium ${
                    epoch.modality === 'sar'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {epoch.modality.toUpperCase()}
                </span>
              </div>

              {/* Sensor & Cloud Badge */}
              <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                <span>{epoch.sensor}</span>
                {epoch.modality === 'optical' ? (
                  <span className={epoch.cloudCoverPct < 2 ? 'text-emerald-400' : 'text-amber-400'}>
                    {epoch.cloudCoverPct}% ☁
                  </span>
                ) : (
                  <span className="text-indigo-400">All-Weather</span>
                )}
              </div>

              {/* Cumulative Delta */}
              <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-neutral-800/80 text-[10px] font-mono">
                <span className="text-neutral-500">Δ Built:</span>
                <span className={epoch.cumulativeChangeHa > 0 ? 'text-amber-300 font-bold' : 'text-neutral-400'}>
                  +{epoch.cumulativeChangeHa.toFixed(2)} ha
                </span>
              </div>

              {/* T1 / T2 Action Buttons */}
              <div className="mt-2 grid grid-cols-2 gap-1 pt-1 border-t border-neutral-850">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimelineBaselineId(epoch.id);
                  }}
                  className={`py-0.5 text-[9px] font-mono rounded transition text-center ${
                    isBaseline
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {isBaseline ? 'T1 BASE' : 'Set T1'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimelineTargetId(epoch.id);
                  }}
                  className={`py-0.5 text-[9px] font-mono rounded transition text-center ${
                    isTarget
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {isTarget ? 'T2 TARGET' : 'Set T2'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
