/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CircuitComponent, CircuitWire, LogicValue } from '../types/circuit';
import { Activity, X, Trash2, Pause, Play } from 'lucide-react';

interface WaveformChannel {
  id: string;
  label: string;
  history: LogicValue[];
}

interface OscilloscopePanelProps {
  isOpen: boolean;
  onClose: () => void;
  channels: WaveformChannel[];
  onClearHistory: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const OscilloscopePanel: React.FC<OscilloscopePanelProps> = ({
  isOpen,
  onClose,
  channels,
  onClearHistory,
  isPaused,
  onTogglePause,
}) => {
  if (!isOpen) return null;

  const maxSamples = 40;
  const sampleWidth = 14;
  const waveHeight = 24;

  return (
    <div
      className="h-44 bg-slate-900 border-t border-slate-800 text-slate-100 flex flex-col select-none z-20 shadow-2xl mb-16 md:mb-0 animate-in slide-in-from-bottom duration-150"
      aria-label="Analizador Lógico de Formas de Onda"
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Osciloscopio Digital / Analizador Lógico
          </span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
            {channels.length} canales
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              isPaused
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>
          <button
            onClick={onClearHistory}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            title="Limpiar trazas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Waveform Channels Canvas / SVG */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-2 space-y-2 custom-scrollbar bg-slate-950">
        {channels.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No hay señales monitorizadas actualmente. Las salidas se registrarán al simular.
          </div>
        ) : (
          channels.map((ch, idx) => {
            const history = ch.history.slice(-maxSamples);
            // Build square wave path
            let d = '';
            for (let i = 0; i < history.length; i++) {
              const val = history[i];
              const x = i * sampleWidth;
              const y = val === 1 ? 4 : waveHeight - 4;

              if (i === 0) {
                d += `M ${x} ${y}`;
              } else {
                const prevVal = history[i - 1];
                const prevY = prevVal === 1 ? 4 : waveHeight - 4;
                if (prevVal !== val) {
                  d += ` L ${x} ${prevY} L ${x} ${y}`;
                } else {
                  d += ` L ${x} ${y}`;
                }
              }
            }

            const curVal = history[history.length - 1];

            return (
              <div key={ch.id} className="flex items-center gap-3">
                {/* Channel Label */}
                <div className="w-32 flex-shrink-0 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 truncate" title={ch.label}>
                    {ch.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1 rounded ${
                      curVal === 1
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {curVal === 1 ? '1' : curVal === 0 ? '0' : '?'}
                  </span>
                </div>

                {/* Waveform Grid & Path */}
                <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded h-7 relative overflow-hidden">
                  <svg className="w-full h-full block">
                    {/* Center dotted guide */}
                    <line
                      x1="0"
                      y1={waveHeight / 2}
                      x2="100%"
                      y2={waveHeight / 2}
                      stroke="#1e293b"
                      strokeDasharray="2 4"
                    />

                    {/* Square Waveform */}
                    <path
                      d={d}
                      stroke={curVal === 1 ? '#10b981' : '#38bdf8'}
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="square"
                    />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
