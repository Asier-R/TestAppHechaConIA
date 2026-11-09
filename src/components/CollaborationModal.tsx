/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CollaboratorUser } from '../types/circuit';
import {
  X,
  Users,
  Copy,
  Check,
  Radio,
  UserCheck,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  collaborators: CollaboratorUser[];
  currentUser: CollaboratorUser;
  onUpdateCurrentUser: (user: Partial<CollaboratorUser>) => void;
  onJoinRoom: (newRoomId: string) => void;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  isOpen,
  onClose,
  roomId,
  collaborators,
  currentUser,
  onUpdateCurrentUser,
  onJoinRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?room=${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Colaboración en Tiempo Real"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Colaboración en Tiempo Real
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Sesión activa multiusuario</span>
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Room ID Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <span className="text-xs font-semibold text-slate-400">Código de Sala Actual:</span>
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2">
              <span className="font-mono text-xs font-bold text-blue-400">{roomId}</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Enlace'}</span>
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Tu Identidad en la Sala:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentUser.name}
                onChange={(e) => onUpdateCurrentUser({ name: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Tu nombre"
              />
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateCurrentUser({ color: c })}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      currentUser.color === c ? 'border-white scale-110' : 'border-transparent opacity-60'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Connected Users List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Participantes Conectados ({collaborators.length}):
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
              {collaborators.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-slate-200">
                      {user.name} {user.id === currentUser.id && '(Tú)'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Join Another Room Form */}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Unirse a otra sala (ej: SALA-XYZ)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                if (joinCode.trim()) {
                  onJoinRoom(joinCode.trim().toUpperCase());
                  setJoinCode('');
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Unirse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
