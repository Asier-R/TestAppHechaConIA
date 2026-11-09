/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { autoLayoutCircuit } from './autolayout';
import { createComponentInstance } from './catalog';
import { CircuitComponent, CircuitWire } from '../types/circuit';

test('autoLayoutCircuit arranges input and output in topological left-to-right columns', () => {
  const sw = createComponentInstance('SWITCH', 500, 500, 'SW1');
  const gate = createComponentInstance('AND', 10, 10, 'AND1');
  const led = createComponentInstance('LED', 20, 20, 'LED1');

  const components: CircuitComponent[] = [sw, gate, led];
  const wires: CircuitWire[] = [
    { id: 'w1', fromComponentId: sw.id, fromPinId: 'out', toComponentId: gate.id, toPinId: 'in1', state: 0 },
    { id: 'w2', fromComponentId: gate.id, fromPinId: 'out', toComponentId: led.id, toPinId: 'in1', state: 0 },
  ];

  const arranged = autoLayoutCircuit(components, wires, { startX: 100, layerGapX: 200 });

  const swArranged = arranged.find((c) => c.id === sw.id);
  const gateArranged = arranged.find((c) => c.id === gate.id);
  const ledArranged = arranged.find((c) => c.id === led.id);

  assert.ok(swArranged && gateArranged && ledArranged);
  // Input switch should be at column 0 (x=100)
  assert.equal(swArranged.x, 100);
  // Gate should be to right of switch
  assert.ok(gateArranged.x > swArranged.x);
  // Output LED should be to right of gate
  assert.ok(ledArranged.x > gateArranged.x);
});
