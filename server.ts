/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client instance with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * AI Circuit Assistant Endpoint:
 * Supports chat, explanation, debugging, optimization, and generating formal Circuit DSL.
 */
app.post('/api/gemini/circuit-ai', async (req: Request, res: Response) => {
  try {
    const { action, message, dslContext, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY no está configurada en las variables de entorno. Configúrela en el panel de secretos.',
      });
    }

    const systemInstruction = `Eres un Ingeniero Experto en Circuitos Electrónicos Digitales y Arquitectura de Computadores, especializado en la aplicación LogiCirc.
Tu objetivo es ayudar al usuario a entender, depurar, optimizar y diseñar planos de circuitos lógicos.

La aplicación utiliza un Lenguaje Formal de Descripción de Circuitos (Circuit DSL) con la siguiente sintaxis estricta:
\`\`\`dsl
CIRCUIT "Nombre Del Circuito" {
  METADATA {
    author: "Autor"
    version: "1.0.0"
    description: "Breve descripción"
  }
  COMPONENTS {
    id_1: SWITCH { label: "A", x: 80, y: 120, state: { isOn: false } }
    id_2: SWITCH { label: "B", x: 80, y: 220, state: { isOn: false } }
    gate_and: AND { label: "AND-1", x: 300, y: 170 }
    led_out: LED { label: "Salida", x: 500, y: 170, state: { color: "#10b981" } }
  }
  WIRES {
    CONNECT id_1.out -> gate_and.in1
    CONNECT id_2.out -> gate_and.in2
    CONNECT gate_and.out -> led_out.in1
  }
}
\`\`\`

Tipos de componentes soportados:
- Puertas: AND, OR, NOT, NAND, NOR, XOR, XNOR, BUFFER, TRI_STATE
- Entradas: SWITCH, BUTTON, CLOCK, VCC, GND, BUS_INPUT_4BIT
- Salidas: LED, DISPLAY_7SEG, DISPLAY_HEX, PROBE, BUZZER
- Secuencial: FLIPFLOP_D, FLIPFLOP_JK, FLIPFLOP_T, SR_LATCH, COUNTER_4BIT, REGISTER_4BIT
- Aritmética / MSI: HALF_ADDER, FULL_ADDER, MUX_2TO1, MUX_4TO1, DECODER_2TO4

Pines estándar:
- AND, OR, NAND, NOR, XOR, XNOR: entradas in1, in2; salida out
- NOT, BUFFER: entrada in1; salida out
- SWITCH, BUTTON, CLOCK, VCC, GND: salida out
- LED, PROBE, BUZZER: entrada in1
- FULL_ADDER: entradas a, b, cin; salidas sum, cout
- HALF_ADDER: entradas a, b; salidas sum, carry
- FLIPFLOP_D: entradas d, clk; salidas q, q_bar
- COUNTER_4BIT: entradas clk, rst, en; salidas q0, q1, q2, q3, carry
- DISPLAY_HEX: entradas d0, d1, d2, d3

Si se solicita generar o modificar un circuito, SIEMPRE incluye un bloque de código formal \`\`\`dsl ... \`\`\` que pueda ser parseado directamente por la aplicación.
Responde de forma concisa, técnica y didáctica en español.`;

    let prompt = '';

    if (action === 'generate') {
      prompt = `Genera un plano de circuito lógico formal para la siguiente solicitud: "${message}".
Incluye la descripción técnica breve y el bloque formal \`\`\`dsl ... \`\`\` completo con posiciones (x, y) ordenadas de izquierda a derecha.`;
    } else if (action === 'explain') {
      prompt = `Analiza y explica detalladamente cómo funciona el siguiente circuito y su tabla de verdad:\n\nDSL Actual:\n\`\`\`dsl\n${dslContext}\n\`\`\``;
    } else if (action === 'debug') {
      prompt = `Inspecciona el siguiente circuito en busca de errores (entradas desconectadas, cortocircuitos lógicos, oscilaciones infinitas o fallos de diseño):\n\nDSL Actual:\n\`\`\`dsl\n${dslContext}\n\`\`\``;
    } else if (action === 'optimize') {
      prompt = `Propón optimizaciones para este circuito (por ejemplo, reducir número de compuertas usando álgebra de Boole / leyes de De Morgan, o convertir a lógica universal NAND/NOR):\n\nDSL Actual:\n\`\`\`dsl\n${dslContext}\n\`\`\``;
    } else {
      prompt = `${message}\n\n[Contexto del plano actual en formato DSL]:\n\`\`\`dsl\n${dslContext || 'Sin componentes'}\n\`\`\``;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || 'Sin respuesta generada por el modelo.';

    // Check if the response contains generated DSL
    let generatedDsl: string | null = null;
    const dslMatch = replyText.match(/```(?:dsl|circuit)?\s*([\s\S]*?CIRCUIT[\s\S]*?)```/i);
    if (dslMatch) {
      generatedDsl = dslMatch[1].trim();
    }

    return res.json({
      text: replyText,
      generatedDsl,
    });
  } catch (error: any) {
    console.error('Error en circuit-ai:', error);
    return res.status(500).json({
      error: error.message || 'Error interno al procesar la solicitud con Gemini',
    });
  }
});

// Mock / Live collaboration room state in memory
interface RoomData {
  id: string;
  users: Array<{ id: string; name: string; color: string; role: string; cursor?: { x: number; y: number } }>;
  lastActivity: number;
}
const rooms = new Map<string, RoomData>();

app.get('/api/collab/room/:id', (req: Request, res: Response) => {
  const roomId = req.params.id;
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      users: [],
      lastActivity: Date.now(),
    });
  }
  res.json(rooms.get(roomId));
});

app.post('/api/collab/join', (req: Request, res: Response) => {
  const { roomId, user } = req.body;
  if (!roomId || !user) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  let room = rooms.get(roomId);
  if (!room) {
    room = { id: roomId, users: [], lastActivity: Date.now() };
    rooms.set(roomId, room);
  }

  const existingIdx = room.users.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) {
    room.users[existingIdx] = { ...room.users[existingIdx], ...user };
  } else {
    room.users.push(user);
  }

  room.lastActivity = Date.now();
  res.json({ success: true, room });
});

// GitHub synchronization mock / proxy
app.post('/api/github/sync', (req: Request, res: Response) => {
  const { repo, branch, commitMessage, dslContent, token } = req.body;
  if (!repo) {
    return res.status(400).json({ error: 'Debe especificar el repositorio' });
  }

  // Simulate or return successful git push metadata
  const sha = Math.random().toString(16).substring(2, 10);
  const syncDate = new Date().toISOString();

  res.json({
    success: true,
    repo,
    branch: branch || 'main',
    commitSha: sha,
    commitMessage: commitMessage || 'Actualización de plano esquemático LogiCirc',
    syncDate,
    filesSynced: ['circuit.hdl', 'schematic.json'],
  });
});

// Vite Middleware integration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true' || process.env.DISABLE_HMR !== 'false';
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
        watch: isHmrDisabled ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LogiCirc server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
