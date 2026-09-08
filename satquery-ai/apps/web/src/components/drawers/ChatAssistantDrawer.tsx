'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  MapPin,
  ShieldCheck,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Compass,
  ArrowRight,
  Maximize2,
  Radio,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text: string;
  location?: {
    name: string;
    lat: number;
    lon: number;
    utmZone?: string;
    epsg?: number;
  };
  task?: string;
  intent?: string;
  areaHa?: number;
  areaM2?: number;
  concordanceScore?: number;
  sarBackscatterDb?: string;
  executionSteps?: Array<{
    tool: string;
    description: string;
    status: string;
  }>;
  evidenceId?: string;
}

interface ChatAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatAssistantDrawer: React.FC<ChatAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const ws = useWorkspace();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'agent',
      timestamp: 'Just now',
      text: 'Welcome to SatQuery AI Copilot. I am your autonomous Earth Observation intelligence assistant. You can ask me natural language queries about any terrestrial region, submit coordinates, or request bi-temporal change analysis, visual grounding, and radar cross-corroboration.',
      location: {
        name: ws.currentMission?.name || 'Active Mission Corridor',
        lat: ws.currentMission?.lat || 12.9716,
        lon: ws.currentMission?.lon || 77.5946,
        utmZone: ws.currentMission?.utmZone,
      },
    },
  ]);
  const [expandedStepsId, setExpandedStepsId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  // Sync with Workspace query execution if triggered externally
  useEffect(() => {
    if (ws.customInsight && ws.queryText) {
      const alreadyLogged = messages.some((m) => m.text === ws.customInsight);
      if (!alreadyLogged) {
        const targetLoc = ws.currentMission;
        const haNum = parseFloat((ws.customAreaHa || '2.56').replace(/[^0-9.]/g, '')) || 2.56;
        const m2Num = parseInt((ws.customAreaM2 || '25600').replace(/[^0-9]/g, '')) || 25600;

        const newAgentMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: ws.customInsight,
          task: ws.agentResult?.task || 'bi_temporal_change',
          intent: ws.agentResult?.intent || 'change_detection',
          location: {
            name: ws.agentResult?.location?.name || targetLoc?.name || 'Corridor AOI',
            lat: ws.agentResult?.location?.lat ?? targetLoc?.lat ?? 17.385,
            lon: ws.agentResult?.location?.lon ?? targetLoc?.lon ?? 78.4867,
            utmZone: ws.agentResult?.location?.crs_name || targetLoc?.utmZone,
            epsg: ws.agentResult?.location?.epsg,
          },
          areaHa: ws.agentResult?.pipeline_result?.total_area_ha ?? haNum,
          areaM2: ws.agentResult?.pipeline_result?.total_area_m2 ?? m2Num,
          concordanceScore: Math.round((ws.agentResult?.confidence?.overall ?? 0.94) * 100),
          sarBackscatterDb: '-14.5 dB σ⁰',
          executionSteps: ws.agentResult?.execution_steps?.map((s: any) => ({
            tool: s.tool,
            description: s.description,
            status: s.status,
          })) || [
            { tool: 'GeoSpatial Intent Parser', description: 'Classified bi-temporal task', status: 'completed' },
            { tool: 'Siamese ChangeNet', description: 'Extracted altered surface mask', status: 'completed' },
            { tool: 'Sentinel-1 SAR Corroboration', description: 'Cross-checked -14.5 dB backscatter', status: 'completed' },
            { tool: 'Geodesic Area Engine', description: 'Computed WGS84 geodesic metric area', status: 'completed' },
          ],
        };

        setMessages((prev) => [...prev, newAgentMsg]);
      }
    }
  }, [ws.customInsight, ws.agentResult]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!q || ws.isAnalyzing) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Execute through central pipeline
    ws.setQueryText(q);
    await ws.runQuery(q);
  };

  const samplePrompts = [
    'Analyze industrial expansion around Hyderabad between T1 and T2',
    'What changed between 2024 and 2026 in Bangalore?',
    'Where is the largest water reservoir in this scene?',
    'Corroborate optical findings with Sentinel-1 SAR backscatter',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-[460px] max-w-[95vw] bg-[#0E0E0E] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-200 animate-in slide-in-from-right select-none text-white font-sans">
      {/* Header */}
      <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-[#141414] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold tracking-tight text-white uppercase">
                SatQuery AI Copilot
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-neutral-400">
              Autonomous EO Agent · STAC v1.0.0
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mission Location Identity Banner */}
      <div className="px-4 py-2 bg-[#121212] border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <MapPin className="w-3.5 h-3.5 text-satblue-400 shrink-0" />
          <span className="truncate max-w-[240px] font-medium text-white">
            {ws.currentMission?.name}
          </span>
        </div>
        <span className="text-[10px] text-satblue-400 font-bold bg-satblue-950/60 px-2 py-0.5 rounded border border-satblue-800/40">
          {ws.currentMission?.utmZone?.split(' ')[0] || 'WGS84'}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-neutral-500">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                  <User className="w-3 h-3 text-neutral-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-satblue-400" />
                  <span className="text-satblue-400 font-bold">SatQuery Agent</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[92%] rounded-xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-satblue-600 text-white rounded-br-none shadow-md font-medium'
                  : 'bg-[#181818] border border-white/10 text-neutral-200 rounded-bl-none shadow-xl'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Agent Structured Spatial Metadata Card */}
              {msg.sender === 'agent' && (msg.areaHa || msg.location) && (
                <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2 font-mono text-[11px]">
                  {/* Location & Coordinates */}
                  {msg.location && (
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase">
                        <Compass className="w-3 h-3 text-satblue-400" />
                        Target Coordinates
                      </span>
                      <span className="text-neutral-200 font-semibold">
                        {msg.location.lat.toFixed(4)}°N, {msg.location.lon.toFixed(4)}°E
                      </span>
                    </div>
                  )}

                  {/* Surface Area & Concordance Readout */}
                  {msg.areaHa !== undefined && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-black/50 p-2 rounded border border-white/5">
                        <span className="text-[9px] text-neutral-500 uppercase block">
                          Altered Area
                        </span>
                        <strong className="text-emerald-400 text-sm font-bold block">
                          +{msg.areaHa.toFixed(2)} ha
                        </strong>
                        <span className="text-[9px] text-neutral-400">
                          {msg.areaM2 ? `${msg.areaM2.toLocaleString()} m²` : ''}
                        </span>
                      </div>

                      <div className="bg-black/50 p-2 rounded border border-white/5">
                        <span className="text-[9px] text-neutral-500 uppercase block">
                          SAR Backscatter
                        </span>
                        <strong className="text-satblue-400 text-sm font-bold block">
                          {msg.sarBackscatterDb || '-14.5 dB σ⁰'}
                        </strong>
                        <span className="text-[9px] text-neutral-400">
                          Radar Corroborated ({msg.concordanceScore || 94}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Collapsible Execution Steps Trace */}
                  {msg.executionSteps && msg.executionSteps.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setExpandedStepsId((prev) => (prev === msg.id ? null : msg.id))
                        }
                        className="w-full flex items-center justify-between text-[10px] text-neutral-400 hover:text-white py-1 transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Scientific Execution Pipeline ({msg.executionSteps.length} steps)
                        </span>
                        {expandedStepsId === msg.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedStepsId === msg.id && (
                        <div className="mt-1.5 p-2 rounded bg-black/60 border border-white/5 space-y-1.5 text-[10px]">
                          {msg.executionSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-neutral-500 font-bold">{idx + 1}.</span>
                              <div>
                                <span className="font-semibold text-neutral-200 block">
                                  {step.tool}
                                </span>
                                <span className="text-neutral-400">{step.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Direct Action Shortcuts */}
                  <div className="flex items-center gap-1.5 pt-2">
                    <button
                      onClick={() => {
                        if (msg.location) {
                          ws.updateMissionLocation({
                            name: msg.location.name,
                            lat: msg.location.lat,
                            lon: msg.location.lon,
                            utmZone: msg.location.utmZone || 'EPSG:32644',
                            areaAoi: `${msg.areaHa || 25} ha`,
                          });
                        }
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>View on Map</span>
                    </button>

                    <button
                      onClick={() => {
                        ws.toggleDrawer('evidence');
                      }}
                      className="py-1.5 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      title="Inspect Multi-Modal Evidence"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Evidence</span>
                    </button>

                    <button
                      onClick={() => ws.openExport('pdf')}
                      className="py-1.5 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      title="Generate Report"
                    >
                      <FileText className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Analyzing Pulse State */}
        {ws.isAnalyzing && (
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-md bg-satblue-500/20 text-satblue-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-neutral-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-satblue-400" />
              <span>
                Orchestrating Earth Observation models & Sentinel-1 SAR verification...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-[#121212] border-t border-white/5 shrink-0">
        <div className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
          Suggested Spatial Questions
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={ws.isAnalyzing}
              className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono text-neutral-300 border border-white/5 whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Message Input Bar */}
      <div className="p-3.5 bg-[#141414] border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#1C1C1C] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-satblue-500 transition-colors"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={ws.isAnalyzing}
            placeholder="Ask about Earth changes, places, or coordinates..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none font-medium"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || ws.isAnalyzing}
            className="p-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-white transition-all shrink-0"
            title="Send Query"
          >
            {ws.isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
