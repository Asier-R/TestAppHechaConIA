/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  CircuitComponent,
  CircuitWire,
  CollaboratorUser,
  ComponentType,
  CustomComponentDef,
  LogicValue,
} from '../types/circuit';
import { getPinCanvasCoordinates } from '../engine/catalog';
import { MiniatureStandardSymbol } from './StandardSymbols';
import {
  Trash2,
  Copy,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MousePointer,
  Crosshair,
} from 'lucide-react';

interface SchematicCanvasProps {
  components: CircuitComponent[];
  wires: CircuitWire[];
  selectedComponentIds: string[];
  selectedWireId: string | null;
  onSelectComponent: (id: string, multiSelect?: boolean) => void;
  onSelectWire: (wireId: string | null) => void;
  onMoveComponents: (moves: Array<{ id: string; x: number; y: number }>) => void;
  onAddWire: (fromComp: string, fromPin: string, toComp: string, toPin: string) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onRotateSelected: () => void;
  onToggleComponentState: (componentId: string, updates: Record<string, any>) => void;
  onDropNewComponent: (type: ComponentType, x: number, y: number, customDefId?: string) => void;
  customComponents: CustomComponentDef[];
  collaborators: CollaboratorUser[];
  onCursorMove?: (x: number, y: number) => void;
  isDarkMode?: boolean;
  isReadOnly?: boolean;
  drcReport?: {
    conflictingWireIds: Set<string>;
    conflictingComponentIds: Set<string>;
    floatingPinKeys: Set<string>;
  };
}

