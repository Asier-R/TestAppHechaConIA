/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRESET_CIRCUITS } from '../engine/presets';
import { DrcReport } from '../engine/drc';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  LayoutGrid,
  Download,
  Upload,
  GitBranch,
  Users,
  Github,
  Code2,
  Activity,
  Bot,
  Sun,
  Moon,
  FolderOpen,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Network,
  Menu,
} from 'lucide-react';

interface ToolbarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onStepSimulation: () => void;
  onResetSimulation: () => void;
  simulationSpeed: number; // Hz
  onChangeSimulationSpeed: (hz: number) => void;
  onAutoLayout: () => void;
  onLoadPreset: (presetId: string) => void;
  onSaveProject: () => void;
  onImportClick: () => void;
  onOpenExportModal: () => void;
  onOpenVersionModal: () => void;
  onOpenCollabModal: () => void;
  onOpenGithubModal: () => void;
  onToggleDslPanel: () => void;
  isDslPanelOpen: boolean;
  onToggleOscilloscope: () => void;
  isOscilloscopeOpen: boolean;
  onToggleAiAssistant: () => void;
  isAiAssistantOpen: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeBranch: string;
  commitsCount: number;
  collaboratorsCount: number;
  activeSignalsCount: number;
  hasOscillation?: boolean;
  drcReport?: DrcReport;
  isDrcPanelOpen?: boolean;
  onToggleDrcPanel?: () => void;
  onOpenUmlModal?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  projectName,
  onUpdateProjectName,
  isSimulating,
  onToggleSimulation,
  onStepSimulation,
  onResetSimulation,
  simulationSpeed,
  onChangeSimulationSpeed,
  onAutoLayout,
  onLoadPreset,
  onSaveProject,
  onImportClick,
  onOpenExportModal,
  onOpenVersionModal,
  onOpenCollabModal,
  onOpenGithubModal,
  onToggleDslPanel,
  isDslPanelOpen,
  onToggleOscilloscope,
  isOscilloscopeOpen,
  onToggleAiAssistant,
  isAiAssistantOpen,
  isDarkMode,
  onToggleDarkMode,
  activeBranch,
  commitsCount,
  collaboratorsCount,
  activeSignalsCount,
  hasOscillation = false,
  drcReport,
  isDrcPanelOpen = false,
  onToggleDrcPanel,
  onOpenUmlModal,
  onOpenMobileMenu,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const errorCount = drcReport?.violations.filter((v) => v.severity === 'error').length || 0;
  const warningCount = drcReport?.violations.filter((v) => v.severity === 'warning').length || 0;

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-2.5 sm:px-3 select-none gap-1.5 sm:gap-2 z-30">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-mono font-bold text-xs sm:text-sm">
            LC
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight text-white hidden sm:inline">
            Logi<span className="text-emerald-400">Circ</span>
          </span>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        <input
          type="text"
          value={projectName}
          onChange={(e) => onUpdateProjectName(e.target.value)}
          aria-label="Nombre del proyecto"
          className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-950 border border-transparent focus:border-slate-700 rounded px-1.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none max-w-[105px] sm:max-w-[180px] md:max-w-[220px] truncate"
          title="Haz clic para renombrar el plano"
        />

        {/* Preset Circuits Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowPresetsMenu((prev) => !prev)}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition cursor-pointer"
            aria-label="Ejemplos predefinidos"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ejemplos</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPresetsMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50">
              <div className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Circuitos de Ejemplo
              </div>
              {PRESET_CIRCUITS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onLoadPreset(p.id);
                    setShowPresetsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs transition cursor-pointer flex flex-col gap-0.5"
                >
                  <span className="font-medium text-slate-200">{p.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{p.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Simulation Controls & Auto Layout (Desktop Only) */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 p-1 rounded-xl">
        {/* Play / Pause Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            isSimulating
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-pulse'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title={isSimulating ? 'Pausar Simulación' : 'Iniciar Simulación en Vivo'}
          aria-label={isSimulating ? 'Pausar' : 'Simular'}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isSimulating ? 'Simulando' : 'Simular'}</span>
        </button>

        {/* Step Tick */}
        <button
          onClick={onStepSimulation}
          className="p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
          title="Avanzar un ciclo (Paso a paso)"
          aria-label="Paso a paso"
        >
          <StepForward className="w-3.5 h-3.5" />
        </button>

        {/* Reset State */}
        <button
          onClick={onResetSimulation}
          className="p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
          title="Reiniciar estados lógicos del circuito"
          aria-label="Reiniciar"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Frequency Selector */}
        <select
          value={simulationSpeed}
          onChange={(e) => onChangeSimulationSpeed(Number(e.target.value))}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-1 text-[11px] focus:outline-none"
          title="Frecuencia del reloj de simulación"
          aria-label="Frecuencia de simulación"
        >
          <option value={1}>1 Hz</option>
          <option value={2}>2 Hz</option>
          <option value={5}>5 Hz</option>
          <option value={10}>10 Hz</option>
          <option value={25}>25 Hz (Rápido)</option>
        </select>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Auto Layout Button */}
        <button
          onClick={onAutoLayout}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer"
          title="Posicionamiento y alineación automática de compuertas"
          aria-label="Auto organizar plano"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Auto Organizar</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* DRC Validation Status & Drawer Toggle */}
        <button
          onClick={onToggleDrcPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer border ${
            isDrcPanelOpen
              ? 'ring-2 ring-emerald-500/50'
              : ''
          } ${
            errorCount > 0
              ? 'bg-rose-950/70 text-rose-300 border-rose-600/70 hover:bg-rose-900/80 shadow-md shadow-rose-900/30 animate-pulse'
              : warningCount > 0
              ? 'bg-amber-950/70 text-amber-300 border-amber-600/70 hover:bg-amber-900/80'
              : 'bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-slate-700'
          }`}
          title={
            errorCount > 0
              ? `DRC: ${errorCount} conflicto(s) detectado(s). Haz clic para inspeccionar.`
              : warningCount > 0
              ? `DRC: ${warningCount} advertencia(s). Haz clic para inspeccionar.`
              : 'DRC: Reglas de diseño eléctricas válidas'
          }
          aria-label="Validación DRC"
        >
          {errorCount > 0 ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          ) : warningCount > 0 ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="font-semibold">
            {errorCount > 0 ? `${errorCount} DRC` : warningCount > 0 ? `${warningCount} DRC` : 'DRC'}
          </span>
        </button>
      </div>

      {/* Right Side: File, Export, Features & AI (Desktop Only) */}
      <div className="hidden md:flex items-center gap-1.5">
        {/* Save & Import */}
        <button
          onClick={onSaveProject}
          className="p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
          title="Guardar plano (Local / Proyecto)"
          aria-label="Guardar"
        >
          <Download className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          onClick={onImportClick}
          className="p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
          title="Importar plano (JSON / HDL)"
          aria-label="Importar"
        >
          <Upload className="w-4 h-4 text-slate-300" />
        </button>

        {/* Export High-Res Modal */}
        <button
          onClick={onOpenExportModal}
          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer"
          aria-label="Exportar PDF e Imagen"
        >
          Exportar
        </button>

        <div className="h-5 w-px bg-slate-800 mx-0.5 hidden lg:block" />

        {/* Version Control */}
        <button
          onClick={onOpenVersionModal}
          className="flex items-center gap-1 p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition"
          title={`Control de Versiones: Rama ${activeBranch} (${commitsCount} commits)`}
          aria-label="Control de Versiones"
        >
          <GitBranch className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300 hidden xl:inline">
            {activeBranch} ({commitsCount})
          </span>
        </button>

        {/* Real-Time Collaboration */}
        <button
          onClick={onOpenCollabModal}
          className="flex items-center gap-1 p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition"
          title={`Colaboración en tiempo real: ${collaboratorsCount} conectados`}
          aria-label="Colaboración"
        >
          <Users className="w-4 h-4 text-blue-400" />
          {collaboratorsCount > 1 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        {/* GitHub Integration */}
        <button
          onClick={onOpenGithubModal}
          className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition"
          title="Sincronización con GitHub"
          aria-label="GitHub"
        >
          <Github className="w-4 h-4 text-slate-200" />
        </button>

        {/* Logic Analyzer / Oscilloscope */}
        <button
          onClick={onToggleOscilloscope}
          className={`p-1.5 rounded-lg transition ${
            isOscilloscopeOpen
              ? 'bg-cyan-600 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Osciloscopio / Analizador Lógico"
          aria-label="Osciloscopio"
        >
          <Activity className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Bidirectional Formal DSL Code Panel */}
        <button
          onClick={onToggleDslPanel}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
            isDslPanelOpen
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title="Editor de Lenguaje Formal (HDL / DSL)"
          aria-label="Código DSL"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Código DSL</span>
        </button>

        {/* UML Architecture Diagrams Modal */}
        <button
          onClick={onOpenUmlModal}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-800/40 transition cursor-pointer"
          title="Ver Diagramas UML de Arquitectura (Clases, ER, Secuencia, Interacción, Casos de Uso, Dominio)"
          aria-label="Diagramas UML"
        >
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">UML</span>
        </button>

        {/* AI Assistant Drawer */}
        <button
          onClick={onToggleAiAssistant}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            isAiAssistantOpen
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-700/60'
          }`}
          title="Asistente de Circuitos con Inteligencia Artificial"
          aria-label="Asistente IA"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Asistente IA</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition"
          title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          aria-label="Cambiar tema"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Mobile Top Bar Controls */}
      <div className="flex md:hidden items-center gap-1.5 shrink-0">
        {/* DRC Quick Badge on Mobile */}
        <button
          onClick={onToggleDrcPanel}
          className={`px-2 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
            errorCount > 0
              ? 'bg-rose-950/80 text-rose-300 border-rose-600 shadow-sm shadow-rose-900/40 animate-pulse'
              : warningCount > 0
              ? 'bg-amber-950/80 text-amber-300 border-amber-600'
              : 'bg-slate-800 text-emerald-400 border-slate-700'
          }`}
          aria-label="DRC"
          title="Reglas DRC"
        >
          {errorCount > 0 ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          ) : warningCount > 0 ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="text-[11px] font-mono">
            {errorCount > 0 ? `${errorCount}` : warningCount > 0 ? `${warningCount}` : 'OK'}
          </span>
        </button>

        {/* Quick Auto Layout button on mobile */}
        <button
          onClick={onAutoLayout}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-cyan-400 rounded-lg transition"
          title="Auto Organizar Plano"
          aria-label="Auto Organizar"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Mobile Menu Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded-lg transition"
            title="Menú y Herramientas"
            aria-label="Abrir menú móvil"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
