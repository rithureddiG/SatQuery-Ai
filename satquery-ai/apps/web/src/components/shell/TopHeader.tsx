'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Target,
  ChevronDown,
  Check,
  Globe,
  FileText,
  ShieldCheck,
  Sparkles,
  Search,
  FolderArchive,
  Calendar,
  X,
  Compass,
  Layers,
  Settings,
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
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('ALL');

  // Filtered missions for quick selection
  const filteredMissions = useMemo(() => {
    return CANONICAL_MISSIONS.filter((m) => {
      if (filterYear !== 'ALL') {
        const hasYear = m.dateT1?.startsWith(filterYear) || m.dateT2?.startsWith(filterYear);
        if (!hasYear) return false;
      }
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesLoc = m.location.toLowerCase().includes(q);
        const matchesTag = m.tag.toLowerCase().includes(q);
        const matchesDate = (m.dateT1 && m.dateT1.includes(q)) || (m.dateT2 && m.dateT2.includes(q));
        if (!matchesName && !matchesLoc && !matchesTag && !matchesDate) return false;
      }
      return true;
    });
  }, [filterQuery, filterYear]);

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

      {/* Center: Mission Selector with Search Filter */}
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
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-88 bg-[#141414] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs">
            {/* Header & Search Bar */}
            <div className="p-2.5 border-b border-[#222222] bg-[#111111] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                  FILTER DOSSIERS & MISSIONS
                </span>
                <span className="text-[9px] text-neutral-500">
                  {filteredMissions.length} matched
                </span>
              </div>
              <div className="relative">
                <Search className="w-3 h-3 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by date or name (e.g. 2026, Bangalore)..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-md pl-7 pr-6 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 font-sans"
                />
                {filterQuery && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterQuery('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                <span className="text-[9px] text-neutral-500 mr-1">Date:</span>
                {(['ALL', '2026', '2025', '2024'] as const).map((yr) => (
                  <button
                    key={yr}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterYear(yr);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      filterYear === yr
                        ? 'bg-neutral-200 text-black font-bold'
                        : 'bg-[#1F1F1F] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Missions List */}
            <div className="p-1 max-h-64 overflow-y-auto space-y-0.5">
              {filteredMissions.length === 0 ? (
                <div className="p-4 text-center text-neutral-500 text-[11px]">
                  No matching dossiers found.
                </div>
              ) : (
                filteredMissions.map((m) => {
                  const isSelected = ws.selectedMissionId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        ws.selectMission(m.id);
                        setIsMissionDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-400 font-bold">{m.tag}</span>
                          {(m.dateT1 || m.dateT2) && (
                            <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/60">
                              {m.dateT2 || m.dateT1}
                            </span>
                          )}
                        </div>
                        <div className="font-sans font-medium text-neutral-200 text-xs mt-0.5">{m.name}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{m.location}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Archive Link */}
            <button
              onClick={() => {
                setIsMissionDropdownOpen(false);
                ws.toggleDrawer('analysis');
              }}
              className="w-full text-left p-2.5 border-t border-[#222222] bg-[#111111] text-[11px] font-mono text-emerald-400 hover:bg-[#1A1A1A] hover:text-emerald-300 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Open Analyses Archive...</span>
              </span>
              <span className="text-[9px] text-neutral-500">Search & Restore Saved Analyses</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Subordinate Navigation & Quiet Status Indicator */}
      <div className="flex items-center gap-2.5">
        {/* Clean Primary Product Navigation */}
        <nav className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
          <button
            onClick={() => {
              ws.closeDrawer();
              ws.setActiveTab('workspace');
            }}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              ws.activeDrawer === null && ws.activeTab === 'workspace'
                ? 'text-white bg-neutral-900 font-bold'
                : 'hover:text-white hover:bg-neutral-900'
            }`}
            title="Return to Main Workspace View"
          >
            <Compass className="w-3 h-3 text-neutral-400" />
            <span>Workspace</span>
          </button>

          {/* Phase 1: Custom AOI Importer Button */}
          <button
            id="header-aoi-btn"
            onClick={() => ws.setIsAoiModalOpen(true)}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              ws.customAoi
                ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800 font-bold'
                : 'hover:text-white hover:bg-neutral-900 text-neutral-300'
            }`}
            title="Import or view Custom AOI (GeoJSON, KML, Shapefile)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>{ws.customAoi ? `AOI: ${ws.customAoi.name.split(' ')[0]}` : 'AOI'}</span>
          </button>

          {/* Phase 2: Spectral & Pixel Inspector */}
          <button
            id="header-inspector-btn"
            onClick={() => {
              ws.setActiveTool('inspect');
              ws.setIsSpectralInspectorActive(!ws.isSpectralInspectorActive);
            }}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              ws.isSpectralInspectorActive
                ? 'text-cyan-300 bg-neutral-900 font-bold border border-cyan-700'
                : 'hover:text-white hover:bg-neutral-900 text-neutral-300'
            }`}
            title="Spectral Reflectance & SAR Backscatter Inspector"
          >
            <span>Inspector</span>
          </button>

          {/* Phase 5: Sentinel Watch Monitoring */}
          <button
            id="header-sentinel-watch-btn"
            onClick={() => ws.setIsSentinelWatchOpen(true)}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 relative ${
              ws.watches.some((w) => w.status === 'Alert Triggered')
                ? 'text-amber-300 bg-amber-950/60 border border-amber-800 font-bold'
                : 'hover:text-white hover:bg-neutral-900 text-neutral-300'
            }`}
            title="Sentinel Watch Orbit Monitoring & Alerts"
          >
            <span>Watch</span>
            {ws.watches.some((w) => w.status === 'Alert Triggered') && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => ws.toggleDrawer('scene')}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              ws.activeDrawer === 'scene'
                ? 'text-white bg-neutral-900 font-bold'
                : 'hover:text-white hover:bg-neutral-900'
            }`}
            title="Imagery & Observations Catalog"
          >
            <Layers className="w-3 h-3 text-neutral-400" />
            <span>Imagery</span>
          </button>

          <button
            onClick={() => ws.toggleDrawer('analysis')}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              ws.activeDrawer === 'analysis'
                ? 'text-emerald-400 bg-neutral-900 font-bold'
                : 'hover:text-white hover:bg-neutral-900'
            }`}
            title="Saved & Recent Analyses"
          >
            <FolderArchive className="w-3 h-3 text-emerald-400" />
            <span className="text-neutral-200">Analyses</span>
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
            onClick={() => {
              if (propOnOpenSettings) propOnOpenSettings();
              else ws.setIsSettingsOpen(true);
            }}
            className="p-1 rounded hover:text-white hover:bg-neutral-900 transition-colors text-neutral-400"
            title="System Settings & Node Clusters"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => ws.toggleDrawer('chat')}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 font-medium ml-0.5 ${
              ws.activeDrawer === 'chat'
                ? 'bg-satblue-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Open SatQuery AI Copilot Conversation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Copilot</span>
          </button>
        </nav>

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
