/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRESET_CIRCUITS } from '../engine/presets';
import {
  X,
  FolderOpen,
  LayoutGrid,
  Download,
  Upload,
  GitBranch,
  Users,
  Github,
  Code2,
  Network,
  Bot,
  Sun,
  Moon,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset: (presetId: string) => void;
  onAutoLayout: () => void;
  onSaveProject: () => void;
  onImportClick: () => void;
  onOpenExportModal: () => void;
  onOpenVersionModal: () => void;
  onOpenCollabModal: () => void;
  onOpenGithubModal: () => void;
  onOpenDslPanel: () => void;
  onOpenUmlModal: () => void;
  onOpenAiAssistant: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetSimulation: () => void;
  simulationSpeed: number;
  onChangeSimulationSpeed: (hz: number) => void;
  activeBranch: string;
  commitsCount: number;
  collaboratorsCount: number;
}

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({
  isOpen,
  onClose,
  onLoadPreset,
  onAutoLayout,
  onSaveProject,
  onImportClick,
  onOpenExportModal,
  onOpenVersionModal,
  onOpenCollabModal,
  onOpenGithubModal,
  onOpenDslPanel,
  onOpenUmlModal,
  onOpenAiAssistant,
  isDarkMode,
  onToggleDarkMode,
  onResetSimulation,
  simulationSpeed,
  onChangeSimulationSpeed,
  activeBranch,
  commitsCount,
  collaboratorsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de Herramientas Móvil"
    >
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250">
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Herramientas y Acciones</h2>
            <p className="text-[11px] text-slate-400">Panel de control de simulación y proyecto</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* 1. Quick Presets Section */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              Circuitos de Ejemplo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_CIRCUITS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onLoadPreset(p.id);
                    onClose();
                  }}
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/60 rounded-xl text-left transition cursor-pointer flex flex-col justify-between gap-1"
                >
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{p.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Simulation Settings */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Frecuencia de Reloj
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 5, 10, 25].map((hz) => (
                <button
                  key={hz}
                  onClick={() => onChangeSimulationSpeed(hz)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    simulationSpeed === hz
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {hz} Hz
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onResetSimulation();
                onClose();
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reiniciar Estados Lógicos</span>
            </button>
          </div>

          {/* 3. Primary Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Auto Organizar */}
            <button
              onClick={() => {
                onAutoLayout();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Auto Organizar</div>
                <div className="text-[10px] text-slate-400">Alinear compuertas</div>
              </div>
            </button>

            {/* Exportar */}
            <button
              onClick={() => {
                onOpenExportModal();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Exportar</div>
                <div className="text-[10px] text-slate-400">PDF, PNG, Alta Res</div>
              </div>
            </button>

            {/* Guardar Proyecto */}
            <button
              onClick={() => {
                onSaveProject();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Guardar Archivo</div>
                <div className="text-[10px] text-slate-400">Descargar JSON</div>
              </div>
            </button>

            {/* Importar Archivo */}
            <button
              onClick={() => {
                onImportClick();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Importar Plano</div>
                <div className="text-[10px] text-slate-400">Subir JSON / HDL</div>
              </div>
            </button>

            {/* Asistente IA */}
            <button
              onClick={() => {
                onOpenAiAssistant();
                onClose();
              }}
              className="p-3 bg-gradient-to-r from-purple-950/70 to-indigo-950/70 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <div className="text-xs font-semibold text-purple-100">Asistente IA</div>
                <div className="text-[10px] text-purple-300">Gemini 3.8 Flash</div>
              </div>
            </button>

            {/* Código Formal DSL */}
            <button
              onClick={() => {
                onOpenDslPanel();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Código DSL</div>
                <div className="text-[10px] text-slate-400">Lenguaje Formal</div>
              </div>
            </button>

            {/* Diagramas UML */}
            <button
              onClick={() => {
                onOpenUmlModal();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Diagramas UML</div>
                <div className="text-[10px] text-slate-400">Arquitectura técnica</div>
              </div>
            </button>

            {/* Control de Versiones */}
            <button
              onClick={() => {
                onOpenVersionModal();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Versiones</div>
                <div className="text-[10px] text-slate-400">{activeBranch} ({commitsCount})</div>
              </div>
            </button>

            {/* Colaboración */}
            <button
              onClick={() => {
                onOpenCollabModal();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Colaboración</div>
                <div className="text-[10px] text-slate-400">{collaboratorsCount} en vivo</div>
              </div>
            </button>

            {/* GitHub */}
            <button
              onClick={() => {
                onOpenGithubModal();
                onClose();
              }}
              className="p-3 bg-slate-800/70 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/50 rounded-2xl flex items-center gap-2.5 transition text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-700/40 border border-slate-600/40 flex items-center justify-center text-slate-200 shrink-0">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">GitHub</div>
                <div className="text-[10px] text-slate-400">Sincronización</div>
              </div>
            </button>
          </div>

          {/* 4. Theme & Preferences */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tema Visual</span>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
