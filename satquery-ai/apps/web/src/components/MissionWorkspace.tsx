'use client';

import React from 'react';
import { TopHeader } from './shell/TopHeader';
import { GeoWorkspace } from './map/GeoWorkspace';
import { QueryBar } from './query/QueryBar';
import { AgentExecution } from './query/AgentExecution';
import { SceneDrawer } from './drawers/SceneDrawer';
import { EvidenceDrawer } from './drawers/EvidenceDrawer';
import { TraceDrawer } from './drawers/TraceDrawer';
import { LayersDrawer } from './drawers/LayersDrawer';
import { ChatAssistantDrawer } from './drawers/ChatAssistantDrawer';
import { AnalysesDrawer } from './drawers/AnalysesDrawer';
import { ReportExportModal } from './ReportExportModal';
import { SettingsModal } from './modals/SettingsModal';
import { LiveSatelliteModal } from './modals/LiveSatelliteModal';
import { BenchmarkModal } from './modals/BenchmarkModal';
import { EarthExplorerModal } from './modals/EarthExplorerModal';
import { EvidenceModal } from './modals/EvidenceModal';
import { TraceModal } from './modals/TraceModal';
import { DossierSearchModal } from './modals/DossierSearchModal';
import { ObservationPicker } from './ObservationPicker';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';

interface MissionWorkspaceProps {
  onSwitchToDiagnostics?: () => void;
  onSwitchToReports?: () => void;
}

function MissionWorkspaceInner({
  onSwitchToDiagnostics,
  onSwitchToReports,
}: MissionWorkspaceProps) {
  const ws = useWorkspace();

  const handleDiagnostics = () => {
    if (onSwitchToDiagnostics) {
      onSwitchToDiagnostics();
    } else {
      ws.setActiveTab('diagnostics');
    }
  };

  const handleReports = () => {
    if (onSwitchToReports) {
      onSwitchToReports();
    } else {
      ws.openExport('pdf');
    }
  };

  return (
    <div className="w-full h-screen min-h-[700px] flex flex-col bg-[#0A0A0A] text-[#111111] font-sans antialiased overflow-hidden select-none">
      {/* 1. Minimal Top Header */}
      <TopHeader
        activeTab={ws.activeTab}
        onSelectTab={(tab) => {
          if (tab === 'diagnostics') handleDiagnostics();
          else if (tab === 'reports') handleReports();
          else ws.setActiveTab('workspace');
        }}
        onOpenSettings={() => ws.setIsSettingsOpen(true)}
      />

      {/* 2. Unified Hero Earth Observation Canvas (Dominates the Workspace) */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <main className="flex-1 relative flex flex-col min-w-0 bg-[#0A0A0A] overflow-hidden">
          <GeoWorkspace />
        </main>

        {/* Progressive Disclosure Slide-Over Drawers (Rendered over the canvas without layout shift) */}
        <SceneDrawer
          isOpen={ws.activeDrawer === 'scene'}
          onClose={() => ws.closeDrawer()}
        />

        <LayersDrawer
          isOpen={ws.activeDrawer === 'layers'}
          onClose={() => ws.closeDrawer()}
        />

        <EvidenceDrawer
          isOpen={ws.activeDrawer === 'evidence'}
          onClose={() => ws.closeDrawer()}
        />

        <TraceDrawer
          isOpen={ws.activeDrawer === 'trace'}
          onClose={() => ws.closeDrawer()}
        />

        <ChatAssistantDrawer
          isOpen={ws.activeDrawer === 'chat'}
          onClose={() => ws.closeDrawer()}
        />

        <AnalysesDrawer
          isOpen={ws.activeDrawer === 'analysis'}
          onClose={() => ws.closeDrawer()}
        />
      </div>

      {/* 3. Bottom Persistent Command Surface & Execution Trace */}
      <div className="shrink-0 bg-[#0C0C0C] border-t border-[#1E1E1E] px-6 py-2.5 space-y-2 z-20">
        {/* Observable Agent Execution Progression */}
        {ws.isAnalyzing && (
          <AgentExecution currentStepIndex={ws.executionStepIndex} />
        )}

        {/* Natural Language Query Composer */}
        <QueryBar />
      </div>

      {/* 4. Production Modals */}
      <ReportExportModal
        isOpen={ws.isExportOpen}
        onClose={ws.closeExport}
        jobId={ws.agentResult?.job_id || `mission_${ws.selectedMissionId}`}
        reportUrls={{
          pdf:
            ws.agentResult?.report_urls?.pdf ||
            `/api/v1/reports/mission_${ws.selectedMissionId}/pdf`,
          geojson:
            ws.agentResult?.report_urls?.geojson ||
            `/api/v1/reports/mission_${ws.selectedMissionId}/geojson`,
          csv:
            ws.agentResult?.report_urls?.csv ||
            `/api/v1/reports/mission_${ws.selectedMissionId}/csv`,
          json:
            ws.agentResult?.report_urls?.json ||
            `/api/v1/reports/mission_${ws.selectedMissionId}/json`,
        }}
      />

      <SettingsModal />

      <LiveSatelliteModal
        isOpen={ws.isLiveSatelliteOpen}
        onClose={() => ws.setIsLiveSatelliteOpen(false)}
      />

      <BenchmarkModal
        isOpen={ws.isBenchmarkOpen}
        onClose={() => ws.setIsBenchmarkOpen(false)}
      />

      <EarthExplorerModal
        isOpen={ws.isEarthExplorerOpen}
        onClose={() => ws.setIsEarthExplorerOpen(false)}
      />

      <EvidenceModal />

      <TraceModal />

      <DossierSearchModal
        isOpen={ws.isDossierSearchOpen}
        onClose={() => ws.setIsDossierSearchOpen(false)}
        onSelectDossier={ws.loadDossier}
      />

      {/* STAC Observation Picker */}
      <ObservationPicker />
    </div>
  );
}

export function MissionWorkspace(props: MissionWorkspaceProps) {
  return (
    <WorkspaceProvider>
      <MissionWorkspaceInner {...props} />
    </WorkspaceProvider>
  );
}

export { SearchEarth } from './SearchEarth';
export { ObservationPicker } from './ObservationPicker';

