/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Schematic } from '../types/circuit';
import { parseCircuitDSL, serializeCircuitToDSL } from '../engine/dsl';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Wand2,
  Check,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Cpu,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  generatedDsl?: string | null;
  timestamp: string;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schematic: Schematic;
  onApplyGeneratedDsl: (updatedSchematic: Partial<Schematic>) => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  schematic,
  onApplyGeneratedDsl,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy tu Asistente de Circuitos Lógicos con IA. Puedo explicar el funcionamiento de tu circuito actual, encontrar errores o compuertas desconectadas, optimizarlo usando álgebra de Boole o generar esquemas completos a partir de lenguaje natural.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string, action: string = 'chat') => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const currentDsl = serializeCircuitToDSL(schematic);
      const res = await fetch('/api/gemini/circuit-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          message: text,
          dslContext: currentDsl,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error en la respuesta del modelo');
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        generatedDsl: data.generatedDsl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'No se pudo conectar con el asistente IA. Comprueba la clave API de Gemini.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyDslToCircuit = (dsl: string) => {
    const result = parseCircuitDSL(dsl);
    if (result.schematic) {
      onApplyGeneratedDsl(result.schematic);
    }
  };

  const quickPrompts = [
    { label: 'Explicar Circuito', action: 'explain', prompt: 'Explica el funcionamiento y la tabla de verdad de este circuito' },
    { label: 'Buscar Errores', action: 'debug', prompt: 'Depura este circuito y detecta pines flotantes o problemas lógicos' },
    { label: 'Optimizar Compuertas', action: 'optimize', prompt: 'Optimiza este circuito usando álgebra de Boole para reducir compuertas' },
    { label: 'Generar Comparador', action: 'generate', prompt: 'Genera un comparador de igualdad de 2 bits con compuertas XNOR y un LED' },
  ];

  return (
    <div
      className="w-96 md:w-[420px] bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full z-20 shadow-2xl animate-in slide-in-from-right duration-200"
      aria-label="Asistente de Circuitos IA"
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 to-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Asistente de Circuitos IA
            </h2>
            <span className="text-[10px] text-purple-400">Gemini 3.8 Flash</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          aria-label="Cerrar asistente"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt, qp.action)}
            disabled={isLoading}
            className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-purple-900/60 hover:text-purple-300 border border-slate-700/60 text-slate-300 transition cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Generated DSL Action Button */}
              {msg.generatedDsl && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-purple-400 font-mono">
                    <span>Plano Formal Generado</span>
                  </div>
                  <button
                    onClick={() => handleApplyDslToCircuit(msg.generatedDsl!)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Insertar Circuito en el Plano</span>
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 px-1 pt-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>El Asistente está analizando el circuito...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Pregunta o pide diseñar un circuito..."
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
          aria-label="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
