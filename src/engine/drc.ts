/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, CircuitWire } from '../types/circuit';

export type DrcSeverity = 'error' | 'warning' | 'info';

export interface DrcViolation {
  id: string;
  code:
    | 'OUTPUT_CONTENTION'
    | 'FLOATING_INPUT'
    | 'SHORT_CIRCUIT_POWER'
    | 'ORPHAN_WIRE'
    | 'COMBINATIONAL_LOOP'
    | 'FANOUT_HIGH';
  severity: DrcSeverity;
  title: string;
  message: string;
  componentIds: string[];
  wireIds: string[];
  pinIds: string[];
  fixSuggestion: string;
}

export interface DrcReport {
  hasErrors: boolean;
  hasWarnings: boolean;
  violations: DrcViolation[];
  conflictingWireIds: Set<string>;
  conflictingComponentIds: Set<string>;
  floatingPinKeys: Set<string>; // "componentId:pinId"
}

/**
 * Executes Real-Time Design Rule Check (DRC) on the circuit schematic.
 * Analyzes electrical connectivity, pin compatibility, contention, and floating nodes.
 */
export function validateCircuitDRC(
  components: CircuitComponent[],
  wires: CircuitWire[]
): DrcReport {
  const violations: DrcViolation[] = [];
  const conflictingWireIds = new Set<string>();
  const conflictingComponentIds = new Set<string>();
  const floatingPinKeys = new Set<string>();

  const compMap = new Map<string, CircuitComponent>();
  for (const c of components) {
    compMap.set(c.id, c);
  }

  // 1. Check for Orphan / Disconnected Wires
  for (const wire of wires) {
    const fromComp = compMap.get(wire.fromComponentId);
    const toComp = compMap.get(wire.toComponentId);

    const fromPin = fromComp?.outputs.find((p) => p.id === wire.fromPinId);
    const toPin = toComp?.inputs.find((p) => p.id === wire.toPinId);

    if (!fromComp || !toComp || !fromPin || !toPin) {
      violations.push({
        id: `drc_orphan_${wire.id}`,
        code: 'ORPHAN_WIRE',
        severity: 'error',
        title: 'Cable Huérfano / Desconectado',
        message: `El cable conecta a un componente o terminal que ya no existe.`,
        componentIds: [wire.fromComponentId, wire.toComponentId].filter((id) => compMap.has(id)),
        wireIds: [wire.id],
        pinIds: [wire.fromPinId, wire.toPinId],
        fixSuggestion: 'Elimina este cable o reconéctalo a terminales válidos.',
      });
      conflictingWireIds.add(wire.id);
    }
  }

  // 2. Build Ingress Wire Map per Input Pin: "targetCompId:targetPinId" -> wires[]
  const inputPinDrivers = new Map<string, CircuitWire[]>();
  for (const wire of wires) {
    const key = `${wire.toComponentId}:${wire.toPinId}`;
    if (!inputPinDrivers.has(key)) {
      inputPinDrivers.set(key, []);
    }
    inputPinDrivers.get(key)!.push(wire);
  }

  // 3. Electrical Contention / Multiple Outputs Driving Same Input Pin Directly
  for (const [key, driverWires] of inputPinDrivers.entries()) {
    if (driverWires.length > 1) {
      const [targetCompId, targetPinId] = key.split(':');
      const targetComp = compMap.get(targetCompId);
      const targetPin = targetComp?.inputs.find((p) => p.id === targetPinId);

      const driverCompNames: string[] = [];
      const driverCompIds: string[] = [];
      let isPowerShort = false;

      let hasVcc = false;
      let hasGnd = false;

      for (const w of driverWires) {
        conflictingWireIds.add(w.id);
        const srcComp = compMap.get(w.fromComponentId);
        if (srcComp) {
          driverCompNames.push(`${srcComp.label}.${w.fromPinId}`);
          driverCompIds.push(srcComp.id);
          conflictingComponentIds.add(srcComp.id);
          if (srcComp.type === 'VCC') hasVcc = true;
          if (srcComp.type === 'GND') hasGnd = true;
        }
      }

      if (hasVcc && hasGnd) {
        isPowerShort = true;
      }

      if (targetComp) {
        conflictingComponentIds.add(targetComp.id);
      }

      if (isPowerShort) {
        violations.push({
          id: `drc_short_power_${key}`,
          code: 'SHORT_CIRCUIT_POWER',
          severity: 'error',
          title: 'Cortocircuito Severo de Alimentación (VCC a GND)',
          message: `Línea de alimentación VCC conectada directamente a GND en el nodo de entrada '${targetComp?.label || ''}.${targetPin?.name || targetPinId}'.`,
          componentIds: [...driverCompIds, targetCompId],
          wireIds: driverWires.map((w) => w.id),
          pinIds: [targetPinId],
          fixSuggestion: 'Separa de inmediato las líneas de VCC y GND para evitar conflicto eléctrico.',
        });
      } else {
        violations.push({
          id: `drc_contention_${key}`,
          code: 'OUTPUT_CONTENTION',
          severity: 'error',
          title: 'Conflicto Eléctrico: Salidas en Conflicto',
          message: `Múltiples salidas (${driverCompNames.join(', ')}) están conectadas directamente entre sí en el pin '${targetComp?.label || ''}.${targetPin?.name || targetPinId}'.`,
          componentIds: [...driverCompIds, targetCompId],
          wireIds: driverWires.map((w) => w.id),
          pinIds: [targetPinId],
          fixSuggestion: 'Utiliza una compuerta OR, un multiplexor o buffers tri-estado para combinar estas señales.',
        });
      }
    }
  }

  // 4. Check for Floating Inputs (Desconectadas)
  // Components where inputs must be driven: Gates, Flip-Flops, Adders, Displays, LEDs, MUX
  const passiveInputTypes = new Set([
    'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER', 'TRI_STATE',
    'HALF_ADDER', 'FULL_ADDER', 'MUX_2TO1', 'MUX_4TO1', 'DECODER_2TO4',
    'FLIPFLOP_D', 'FLIPFLOP_JK', 'FLIPFLOP_T', 'SR_LATCH', 'COUNTER_4BIT', 'REGISTER_4BIT',
    'LED', 'DISPLAY_7SEG', 'DISPLAY_HEX', 'PROBE', 'BUZZER'
  ]);

  for (const comp of components) {
    if (!passiveInputTypes.has(comp.type)) continue;

    for (const inPin of comp.inputs) {
      // Optional inputs can be skipped if specified (e.g. reset/en on counter can have default 1/0, but good to flag)
      const pinKey = `${comp.id}:${inPin.id}`;
      const drivers = inputPinDrivers.get(pinKey);

      if (!drivers || drivers.length === 0) {
        floatingPinKeys.add(pinKey);
        // Only mark components if it has critical floating inputs
        if (['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'FULL_ADDER', 'HALF_ADDER'].includes(comp.type)) {
          conflictingComponentIds.add(comp.id);
        }

        violations.push({
          id: `drc_floating_${pinKey}`,
          code: 'FLOATING_INPUT',
          severity: 'warning',
          title: 'Terminal de Entrada Flotante',
          message: `El pin de entrada '${inPin.name}' en '${comp.label}' (${comp.type}) está sin conectar.`,
          componentIds: [comp.id],
          wireIds: [],
          pinIds: [inPin.id],
          fixSuggestion: 'Conecta esta entrada a un interruptor, VCC (1), GND (0) o a la salida de otra compuerta.',
        });
      }
    }
  }

  // 5. Fan-Out Overload Check (> 8 gate inputs driven by single output)
  const outputFanOut = new Map<string, number>();
  for (const wire of wires) {
    const key = `${wire.fromComponentId}:${wire.fromPinId}`;
    outputFanOut.set(key, (outputFanOut.get(key) || 0) + 1);
  }

  for (const [key, count] of outputFanOut.entries()) {
    if (count > 8) {
      const [srcCompId, srcPinId] = key.split(':');
      const srcComp = compMap.get(srcCompId);
      violations.push({
        id: `drc_fanout_${key}`,
        code: 'FANOUT_HIGH',
        severity: 'info',
        title: 'Carga Elevada de Fan-Out',
        message: `La salida '${srcComp?.label || ''}.${srcPinId}' está alimentando a ${count} compuertas simultáneamente.`,
        componentIds: [srcCompId],
        wireIds: [],
        pinIds: [srcPinId],
        fixSuggestion: 'Considera insertar un Buffer intermedio para regenerar la capacidad de corriente de la señal.',
      });
    }
  }

  return {
    hasErrors: violations.some((v) => v.severity === 'error'),
    hasWarnings: violations.some((v) => v.severity === 'warning'),
    violations,
    conflictingWireIds,
    conflictingComponentIds,
    floatingPinKeys,
  };
}
