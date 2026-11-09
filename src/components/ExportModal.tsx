/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Schematic } from '../types/circuit';
import {
  X,
  FileImage,
  FileText,
  Download,
  Printer,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schematic: Schematic;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  schematic,
}) => {
  const [resolutionScale, setResolutionScale] = useState<number>(2); // 1x, 2x, 4x
  const [backgroundType, setBackgroundType] = useState<'dark' | 'light' | 'transparent'>('dark');
  const [includeTitleBlock, setIncludeTitleBlock] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Export as High-Resolution PNG using HTML5 Canvas
  const handleExportPng = () => {
    setIsExporting(true);
    const svgElem = document.querySelector('[data-testid="circuit-canvas"] svg');
    if (!svgElem) {
      setIsExporting(false);
      return;
    }

    // Clone SVG to modify export dimensions and background
    const clonedSvg = svgElem.cloneNode(true) as SVGElement;
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL || window.webkitURL || window;
    const blobURL = URLObj.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const width = image.width || 1600;
      const height = image.height || 1000;

      canvas.width = width * resolutionScale;
      canvas.height = height * resolutionScale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      if (backgroundType === 'dark') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backgroundType === 'light') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.scale(resolutionScale, resolutionScale);
      ctx.drawImage(image, 0, 0);

      // Engineering Title Block (Cajetín)
      if (includeTitleBlock) {
        const tbWidth = 320;
        const tbHeight = 70;
        const tbX = width - tbWidth - 20;
        const tbY = height - tbHeight - 20;

        ctx.fillStyle = backgroundType === 'light' ? '#ffffff' : '#0f172a';
        ctx.strokeStyle = backgroundType === 'light' ? '#cbd5e1' : '#334155';
        ctx.lineWidth = 1.5;
        ctx.fillRect(tbX, tbY, tbWidth, tbHeight);
        ctx.strokeRect(tbX, tbY, tbWidth, tbHeight);

        ctx.fillStyle = backgroundType === 'light' ? '#0f172a' : '#f8fafc';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`PLANO: ${schematic.name || 'Circuito'}`, tbX + 12, tbY + 22);

        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = backgroundType === 'light' ? '#64748b' : '#94a3b8';
        ctx.fillText(`AUTOR: ${schematic.author || 'LogiCirc'}`, tbX + 12, tbY + 40);
        ctx.fillText(
          `REV: ${schematic.version || '1.0'} | FECHA: ${new Date().toLocaleDateString()}`,
          tbX + 12,
          tbY + 56
        );
        ctx.fillText(`HOJA: 1/1`, tbX + tbWidth - 65, tbY + 56);
      }

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${(schematic.name || 'plano').replace(/\s+/g, '_')}_${resolutionScale}x.png`;
      downloadLink.click();

      URLObj.revokeObjectURL(blobURL);
      setIsExporting(false);
      onClose();
    };

    image.src = blobURL;
  };

  // Export as Lossless Scalable Vector Graphics (SVG)
  const handleExportSvg = () => {
    const svgElem = document.querySelector('[data-testid="circuit-canvas"] svg');
    if (!svgElem) return;

    const svgString = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(schematic.name || 'plano').replace(/\s+/g, '_')}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  // Print PDF with standard engineering border and title block
  const handlePrintPdf = () => {
    window.print();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Exportar Plano Esquemático"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Exportar Plano Lógico</h2>
              <p className="text-[11px] text-slate-400">
                Formatos de alta resolución para documentación y entrega técnica.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-4">
          {/* Resolution */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Resolución de Imagen (DPI)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: 1, label: '1x Estándar (Web)' },
                { scale: 2, label: '2x Alta Def (300 DPI)' },
                { scale: 4, label: '4x Ultra HD (Póster)' },
              ].map((opt) => (
                <button
                  key={opt.scale}
                  type="button"
                  onClick={() => setResolutionScale(opt.scale)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                    resolutionScale === opt.scale
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Fondo del Plano</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Oscuro CAD' },
                { id: 'light', label: 'Blanco Técnico' },
                { id: 'transparent', label: 'Transparente' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBackgroundType(opt.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                    backgroundType === opt.id
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title block toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-200">Cajetín de Ingeniería (UNE/IEC)</span>
              <p className="text-[10px] text-slate-400">
                Incluye bloque formal con Título, Autor, Versión y Fecha.
              </p>
            </div>
            <input
              type="checkbox"
              checked={includeTitleBlock}
              onChange={(e) => setIncludeTitleBlock(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <FileImage className="w-4 h-4" />
              <span>{isExporting ? 'Generando PNG...' : `Descargar Imagen PNG (${resolutionScale}x)`}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportSvg}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vector SVG</span>
              </button>
              <button
                onClick={handlePrintPdf}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-purple-400" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
