/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Commit, UserRole } from '../types/circuit';
import {
  X,
  GitBranch,
  GitCommit,
  RotateCcw,
  Shield,
  Clock,
  Plus,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';

interface VersionControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  commits: Commit[];
  currentBranch: string;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  onCreateCommit: (message: string) => void;
  onRestoreCommit: (commit: Commit) => void;
  currentComponentsCount: number;
  currentWiresCount: number;
}

export const VersionControlModal: React.FC<VersionControlModalProps> = ({
  isOpen,
  onClose,
  commits,
  currentBranch,
  userRole,
  onChangeUserRole,
  onCreateCommit,
  onRestoreCommit,
  currentComponentsCount,
  currentWiresCount,
}) => {
  const [activeTab, setActiveTab] = useState<'commits' | 'permissions'>('commits');
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedCommitForDiff, setSelectedCommitForDiff] = useState<Commit | null>(null);

  if (!isOpen) return null;

  const handleCreateCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    onCreateCommit(commitMessage);
    setCommitMessage('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Control de Versiones y Permisos"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Control de Versiones y Permisos
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Rama: <strong className="text-purple-400">{currentBranch}</strong></span>
                <span>•</span>
                <span>Rol Actual: <strong className="text-emerald-400 capitalize">{userRole}</strong></span>
              </div>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-4 gap-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('commits')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'commits'
                ? 'border-purple-500 text-purple-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Historial de Commits ({commits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'border-purple-500 text-purple-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Permisos y Roles de Edición</span>
          </button>
        </div>

        {/* Tab 1: Commits History & Snapshot Creator */}
        {activeTab === 'commits' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            {/* Create Commit Form */}
            {userRole !== 'viewer' && (
              <form onSubmit={handleCreateCommit} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <span className="text-xs font-semibold text-slate-300">Guardar Nuevo Punto de Control (Commit)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Descripción del cambio (ej: Agregado sumador con acarreo)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Commit</span>
                  </button>
                </div>
              </form>
            )}

            {/* Commits List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Puntos de Restauración:</span>
              <div className="space-y-2">
                {commits.map((commit, idx) => {
                  const dateStr = new Date(commit.timestamp).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <div
                      key={commit.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition"
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                            {commit.id.slice(0, 7)}
                          </span>
                          <span className="text-xs font-medium text-slate-200 truncate">
                            {commit.message}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {dateStr}
                          </span>
                          <span>Autor: {commit.author}</span>
                          <span>{commit.componentsCount} comp. / {commit.wiresCount} cables</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRestoreCommit(commit)}
                          disabled={userRole === 'viewer'}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition cursor-pointer disabled:opacity-40"
                          title="Restaurar el circuito a este estado"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                          <span>Restaurar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Roles & Permissions */}
        {activeTab === 'permissions' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200">Asignar Rol de Usuario en este Proyecto:</span>
              <p className="text-[11px] text-slate-400">
                Controla los permisos para evitar modificaciones no deseadas o permitir solo visualización.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Admin */}
              <div
                onClick={() => onChangeUserRole('admin')}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  userRole === 'admin'
                    ? 'bg-purple-950/30 border-purple-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Administrador</span>
                    {userRole === 'admin' && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Control total: editar, simular, gestionar permisos y commits.
                  </p>
                </div>
              </div>

              {/* Editor */}
              <div
                onClick={() => onChangeUserRole('editor')}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  userRole === 'editor'
                    ? 'bg-emerald-950/30 border-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Editor</span>
                    {userRole === 'editor' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Modificar esquemático, cablear compuertas, probar simulación y guardar commits.
                  </p>
                </div>
              </div>

              {/* Viewer */}
              <div
                onClick={() => onChangeUserRole('viewer')}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  userRole === 'viewer'
                    ? 'bg-blue-950/30 border-blue-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Visor (Lectura)</span>
                    {userRole === 'viewer' && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Solo lectura. Bloquea movimiento de compuertas y creación de cables.
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300">Capacidades del rol activo:</span>
              <ul className="space-y-1 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className={userRole !== 'viewer' ? 'text-emerald-400' : 'text-slate-600'}>
                    {userRole !== 'viewer' ? '✓' : '✗'}
                  </span>
                  <span>Añadir y mover componentes en el plano</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={userRole !== 'viewer' ? 'text-emerald-400' : 'text-slate-600'}>
                    {userRole !== 'viewer' ? '✓' : '✗'}
                  </span>
                  <span>Trazar nuevas conexiones de cables</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Simular y activar interruptores</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={userRole === 'admin' ? 'text-emerald-400' : 'text-slate-600'}>
                    {userRole === 'admin' ? '✓' : '✗'}
                  </span>
                  <span>Cambiar permisos de colaboradores y ramas</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
