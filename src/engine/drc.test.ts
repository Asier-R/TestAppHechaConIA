/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCircuitDRC } from './drc';
import { createComponentInstance } from './catalog';
import { CircuitComponent, CircuitWire } from '../types/circuit';

test('validateCircuitDRC detects output contention when two outputs connect to same input', () => {
  const swA = createComponentInstance('SWITCH', 0, 0, 'SwA');
  const swB = createComponentInstance('SWITCH', 0, 100, 'SwB');
  const andGate = createComponentInstance('AND', 200, 50, 'AND1');

  // Both SwA.out and SwB.out drive andGate.in1 directly
  const wires: CircuitWire[] = [
    { id: 'w1', fromComponentId: swA.id, fromPinId: 'out', toComponentId: andGate.id, toPinId: 'in1', state: 0 },
    { id: 'w2', fromComponentId: swB.id, fromPinId: 'out', toComponentId: andGate.id, toPinId: 'in1', state: 0 },
  ];

  const report = validateCircuitDRC([swA, swB, andGate], wires);

  assert.equal(report.hasErrors, true);
  const contention = report.violations.find((v) => v.code === 'OUTPUT_CONTENTION');
  assert.ok(contention);
  assert.ok(report.conflictingWireIds.has('w1'));
  assert.ok(report.conflictingWireIds.has('w2'));
});

test('validateCircuitDRC detects severe VCC to GND power short circuit', () => {
  const vcc = createComponentInstance('VCC', 0, 0, 'VCC');
  const gnd = createComponentInstance('GND', 0, 100, 'GND');
  const led = createComponentInstance('LED', 200, 50, 'LED');

  const wires: CircuitWire[] = [
    { id: 'w1', fromComponentId: vcc.id, fromPinId: 'out', toComponentId: led.id, toPinId: 'in1', state: 1 },
    { id: 'w2', fromComponentId: gnd.id, fromPinId: 'out', toComponentId: led.id, toPinId: 'in1', state: 0 },
  ];

  const report = validateCircuitDRC([vcc, gnd, led], wires);
  assert.equal(report.hasErrors, true);
  const powerShort = report.violations.find((v) => v.code === 'SHORT_CIRCUIT_POWER');
  assert.ok(powerShort);
});

test('validateCircuitDRC detects floating input pins on gates', () => {
  const sw = createComponentInstance('SWITCH', 0, 0, 'Sw1');
  const andGate = createComponentInstance('AND', 200, 50, 'AND1');

  // Connect only in1; in2 is left floating
  const wires: CircuitWire[] = [
    { id: 'w1', fromComponentId: sw.id, fromPinId: 'out', toComponentId: andGate.id, toPinId: 'in1', state: 0 },
  ];

  const report = validateCircuitDRC([sw, andGate], wires);
  assert.equal(report.hasWarnings, true);
  const floating = report.violations.find((v) => v.code === 'FLOATING_INPUT');
  assert.ok(floating);
  assert.ok(report.floatingPinKeys.has(`${andGate.id}:in2`));
});

test('validateCircuitDRC passes clean circuit without violations', () => {
  const swA = createComponentInstance('SWITCH', 0, 0, 'SwA');
  const swB = createComponentInstance('SWITCH', 0, 100, 'SwB');
  const andGate = createComponentInstance('AND', 200, 50, 'AND1');
  const led = createComponentInstance('LED', 400, 50, 'LED1');

  const wires: CircuitWire[] = [
    { id: 'w1', fromComponentId: swA.id, fromPinId: 'out', toComponentId: andGate.id, toPinId: 'in1', state: 0 },
    { id: 'w2', fromComponentId: swB.id, fromPinId: 'out', toComponentId: andGate.id, toPinId: 'in2', state: 0 },
    { id: 'w3', fromComponentId: andGate.id, fromPinId: 'out', toComponentId: led.id, toPinId: 'in1', state: 0 },
  ];

  const report = validateCircuitDRC([swA, swB, andGate, led], wires);
  assert.equal(report.hasErrors, false);
  assert.equal(report.hasWarnings, false);
  assert.equal(report.violations.length, 0);
});
