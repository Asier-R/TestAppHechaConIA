/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PlusCircle,
  Play,
  Pause,
  StepForward,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Menu,
} from 'lucide-react';
import { DrcReport } from '../engine/drc';

interface MobileBottomNavProps {
  onOpenComponentDrawer: () => void;
  isComponentDrawerOpen: boolean;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onStepSimulation: () => void;
  drcReport?: DrcReport;
  onToggleDrcPanel: () => void;
  isDrcPanelOpen: boolean;
  isOscilloscopeOpen: boolean;
  onToggleOscilloscope: () => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenComponentDrawer,
  isComponentDrawerOpen,
  isSimulating,
  onToggleSimulation,
  onStepSimulation,
  drcReport,
  onToggleDrcPanel,
  isDrcPanelOpen,
  isOscilloscopeOpen,
  onToggleOscilloscope,
  onOpenMobileMenu,
  isMobileMenuOpen,
}) => {
  const errorCount = drcReport?.violations.filter((v) => v.severity === 'error').length || 0;
  const warningCount = drcReport?.violations.filter((v) => v.severity === 'warning').length || 0;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden select-none safe-area-pb"
      aria-label="Navegación Móvil Principal"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Componentes (+) */}
        <button
          onClick={onOpenComponentDrawer}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition cursor-pointer active:scale-95 ${
            isComponentDrawerOpen ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Añadir Componentes"
        >
          <div className="relative">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Añadir</span>
        </button>

        {/* 2. Simulación (Play/Pause + Step) */}
        <div className="flex items-center justify-center gap-1 h-full min-h-[44px]">
          <button
            onClick={onToggleSimulation}
            className={`flex flex-col items-center justify-center h-full w-full min-h-[44px] transition cursor-pointer active:scale-95 ${
              isSimulating
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label={isSimulating ? 'Pausar Simulación' : 'Iniciar Simulación'}
          >
            {isSimulating ? (
              <div className="relative">
                <Pause className="w-5 h-5 text-emerald-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            ) : (
              <Play className="w-5 h-5 text-slate-300" />
            )}
            <span className="text-[10px] font-medium tracking-tight mt-1">
              {isSimulating ? 'Pausar' : 'Simular'}
            </span>
          </button>

          <button
            onClick={onStepSimulation}
            className="p-1 text-slate-400 hover:text-slate-200 active:scale-90 transition rounded-lg hover:bg-slate-800"
            title="Avanzar 1 ciclo de reloj"
            aria-label="Avanzar paso"
          >
            <StepForward className="w-4 h-4" />
          </button>
        </div>

        {/* 3. DRC (Validación) */}
        <button
          onClick={onToggleDrcPanel}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition cursor-pointer active:scale-95 relative ${
            isDrcPanelOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Ver reglas DRC"
        >
          <div className="relative">
            {errorCount > 0 ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            {(errorCount > 0 || warningCount > 0) && (
              <span
                className={`absolute -top-1.5 -right-2 text-[9px] font-bold px-1 rounded-full text-white ${
                  errorCount > 0 ? 'bg-rose-600' : 'bg-amber-600'
                }`}
              >
                {errorCount || warningCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">
            {errorCount > 0 ? 'Errores' : 'Reglas'}
          </span>
        </button>

        {/* 4. Osciloscopio */}
        <button
          onClick={onToggleOscilloscope}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition cursor-pointer active:scale-95 ${
            isOscilloscopeOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Osciloscopio"
        >
          <Activity className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Señales</span>
        </button>

        {/* 5. Menú / Más */}
        <button
          onClick={onOpenMobileMenu}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition cursor-pointer active:scale-95 ${
            isMobileMenuOpen ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Menú de herramientas"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Menú</span>
        </button>
      </div>
    </nav>
  );
};
