/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateCircuit, evaluateBooleanExpression } from './simulation';
import { createComponentInstance } from './catalog';
import { CircuitComponent, CircuitWire, CustomComponentDef } from '../types/circuit';

test('evaluateBooleanExpression correctly calculates logic formulas', () => {
  assert.equal(evaluateBooleanExpression('A & B', { A: 1, B: 1 }), 1);
  assert.equal(evaluateBooleanExpression('A & B', { A: 1, B: 0 }), 0);
  assert.equal(evaluateBooleanExpression('A | B', { A: 0, B: 1 }), 1);
  assert.equal(evaluateBooleanExpression('~A', { A: 1 }), 0);
  assert.equal(evaluateBooleanExpression('~A', { A: 0 }), 1);
  assert.equal(evaluateBooleanExpression('A ^ B', { A: 1, B: 0 }), 1);
  assert.equal(evaluateBooleanExpression('A ^ B', { A: 1, B: 1 }), 0);
  assert.equal(evaluateBooleanExpression('(A & B) | (~C)', { A: 1, B: 0, C: 0 }), 1);
});

test('simulateCircuit evaluates basic AND gate with switch inputs', () => {
  const swA = createComponentInstance('SWITCH', 0, 0, 'SwA');
  swA.state.isOn = true;

  const swB = createComponentInstance('SWITCH', 0, 100, 'SwB');
  swB.state.isOn = true;

  const andGate = createComponentInstance('AND', 200, 50, 'AND1');
  const led = createComponentInstance('LED', 350, 50, 'LED1');

  const components: CircuitComponent[] = [swA, swB, andGate, led];
  const wires: CircuitWire[] = [
    {
      id: 'w1',
      fromComponentId: swA.id,
      fromPinId: 'out',
      toComponentId: andGate.id,
      toPinId: 'in1',
      state: 0,
    },
    {
      id: 'w2',
      fromComponentId: swB.id,
      fromPinId: 'out',
      toComponentId: andGate.id,
      toPinId: 'in2',
      state: 0,
    },
    {
      id: 'w3',
      fromComponentId: andGate.id,
      fromPinId: 'out',
      toComponentId: led.id,
      toPinId: 'in1',
      state: 0,
    },
  ];

  const result = simulateCircuit(components, wires);
  const updatedLed = result.components.find((c) => c.id === led.id);
  assert.equal(updatedLed?.state.isOn, true);
  assert.equal(result.hasOscillation, false);

  // Turn SwB OFF
  swB.state.isOn = false;
  const result2 = simulateCircuit([swA, swB, andGate, led], wires);
  const updatedLed2 = result2.components.find((c) => c.id === led.id);
  assert.equal(updatedLed2?.state.isOn, false);
});

test('simulateCircuit correctly evaluates Full Adder 1 + 1 + 0 = Sum 0, Cout 1', () => {
  const swA = createComponentInstance('SWITCH', 0, 0);
  swA.state.isOn = true;
  const swB = createComponentInstance('SWITCH', 0, 100);
  swB.state.isOn = true;
  const swCin = createComponentInstance('SWITCH', 0, 200);
  swCin.state.isOn = false;

  const fa = createComponentInstance('FULL_ADDER', 200, 100);

  const wires: CircuitWire[] = [
    { id: 'w1', fromComponentId: swA.id, fromPinId: 'out', toComponentId: fa.id, toPinId: 'a', state: 0 },
    { id: 'w2', fromComponentId: swB.id, fromPinId: 'out', toComponentId: fa.id, toPinId: 'b', state: 0 },
    { id: 'w3', fromComponentId: swCin.id, fromPinId: 'out', toComponentId: fa.id, toPinId: 'cin', state: 0 },
  ];

  const result = simulateCircuit([swA, swB, swCin, fa], wires);
  const resFa = result.components.find((c) => c.id === fa.id);
  const sumPin = resFa?.outputs.find((p) => p.id === 'sum');
  const coutPin = resFa?.outputs.find((p) => p.id === 'cout');

  assert.equal(sumPin?.state, 0);
  assert.equal(coutPin?.state, 1);
});

test('simulateCircuit evaluates custom IC with user-defined logic expressions', () => {
  const customDef: CustomComponentDef = {
    id: 'CHIP_MAJ3',
    name: 'Mayoría de 3 Bits',
    abbreviation: 'MAJ3',
    description: '1 si 2 o más entradas son 1',
    category: 'custom',
    color: '#8b5cf6',
    inputs: [
      { id: 'in_0', name: 'A' },
      { id: 'in_1', name: 'B' },
      { id: 'in_2', name: 'C' },
    ],
    outputs: [{ id: 'out_0', name: 'Y' }],
    logicExpressions: {
      Y: '(A & B) | (A & C) | (B & C)',
    },
    createdAt: new Date().toISOString(),
  };

  const swA = createComponentInstance('SWITCH', 0, 0);
  swA.state.isOn = true;
  const swB = createComponentInstance('SWITCH', 0, 100);
  swB.state.isOn = true;
  const swC = createComponentInstance('SWITCH', 0, 200);
  swC.state.isOn = false;

  const customComp = createComponentInstance('CUSTOM_IC', 200, 100, 'MajBlock', customDef);

  const wires: CircuitWire[] = [
    { id: 'w1', fromComponentId: swA.id, fromPinId: 'out', toComponentId: customComp.id, toPinId: 'in_0', state: 0 },
    { id: 'w2', fromComponentId: swB.id, fromPinId: 'out', toComponentId: customComp.id, toPinId: 'in_1', state: 0 },
    { id: 'w3', fromComponentId: swC.id, fromPinId: 'out', toComponentId: customComp.id, toPinId: 'in_2', state: 0 },
  ];

  const result = simulateCircuit([swA, swB, swC, customComp], wires, [customDef]);
  const resComp = result.components.find((c) => c.id === customComp.id);
  const outPin = resComp?.outputs.find((p) => p.id === 'out_0');
  assert.equal(outPin?.state, 1);
});
