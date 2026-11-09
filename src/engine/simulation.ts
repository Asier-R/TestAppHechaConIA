/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CircuitComponent,
  CircuitWire,
  CustomComponentDef,
  LogicValue,
  SimulationStepResult,
} from '../types/circuit';

/**
 * Safely evaluates a boolean logic expression with variables like A, B, C, in1, in2...
 * Operators supported: & (AND), | (OR), ^ (XOR), ~ or ! (NOT), 1, 0, ()
 */
export function evaluateBooleanExpression(
  expr: string,
  env: Record<string, LogicValue>
): LogicValue {
  try {
    let sanitized = expr.toUpperCase();
    // Sort keys by length descending to prevent replacing substrings (e.g. IN10 before IN1)
    const keys = Object.keys(env).sort((a, b) => b.length - a.length);

    for (const key of keys) {
      const val = env[key];
      const bitStr = val === 1 ? '1' : '0';
      const regex = new RegExp(`\\b${key.toUpperCase()}\\b`, 'g');
      sanitized = sanitized.replace(regex, bitStr);
    }

    // Replace logic operators with JS bitwise operators
    sanitized = sanitized
      .replace(/AND/g, '&')
      .replace(/OR/g, '|')
      .replace(/XOR/g, '^')
      .replace(/NOT\s*/g, '~')
      .replace(/!/g, '~');

    // Only allow safe characters: 0, 1, &, |, ^, ~, (, ), spaces
    if (!/^[01&|^~() \t]+$/.test(sanitized)) {
      return 0;
    }

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized});`)();
    return (result & 1) ? 1 : 0;
  } catch {
    return 0;
  }
}

/**
 * Steps the simulation forward by one evaluation pass / clock tick
 */
export function simulateCircuit(
  components: CircuitComponent[],
  wires: CircuitWire[],
  customComponentDefs: CustomComponentDef[] = [],
  options: {
    clockTick?: boolean;
    tickNumber?: number;
  } = {}
): SimulationStepResult {
  // Deep clone components and wires so we don't mutate input props directly
  const compMap = new Map<string, CircuitComponent>();
  for (const c of components) {
    compMap.set(c.id, {
      ...c,
      state: { ...c.state },
      inputs: c.inputs.map((p) => ({ ...p })),
      outputs: c.outputs.map((p) => ({ ...p })),
    });
  }

  const updatedWires: CircuitWire[] = wires.map((w) => ({ ...w }));

  // Helper to get input pin logic level
  const getPinVal = (comp: CircuitComponent, pinId: string): LogicValue => {
    const pin = comp.inputs.find((p) => p.id === pinId);
    return pin ? pin.state ?? 0 : 0;
  };

  const setOutputVal = (comp: CircuitComponent, pinId: string, val: LogicValue) => {
    const pin = comp.outputs.find((p) => p.id === pinId);
    if (pin) {
      pin.state = val;
    }
  };

  // Custom IC lookup
  const customDefsMap = new Map<string, CustomComponentDef>();
  for (const def of customComponentDefs) {
    customDefsMap.set(def.id, def);
  }

  let hasOscillation = false;
  const MAX_ITERATIONS = 25;
  let iteration = 0;
  let stateChanged = true;

  while (stateChanged && iteration < MAX_ITERATIONS) {
    stateChanged = false;
    iteration++;

    // 1. Evaluate every component's outputs based on its inputs & internal state
    for (const comp of compMap.values()) {
      switch (comp.type) {
        // --- INPUTS ---
        case 'SWITCH': {
          const outVal: LogicValue = comp.state.isOn ? 1 : 0;
          const current = comp.outputs[0]?.state;
          if (current !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'BUTTON': {
          const outVal: LogicValue = comp.state.isPressed ? 1 : 0;
          const current = comp.outputs[0]?.state;
          if (current !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'CLOCK': {
          if (options.clockTick) {
            const current = comp.outputs[0]?.state;
            const nextVal: LogicValue = current === 1 ? 0 : 1;
            setOutputVal(comp, 'out', nextVal);
            stateChanged = true;
          }
          break;
        }

        case 'VCC': {
          if (comp.outputs[0]?.state !== 1) {
            setOutputVal(comp, 'out', 1);
            stateChanged = true;
          }
          break;
        }

        case 'GND': {
          if (comp.outputs[0]?.state !== 0) {
            setOutputVal(comp, 'out', 0);
            stateChanged = true;
          }
          break;
        }

        case 'BUS_INPUT_4BIT': {
          const val = comp.state.storedValue ?? 0;
          for (let b = 0; b < 4; b++) {
            const bit = ((val >> b) & 1) ? 1 : 0;
            const p = comp.outputs.find((out) => out.id === `b${b}`);
            if (p && p.state !== bit) {
              p.state = bit;
              stateChanged = true;
            }
          }
          break;
        }

        // --- BASIC GATES ---
        case 'AND': {
          const in1 = getPinVal(comp, 'in1');
          const in2 = getPinVal(comp, 'in2');
          const outVal: LogicValue = in1 === 1 && in2 === 1 ? 1 : 0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'OR': {
          const in1 = getPinVal(comp, 'in1');
          const in2 = getPinVal(comp, 'in2');
          const outVal: LogicValue = in1 === 1 || in2 === 1 ? 1 : 0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'NOT': {
          const in1 = getPinVal(comp, 'in1');
          const outVal: LogicValue = in1 === 1 ? 0 : 1;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'NAND': {
          const in1 = getPinVal(comp, 'in1');
          const in2 = getPinVal(comp, 'in2');
          const outVal: LogicValue = !(in1 === 1 && in2 === 1) ? 1 : 0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'NOR': {
          const in1 = getPinVal(comp, 'in1');
          const in2 = getPinVal(comp, 'in2');
          const outVal: LogicValue = !(in1 === 1 || in2 === 1) ? 1 : 0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'XOR': {
          const in1 = getPinVal(comp, 'in1');
          const in2 = getPinVal(comp, 'in2');
          const outVal: LogicValue = in1 !== in2 ? 1 : 0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'XNOR': {
          const in1 = getPinVal(comp, 'in1');
          const in2 = getPinVal(comp, 'in2');
          const outVal: LogicValue = in1 === in2 ? 1 : 0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'BUFFER': {
          const in1 = getPinVal(comp, 'in1');
          if (comp.outputs[0]?.state !== in1) {
            setOutputVal(comp, 'out', in1);
            stateChanged = true;
          }
          break;
        }

        case 'TRI_STATE': {
          const in1 = getPinVal(comp, 'in1');
          const en = getPinVal(comp, 'enable');
          const outVal: LogicValue = en === 1 ? in1 : null;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        // --- ARITHMETIC & MSI ---
        case 'HALF_ADDER': {
          const a = getPinVal(comp, 'a') === 1 ? 1 : 0;
          const b = getPinVal(comp, 'b') === 1 ? 1 : 0;
          const sum: LogicValue = (a ^ b) as LogicValue;
          const carry: LogicValue = (a & b) as LogicValue;
          if (comp.outputs.find((p) => p.id === 'sum')?.state !== sum) {
            setOutputVal(comp, 'sum', sum);
            stateChanged = true;
          }
          if (comp.outputs.find((p) => p.id === 'carry')?.state !== carry) {
            setOutputVal(comp, 'carry', carry);
            stateChanged = true;
          }
          break;
        }

        case 'FULL_ADDER': {
          const a = getPinVal(comp, 'a') === 1 ? 1 : 0;
          const b = getPinVal(comp, 'b') === 1 ? 1 : 0;
          const cin = getPinVal(comp, 'cin') === 1 ? 1 : 0;
          const sum: LogicValue = (a ^ b ^ cin) as LogicValue;
          const cout: LogicValue = ((a & b) | (cin & (a ^ b))) as LogicValue;
          if (comp.outputs.find((p) => p.id === 'sum')?.state !== sum) {
            setOutputVal(comp, 'sum', sum);
            stateChanged = true;
          }
          if (comp.outputs.find((p) => p.id === 'cout')?.state !== cout) {
            setOutputVal(comp, 'cout', cout);
            stateChanged = true;
          }
          break;
        }

        case 'MUX_2TO1': {
          const i0 = getPinVal(comp, 'i0');
          const i1 = getPinVal(comp, 'i1');
          const sel = getPinVal(comp, 'sel');
          const outVal: LogicValue = sel === 1 ? i1 : i0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'MUX_4TO1': {
          const i0 = getPinVal(comp, 'i0');
          const i1 = getPinVal(comp, 'i1');
          const i2 = getPinVal(comp, 'i2');
          const i3 = getPinVal(comp, 'i3');
          const s0 = getPinVal(comp, 's0') === 1 ? 1 : 0;
          const s1 = getPinVal(comp, 's1') === 1 ? 1 : 0;
          const sel = (s1 << 1) | s0;
          const choices = [i0, i1, i2, i3];
          const outVal = choices[sel] ?? 0;
          if (comp.outputs[0]?.state !== outVal) {
            setOutputVal(comp, 'out', outVal);
            stateChanged = true;
          }
          break;
        }

        case 'DECODER_2TO4': {
          const a0 = getPinVal(comp, 'a0') === 1 ? 1 : 0;
          const a1 = getPinVal(comp, 'a1') === 1 ? 1 : 0;
          const en = getPinVal(comp, 'en') === 1 ? 1 : 0;
          const sel = (a1 << 1) | a0;
          for (let i = 0; i < 4; i++) {
            const outVal: LogicValue = en && sel === i ? 1 : 0;
            const p = comp.outputs.find((o) => o.id === `y${i}`);
            if (p && p.state !== outVal) {
              p.state = outVal;
              stateChanged = true;
            }
          }
          break;
        }

        // --- SEQUENTIAL / MEMORY ---
        case 'FLIPFLOP_D': {
          const clk = getPinVal(comp, 'clk');
          const d = getPinVal(comp, 'd');
          const lastClk = comp.state.lastClk ?? 0;
          // Rising edge detection
          if (lastClk === 0 && clk === 1) {
            comp.state.storedValue = d === 1 ? 1 : 0;
          }
          comp.state.lastClk = clk;
          const qVal: LogicValue = comp.state.storedValue === 1 ? 1 : 0;
          const qBarVal: LogicValue = qVal === 1 ? 0 : 1;
          if (comp.outputs.find((p) => p.id === 'q')?.state !== qVal) {
            setOutputVal(comp, 'q', qVal);
            stateChanged = true;
          }
          if (comp.outputs.find((p) => p.id === 'q_bar')?.state !== qBarVal) {
            setOutputVal(comp, 'q_bar', qBarVal);
            stateChanged = true;
          }
          break;
        }

        case 'FLIPFLOP_JK': {
          const clk = getPinVal(comp, 'clk');
          const j = getPinVal(comp, 'j') === 1 ? 1 : 0;
          const k = getPinVal(comp, 'k') === 1 ? 1 : 0;
          const lastClk = comp.state.lastClk ?? 0;
          if (lastClk === 0 && clk === 1) {
            const curQ = comp.state.storedValue === 1 ? 1 : 0;
            if (j === 0 && k === 1) comp.state.storedValue = 0;
            else if (j === 1 && k === 0) comp.state.storedValue = 1;
            else if (j === 1 && k === 1) comp.state.storedValue = curQ === 1 ? 0 : 1;
          }
          comp.state.lastClk = clk;
          const qVal: LogicValue = comp.state.storedValue === 1 ? 1 : 0;
          const qBarVal: LogicValue = qVal === 1 ? 0 : 1;
          if (comp.outputs.find((p) => p.id === 'q')?.state !== qVal) {
            setOutputVal(comp, 'q', qVal);
            stateChanged = true;
          }
          if (comp.outputs.find((p) => p.id === 'q_bar')?.state !== qBarVal) {
            setOutputVal(comp, 'q_bar', qBarVal);
            stateChanged = true;
          }
          break;
        }

        case 'FLIPFLOP_T': {
          const clk = getPinVal(comp, 'clk');
          const t = getPinVal(comp, 't') === 1 ? 1 : 0;
          const lastClk = comp.state.lastClk ?? 0;
          if (lastClk === 0 && clk === 1 && t === 1) {
            comp.state.storedValue = comp.state.storedValue === 1 ? 0 : 1;
          }
          comp.state.lastClk = clk;
          const qVal: LogicValue = comp.state.storedValue === 1 ? 1 : 0;
          const qBarVal: LogicValue = qVal === 1 ? 0 : 1;
          if (comp.outputs.find((p) => p.id === 'q')?.state !== qVal) {
            setOutputVal(comp, 'q', qVal);
            stateChanged = true;
          }
          if (comp.outputs.find((p) => p.id === 'q_bar')?.state !== qBarVal) {
            setOutputVal(comp, 'q_bar', qBarVal);
            stateChanged = true;
          }
          break;
        }

        case 'SR_LATCH': {
          const s = getPinVal(comp, 's') === 1 ? 1 : 0;
          const r = getPinVal(comp, 'r') === 1 ? 1 : 0;
          if (s === 1 && r === 0) comp.state.storedValue = 1;
          else if (s === 0 && r === 1) comp.state.storedValue = 0;
          const qVal: LogicValue = comp.state.storedValue === 1 ? 1 : 0;
          const qBarVal: LogicValue = qVal === 1 ? 0 : 1;
          if (comp.outputs.find((p) => p.id === 'q')?.state !== qVal) {
            setOutputVal(comp, 'q', qVal);
            stateChanged = true;
          }
          if (comp.outputs.find((p) => p.id === 'q_bar')?.state !== qBarVal) {
            setOutputVal(comp, 'q_bar', qBarVal);
            stateChanged = true;
          }
          break;
        }

        case 'COUNTER_4BIT': {
          const clk = getPinVal(comp, 'clk');
          const rst = getPinVal(comp, 'rst');
          const en = getPinVal(comp, 'en') ?? 1; // Default enabled
          const lastClk = comp.state.lastClk ?? 0;
          if (rst === 1) {
            comp.state.storedValue = 0;
          } else if (lastClk === 0 && clk === 1 && en === 1) {
            comp.state.storedValue = ((comp.state.storedValue ?? 0) + 1) % 16;
          }
          comp.state.lastClk = clk;
          const val = comp.state.storedValue ?? 0;
          for (let b = 0; b < 4; b++) {
            const bit = ((val >> b) & 1) ? 1 : 0;
            const p = comp.outputs.find((o) => o.id === `q${b}`);
            if (p && p.state !== bit) {
              p.state = bit;
              stateChanged = true;
            }
          }
          const carry = val === 15 ? 1 : 0;
          const pCarry = comp.outputs.find((o) => o.id === 'carry');
          if (pCarry && pCarry.state !== carry) {
            pCarry.state = carry;
            stateChanged = true;
          }
          break;
        }

        case 'REGISTER_4BIT': {
          const clk = getPinVal(comp, 'clk');
          const load = getPinVal(comp, 'load') === 1 ? 1 : 0;
          const lastClk = comp.state.lastClk ?? 0;
          if (lastClk === 0 && clk === 1 && load === 1) {
            let loaded = 0;
            for (let b = 0; b < 4; b++) {
              if (getPinVal(comp, `d${b}`) === 1) {
                loaded |= 1 << b;
              }
            }
            comp.state.storedValue = loaded;
          }
          comp.state.lastClk = clk;
          const val = comp.state.storedValue ?? 0;
          for (let b = 0; b < 4; b++) {
            const bit = ((val >> b) & 1) ? 1 : 0;
            const p = comp.outputs.find((o) => o.id === `q${b}`);
            if (p && p.state !== bit) {
              p.state = bit;
              stateChanged = true;
            }
          }
          break;
        }

        // --- OUTPUTS (Display & Indicators) ---
        case 'LED': {
          const inVal = getPinVal(comp, 'in1');
          comp.state.isOn = inVal === 1;
          break;
        }

        case 'DISPLAY_HEX': {
          const d0 = getPinVal(comp, 'd0') === 1 ? 1 : 0;
          const d1 = getPinVal(comp, 'd1') === 1 ? 1 : 0;
          const d2 = getPinVal(comp, 'd2') === 1 ? 1 : 0;
          const d3 = getPinVal(comp, 'd3') === 1 ? 1 : 0;
          const hexNum = d0 | (d1 << 1) | (d2 << 2) | (d3 << 3);
          comp.state.storedValue = hexNum;
          break;
        }

        case 'DISPLAY_7SEG': {
          // Keep tracks of pins a..g
          break;
        }

        case 'PROBE': {
          comp.state.probeValue = getPinVal(comp, 'in1');
          break;
        }

        case 'BUZZER': {
          comp.state.isOn = getPinVal(comp, 'in1') === 1;
          break;
        }

        // --- CUSTOM IC ---
        case 'CUSTOM_IC': {
          const defId = comp.state.customIcId;
          const def = defId ? customDefsMap.get(defId) : undefined;
          if (def) {
            const env: Record<string, LogicValue> = {};
            for (const inputPin of comp.inputs) {
              env[inputPin.name] = inputPin.state ?? 0;
              env[inputPin.id] = inputPin.state ?? 0;
            }

            if (def.logicExpressions) {
              for (const [outPinName, expression] of Object.entries(def.logicExpressions)) {
                const targetPin = comp.outputs.find(
                  (p) => p.name === outPinName || p.id === outPinName
                );
                if (targetPin) {
                  const evalVal = evaluateBooleanExpression(expression, env);
                  if (targetPin.state !== evalVal) {
                    targetPin.state = evalVal;
                    stateChanged = true;
                  }
                }
              }
            } else if (def.truthTable) {
              // Match input pattern
              const inputTuple = def.inputs.map((inp) => (env[inp.id] === 1 ? 1 : 0));
              const match = def.truthTable.find((row) =>
                row.inputs.every((bit, idx) => bit === inputTuple[idx])
              );
              if (match) {
                def.outputs.forEach((outDef, idx) => {
                  const targetPin = comp.outputs.find((p) => p.id === outDef.id);
                  const bitVal: LogicValue = match.outputs[idx] === 1 ? 1 : 0;
                  if (targetPin && targetPin.state !== bitVal) {
                    targetPin.state = bitVal;
                    stateChanged = true;
                  }
                });
              }
            }
          }
          break;
        }
      }
    }

    // 2. Propagate signals across all wires
    // Map: toComponentId + ':' + toPinId -> LogicValue
    const wireSignals = new Map<string, LogicValue>();

    for (const wire of updatedWires) {
      const srcComp = compMap.get(wire.fromComponentId);
      const srcPin = srcComp?.outputs.find((p) => p.id === wire.fromPinId);
      const currentSrcVal: LogicValue = srcPin ? srcPin.state ?? 0 : 0;

      wire.state = currentSrcVal;
      const targetKey = `${wire.toComponentId}:${wire.toPinId}`;

      // If multiple drivers connect to same input, OR or conflict logic
      const prev = wireSignals.get(targetKey);
      if (prev === undefined) {
        wireSignals.set(targetKey, currentSrcVal);
      } else {
        wireSignals.set(targetKey, (prev === 1 || currentSrcVal === 1 ? 1 : 0) as LogicValue);
      }
    }

    // Apply wire signals to inputs of receiving components
    for (const [key, val] of wireSignals.entries()) {
      const [compId, pinId] = key.split(':');
      const targetComp = compMap.get(compId);
      if (targetComp) {
        const pin = targetComp.inputs.find((p) => p.id === pinId);
        if (pin && pin.state !== val) {
          pin.state = val;
          stateChanged = true;
        }
      }
    }
  }

  if (iteration >= MAX_ITERATIONS) {
    hasOscillation = true;
  }

  const resultComponents = Array.from(compMap.values());
  const activeSignalsCount = updatedWires.filter((w) => w.state === 1).length;

  return {
    components: resultComponents,
    wires: updatedWires,
    hasOscillation,
    activeSignalsCount,
  };
}
