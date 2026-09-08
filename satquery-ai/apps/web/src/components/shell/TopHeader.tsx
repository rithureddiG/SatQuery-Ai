'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Target,
  ChevronDown,
  Check,
  Globe,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useWorkspace, Scenario, CANONICAL_MISSIONS } from '../../context/WorkspaceContext';

interface TopHeaderProps {
  scenarios?: Scenario[];
  selectedScenarioId?: string;
  onSelectScenario?: (id: string) => void;
  activeTab?: 'workspace' | 'diagnostics' | 'reports';
  onSelectTab?: (tab: 'workspace' | 'diagnostics' | 'reports') => void;
  onOpenSettings?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSelectTab: propOnSelectTab,
  onOpenSettings: propOnOpenSettings,
}) => {
  const ws = useWorkspace();
  const [isMissionDropdownOpen, setIsMissionDropdownOpen] = useState<boolean>(false);
  const missionRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (missionRef.current && !missionRef.current.contains(event.target as Node)) {
        setIsMissionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMission = ws.currentMission;

  return (
    <header className="h-11 shrink-0 bg-[#0A0A0A] border-b border-[#222222] px-5 flex items-center justify-between z-30 select-none text-white">
      {/* Left: Brand & Micro Subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black">
          <Target className="w-3.5 h-3.5 stroke-[2.4]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-bold text-xs tracking-tight text-neutral-100">
            SATQUERY AI
          </span>
          <span className="hidden sm:inline text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
            EARTH OBSERVATION INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Center: Mission Selector (Restrained Typography, No Heavy Pill) */}
      <div className="relative" ref={missionRef}>
        <button
          onClick={() => setIsMissionDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 text-xs text-neutral-300 hover:text-white transition-colors group py-1 px-2 rounded hover:bg-neutral-900"
        >
          <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            {currentMission.tag}
          </span>
          <span className="font-medium text-neutral-200 group-hover:text-white transition-colors">
            {currentMission.name}
          </span>
          <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300 transition-transform duration-150" />
        </button>

        {isMissionDropdownOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-80 bg-[#141414] border border-[#2A2A2A] rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs">
            <div className="px-3 py-1.5 text-[9px] font-bold tracking-widest text-neutral-500 uppercase border-b border-[#222222]">
              CANONICAL MISSIONS SUITE
            </div>
            <div className="p-1 space-y-0.5">
              {CANONICAL_MISSIONS.map((m) => {
                const isSelected = ws.selectedMissionId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      ws.selectMission(m.id);
                      setIsMissionDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded text-xs transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-neutral-500 font-bold">{m.tag}</div>
                      <div className="font-sans font-medium text-neutral-200 text-xs mt-0.5">{m.name}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{m.location}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: Subordinate Navigation & Quiet Status Indicator */}
      <div className="flex items-center gap-3">
        {/* Subtle Navigation Actions */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
          <button
            onClick={() => ws.toggleDrawer('evidence')}
            className="px-2 py-1 rounded hover:text-white hover:bg-neutral-900 transition-colors flex items-center gap-1"
            title="Inspect Grounded Multi-modal Evidence"
          >
            <ShieldCheck className="w-3 h-3 text-neutral-400" />
            <span>Evidence</span>
          </button>

          <button
            onClick={() => ws.openExport('pdf')}
            className="px-2 py-1 rounded hover:text-white hover:bg-neutral-900 transition-colors flex items-center gap-1"
            title="Export Mission Audit Dossier"
          >
            <FileText className="w-3 h-3 text-neutral-400" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => ws.setIsEarthExplorerOpen(true)}
            className="px-2 py-1 rounded hover:text-white hover:bg-neutral-900 transition-colors flex items-center gap-1"
            title="STAC Catalog & Global Coordinate Query"
          >
            <Globe className="w-3 h-3 text-neutral-400" />
            <span>Earth Explorer</span>
          </button>

          <button
            onClick={() => ws.toggleDrawer('chat')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 font-medium ${
              ws.activeDrawer === 'chat'
                ? 'bg-satblue-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Open SatQuery AI Copilot Conversation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Copilot</span>
          </button>
        </div>

        <span className="w-px h-3 bg-neutral-800" />

        {/* Quiet Minimal Status Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
          {ws.systemState === 'ANALYZING' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300">ANALYZING</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-neutral-400">READY</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export type { Scenario };
