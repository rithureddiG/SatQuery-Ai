'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Loader2, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const QueryBar: React.FC = () => {
  const ws = useWorkspace();
  const [isListening, setIsListening] = useState(false);
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
      const defaultQ = 'Has the built-up area increased between the two dates?';
      ws.setQueryText(defaultQ);
      ws.runQuery(defaultQ);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws.queryText.trim() || ws.isAnalyzing) return;
    ws.runQuery();
  };

  const prompts = ws.currentMission.prompts || [];

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-2.5" ref={containerRef}>
      {/* 1-Click Starter Questions Chips */}
      {!ws.isAnalyzing && prompts.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 select-none">
          <span className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-wider shrink-0">
            TRY:
          </span>
          {prompts.slice(0, 3).map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                ws.setQueryText(promptText);
                ws.runQuery(promptText);
              }}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#E6E6E1] hover:border-[#111111] hover:bg-[#FAF9F7] text-xs font-medium text-[#333333] transition-all flex items-center gap-1.5 shadow-xs group active:scale-[0.98]"
            >
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate max-w-[280px]">{promptText}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Query Bar */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-white border rounded-2xl px-3 py-2 shadow-md transition-all ${
          ws.isAnalyzing
            ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20'
            : 'border-[#E6E6E1] hover:border-[#CCCCCC] focus-within:border-[#111111] focus-within:ring-1 focus-within:ring-black/5'
        }`}
      >
        {/* Leading Icon */}
        <div className="pl-1 pr-2 text-[#888888]">
          <Sparkles className={`w-4 h-4 ${ws.isAnalyzing ? 'text-amber-500 animate-spin' : 'text-[#6F6F6A]'}`} />
        </div>

        {/* Query Input */}
        <input
          type="text"
          value={ws.queryText}
          onChange={(e) => ws.setQueryText(e.target.value)}
          placeholder={
            ws.isAnalyzing
              ? 'Analyzing remote-sensing observations via Siamese ChangeNet & SAR...'
              : 'Ask SatQuery about this satellite scene (or click a query above)...'
          }
          disabled={ws.isAnalyzing}
          className="flex-1 text-xs font-sans text-[#111111] placeholder-[#888888] bg-transparent focus:outline-none disabled:opacity-85"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md'
                : 'text-[#6F6F6A] hover:text-[#111111] hover:bg-[#FAF9F7]'
            }`}
            title={isListening ? 'Listening via Web Speech API...' : 'Voice Query'}
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!ws.queryText.trim() || ws.isAnalyzing}
            className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-black transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            title="Dispatch Query (Enter)"
          >
            {ws.isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
