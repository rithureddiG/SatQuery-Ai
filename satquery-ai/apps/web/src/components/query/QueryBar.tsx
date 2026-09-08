'use client';

import React, { useState, useRef } from 'react';
import { ArrowUp, Mic, Loader2, Sparkles, Compass } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const QueryBar: React.FC = () => {
  const ws = useWorkspace();
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleVoiceInput = () => {
    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          ws.setQueryText(transcript);
          ws.runQuery(transcript);
        }
      };

      recognition.start();
    } else {
      const defaultQ = 'Analyze industrial expansion around Hyderabad between T1 and T2';
      ws.setQueryText(defaultQ);
      ws.runQuery(defaultQ);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = ws.queryText.trim();
    if (!query || ws.isAnalyzing) return;

    // Direct Geographic & Coordinate Navigation
    const lower = query.toLowerCase();
    if (lower.includes('hyderabad')) {
      ws.updateMissionLocation({
        name: 'Hyderabad Urban Corridor',
        lat: 17.3850,
        lon: 78.4867,
        utmZone: 'EPSG:32644 (UTM Zone 44N)',
        areaAoi: '25.0 km²',
      });
    } else if (lower.includes('bengaluru') || lower.includes('bangalore')) {
      ws.updateMissionLocation({
        name: 'Bangalore Urban Corridor',
        lat: 12.9716,
        lon: 77.5946,
        utmZone: 'EPSG:32643 (UTM Zone 43N)',
        areaAoi: '12.64 km²',
      });
    } else if (lower.includes('mumbai')) {
      ws.updateMissionLocation({
        name: 'Mumbai Coastal Region',
        lat: 19.0760,
        lon: 72.8777,
        utmZone: 'EPSG:32643 (UTM Zone 43N)',
        areaAoi: '30.0 km²',
      });
    } else if (lower.includes('delhi')) {
      ws.updateMissionLocation({
        name: 'Delhi NCR Region',
        lat: 28.6139,
        lon: 77.2090,
        utmZone: 'EPSG:32643 (UTM Zone 43N)',
        areaAoi: '28.5 km²',
      });
    }

    // Check if input is a coordinate pair (e.g., "17.385, 78.4867")
    const coordMatch = query.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        ws.updateMissionLocation({
          name: `Coordinates (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`,
          lat,
          lon,
          utmZone: `EPSG:${Math.floor((lon + 180) / 6) + 32601}`,
          areaAoi: '15.0 km²',
        });
      }
    }

    ws.runQuery();
  };

  const prompts = ws.currentMission.prompts || [
    'Analyze industrial expansion around Hyderabad between T1 and T2',
    'Corroborate with Sentinel-1 SAR VV/VH backscatter change',
    'Quantify built-up expansion and compute area in hectares',
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-1.5" ref={containerRef}>
      {/* Contextual Command Suggestions (Progressive Disclosure) */}
      {!ws.isAnalyzing && isFocused && prompts.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none animate-in fade-in duration-150">
          <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest shrink-0">
            PROMPTS:
          </span>
          {prompts.slice(0, 3).map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                ws.setQueryText(promptText);
                ws.runQuery(promptText);
              }}
              className="shrink-0 px-2 py-1 rounded bg-[#1A1A1A] border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 text-[11px] font-mono text-neutral-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
              <span className="truncate max-w-[260px]">{promptText}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Mission Command Surface */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-[#141414] border rounded-md px-3 py-1.5 transition-colors ${
          ws.isAnalyzing
            ? 'border-amber-500/60 bg-amber-950/20'
            : isFocused
            ? 'border-neutral-500 bg-[#161616]'
            : 'border-neutral-800 hover:border-neutral-700'
        }`}
      >
        {/* Command Surface Label */}
        <div className="pr-2.5 flex items-center gap-1.5 text-neutral-500 font-mono text-[10px] font-bold tracking-widest border-r border-neutral-800 shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <span className="text-neutral-400">ASK SATQUERY</span>
        </div>

        {/* Command Input Field */}
        <input
          type="text"
          value={ws.queryText}
          onChange={(e) => ws.setQueryText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            ws.isAnalyzing
              ? 'Analyzing observation scenes via ChangeNet & SAR...'
              : 'Analyze industrial expansion around Hyderabad between T1 and T2 (or enter coordinates)'
          }
          disabled={ws.isAnalyzing}
          className="flex-1 text-xs font-mono text-white placeholder-neutral-500 bg-transparent px-2.5 focus:outline-none disabled:opacity-75"
        />

        {/* Action Controls */}
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-1.5 rounded transition-colors ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
            }`}
            title={isListening ? 'Listening...' : 'Voice Command'}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => ws.toggleDrawer('chat')}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 border border-white/5 ${
              ws.activeDrawer === 'chat'
                ? 'bg-satblue-600 text-white'
                : 'text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800'
            }`}
            title="Open SatQuery AI Copilot Conversation"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline text-[10px] font-mono font-semibold">COPILOT</span>
          </button>

          <button
            type="submit"
            disabled={!ws.queryText.trim() || ws.isAnalyzing}
            className="px-2.5 py-1 rounded bg-white text-black text-xs font-mono font-bold flex items-center gap-1 hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Dispatch Command"
          >
            {ws.isAnalyzing ? (
              <Loader2 className="w-3 h-3 animate-spin text-black" />
            ) : (
              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            )}
            <span className="hidden sm:inline text-[10px]">RUN</span>
          </button>
        </div>
      </form>
    </div>
  );
};
