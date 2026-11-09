/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { parseCircuitDSL, serializeCircuitToDSL } from '../engine/dsl';
import { Schematic } from '../types/circuit';
import {
  Code2,
  Play,
  Copy,
  Check,
  Download,
  AlertTriangle,
  X,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface DslPanelProps {
  isOpen: boolean;
  onClose: () => void;
  schematic: Schematic;
  onApplyDsl: (updatedSchematic: Partial<Schematic>) => void;
  isReadOnly?: boolean;
}

export const DslPanel: React.FC<DslPanelProps> = ({
  isOpen,
  onClose,
  schematic,
  onApplyDsl,
  isReadOnly = false,
}) => {
  const [dslCode, setDslCode] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync from visual schematic to DSL when panel opens or schematic changes
  useEffect(() => {
    if (isOpen) {
      const generated = serializeCircuitToDSL(schematic);
      setDslCode(generated);
      setParseErrors([]);
    }
  }, [isOpen, schematic]);

  if (!isOpen) return null;

  const handleApplyToCanvas = () => {
    setParseErrors([]);
    setSuccessMessage(null);

    const result = parseCircuitDSL(dslCode);
    if (result.errors.length > 0) {
      setParseErrors(result.errors);
      return;
    }

    if (result.schematic) {
      onApplyDsl(result.schematic);
      setSuccessMessage('¡Plano actualizado exitosamente a partir del código formal!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dslCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([dslCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(schematic.name || 'circuito').replace(/\s+/g, '_')}.hdl`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="w-96 md:w-[480px] bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full z-20 shadow-2xl animate-in slide-in-from-right duration-200"
      aria-label="Editor de Lenguaje Formal"
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Lenguaje Formal de Descripción (HDL / DSL)
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          aria-label="Cerrar panel DSL"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleApplyToCanvas}
            disabled={isReadOnly}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-md shadow-indigo-600/20"
            title="Parsear y generar plano visual automáticamente"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Aplicar al Plano</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition cursor-pointer"
            title="Copiar código al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer"
            title="Descargar archivo .hdl"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-2 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Parse Errors Banner */}
      {parseErrors.length > 0 && (
        <div className="p-2.5 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Errores de sintaxis en el archivo formal:</span>
          </div>
          <ul className="list-disc pl-5 text-[11px] space-y-0.5">
            {parseErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Monospace Code Editor */}
      <div className="flex-1 p-2 relative flex flex-col min-h-0">
        <textarea
          value={dslCode}
          onChange={(e) => setDslCode(e.target.value)}
          disabled={isReadOnly}
          className="flex-1 w-full bg-slate-950 text-slate-200 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none custom-scrollbar"
          placeholder="CIRCUIT &quot;Mi Circuito&quot; { ... }"
          spellCheck={false}
          aria-label="Código formal del circuito"
        />
      </div>

      {/* Syntax Guide Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300 flex items-center gap-1">
          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
          <span>Estructura Formal Bidireccional</span>
        </div>
        <p className="text-[10px] text-slate-500">
          Cualquier cambio realizado visualmente actualiza este código en tiempo real. Modificar el código y hacer clic en <strong>"Aplicar al Plano"</strong> regenera el plano visual inmediatamente.
        </p>
      </div>
    </div>
  );
};
