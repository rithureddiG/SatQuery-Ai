'use client';

import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface FloatingFindingSurfaceProps {
  onInspectEvidence?: () => void;
}

export const FloatingFindingSurface: React.FC<FloatingFindingSurfaceProps> = ({
  onInspectEvidence,
}) => {
  const ws = useWorkspace();
  const finding = ws.activeFinding;

  const handleInspect = () => {
    if (onInspectEvidence) {
      onInspectEvidence();
    } else {
      ws.toggleDrawer('evidence');
    }
  };

  const title = finding?.title || ws.findingTitle;
  const areaHa = finding ? `${finding.spatial.area_ha.toFixed(2)} ha` : ws.totalAreaHa;
  const areaM2 = finding ? `${finding.spatial.area_m2.toLocaleString()} m²` : ws.totalAreaM2;
  const concordance = finding
    ? Math.round(
        finding.confidence.evidence_score <= 1
          ? finding.confidence.evidence_score * 100
          : finding.confidence.evidence_score
      )
    : ws.evidenceScore;

  const agentConfidence = ws.agentResult?.confidence;
  const opticalScore = agentConfidence?.factors?.spatial_resolution 
    ? Math.round(agentConfidence.factors.spatial_resolution * 100) 
    : 88;
  const temporalScore = agentConfidence?.factors?.model_confidence 
    ? Math.round(agentConfidence.factors.model_confidence * 100) 
    : 94;
  const sarBackscatterDb = '-14.5 dB σ⁰';

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
          <span className="text-neutral-400 text-[10px]">({concordance}%)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-12 right-5 z-20 w-72 bg-[#121212]/92 backdrop-blur-md border border-white/10 rounded-md p-4 space-y-3.5 select-none text-white font-mono shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
            FINDING
          </span>
        </div>
        <button
          onClick={() => ws.setIsFindingDismissed(true)}
          className="text-neutral-500 hover:text-neutral-300 transition-colors"
          title="Dismiss Finding Readout"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Title / Description */}
      <div className="space-y-0.5">
        <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
          {finding?.category || 'DETECTION'}
        </div>
        <div className="font-sans font-semibold text-xs text-white leading-snug">
          {title}
        </div>
      </div>

      {/* Editorial Metric Readout */}
      <div className="border-b border-white/10 pb-3">
        <div className="text-2xl font-bold font-sans tracking-tight text-white leading-none">
          {areaHa}
        </div>
        <div className="text-[10px] text-neutral-400 mt-1 font-mono">
          {areaM2}
        </div>
      </div>

      {/* Observation Interval */}
      <div className="flex items-center justify-between text-[11px] text-neutral-300 border-b border-white/10 pb-2.5">
        <span className="text-neutral-500 text-[10px] uppercase tracking-wider">INTERVAL</span>
        <span className="font-bold text-white">T1 → T2</span>
      </div>

      {/* Concordance Score */}
      <div className="flex items-center justify-between text-[11px] text-neutral-300 border-b border-white/10 pb-2.5">
        <span className="text-neutral-500 text-[10px] uppercase tracking-wider">CONCORDANCE</span>
        <span className="font-bold text-emerald-400">{concordance}%</span>
      </div>

      {/* Corroboration Breakdown */}
      <div className="space-y-1.5 text-[10px] text-neutral-400 border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 uppercase tracking-wider">OPTICAL CONSISTENCY</span>
          <span className="font-bold text-neutral-200">{opticalScore}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 uppercase tracking-wider">TEMPORAL CORRELATION</span>
          <span className="font-bold text-neutral-200">{temporalScore}%</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-neutral-500 uppercase tracking-wider">SAR RADAR BACKSCATTER</span>
          <span className="font-bold text-satblue-400 font-mono">{sarBackscatterDb}</span>
        </div>
      </div>

      {/* Inspect Evidence Action */}
      <button
        onClick={handleInspect}
        className="w-full flex items-center justify-between py-1.5 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors group"
      >
        <span>INSPECT EVIDENCE</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
