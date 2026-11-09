/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomComponentDef } from '../types/circuit';
import { evaluateBooleanExpression } from '../engine/simulation';
import {
  X,
  Plus,
  Trash2,
  Cpu,
  Table,
  Terminal,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CustomComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComponent: (def: CustomComponentDef) => void;
}

export const CustomComponentModal: React.FC<CustomComponentModalProps> = ({
  isOpen,
  onClose,
  onSaveComponent,
}) => {
  const [name, setName] = useState('Comparador 2-Bit');
  const [abbr, setAbbr] = useState('CMP2');
  const [description, setDescription] = useState('Compara si 2 entradas son iguales');
  const [color, setColor] = useState('#8b5cf6');

  const [inputs, setInputs] = useState<Array<{ id: string; name: string }>>([
    { id: 'in_0', name: 'A' },
    { id: 'in_1', name: 'B' },
  ]);

  const [outputs, setOutputs] = useState<Array<{ id: string; name: string }>>([
    { id: 'out_0', name: 'EQ' },
  ]);

  const [logicMode, setLogicMode] = useState<'expression' | 'truthTable'>('expression');
  const [expressions, setExpressions] = useState<Record<string, string>>({
    EQ: '~(A ^ B)',
  });

  const [truthTable, setTruthTable] = useState<Array<{ inputs: number[]; outputs: number[] }>>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddInput = () => {
    if (inputs.length >= 8) return;
    const newIdx = inputs.length;
    const char = String.fromCharCode(65 + newIdx); // A, B, C, D...
    setInputs([...inputs, { id: `in_${newIdx}`, name: char }]);
  };

  const handleRemoveInput = (idx: number) => {
    if (inputs.length <= 1) return;
    setInputs(inputs.filter((_, i) => i !== idx));
  };

  const handleAddOutput = () => {
    if (outputs.length >= 6) return;
    const newIdx = outputs.length;
    const outName = `Y${newIdx}`;
    setOutputs([...outputs, { id: `out_${newIdx}`, name: outName }]);
    setExpressions((prev) => ({ ...prev, [outName]: 'A & B' }));
  };

  const handleRemoveOutput = (idx: number) => {
    if (outputs.length <= 1) return;
    const target = outputs[idx];
    setOutputs(outputs.filter((_, i) => i !== idx));
    setExpressions((prev) => {
      const next = { ...prev };
      delete next[target.name];
      return next;
    });
  };

  // Generate truth table rows for current inputs
  const handleGenerateTruthTable = () => {
    const numRows = Math.pow(2, inputs.length);
    const rows: Array<{ inputs: number[]; outputs: number[] }> = [];

    for (let i = 0; i < numRows; i++) {
      const inBits: number[] = [];
      for (let b = inputs.length - 1; b >= 0; b--) {
        inBits.push((i >> b) & 1);
      }
      rows.push({
        inputs: inBits,
        outputs: new Array(outputs.length).fill(0),
      });
    }
    setTruthTable(rows);
  };

  const handleToggleTableOutput = (rowIdx: number, outIdx: number) => {
    setTruthTable((prev) =>
      prev.map((row, r) => {
        if (r !== rowIdx) return row;
        const newOutputs = [...row.outputs];
        newOutputs[outIdx] = newOutputs[outIdx] === 1 ? 0 : 1;
        return { ...row, outputs: newOutputs };
      })
    );
  };

  const handleSave = () => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Por favor ingresa un nombre para el componente.');
      return;
    }

    if (inputs.length === 0 || outputs.length === 0) {
      setValidationError('Debe haber al menos 1 pin de entrada y 1 pin de salida.');
      return;
    }

    // Verify boolean expressions if in expression mode
    if (logicMode === 'expression') {
      for (const outPin of outputs) {
        const expr = expressions[outPin.name] || '';
        if (!expr.trim()) {
          setValidationError(`Falta la expresión lógica para el pin de salida "${outPin.name}".`);
          return;
        }
        // Test expression with sample 0 inputs
        const testEnv: Record<string, any> = {};
        inputs.forEach((inp) => (testEnv[inp.name] = 0));
        const testRes = evaluateBooleanExpression(expr, testEnv);
        if (testRes === null || testRes === undefined) {
          setValidationError(`Error de sintaxis en la expresión "${expr}".`);
          return;
        }
      }
    }

    const customId = `chip_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;

    const newDef: CustomComponentDef = {
      id: customId,
      name,
      abbreviation: abbr || name.slice(0, 4).toUpperCase(),
      description,
      category: 'custom',
      color,
      inputs,
      outputs,
      logicExpressions: logicMode === 'expression' ? expressions : undefined,
      truthTable: logicMode === 'truthTable' && truthTable.length > 0 ? truthTable : undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveComponent(newDef);
    onClose();
  };

  const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Crear Componente Personalizado"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-mono font-bold"
              style={{ backgroundColor: color }}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Crear Chip / Subcircuito Personalizado</h2>
              <p className="text-[11px] text-slate-400">
                Diseña un nuevo circuito integrado con pines y comportamiento lógico personalizado.
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

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {validationError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-300">Nombre del Chip</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Decodificador BCD"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Abreviatura (2-4 letras)</label>
              <input
                type="text"
                maxLength={4}
                value={abbr}
                onChange={(e) => setAbbr(e.target.value.toUpperCase())}
                placeholder="BCD"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 uppercase font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Color del Encapsulado</label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Pin Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Pins */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Pines de Entrada ({inputs.length})</span>
                <button
                  onClick={handleAddInput}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                >
                  <Plus className="w-3 h-3" /> Añadir
                </button>
              </div>
              <div className="space-y-1.5">
                {inputs.map((inp, idx) => (
                  <div key={inp.id} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 w-4">#{idx + 1}</span>
                    <input
                      type="text"
                      value={inp.name}
                      onChange={(e) => {
                        const updated = [...inputs];
                        updated[idx].name = e.target.value.toUpperCase();
                        setInputs(updated);
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleRemoveInput(idx)}
                      disabled={inputs.length <= 1}
                      className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Pins */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Pines de Salida ({outputs.length})</span>
                <button
                  onClick={handleAddOutput}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                >
                  <Plus className="w-3 h-3" /> Añadir
                </button>
              </div>
              <div className="space-y-1.5">
                {outputs.map((out, idx) => (
                  <div key={out.id} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 w-4">#{idx + 1}</span>
                    <input
                      type="text"
                      value={out.name}
                      onChange={(e) => {
                        const updated = [...outputs];
                        const oldName = updated[idx].name;
                        const newName = e.target.value.toUpperCase();
                        updated[idx].name = newName;
                        setOutputs(updated);
                        // Rename expression key
                        setExpressions((prev) => {
                          const val = prev[oldName] || '';
                          const next = { ...prev };
                          delete next[oldName];
                          next[newName] = val;
                          return next;
                        });
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleRemoveOutput(idx)}
                      disabled={outputs.length <= 1}
                      className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logic Definition Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setLogicMode('expression')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  logicMode === 'expression'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Expresiones Booleanas</span>
              </button>
              <button
                onClick={() => {
                  setLogicMode('truthTable');
                  if (truthTable.length === 0) handleGenerateTruthTable();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  logicMode === 'truthTable'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabla de Verdad</span>
              </button>
            </div>

            {/* Expression Mode */}
            {logicMode === 'expression' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">
                  Operadores admitidos: <code className="text-emerald-400">&amp;</code> (AND),{' '}
                  <code className="text-emerald-400">|</code> (OR),{' '}
                  <code className="text-emerald-400">^</code> (XOR),{' '}
                  <code className="text-emerald-400">~</code> (NOT), paréntesis.
                </p>
                {outputs.map((out) => (
                  <div key={out.id} className="flex items-center gap-2">
                    <span className="w-16 font-mono text-xs font-bold text-slate-300">{out.name} =</span>
                    <input
                      type="text"
                      value={expressions[out.name] || ''}
                      onChange={(e) =>
                        setExpressions({ ...expressions, [out.name]: e.target.value })
                      }
                      placeholder={`ej: (${inputs.map((i) => i.name).join(' & ')})`}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Truth Table Mode */}
            {logicMode === 'truthTable' && (
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar border border-slate-800 rounded-lg p-2 bg-slate-950">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      {inputs.map((i) => (
                        <th key={i.id} className="p-1 font-mono">{i.name}</th>
                      ))}
                      <th className="p-1 text-slate-600">|</th>
                      {outputs.map((o) => (
                        <th key={o.id} className="p-1 font-mono text-purple-400">{o.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {truthTable.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900 border-b border-slate-900/60 font-mono">
                        {row.inputs.map((bit, bIdx) => (
                          <td key={bIdx} className="p-1 text-slate-300">{bit}</td>
                        ))}
                        <td className="p-1 text-slate-700">|</td>
                        {row.outputs.map((bit, oIdx) => (
                          <td key={oIdx} className="p-1">
                            <button
                              type="button"
                              onClick={() => handleToggleTableOutput(rIdx, oIdx)}
                              className={`w-6 h-6 rounded font-bold text-xs cursor-pointer ${
                                bit === 1
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {bit}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-purple-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Guardar en Mi Biblioteca</span>
          </button>
        </div>
      </div>
    </div>
  );
};
