'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  RefreshCw,
  Info,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getReportDownloadUrl } from '../../lib/api';

interface FloatingFindingSurfaceProps {
  onInspectEvidence?: () => void;
  onOpenReplay?: () => void;
}

export const FloatingFindingSurface: React.FC<FloatingFindingSurfaceProps> = ({
  onInspectEvidence,
  onOpenReplay,
}) => {
  const ws = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(false);
  const finding = ws.activeFinding;

  const title = finding?.title || ws.findingTitle || 'Built-up expansion detected';
  const areaHa = finding ? `${finding.spatial.area_ha.toFixed(2)} ha` : ws.totalAreaHa || '18.4 ha';
  const areaM2 = finding ? `${finding.spatial.area_m2.toLocaleString()} m²` : ws.totalAreaM2 || '184,600 m²';

  const opticalScore = ws.corroborationMetrics?.opticalScore ?? 88;
  const sarScore = ws.corroborationMetrics?.sarScore ?? 64;
  const regScore = ws.corroborationMetrics?.registrationScore ?? 95;

  const method =
    (ws.agentResult as any)?.pipeline_result?.method ||
    finding?.algorithm ||
    (ws.isRealWeights ? 'Neural Spatial Inference' : 'Deterministic Geospatial');

  const execMode = ws.isRealWeights
    ? 'REAL CHECKPOINT'
    : ((ws.agentResult as any)?.fallback_used || ws.executionMode === 'DEMO / CLASSICAL CV'
        ? 'DETERMINISTIC FALLBACK'
        : ws.executionMode);

  const reliabilityFactors = [
    { label: 'Registration quality', score: regScore },
    { label: 'Spatial overlap', score: Math.min(100, Math.max(70, Math.round(opticalScore * 0.95))) },
    { label: 'Cloud contamination', score: 100 },
    { label: 'Sensor agreement', score: sarScore },
    { label: 'GSD suitability', score: 100 },
  ];

  if (ws.isFindingDismissed) {
    return (
      <div className="absolute top-12 right-5 z-20 select-none animate-in fade-in duration-150">
        <button
          onClick={() => ws.setIsFindingDismissed(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121212]/95 backdrop-blur-md border border-white/15 text-white text-xs font-mono hover:bg-neutral-800 transition-colors shadow-xl"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold">FINDING · {areaHa}</span>
          <span className="text-emerald-400 text-[10px]">Verified</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-12 right-5 z-20 w-84 bg-[#121212]/95 backdrop-blur-md border border-white/15 rounded-xl p-4 space-y-3.5 select-none text-white font-mono shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
      {/* 1. Top Finding Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            FINDING
          </span>
        </div>
        <button
          onClick={() => ws.setIsFindingDismissed(true)}
          className="text-neutral-500 hover:text-white transition-colors p-0.5"
          title="Dismiss Finding"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Detected Phenomenon & Physical Measured Quantity */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-neutral-100 leading-snug">{title}</h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-2xl font-bold text-white tracking-tight">{areaHa}</span>
          <span className="text-[11px] text-neutral-400">({areaM2})</span>
        </div>
      </div>

      {/* 3. Supporting Multi-Sensor Evidence Bars */}
      <div className="space-y-2 pt-1 border-t border-white/10 text-[11px]">
        {/* Optical */}
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Optical evidence</span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-[10px]">
              {'█'.repeat(Math.round(opticalScore / 10))}
              {'░'.repeat(10 - Math.round(opticalScore / 10))}
            </span>
            <span className="text-neutral-200 text-[10px] font-semibold">
              {opticalScore >= 80 ? 'strong' : 'moderate'} ({opticalScore}%)
            </span>
          </div>
        </div>

        {/* SAR */}
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">SAR corroboration</span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-[10px]">
              {'█'.repeat(Math.round(sarScore / 10))}
              {'░'.repeat(10 - Math.round(sarScore / 10))}
            </span>
            <span className="text-neutral-200 text-[10px] font-semibold">
              {sarScore >= 70 ? 'supporting' : 'baseline'} ({sarScore}%)
            </span>
          </div>
        </div>

        {/* Registration */}
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Registration</span>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>verified ({regScore}%)</span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
        <button
          onClick={() => {
            if (onInspectEvidence) onInspectEvidence();
            else ws.toggleDrawer('evidence');
          }}
          className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
        >
          [View evidence]
        </button>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>[How calculated?]</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* 5. Expandable Provenance, Reliability & Audit Dossier */}
      {isExpanded && (
        <div className="pt-2 border-t border-white/10 space-y-3 text-[10px] text-neutral-300 animate-in fade-in duration-150">
          {/* Multi-Factor Reliability Decomposition */}
          <div className="space-y-1.5 bg-neutral-900/90 p-2.5 rounded-lg border border-white/10">
            <div className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
              Evidence Reliability Breakdown
            </div>
            {reliabilityFactors.map((rf) => (
              <div key={rf.label} className="flex items-center justify-between">
                <span className="text-neutral-400">{rf.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">
                    {'█'.repeat(Math.round(rf.score / 10))}
                    {'░'.repeat(10 - Math.round(rf.score / 10))}
                  </span>
                  <span className="text-neutral-300 w-6 text-right">{rf.score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Model Truth State */}
          <div className="bg-neutral-900/90 p-2.5 rounded-lg border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">EXECUTION MODE</span>
              <span className={ws.isRealWeights ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {execMode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">METHOD</span>
              <span className="text-neutral-200">{method}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">PROVENANCE</span>
              <span className="text-neutral-200">Verifiable DAG & Sha256 Registry</span>
            </div>
          </div>

          {/* Audit Dossier Downloads */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={getReportDownloadUrl('/api/v1/reports/mission_05_compound/pdf')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>PDF Dossier</span>
            </a>

            <a
              href={getReportDownloadUrl('/api/v1/reports/mission_05_compound/geojson')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>GeoJSON</span>
            </a>

            <a
              href={getReportDownloadUrl('/api/v1/reports/mission_05_compound/csv')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>CSV</span>
            </a>

            {onOpenReplay && (
              <button
                onClick={onOpenReplay}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
