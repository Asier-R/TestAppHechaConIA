/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadPresetSchematic, PRESET_CIRCUITS } from './presets';
import { simulateCircuit } from './simulation';
import { validateCircuitDRC } from './drc';

describe('Calculator circuit preset verification', () => {
  it('loads calculator_2bit_alu preset and parses all components and wires', () => {
    const calcSchematic = loadPresetSchematic('calculator_2bit_alu');
    assert.ok(calcSchematic, 'Schematic should be loaded');
    assert.strictEqual(calcSchematic.name, 'Calculadora Aritmética 2-Bit (Suma / Resta)');
    assert.ok(calcSchematic.components.length >= 10, 'Should have at least 10 components');
    assert.ok(calcSchematic.wires.length >= 12, 'Should have at least 12 wires');
  });

  it('calculator_2bit_alu passes real-time DRC with 0 errors', () => {
    const calcSchematic = loadPresetSchematic('calculator_2bit_alu');
    const drc = validateCircuitDRC(calcSchematic.components, calcSchematic.wires);
    assert.strictEqual(drc.hasErrors, false, 'Calculator preset should not have electrical contention or shorts');
    assert.strictEqual(drc.conflictingWireIds.size, 0);
  });

  it('calculator_2bit_alu calculates 3 + 1 = 4 in addition mode', () => {
    const calcSchematic = loadPresetSchematic('calculator_2bit_alu');
    // Default: A=3 (a0=1, a1=1), B=1 (b0=1, b1=0), Op=0 (Suma)
    const result = simulateCircuit(calcSchematic.components, calcSchematic.wires, []);

    // Check display HEX value
    const hexDisp = result.components.find((c) => c.type === 'DISPLAY_HEX');
    assert.ok(hexDisp, 'DISPLAY_HEX must exist');
    assert.strictEqual(hexDisp.state.storedValue, 4, '3 + 1 should equal 4 on HEX display');

    // Check LEDs
    const ledS0 = result.components.find((c) => c.label === 'Bit S0');
    const ledS1 = result.components.find((c) => c.label === 'Bit S1');
    const ledCout = result.components.find((c) => c.label === 'Acarreo / Signo');
    assert.strictEqual(ledS0?.state.isOn, false, 'Bit 0 of 4 (100b) is 0');
    assert.strictEqual(ledS1?.state.isOn, false, 'Bit 1 of 4 (100b) is 0');
    assert.strictEqual(ledCout?.state.isOn, true, 'Carry bit of 4 (100b) is 1');
  });

  it('calculator_2bit_alu calculates 3 - 1 = 2 in subtraction mode', () => {
    const calcSchematic = loadPresetSchematic('calculator_2bit_alu');
    // Set Modo Resta: sw_op isOn = true
    const updatedComponents = calcSchematic.components.map((c) => {
      if (c.id === 'sw_op') {
        return { ...c, state: { ...c.state, isOn: true } };
      }
      return c;
    });

    const result = simulateCircuit(updatedComponents, calcSchematic.wires, []);

    const hexDisp = result.components.find((c) => c.type === 'DISPLAY_HEX');
    assert.strictEqual(hexDisp?.state.storedValue, 2, '3 - 1 should equal 2 on HEX display');

    const ledS0 = result.components.find((c) => c.label === 'Bit S0');
    const ledS1 = result.components.find((c) => c.label === 'Bit S1');
    assert.strictEqual(ledS0?.state.isOn, false, 'Bit 0 of 2 (10b) is 0');
    assert.strictEqual(ledS1?.state.isOn, true, 'Bit 1 of 2 (10b) is 1');
  });
});
