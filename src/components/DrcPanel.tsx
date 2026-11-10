/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DrcReport, DrcViolation } from '../engine/drc';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  X,
  Crosshair,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

interface DrcPanelProps {
  isOpen: boolean;
  onClose: () => void;
  report: DrcReport;
  onSelectComponent: (componentId: string) => void;
  onSelectWire: (wireId: string) => void;
}

export const DrcPanel: React.FC<DrcPanelProps> = ({
  isOpen,
  onClose,
  report,
  onSelectComponent,
  onSelectWire,
}) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');

  if (!isOpen) return null;

  const filteredViolations = report.violations.filter((v) => {
    if (filter === 'all') return true;
    return v.severity === filter;
  });

  const errorCount = report.violations.filter((v) => v.severity === 'error').length;
  const warningCount = report.violations.filter((v) => v.severity === 'warning').length;

  return (
    <div
      className="fixed inset-0 md:relative md:inset-auto w-full md:w-[440px] bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full z-50 md:z-20 shadow-2xl animate-in slide-in-from-right duration-200"
      aria-label="Inspector de Reglas de Diseño DRC"
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          {report.hasErrors ? (
            <div className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          ) : report.hasWarnings ? (
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Reglas de Diseño (DRC)
            </h2>
            <span className="text-[10px] text-slate-400">
              Validación eléctrica en tiempo real
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          aria-label="Cerrar panel DRC"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950/50 flex items-center gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos ({report.violations.length})
        </button>
        <button
          onClick={() => setFilter('error')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
            filter === 'error'
              ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
              : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          <span>Conflictos Eléctricos</span>
          <span className="text-[10px] bg-rose-900/60 px-1 rounded text-rose-200">
            {errorCount}
          </span>
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
            filter === 'warning'
              ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
              : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          <span>Advertencias</span>
          <span className="text-[10px] bg-amber-900/60 px-1 rounded text-amber-200">
            {warningCount}
          </span>
        </button>
      </div>

      {/* Violations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {filteredViolations.length === 0 ? (
          <div className="p-8 text-center space-y-2 flex flex-col items-center justify-center h-full">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              ¡Sin infracciones de diseño!
            </h3>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Todas las conexiones eléctricas, niveles de polarización y terminales cumplen con las normas lógicas.
            </p>
          </div>
        ) : (
          filteredViolations.map((v) => (
            <div
              key={v.id}
              className={`p-3 rounded-xl border text-xs space-y-2 transition ${
                v.severity === 'error'
                  ? 'bg-rose-950/30 border-rose-900/60 hover:border-rose-700'
                  : v.severity === 'warning'
                  ? 'bg-amber-950/30 border-amber-900/60 hover:border-amber-700'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  {v.severity === 'error' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : v.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                  <span
                    className={
                      v.severity === 'error'
                        ? 'text-rose-300'
                        : v.severity === 'warning'
                        ? 'text-amber-300'
                        : 'text-blue-300'
                    }
                  >
                    {v.title}
                  </span>
                </div>
                <span
                  className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                    v.severity === 'error'
                      ? 'bg-rose-900/60 text-rose-300'
                      : 'bg-amber-900/60 text-amber-300'
                  }`}
                >
                  {v.severity}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {v.message}
              </p>

              {/* Fix Recommendation */}
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-1.5">
                <Wrench className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-300">Solución: </strong>
                  {v.fixSuggestion}
                </span>
              </div>

              {/* Action Buttons to Focus Component / Wire */}
              <div className="flex items-center gap-2 pt-1">
                {v.componentIds.map((cId) => (
                  <button
                    key={cId}
                    onClick={() => onSelectComponent(cId)}
                    className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition cursor-pointer"
                  >
                    <Crosshair className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Ver {cId.slice(0, 10)}</span>
                  </button>
                ))}
                {v.wireIds.map((wId) => (
                  <button
                    key={wId}
                    onClick={() => onSelectWire(wId)}
                    className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition cursor-pointer"
                  >
                    <Crosshair className="w-2.5 h-2.5 text-rose-400" />
                    <span>Ver Cable</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