export const SchematicCanvas: React.FC<SchematicCanvasProps> = ({
  components,
  wires,
  selectedComponentIds,
  selectedWireId,
  onSelectComponent,
  onSelectWire,
  onMoveComponents,
  onAddWire,
  onDeleteSelected,
  onDuplicateSelected,
  onRotateSelected,
  onToggleComponentState,
  onDropNewComponent,
  customComponents,
  collaborators,
  onCursorMove,
  isDarkMode = true,
  isReadOnly = false,
  drcReport,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport Pan and Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging components
  const [isDraggingComponents, setIsDraggingComponents] = useState(false);
  const [dragStartMouse, setDragStartMouse] = useState({ x: 0, y: 0 });
  const [dragInitialPositions, setDragInitialPositions] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );

  // Interactive Wiring State
  const [wiringStart, setWiringStart] = useState<{
    componentId: string;
    pinId: string;
    x: number;
    y: number;
  } | null>(null);
  const [wiringCurrentPos, setWiringCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{
    componentId: string;
    pinId: string;
    type: 'input' | 'output';
  } | null>(null);

  // Box selection marquee
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Helper: Convert screen client coords to canvas circuit coords
  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  // Handle Zoom with Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(0.2, zoom * zoomFactor), 3.0);

    // Zoom toward mouse pointer
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

      setPan({ x: newPanX, y: newPanY });
      setZoom(newZoom);
    }
  };

  // Fit all elements on screen
  const handleFitToScreen = () => {
    if (components.length === 0 || !containerRef.current) {
      setPan({ x: 50, y: 50 });
      setZoom(1);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const c of components) {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.x + c.width > maxX) maxX = c.x + c.width;
      if (c.y + c.height > maxY) maxY = c.y + c.height;
    }

    const padding = 100;
    const circuitW = maxX - minX + padding * 2;
    const circuitH = maxY - minY + padding * 2;

    const scaleX = rect.width / circuitW;
    const scaleY = rect.height / circuitH;
    const newZoom = Math.min(Math.max(0.4, Math.min(scaleX, scaleY)), 1.5);

    const newPanX = (rect.width - (maxX - minX) * newZoom) / 2 - minX * newZoom;
    const newPanY = (rect.height - (maxY - minY) * newZoom) / 2 - minY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Mouse Down on Background (Start panning or marquee selection)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== 'svg') {
      return;
    }

    if (e.button === 1 || e.altKey || e.button === 0) {
      // If clicking directly on empty canvas background
      if (e.shiftKey) {
        // Start marquee selection
        const pos = screenToCanvas(e.clientX, e.clientY);
        setSelectionBox({
          startX: pos.x,
          startY: pos.y,
          currentX: pos.x,
          currentY: pos.y,
        });
      } else {
        // Start Canvas Pan
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        onSelectComponent('', false);
        onSelectWire(null);
      }
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    onCursorMove?.(canvasPos.x, canvasPos.y);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (selectionBox) {
      setSelectionBox((prev) => (prev ? { ...prev, currentX: canvasPos.x, currentY: canvasPos.y } : null));
      return;
    }

    if (wiringStart) {
      setWiringCurrentPos(canvasPos);
      return;
    }

    if (isDraggingComponents && !isReadOnly) {
      const dx = (e.clientX - dragStartMouse.x) / zoom;
      const dy = (e.clientY - dragStartMouse.y) / zoom;

      const moves: Array<{ id: string; x: number; y: number }> = [];
      const grid = 20;

      for (const [id, initial] of dragInitialPositions.entries()) {
        const rawX = initial.x + dx;
        const rawY = initial.y + dy;
        const snappedX = Math.round(rawX / grid) * grid;
        const snappedY = Math.round(rawY / grid) * grid;
        moves.push({ id, x: snappedX, y: snappedY });
      }

      onMoveComponents(moves);
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (selectionBox) {
      const x1 = Math.min(selectionBox.startX, selectionBox.currentX);
      const x2 = Math.max(selectionBox.startX, selectionBox.currentX);
      const y1 = Math.min(selectionBox.startY, selectionBox.currentY);
      const y2 = Math.max(selectionBox.startY, selectionBox.currentY);

      // Select all components inside marquee box
      for (const c of components) {
        if (c.x >= x1 && c.x + c.width <= x2 && c.y >= y1 && c.y + c.height <= y2) {
          onSelectComponent(c.id, true);
        }
      }
      setSelectionBox(null);
    }

    if (isDraggingComponents) {
      setIsDraggingComponents(false);
    }

    if (wiringStart) {
      // Cancel wiring if dropped on empty canvas
      setWiringStart(null);
      setWiringCurrentPos(null);
    }
  };

  // Pin Click or Drag for Wiring
  const handlePinMouseDown = (
    e: React.MouseEvent,
    componentId: string,
    pinId: string,
    isInput: boolean
  ) => {
    e.stopPropagation();
    if (isReadOnly) return;

    const comp = components.find((c) => c.id === componentId);
    if (!comp) return;

    if (!isInput) {
      // Output pin: start wiring
      const coords = getPinCanvasCoordinates(comp, pinId);
      setWiringStart({
        componentId,
        pinId,
        x: coords.x,
        y: coords.y,
      });
      setWiringCurrentPos(coords);
    } else if (wiringStart) {
      // If we already started wiring and clicked an input pin: complete wire!
      if (wiringStart.componentId !== componentId) {
        onAddWire(wiringStart.componentId, wiringStart.pinId, componentId, pinId);
      }
      setWiringStart(null);
      setWiringCurrentPos(null);
    }
  };

  const handlePinMouseUp = (
    e: React.MouseEvent,
    componentId: string,
    pinId: string,
    isInput: boolean
  ) => {
    e.stopPropagation();
    if (wiringStart && isInput && !isReadOnly) {
      if (wiringStart.componentId !== componentId) {
        onAddWire(wiringStart.componentId, wiringStart.pinId, componentId, pinId);
      }
      setWiringStart(null);
      setWiringCurrentPos(null);
    }
  };

  // Component Drag Start
  const handleComponentMouseDown = (e: React.MouseEvent, compId: string) => {
    e.stopPropagation();
    const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;

    if (!selectedComponentIds.includes(compId)) {
      onSelectComponent(compId, isMulti);
    }

    if (isReadOnly) return;

    setIsDraggingComponents(true);
    setDragStartMouse({ x: e.clientX, y: e.clientY });

    const initials = new Map<string, { x: number; y: number }>();
    const targets = selectedComponentIds.includes(compId)
      ? selectedComponentIds
      : [compId];

    for (const id of targets) {
      const comp = components.find((c) => c.id === id);
      if (comp) {
        initials.set(id, { x: comp.x, y: comp.y });
      }
    }
    setDragInitialPositions(initials);
  };

  // Drag & Drop new components from sidebar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      if (data.type) {
        const pos = screenToCanvas(e.clientX, e.clientY);
        const snappedX = Math.round(pos.x / 20) * 20;
        const snappedY = Math.round(pos.y / 20) * 20;
        onDropNewComponent(data.type, snappedX, snappedY, data.customDefId);
      }
    } catch (err) {
      console.error('Error al soltar componente:', err);
    }
  };

  // Wire Manhattan / Bezier Path Generator
  const generateWirePath = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): string => {
    const midX = fromX + Math.max(30, (toX - fromX) / 2);
    // Orthogonal right-angle corners with slight fillet
    if (toX >= fromX + 40) {
      return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
    }
    // Backward loop routing
    const offset = 40;
    return `M ${fromX} ${fromY} C ${fromX + offset} ${fromY}, ${fromX + offset} ${
      fromY < toY ? fromY + offset : fromY - offset
    }, ${midX} ${(fromY + toY) / 2} C ${toX - offset} ${
      fromY < toY ? toY - offset : toY + offset
    }, ${toX - offset} ${toY}, ${toX} ${toY}`;
  };

  // Keyboard Shortcuts (Delete, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteSelected();
      } else if (e.key === 'Escape') {
        setWiringStart(null);
        setWiringCurrentPos(null);
        onSelectComponent('', false);
        onSelectWire(null);
      } else if (e.key === 'r' || e.key === 'R') {
        onRotateSelected();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        onDuplicateSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDeleteSelected, onDuplicateSelected, onRotateSelected, onSelectComponent, onSelectWire]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex-1 h-full overflow-hidden select-none outline-none ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
      style={{ cursor: isPanning ? 'grabbing' : wiringStart ? 'crosshair' : 'default' }}
      tabIndex={0}
      data-testid="circuit-canvas"
    >
      {/* Read-Only Banner */}
      {isReadOnly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500/90 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur">
          <span>Modo Solo Lectura (Visor) - Las modificaciones están bloqueadas</span>
        </div>
      )}

      {/* Canvas Controls HUD */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-800 p-1 rounded-lg shadow-xl text-slate-200">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 3))}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
          title="Acercar (Zoom In)"
          aria-label="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono px-1 min-w-[42px] text-center text-slate-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
          title="Alejar (Zoom Out)"
          aria-label="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-800 mx-0.5" />
        <button
          onClick={handleFitToScreen}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
          title="Ajustar circuito a la pantalla"
          aria-label="Ajustar pantalla"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Selected Components Actions Bar */}
      {selectedComponentIds.length > 0 && !isReadOnly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur animate-in fade-in slide-in-from-top-2">
          <span className="text-xs text-slate-400 font-medium">
            {selectedComponentIds.length}{' '}
            {selectedComponentIds.length === 1 ? 'componente' : 'componentes'}
          </span>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button
            onClick={onRotateSelected}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition cursor-pointer"
            title="Rotar componente 90 grados (R)"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Rotar</span>
          </button>
          <button
            onClick={onDuplicateSelected}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition cursor-pointer"
            title="Duplicar seleccionado (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duplicar</span>
          </button>
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 rounded font-medium transition cursor-pointer"
            title="Eliminar seleccionado (Supr / Delete)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Eliminar</span>
          </button>
        </div>
      )}

      {/* Main SVG Infinite Schematic Canvas */}
      <svg
        className="w-full h-full block"
        style={{
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Engineering Dot Grid Pattern */}
          <pattern
            id="circuit-grid"
            width={20 * zoom}
            height={20 * zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % (20 * zoom)}, ${pan.y % (20 * zoom)})`}
          >
            <circle
              cx={1}
              cy={1}
              r={1}
              fill={isDarkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(100, 116, 139, 0.3)'}
            />
          </pattern>

          {/* Glowing Filter for High Logic Level (1) */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* DRC Contention Red Glow Filter */}
          <filter id="drc-error-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />

        {/* Transform Group for Pan & Zoom */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Circuit Wires Layer */}
          {wires.map((wire) => {
            const fromComp = components.find((c) => c.id === wire.fromComponentId);
            const toComp = components.find((c) => c.id === wire.toComponentId);
            if (!fromComp || !toComp) return null;

            const fromCoords = getPinCanvasCoordinates(fromComp, wire.fromPinId);
            const toCoords = getPinCanvasCoordinates(toComp, wire.toPinId);

            const isDrcConflict = drcReport?.conflictingWireIds?.has(wire.id);
            const isSelected = selectedWireId === wire.id;
            const isHigh = wire.state === 1;
            const isLow = wire.state === 0;

            const strokeColor = isDrcConflict
              ? '#ef4444' // Red alert when electrical contention / short circuit!
              : isSelected
              ? '#38bdf8' // bright cyan when selected
              : isHigh
              ? '#10b981' // emerald neon when High (1)
              : isLow
              ? isDarkMode
                ? '#334155'
                : '#94a3b8' // dark slate when Low (0)
              : '#f59e0b'; // amber warning if undefined/floating

            const pathData = generateWirePath(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);

            return (
              <g
                key={wire.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWire(wire.id);
                }}
                className="cursor-pointer group"
              >
                {/* Invisible Wider Hit Area for Easy Clicking */}
                <path d={pathData} stroke="transparent" strokeWidth="12" fill="none" />

                {/* Visible Schematic Wire */}
                <path
                  d={pathData}
                  stroke={strokeColor}
                  strokeWidth={isDrcConflict ? 3.5 : isSelected ? 3.5 : isHigh ? 2.5 : 2}
                  strokeLinecap="round"
                  fill="none"
                  filter={isDrcConflict ? 'url(#drc-error-glow)' : isHigh ? 'url(#neon-glow)' : undefined}
                />

                {/* Animated pulse dots along active wires or warning stripes on DRC conflict */}
                {isDrcConflict ? (
                  <path
                    d={pathData}
                    stroke="#fee2e2"
                    strokeWidth="3.5"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-pulse"
                  />
                ) : isHigh ? (
                  <path
                    d={pathData}
                    stroke="#ecfdf5"
                    strokeWidth="2.5"
                    strokeDasharray="4 16"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-pulse"
                  />
                ) : null}

                {/* Source and Destination Terminal Dots */}
                <circle cx={fromCoords.x} cy={fromCoords.y} r={isDrcConflict ? 4.5 : 3} fill={strokeColor} />
                <circle cx={toCoords.x} cy={toCoords.y} r={isDrcConflict ? 4.5 : 3} fill={strokeColor} />
              </g>
            );
          })}

          {/* 2. Interactive In-Progress Wire */}
          {wiringStart && wiringCurrentPos && (
            <path
              d={generateWirePath(
                wiringStart.x,
                wiringStart.y,
                wiringCurrentPos.x,
                wiringCurrentPos.y
              )}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* 3. Circuit Components Layer */}
          {components.map((comp) => {
            const isSelected = selectedComponentIds.includes(comp.id);
            const isDrcError = drcReport?.conflictingComponentIds?.has(comp.id);
            const customDef = comp.state.customIcId
              ? customComponents.find((c) => c.id === comp.state.customIcId)
              : undefined;

            return (
              <g
                key={comp.id}
                transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0}, ${
                  comp.width / 2
                }, ${comp.height / 2})`}
                onMouseDown={(e) => handleComponentMouseDown(e, comp.id)}
                className="cursor-move group"
              >
                {/* Component Body Box */}
                <rect
                  width={comp.width}
                  height={comp.height}
                  rx="6"
                  ry="6"
                  fill={
                    customDef
                      ? isDarkMode
                        ? '#1e1b4b'
                        : '#e0e7ff'
                      : isDarkMode
                      ? '#0f172a'
                      : '#ffffff'
                  }
                  stroke={
                    isDrcError
                      ? '#ef4444' // Red alert border on electrical conflict!
                      : isSelected
                      ? '#38bdf8'
                      : customDef
                      ? customDef.color || '#8b5cf6'
                      : isDarkMode
                      ? '#334155'
                      : '#cbd5e1'
                  }
                  strokeWidth={isDrcError || isSelected ? '2.5' : '1.5'}
                  filter={isDrcError ? 'url(#drc-error-glow)' : undefined}
                  className="transition-colors drop-shadow-md"
                />

                {/* DRC Hazard Warning Icon */}
                {isDrcError && (
                  <g transform={`translate(${comp.width - 17}, 3)`}>
                    <circle cx="6" cy="6" r="6" fill="#ef4444" />
                    <text
                      x="6"
                      y="9.5"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontFamily="Inter, sans-serif"
                    >
                      !
                    </text>
                  </g>
                )}

                {/* Miniature Standard Symbol & Category Badge (Top Left) */}
                <g transform="translate(6, 4)">
                  <MiniatureStandardSymbol
                    type={comp.type}
                    width={20}
                    height={14}
                    color={
                      isSelected
                        ? '#38bdf8'
                        : isDarkMode
                        ? '#94a3b8'
                        : '#475569'
                    }
                  />
                </g>

                {/* Component Label Text (Cleanly spaced) */}
                <text
                  x={comp.width > 90 ? 30 : comp.width / 2}
                  y="14"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  textAnchor={comp.width > 90 ? 'start' : 'middle'}
                  fill={isDarkMode ? '#e2e8f0' : '#1e293b'}
                  className="pointer-events-none uppercase tracking-wider"
                >
                  {comp.label}
                </text>

                {/* Interactive In-Component UI (Switches, LEDs, Hex Display) */}
                <g transform={`translate(${comp.width / 2}, ${comp.height / 2 + 5})`}>
                  {/* SWITCH */}
                  {comp.type === 'SWITCH' && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) {
                          onToggleComponentState(comp.id, { isOn: !comp.state.isOn });
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x="-18"
                        y="-10"
                        width="36"
                        height="20"
                        rx="10"
                        fill={comp.state.isOn ? '#10b981' : '#334155'}
                        className="transition-colors"
                      />
                      <circle
                        cx={comp.state.isOn ? 8 : -8}
                        cy="0"
                        r="7"
                        fill="#ffffff"
                        className="transition-all drop-shadow"
                      />
                    </g>
                  )}

                  {/* BUTTON */}
                  {comp.type === 'BUTTON' && (
                    <g
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) onToggleComponentState(comp.id, { isPressed: true });
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) onToggleComponentState(comp.id, { isPressed: false });
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="14"
                        fill={comp.state.isPressed ? '#ef4444' : '#64748b'}
                        stroke="#334155"
                        strokeWidth="2"
                        className="transition-colors"
                      />
                      <circle cx="0" cy="0" r="8" fill="#ffffff" opacity="0.8" />
                    </g>
                  )}

                  {/* LED */}
                  {comp.type === 'LED' && (
                    <g
                      onClick={(e) => {
                        e.stopPropagation();
                        // Cycle LED color on click
                        const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];
                        const curIdx = colors.indexOf(comp.state.color || '#10b981');
                        const nextColor = colors[(curIdx + 1) % colors.length];
                        onToggleComponentState(comp.id, { color: nextColor });
                      }}
                      className="cursor-pointer"
                    >
                      {comp.state.isOn && (
                        <circle
                          cx="0"
                          cy="0"
                          r="16"
                          fill={comp.state.color || '#10b981'}
                          opacity="0.3"
                          filter="url(#neon-glow)"
                        />
                      )}
                      <circle
                        cx="0"
                        cy="0"
                        r="11"
                        fill={comp.state.isOn ? comp.state.color || '#10b981' : '#334155'}
                        stroke="#1e293b"
                        strokeWidth="2"
                      />
                      <circle cx="-3" cy="-3" r="3" fill="#ffffff" opacity={comp.state.isOn ? 0.7 : 0.2} />
                    </g>
                  )}

                  {/* DISPLAY_HEX */}
                  {comp.type === 'DISPLAY_HEX' && (
                    <g>
                      <rect x="-16" y="-14" width="32" height="28" rx="4" fill="#020617" stroke="#1e293b" />
                      <text
                        x="0"
                        y="6"
                        fontSize="18"
                        fontWeight="bold"
                        fontFamily="Fira Code, monospace"
                        textAnchor="middle"
                        fill="#10b981"
                        filter="url(#neon-glow)"
                      >
                        {(comp.state.storedValue ?? 0).toString(16).toUpperCase()}
                      </text>
                    </g>
                  )}

                  {/* PROBE */}
                  {comp.type === 'PROBE' && (
                    <g>
                      <rect
                        x="-14"
                        y="-9"
                        width="28"
                        height="18"
                        rx="3"
                        fill={
                          comp.state.probeValue === 1
                            ? '#064e3b'
                            : comp.state.probeValue === 0
                            ? '#1e293b'
                            : '#78350f'
                        }
                        stroke="#334155"
                      />
                      <text
                        x="0"
                        y="4"
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="Fira Code, monospace"
                        textAnchor="middle"
                        fill={
                          comp.state.probeValue === 1
                            ? '#34d399'
                            : comp.state.probeValue === 0
                            ? '#94a3b8'
                            : '#f59e0b'
                        }
                      >
                        {comp.state.probeValue === null ? '?' : comp.state.probeValue}
                      </text>
                    </g>
                  )}

                  {/* CLOCK */}
                  {comp.type === 'CLOCK' && (
                    <g>
                      <text
                        x="0"
                        y="5"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill="#94a3b8"
                      >
                        {comp.state.frequencyHz || 1}Hz
                      </text>
                    </g>
                  )}
                </g>

                {/* Input Pins (Left Side) */}
                {comp.inputs.map((pin) => {
                  const relY = pin.relativeY !== undefined ? pin.relativeY * comp.height : comp.height / 2;
                  const isHigh = pin.state === 1;
                  const isFloating = drcReport?.floatingPinKeys?.has(`${comp.id}:${pin.id}`);
                  const pinColor = isFloating
                    ? '#f59e0b' // amber warning if floating
                    : isHigh
                    ? '#10b981'
                    : isDarkMode
                    ? '#64748b'
                    : '#94a3b8';

                  return (
                    <g
                      key={pin.id}
                      transform={`translate(0, ${relY})`}
                      onMouseDown={(e) => handlePinMouseDown(e, comp.id, pin.id, true)}
                      onMouseUp={(e) => handlePinMouseUp(e, comp.id, pin.id, true)}
                      onMouseEnter={() =>
                        setHoveredPin({ componentId: comp.id, pinId: pin.id, type: 'input' })
                      }
                      onMouseLeave={() => setHoveredPin(null)}
                      className="cursor-crosshair"
                    >
                      {/* Warning ring for floating disconnected inputs */}
                      {isFloating && (
                        <circle
                          cx="0"
                          cy="0"
                          r="7.5"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                      )}
                      {/* Connection Terminal Circle */}
                      <circle
                        cx="0"
                        cy="0"
                        r="4.5"
                        fill={pinColor}
                        stroke={isDarkMode ? '#0f172a' : '#ffffff'}
                        strokeWidth="1.5"
                        className="transition-transform hover:scale-125"
                      />
                      {/* Pin Label inside Component */}
                      <text
                        x="7"
                        y="3.5"
                        fontSize="8.5"
                        fontWeight="500"
                        fontFamily="monospace"
                        fill={isDarkMode ? '#94a3b8' : '#64748b'}
                        className="pointer-events-none"
                      >
                        {pin.name}
                      </text>
                    </g>
                  );
                })}

                {/* Output Pins (Right Side) */}
                {comp.outputs.map((pin) => {
                  const relY = pin.relativeY !== undefined ? pin.relativeY * comp.height : comp.height / 2;
                  const isHigh = pin.state === 1;
                  const pinColor = isHigh ? '#10b981' : isDarkMode ? '#64748b' : '#94a3b8';

                  return (
                    <g
                      key={pin.id}
                      transform={`translate(${comp.width}, ${relY})`}
                      onMouseDown={(e) => handlePinMouseDown(e, comp.id, pin.id, false)}
                      onMouseUp={(e) => handlePinMouseUp(e, comp.id, pin.id, false)}
                      onMouseEnter={() =>
                        setHoveredPin({ componentId: comp.id, pinId: pin.id, type: 'output' })
                      }
                      onMouseLeave={() => setHoveredPin(null)}
                      className="cursor-crosshair"
                    >
                      {/* Connection Terminal Circle */}
                      <circle
                        cx="0"
                        cy="0"
                        r="4.5"
                        fill={pinColor}
                        stroke={isDarkMode ? '#0f172a' : '#ffffff'}
                        strokeWidth="1.5"
                        className="transition-transform hover:scale-125"
                      />
                      {/* Pin Label inside Component */}
                      <text
                        x="-7"
                        y="3.5"
                        fontSize="8.5"
                        fontWeight="500"
                        fontFamily="monospace"
                        textAnchor="end"
                        fill={isDarkMode ? '#94a3b8' : '#64748b'}
                        className="pointer-events-none"
                      >
                        {pin.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* 4. Multi-user Collaborators Live Cursors */}
          {collaborators.map((user) => {
            if (!user.cursor) return null;
            return (
              <g
                key={user.id}
                transform={`translate(${user.cursor.x}, ${user.cursor.y})`}
                className="pointer-events-none transition-all duration-75"
              >
                <MousePointer className="w-4 h-4" fill={user.color} stroke="#0f172a" />
                <rect
                  x="14"
                  y="4"
                  width={user.name.length * 7 + 12}
                  height="18"
                  rx="4"
                  fill={user.color}
                />
                <text
                  x="20"
                  y="16"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="Inter, sans-serif"
                >
                  {user.name}
                </text>
              </g>
            );
          })}

          {/* 5. Marquee Selection Box */}
          {selectionBox && (
            <rect
              x={Math.min(selectionBox.startX, selectionBox.currentX)}
              y={Math.min(selectionBox.startY, selectionBox.currentY)}
              width={Math.abs(selectionBox.currentX - selectionBox.startX)}
              height={Math.abs(selectionBox.currentY - selectionBox.startY)}
              fill="rgba(56, 189, 248, 0.15)"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          )}
        </g>
      </svg>
    </div>
  );
};
