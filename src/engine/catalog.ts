/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, ComponentType, PinDefinition } from '../types/circuit';

export interface ComponentTemplate {
  type: ComponentType;
  name: string;
  category: 'gates' | 'inputs' | 'outputs' | 'sequential' | 'arithmetic' | 'custom';
  description: string;
  width: number;
  height: number;
  defaultInputs: Array<{ id: string; name: string }>;
  defaultOutputs: Array<{ id: string; name: string }>;
  defaultState: Record<string, any>;
  iecSymbol: string;
  ansiType: string;
}

export const COMPONENT_CATALOG: ComponentTemplate[] = [
  // --- PUERTAS LÓGICAS (LOGIC GATES) ---
  {
    type: 'AND',
    name: 'Compuerta AND',
    category: 'gates',
    description: 'Salida 1 solo si todas sus entradas son 1',
    width: 110,
    height: 70,
    defaultInputs: [
      { id: 'in1', name: 'A' },
      { id: 'in2', name: 'B' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '&',
    ansiType: 'and',
  },
  {
    type: 'OR',
    name: 'Compuerta OR',
    category: 'gates',
    description: 'Salida 1 si al menos una entrada es 1',
    width: 110,
    height: 70,
    defaultInputs: [
      { id: 'in1', name: 'A' },
      { id: 'in2', name: 'B' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '≥1',
    ansiType: 'or',
  },
  {
    type: 'NOT',
    name: 'Inversor NOT',
    category: 'gates',
    description: 'Invierte el estado de la entrada',
    width: 100,
    height: 60,
    defaultInputs: [{ id: 'in1', name: 'A' }],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '1',
    ansiType: 'not',
  },
  {
    type: 'NAND',
    name: 'Compuerta NAND',
    category: 'gates',
    description: 'AND negada; universal',
    width: 110,
    height: 70,
    defaultInputs: [
      { id: 'in1', name: 'A' },
      { id: 'in2', name: 'B' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '&',
    ansiType: 'nand',
  },
  {
    type: 'NOR',
    name: 'Compuerta NOR',
    category: 'gates',
    description: 'OR negada; universal',
    width: 110,
    height: 70,
    defaultInputs: [
      { id: 'in1', name: 'A' },
      { id: 'in2', name: 'B' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '≥1',
    ansiType: 'nor',
  },
  {
    type: 'XOR',
    name: 'Compuerta XOR',
    category: 'gates',
    description: 'OR exclusiva; 1 si entradas son distintas',
    width: 110,
    height: 70,
    defaultInputs: [
      { id: 'in1', name: 'A' },
      { id: 'in2', name: 'B' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '=1',
    ansiType: 'xor',
  },
  {
    type: 'XNOR',
    name: 'Compuerta XNOR',
    category: 'gates',
    description: 'Equivalencia lógica; 1 si entradas son iguales',
    width: 110,
    height: 70,
    defaultInputs: [
      { id: 'in1', name: 'A' },
      { id: 'in2', name: 'B' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '=1',
    ansiType: 'xnor',
  },
  {
    type: 'BUFFER',
    name: 'Buffer',
    category: 'gates',
    description: 'Regenerador / aislamiento de señal',
    width: 100,
    height: 60,
    defaultInputs: [{ id: 'in1', name: 'A' }],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: '1',
    ansiType: 'buffer',
  },
  {
    type: 'TRI_STATE',
    name: 'Buffer Tri-Estado',
    category: 'gates',
    description: 'Pasa señal si Enable=1, alta impedancia si 0',
    width: 110,
    height: 70,
    defaultInputs: [
      { id: 'in1', name: 'IN' },
      { id: 'enable', name: 'EN' },
    ],
    defaultOutputs: [{ id: 'out', name: 'OUT' }],
    defaultState: {},
    iecSymbol: 'EN',
    ansiType: 'tristate',
  },

  // --- ENTRADAS / GENERADORES (INPUTS & GENERATORS) ---
  {
    type: 'SWITCH',
    name: 'Interruptor Conmutable',
    category: 'inputs',
    description: 'Alterna entre estado 0 y 1 al hacer clic',
    width: 105,
    height: 60,
    defaultInputs: [],
    defaultOutputs: [{ id: 'out', name: 'OUT' }],
    defaultState: { isOn: false },
    iecSymbol: 'SW',
    ansiType: 'switch',
  },
  {
    type: 'BUTTON',
    name: 'Pulsador Momentáneo',
    category: 'inputs',
    description: 'Emite 1 mientras se mantiene presionado',
    width: 105,
    height: 60,
    defaultInputs: [],
    defaultOutputs: [{ id: 'out', name: 'OUT' }],
    defaultState: { isPressed: false },
    iecSymbol: 'PB',
    ansiType: 'button',
  },
  {
    type: 'CLOCK',
    name: 'Generador de Reloj',
    category: 'inputs',
    description: 'Oscilador que genera pulsos cuadrados periódicos',
    width: 105,
    height: 60,
    defaultInputs: [],
    defaultOutputs: [{ id: 'out', name: 'CLK' }],
    defaultState: { frequencyHz: 1, lastTick: 0, isOn: true },
    iecSymbol: 'Л',
    ansiType: 'clock',
  },
  {
    type: 'VCC',
    name: 'Constante Alta (VCC)',
    category: 'inputs',
    description: 'Nivel lógico permanente 1 (VCC / High)',
    width: 85,
    height: 50,
    defaultInputs: [],
    defaultOutputs: [{ id: 'out', name: '1' }],
    defaultState: {},
    iecSymbol: 'VCC',
    ansiType: 'vcc',
  },
  {
    type: 'GND',
    name: 'Tierra / Nivel Bajo (GND)',
    category: 'inputs',
    description: 'Nivel lógico permanente 0 (GND / Low)',
    width: 85,
    height: 50,
    defaultInputs: [],
    defaultOutputs: [{ id: 'out', name: '0' }],
    defaultState: {},
    iecSymbol: 'GND',
    ansiType: 'gnd',
  },
  {
    type: 'BUS_INPUT_4BIT',
    name: 'Entrada Bus 4-Bit (DIP)',
    category: 'inputs',
    description: 'Selector binario de 4 bits (0 a 15)',
    width: 125,
    height: 90,
    defaultInputs: [],
    defaultOutputs: [
      { id: 'b0', name: 'D0' },
      { id: 'b1', name: 'D1' },
      { id: 'b2', name: 'D2' },
      { id: 'b3', name: 'D3' },
    ],
    defaultState: { storedValue: 0 },
    iecSymbol: 'DIP',
    ansiType: 'dip4',
  },

  // --- SALIDAS E INDICADORES (OUTPUTS & PROBES) ---
  {
    type: 'LED',
    name: 'Diodo LED',
    category: 'outputs',
    description: 'Se ilumina brillantemente cuando la entrada es 1',
    width: 95,
    height: 60,
    defaultInputs: [{ id: 'in1', name: 'IN' }],
    defaultOutputs: [],
    defaultState: { color: '#10b981' },
    iecSymbol: 'LED',
    ansiType: 'led',
  },
  {
    type: 'DISPLAY_7SEG',
    name: 'Display 7 Segmentos',
    category: 'outputs',
    description: 'Control de 7 segmentos individuales (a-g)',
    width: 110,
    height: 120,
    defaultInputs: [
      { id: 'a', name: 'a' },
      { id: 'b', name: 'b' },
      { id: 'c', name: 'c' },
      { id: 'd', name: 'd' },
      { id: 'e', name: 'e' },
      { id: 'f', name: 'f' },
      { id: 'g', name: 'g' },
    ],
    defaultOutputs: [],
    defaultState: {},
    iecSymbol: '7-SEG',
    ansiType: '7seg',
  },
  {
    type: 'DISPLAY_HEX',
    name: 'Display Hexadecimal (4-Bit)',
    category: 'outputs',
    description: 'Decodifica automáticamente 4 bits a dígitos 0-9, A-F',
    width: 100,
    height: 90,
    defaultInputs: [
      { id: 'd0', name: 'D0' },
      { id: 'd1', name: 'D1' },
      { id: 'd2', name: 'D2' },
      { id: 'd3', name: 'D3' },
    ],
    defaultOutputs: [],
    defaultState: {},
    iecSymbol: 'HEX',
    ansiType: 'hex',
  },
  {
    type: 'PROBE',
    name: 'Sonda Lógica (Probe)',
    category: 'outputs',
    description: 'Muestra valor instantáneo 0, 1 o Flotante',
    width: 85,
    height: 55,
    defaultInputs: [{ id: 'in1', name: 'IN' }],
    defaultOutputs: [],
    defaultState: {},
    iecSymbol: '?',
    ansiType: 'probe',
  },
  {
    type: 'BUZZER',
    name: 'Zumbador Acústico',
    category: 'outputs',
    description: 'Emite señal acústica cuando recibe 1 lógico',
    width: 85,
    height: 55,
    defaultInputs: [{ id: 'in1', name: 'IN' }],
    defaultOutputs: [],
    defaultState: {},
    iecSymbol: 'BZZ',
    ansiType: 'buzzer',
  },

  // --- SECUENCIAL Y MEMORIA (SEQUENTIAL & MEMORY) ---
  {
    type: 'FLIPFLOP_D',
    name: 'Flip-Flop Tipo D',
    category: 'sequential',
    description: 'Biestable síncrono por flanco ascendente',
    width: 120,
    height: 85,
    defaultInputs: [
      { id: 'd', name: 'D' },
      { id: 'clk', name: 'CLK' },
    ],
    defaultOutputs: [
      { id: 'q', name: 'Q' },
      { id: 'q_bar', name: 'Q̄' },
    ],
    defaultState: { storedValue: 0, lastClk: 0 },
    iecSymbol: 'D-FF',
    ansiType: 'ff_d',
  },
  {
    type: 'FLIPFLOP_JK',
    name: 'Flip-Flop Tipo JK',
    category: 'sequential',
    description: 'Biestable universal con basculación (Toggle)',
    width: 125,
    height: 95,
    defaultInputs: [
      { id: 'j', name: 'J' },
      { id: 'clk', name: 'CLK' },
      { id: 'k', name: 'K' },
    ],
    defaultOutputs: [
      { id: 'q', name: 'Q' },
      { id: 'q_bar', name: 'Q̄' },
    ],
    defaultState: { storedValue: 0, lastClk: 0 },
    iecSymbol: 'JK-FF',
    ansiType: 'ff_jk',
  },
  {
    type: 'FLIPFLOP_T',
    name: 'Flip-Flop Tipo T',
    category: 'sequential',
    description: 'Bascula salida en cada pulso de reloj si T=1',
    width: 120,
    height: 85,
    defaultInputs: [
      { id: 't', name: 'T' },
      { id: 'clk', name: 'CLK' },
    ],
    defaultOutputs: [
      { id: 'q', name: 'Q' },
      { id: 'q_bar', name: 'Q̄' },
    ],
    defaultState: { storedValue: 0, lastClk: 0 },
    iecSymbol: 'T-FF',
    ansiType: 'ff_t',
  },
  {
    type: 'SR_LATCH',
    name: 'Cerrojo SR (Latch)',
    category: 'sequential',
    description: 'Memoria asíncrona Set/Reset',
    width: 120,
    height: 85,
    defaultInputs: [
      { id: 's', name: 'S' },
      { id: 'r', name: 'R' },
    ],
    defaultOutputs: [
      { id: 'q', name: 'Q' },
      { id: 'q_bar', name: 'Q̄' },
    ],
    defaultState: { storedValue: 0 },
    iecSymbol: 'SR',
    ansiType: 'sr',
  },
  {
    type: 'COUNTER_4BIT',
    name: 'Contador Binario 4-Bit',
    category: 'sequential',
    description: 'Cuenta de 0 a 15 con cada pulso de reloj',
    width: 140,
    height: 100,
    defaultInputs: [
      { id: 'clk', name: 'CLK' },
      { id: 'rst', name: 'RST' },
      { id: 'en', name: 'EN' },
    ],
    defaultOutputs: [
      { id: 'q0', name: 'Q0' },
      { id: 'q1', name: 'Q1' },
      { id: 'q2', name: 'Q2' },
      { id: 'q3', name: 'Q3' },
      { id: 'carry', name: 'CO' },
    ],
    defaultState: { storedValue: 0, lastClk: 0 },
    iecSymbol: 'CTR4',
    ansiType: 'ctr4',
  },
  {
    type: 'REGISTER_4BIT',
    name: 'Registro de 4 Bits',
    category: 'sequential',
    description: 'Almacena 4 bits síncronamente con señal Load',
    width: 140,
    height: 110,
    defaultInputs: [
      { id: 'd0', name: 'D0' },
      { id: 'd1', name: 'D1' },
      { id: 'd2', name: 'D2' },
      { id: 'd3', name: 'D3' },
      { id: 'load', name: 'LD' },
      { id: 'clk', name: 'CLK' },
    ],
    defaultOutputs: [
      { id: 'q0', name: 'Q0' },
      { id: 'q1', name: 'Q1' },
      { id: 'q2', name: 'Q2' },
      { id: 'q3', name: 'Q3' },
    ],
    defaultState: { storedValue: 0, lastClk: 0 },
    iecSymbol: 'REG4',
    ansiType: 'reg4',
  },

  // --- ARITMÉTICA Y MSI (ARITHMETIC & MSI) ---
  {
    type: 'HALF_ADDER',
    name: 'Semisumador (Half Adder)',
    category: 'arithmetic',
    description: 'Suma 2 bits, genera Suma (S) y Acarreo (C)',
    width: 120,
    height: 80,
    defaultInputs: [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ],
    defaultOutputs: [
      { id: 'sum', name: 'SUM' },
      { id: 'carry', name: 'C' },
    ],
    defaultState: {},
    iecSymbol: 'HA',
    ansiType: 'ha',
  },
  {
    type: 'FULL_ADDER',
    name: 'Sumador Completo (Full Adder)',
    category: 'arithmetic',
    description: 'Suma 2 bits más Acarreo de entrada (Cin)',
    width: 130,
    height: 95,
    defaultInputs: [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'cin', name: 'Cin' },
    ],
    defaultOutputs: [
      { id: 'sum', name: 'SUM' },
      { id: 'cout', name: 'Cout' },
    ],
    defaultState: {},
    iecSymbol: 'FA',
    ansiType: 'fa',
  },
  {
    type: 'MUX_2TO1',
    name: 'Multiplexor 2 a 1',
    category: 'arithmetic',
    description: 'Selecciona entrada I0 o I1 según selector S',
    width: 120,
    height: 85,
    defaultInputs: [
      { id: 'i0', name: 'I0' },
      { id: 'i1', name: 'I1' },
      { id: 'sel', name: 'SEL' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: 'MUX',
    ansiType: 'mux2',
  },
  {
    type: 'MUX_4TO1',
    name: 'Multiplexor 4 a 1',
    category: 'arithmetic',
    description: 'Selecciona entre 4 entradas con 2 bits de selección',
    width: 130,
    height: 110,
    defaultInputs: [
      { id: 'i0', name: 'I0' },
      { id: 'i1', name: 'I1' },
      { id: 'i2', name: 'I2' },
      { id: 'i3', name: 'I3' },
      { id: 's0', name: 'S0' },
      { id: 's1', name: 'S1' },
    ],
    defaultOutputs: [{ id: 'out', name: 'Y' }],
    defaultState: {},
    iecSymbol: 'MUX4',
    ansiType: 'mux4',
  },
  {
    type: 'DECODER_2TO4',
    name: 'Decodificador 2 a 4',
    category: 'arithmetic',
    description: 'Activa una de 4 salidas según código binario de 2 bits',
    width: 130,
    height: 110,
    defaultInputs: [
      { id: 'a0', name: 'A0' },
      { id: 'a1', name: 'A1' },
      { id: 'en', name: 'EN' },
    ],
    defaultOutputs: [
      { id: 'y0', name: 'Y0' },
      { id: 'y1', name: 'Y1' },
      { id: 'y2', name: 'Y2' },
      { id: 'y3', name: 'Y3' },
    ],
    defaultState: {},
    iecSymbol: 'DEC',
    ansiType: 'dec24',
  },
];

export function getTemplateByType(type: ComponentType): ComponentTemplate | undefined {
  return COMPONENT_CATALOG.find((c) => c.type === type);
}

let idCounter = 1;

/**
 * Creates a configured CircuitComponent ready for the schematic
 */
export function createComponentInstance(
  type: ComponentType,
  x: number,
  y: number,
  customLabel?: string,
  customIcDef?: { id: string; name: string; inputs: { id: string; name: string }[]; outputs: { id: string; name: string }[] }
): CircuitComponent {
  const template = getTemplateByType(type);
  const compId = `${type.toLowerCase()}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

  if (type === 'CUSTOM_IC' && customIcDef) {
    const inputs: PinDefinition[] = customIcDef.inputs.map((pin, idx) => ({
      id: pin.id,
      name: pin.name,
      type: 'input',
      slot: `left-${idx}`,
      relativeX: 0,
      relativeY: (idx + 1) / (customIcDef.inputs.length + 1),
      state: null,
    }));

    const outputs: PinDefinition[] = customIcDef.outputs.map((pin, idx) => ({
      id: pin.id,
      name: pin.name,
      type: 'output',
      slot: `right-${idx}`,
      relativeX: 1,
      relativeY: (idx + 1) / (customIcDef.outputs.length + 1),
      state: null,
    }));

    const maxPins = Math.max(inputs.length, outputs.length, 2);
    const height = Math.max(70, maxPins * 24 + 30);
    const width = 130;

    return {
      id: compId,
      type: 'CUSTOM_IC',
      label: customLabel || customIcDef.name,
      x,
      y,
      width,
      height,
      rotation: 0,
      inputs,
      outputs,
      state: { customIcId: customIcDef.id },
    };
  }

  if (!template) {
    throw new Error(`Component type ${type} not found in catalog`);
  }

  const inputs: PinDefinition[] = template.defaultInputs.map((pin, idx) => {
    const total = template.defaultInputs.length;
    return {
      id: pin.id,
      name: pin.name,
      type: 'input',
      slot: `left-${idx}`,
      relativeX: 0,
      relativeY: (idx + 1) / (total + 1),
      state: null,
    };
  });

  const outputs: PinDefinition[] = template.defaultOutputs.map((pin, idx) => {
    const total = template.defaultOutputs.length;
    return {
      id: pin.id,
      name: pin.name,
      type: 'output',
      slot: `right-${idx}`,
      relativeX: 1,
      relativeY: (idx + 1) / (total + 1),
      state: null,
    };
  });

  return {
    id: compId,
    type,
    label: customLabel || template.name.split(' ')[0],
    x,
    y,
    width: template.width,
    height: template.height,
    rotation: 0,
    inputs,
    outputs,
    state: { ...template.defaultState },
  };
}

/**
 * Calculates global canvas coordinates for a given pin
 */
export function getPinCanvasCoordinates(
  component: CircuitComponent,
  pinId: string
): { x: number; y: number } {
  const isInput = component.inputs.some((p) => p.id === pinId);
  const pin = isInput
    ? component.inputs.find((p) => p.id === pinId)
    : component.outputs.find((p) => p.id === pinId);

  if (!pin) {
    return { x: component.x, y: component.y };
  }

  const relX = pin.relativeX !== undefined ? pin.relativeX : isInput ? 0 : 1;
  const relY = pin.relativeY !== undefined ? pin.relativeY : 0.5;

  return {
    x: component.x + relX * component.width,
    y: component.y + relY * component.height,
  };
}
