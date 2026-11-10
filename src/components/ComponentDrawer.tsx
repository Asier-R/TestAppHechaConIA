/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  COMPONENT_CATALOG,
  ComponentTemplate,
} from '../engine/catalog';
import { ComponentType, CustomComponentDef } from '../types/circuit';
import { MiniatureStandardSymbol } from './StandardSymbols';
import {
  Search,
  Plus,
  Layers,
  Sliders,
  Tv,
  Cpu,
  Calculator,
  Bookmark,
  ChevronDown,
  ChevronRight,
  GripVertical,
  X,
} from 'lucide-react';

interface ComponentDrawerProps {
  onSelectComponent: (type: ComponentType, customDef?: CustomComponentDef) => void;
  customComponents: CustomComponentDef[];
  onOpenCustomModal: () => void;
  isReadOnly?: boolean;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ComponentDrawer: React.FC<ComponentDrawerProps> = ({
  onSelectComponent,
  customComponents,
  onOpenCustomModal,
  isReadOnly = false,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    gates: true,
    inputs: true,
    outputs: true,
    sequential: true,
    arithmetic: true,
    custom: true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredCatalog = COMPONENT_CATALOG.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustom = customComponents.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: 'gates', name: 'Puertas Lógicas', icon: Layers },
    { id: 'inputs', name: 'Entradas y Señal', icon: Sliders },
    { id: 'outputs', name: 'Salidas e Indicadores', icon: Tv },
    { id: 'sequential', name: 'Secuencial y Memoria', icon: Cpu },
    { id: 'arithmetic', name: 'Aritmética y MSI', icon: Calculator },
    { id: 'custom', name: 'Chips Personalizados', icon: Bookmark },
  ];

