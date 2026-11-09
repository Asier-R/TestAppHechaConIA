/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCircuitDSL, serializeCircuitToDSL } from './dsl';
import { Schematic } from '../types/circuit';
import { createComponentInstance } from './catalog';

test('parseCircuitDSL parses valid DSL into components and wires', () => {
  const dsl = `CIRCUIT "Detector de Paridad" {
  METADATA {
    author: "Elena"
    version: "2.1.0"
    description: "Circuito de prueba"
  }

  COMPONENTS {
    in1: SWITCH { label: "Bit 0", x: 100, y: 150, state: { isOn: true } }
    in2: SWITCH { label: "Bit 1", x: 100, y: 250, state: { isOn: false } }
    xor1: XOR { label: "XOR-1", x: 300, y: 200 }
    led1: LED { label: "Salida", x: 500, y: 200, state: { color: "#10b981" } }
  }

  WIRES {
    CONNECT in1.out -> xor1.in1
    CONNECT in2.out -> xor1.in2
    CONNECT xor1.out -> led1.in1
  }
}`;

  const result = parseCircuitDSL(dsl);
  assert.equal(result.errors.length, 0);
  assert.equal(result.schematic?.name, 'Detector de Paridad');
  assert.equal(result.schematic?.author, 'Elena');
  assert.equal(result.schematic?.components?.length, 4);
  assert.equal(result.schematic?.wires?.length, 3);

  const sw1 = result.schematic?.components?.find((c) => c.id === 'in1');
  assert.equal(sw1?.state.isOn, true);
});

test('serializeCircuitToDSL outputs valid round-trip DSL syntax', () => {
  const comp1 = createComponentInstance('SWITCH', 80, 100, 'SW1');
  comp1.id = 'sw1';
  comp1.state.isOn = true;

  const comp2 = createComponentInstance('NOT', 240, 100, 'INV1');
  comp2.id = 'inv1';

  const schematic: Schematic = {
    id: 'sch_1',
    name: 'Inversor Simple',
    author: 'Carlos',
    version: '1.0.0',
    description: 'Circuito de prueba unitaria',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    components: [comp1, comp2],
    wires: [
      {
        id: 'w1',
        fromComponentId: 'sw1',
        fromPinId: 'out',
        toComponentId: 'inv1',
        toPinId: 'in1',
        state: 0,
      },
    ],
    customComponents: [],
    commits: [],
    activeBranch: 'main',
  };

  const dslText = serializeCircuitToDSL(schematic);
  assert.ok(dslText.includes('CIRCUIT "Inversor Simple"'));
  assert.ok(dslText.includes('sw1: SWITCH'));
  assert.ok(dslText.includes('inv1: NOT'));
  assert.ok(dslText.includes('CONNECT sw1.out -> inv1.in1'));

  // Parse back to confirm lossless round-trip
  const reparsed = parseCircuitDSL(dslText);
  assert.equal(reparsed.errors.length, 0);
  assert.equal(reparsed.schematic?.components?.length, 2);
  assert.equal(reparsed.schematic?.wires?.length, 1);
});
