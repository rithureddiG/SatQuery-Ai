'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  ZoomIn,
  Activity,
  Layers,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface FloatingFindingSurfaceProps {
  onInspectEvidence?: () => void;
}

export const FloatingFindingSurface: React.FC<FloatingFindingSurfaceProps> = ({
  onInspectEvidence,
}) => {
  const ws = useWorkspace();
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);
  const finding = ws.activeFinding;

  const handleInspect = () => {
    if (onInspectEvidence) {
      onInspectEvidence();
    } else {
      ws.setActiveLens('EVIDENCE');
      ws.toggleDrawer('evidence');
    }
  };

  const handleZoomToEvidence = () => {
    ws.setActiveLens('CHANGE');
    if (ws.clusters.length > 0) {
      ws.selectCluster(ws.clusters[0].id);
      ws.setPan({ x: -10, y: -15 });
    }
  };

  if (!finding) return null;

  const title = finding.title;
  const areaHa = `${finding.spatial.area_ha.toFixed(2)} ha`;
  const areaM2 = `${finding.spatial.area_m2.toLocaleString()} m²`;
  const concordance = finding
    ? Math.round(
        finding.confidence.evidence_score <= 1
          ? finding.confidence.evidence_score * 100
          : finding.confidence.evidence_score
      )
    : null;

  // Minimized state
  if (ws.isFindingDismissed) {
    return (
      <div className="absolute top-12 right-5 z-20 select-none animate-in fade-in duration-200">
        <button
          onClick={() => ws.setIsFindingDismissed(false)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#121212]/90 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono hover:bg-neutral-800 transition-colors shadow-lg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-bold">FINDING · {areaHa}</span>
          <span className="text-emerald-400 text-[10px]">({concordance}%)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-12 right-5 z-20 w-80 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-lg p-4 space-y-3 select-none text-white font-mono shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
            RESULT & EVIDENCE
          </span>
        </div>
        <button
          onClick={() => ws.setIsFindingDismissed(true)}
          className="text-neutral-500 hover:text-neutral-300 transition-colors p-0.5"
          title="Dismiss Finding Readout"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Result Headline */}
      <div className="space-y-1">
        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>VERIFIED GEOSPATIAL FINDING</span>
        </div>
        <div className="font-sans font-bold text-xs text-white leading-snug">
          {title}
        </div>
      </div>

      {/* Metric & Calibrated Confidence Strip */}
      <div className="grid grid-cols-2 gap-2 bg-[#171717] p-2.5 rounded-md border border-white/5">
        <div>
          <span className="text-[9px] text-neutral-500 uppercase block">ESTIMATED CHANGE</span>
          <span className="text-base font-bold font-sans text-white">{areaHa}</span>
          <span className="text-[9px] text-neutral-400 block font-mono">{areaM2}</span>
        </div>
        <div>
          <span className="text-[9px] text-neutral-500 uppercase block">CONFIDENCE</span>
          <div className="flex items-center gap-1">
            <span className="text-base font-bold font-sans text-neutral-300">{concordance != null ? `${concordance}%` : 'N/A'}</span>
          </div>
          <span className="text-[9px] text-neutral-400 block font-mono">Not calibrated</span>
        </div>
      </div>

      {/* Key Findings Bullet Points */}
      <div className="space-y-1.5 text-[11px] font-sans border-t border-b border-white/5 py-2.5">
        <div className="text-[9px] font-mono uppercase text-neutral-500 font-bold tracking-wider">
          KEY OBSERVATIONS
        </div>
        <ul className="space-y-1 text-neutral-300 text-[11px] leading-tight">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 shrink-0">•</span>
            <span>{areaHa} represented by the selected backend geometry.</span>
          </li>
        </ul>
      </div>

      {/* Primary Actions: Zoom to Evidence, How it ran, Export Report */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <button
          onClick={handleZoomToEvidence}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-colors"
          title="Zoom map view to evidence polygon clusters"
        >
          <ZoomIn className="w-3 h-3" />
          <span>Zoom</span>
        </button>

        <button
          onClick={() => setShowTechnicalTrace(!showTechnicalTrace)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
          title="Toggle execution pipeline and technical inference details"
        >
          <span>How it ran</span>
          {showTechnicalTrace ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          onClick={() => ws.openExport('pdf')}
          className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
          title="Export Analysis Report"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expandable Technical Details: "How this analysis ran" */}
      {showTechnicalTrace && (
        <div className="p-2.5 rounded bg-[#0F0F0F] border border-[#2B2B2B] space-y-2 text-[10px] font-mono animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-neutral-400 border-b border-white/5 pb-1">
            <span className="text-[9px] uppercase font-bold text-neutral-300 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-satblue-400" />
              PIPELINE EXECUTION TRACE
            </span>
            <span className="text-emerald-400 font-bold">{ws.agentResult?.total_duration_ms ?? 'N/A'} ms</span>
          </div>

          <div className="space-y-1 text-neutral-400 leading-snug">
            {(ws.agentResult?.execution_steps || []).map((step, index) => (
              <div key={`${step.tool}-${index}`}>
                <span className="text-neutral-500">{step.tool}: </span>
                <span className="text-neutral-200">{step.output_summary || step.description || step.status}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => ws.toggleDrawer('trace')}
            className="w-full text-center py-1 mt-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[10px] font-semibold border border-white/5 transition-colors"
          >
            Open Full Provenance Trace →
          </button>
        </div>
      )}
    </div>
  );
};