  const handleDragStart = (
    e: React.DragEvent,
    type: ComponentType,
    customDef?: CustomComponentDef
  ) => {
    if (isReadOnly) return;
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type, customDefId: customDef?.id })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!isOpenOnMobile) {
    // Hidden on mobile, visible on desktop
    return (
      <aside
        className="hidden md:flex w-72 bg-slate-900 border-r border-slate-800 text-slate-100 flex-col h-full select-none"
        aria-label="Biblioteca de Componentes"
      >
        {/* Header & Search */}
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Biblioteca de Componentes
            </span>
            <button
              onClick={onOpenCustomModal}
              disabled={isReadOnly}
              aria-label="Crear nuevo componente"
              className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Chip</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar compuerta, LED, multiplexor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {categories.map((cat) => {
            const isCustom = cat.id === 'custom';
            const items = isCustom
              ? filteredCustom
              : filteredCatalog.filter((c) => c.category === cat.id);

            if (items.length === 0 && searchTerm) return null;

            const isOpen = openCategories[cat.id];
            const Icon = cat.icon;

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800/60 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{cat.name}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                      {items.length}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="grid grid-cols-1 gap-1.5 pl-1 pr-1">
                    {/* Standard Components */}
                    {!isCustom &&
                      (items as ComponentTemplate[]).map((template) => (
                        <div
                          key={template.type}
                          draggable={!isReadOnly}
                          onDragStart={(e) => handleDragStart(e, template.type)}
                          onClick={() => {
                            if (!isReadOnly) {
                              onSelectComponent(template.type);
                              onCloseMobile?.();
                            }
                          }}
                          className={`group flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/40 transition cursor-grab active:cursor-grabbing ${
                            isReadOnly ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          title={template.description}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                            <div className="w-7 h-5 flex items-center justify-center bg-slate-900 border border-slate-800 rounded text-slate-300 flex-shrink-0">
                              <MiniatureStandardSymbol
                                type={template.type}
                                width={22}
                                height={15}
                                color="#10b981"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-slate-200 truncate">
                                {template.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {template.description}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            {template.iecSymbol}
                          </span>
                        </div>
                      ))}

                    {/* Custom User ICs */}
                    {isCustom &&
                      filteredCustom.map((chip) => (
                        <div
                          key={chip.id}
                          draggable={!isReadOnly}
                          onDragStart={(e) => handleDragStart(e, 'CUSTOM_IC', chip)}
                          onClick={() => {
                            if (!isReadOnly) {
                              onSelectComponent('CUSTOM_IC', chip);
                              onCloseMobile?.();
                            }
                          }}
                          className={`group flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-800/40 transition cursor-grab active:cursor-grabbing ${
                            isReadOnly ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                            <div
                              className="w-7 h-5 flex items-center justify-center rounded text-white text-[10px] font-bold font-mono"
                              style={{ backgroundColor: chip.color || '#8b5cf6' }}
                            >
                              {chip.abbreviation.slice(0, 3)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-slate-200 truncate">
                                {chip.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {chip.inputs.length} In / {chip.outputs.length} Out
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/60 px-1 py-0.5 rounded">
                            CHIP
                          </span>
                        </div>
                      ))}

                    {isCustom && filteredCustom.length === 0 && (
                      <div className="p-3 text-center border border-dashed border-slate-800 rounded text-[11px] text-slate-500">
                        Sin chips personalizados todavía. Haz clic en "Crear Chip" para definir uno.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  // Open on Mobile as Slide-Over Drawer with Backdrop
  return (
    <div
      className="fixed inset-0 z-50 md:static md:z-auto bg-slate-950/80 backdrop-blur-sm md:bg-transparent flex"
      role="dialog"
      aria-modal="true"
      aria-label="Biblioteca de Componentes"
    >
      <aside
        className="w-80 max-w-[85vw] md:w-72 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-full select-none shadow-2xl animate-in slide-in-from-left duration-200"
        aria-label="Biblioteca de Componentes"
      >
        {/* Header & Search */}
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Componentes
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenCustomModal}
                disabled={isReadOnly}
                aria-label="Crear nuevo componente"
                className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Chip</span>
              </button>
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="md:hidden p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  aria-label="Cerrar panel"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar compuerta, LED, multiplexor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {categories.map((cat) => {
            const isCustom = cat.id === 'custom';
            const items = isCustom
              ? filteredCustom
              : filteredCatalog.filter((c) => c.category === cat.id);

            if (items.length === 0 && searchTerm) return null;

            const isOpen = openCategories[cat.id];
            const Icon = cat.icon;

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800/60 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{cat.name}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                      {items.length}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="grid grid-cols-1 gap-1.5 pl-1 pr-1">
                    {/* Standard Components */}
                    {!isCustom &&
                      (items as ComponentTemplate[]).map((template) => (
                        <div
                          key={template.type}
                          draggable={!isReadOnly}
                          onDragStart={(e) => handleDragStart(e, template.type)}
                          onClick={() => {
                            if (!isReadOnly) {
                              onSelectComponent(template.type);
                              onCloseMobile?.();
                            }
                          }}
                          className={`group flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/40 transition cursor-grab active:cursor-grabbing ${
                            isReadOnly ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          title={template.description}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                            <div className="w-7 h-5 flex items-center justify-center bg-slate-900 border border-slate-800 rounded text-slate-300 flex-shrink-0">
                              <MiniatureStandardSymbol
                                type={template.type}
                                width={22}
                                height={15}
                                color="#10b981"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-slate-200 truncate">
                                {template.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {template.description}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            {template.iecSymbol}
                          </span>
                        </div>
                      ))}

                    {/* Custom User ICs */}
                    {isCustom &&
                      filteredCustom.map((chip) => (
                        <div
                          key={chip.id}
                          draggable={!isReadOnly}
                          onDragStart={(e) => handleDragStart(e, 'CUSTOM_IC', chip)}
                          onClick={() => {
                            if (!isReadOnly) {
                              onSelectComponent('CUSTOM_IC', chip);
                              onCloseMobile?.();
                            }
                          }}
                          className={`group flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-800/40 transition cursor-grab active:cursor-grabbing ${
                            isReadOnly ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                            <div
                              className="w-7 h-5 flex items-center justify-center rounded text-white text-[10px] font-bold font-mono"
                              style={{ backgroundColor: chip.color || '#8b5cf6' }}
                            >
                              {chip.abbreviation.slice(0, 3)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-slate-200 truncate">
                                {chip.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {chip.inputs.length} In / {chip.outputs.length} Out
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/60 px-1 py-0.5 rounded">
                            CHIP
                          </span>
                        </div>
                      ))}

                    {isCustom && filteredCustom.length === 0 && (
                      <div className="p-3 text-center border border-dashed border-slate-800 rounded text-[11px] text-slate-500">
                        Sin chips personalizados todavía. Haz clic en "Crear Chip" para definir uno.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Backdrop overlay on mobile: tap to dismiss */}
      <div className="flex-1 md:hidden" onClick={onCloseMobile} />
    </div>
  );
};
