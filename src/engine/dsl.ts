/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CircuitComponent,
  CircuitWire,
  ComponentType,
  CustomComponentDef,
  Schematic,
} from '../types/circuit';
import { createComponentInstance, getTemplateByType } from './catalog';

export interface ParseResult {
  schematic?: Partial<Schematic>;
  errors: string[];
}

/**
 * Serializes a full schematic into formal Circuit DSL / HDL text
 */
export function serializeCircuitToDSL(schematic: Schematic): string {
  const lines: string[] = [];

  lines.push(`CIRCUIT "${schematic.name || 'Circuito_Sin_Nombre'}" {`);
  lines.push(`  METADATA {`);
  lines.push(`    author: "${schematic.author || 'Usuario'}"`);
  lines.push(`    version: "${schematic.version || '1.0.0'}"`);
  lines.push(`    description: "${(schematic.description || '').replace(/"/g, '\\"')}"`);
  lines.push(`  }`);
  lines.push(``);

  if (schematic.customComponents && schematic.customComponents.length > 0) {
    lines.push(`  CUSTOM_CHIPS {`);
    for (const chip of schematic.customComponents) {
      lines.push(`    CHIP ${chip.id} {`);
      lines.push(`      name: "${chip.name}"`);
      lines.push(`      abbreviation: "${chip.abbreviation}"`);
      lines.push(`      color: "${chip.color}"`);
      lines.push(`      inputs: [${chip.inputs.map((i) => `"${i.name}"`).join(', ')}]`);
      lines.push(`      outputs: [${chip.outputs.map((o) => `"${o.name}"`).join(', ')}]`);
      if (chip.logicExpressions) {
        lines.push(`      expressions: {`);
        for (const [outPin, expr] of Object.entries(chip.logicExpressions)) {
          lines.push(`        "${outPin}": "${expr}"`);
        }
        lines.push(`      }`);
      }
      lines.push(`    }`);
    }
    lines.push(`  }`);
    lines.push(``);
  }

  lines.push(`  COMPONENTS {`);
  for (const comp of schematic.components) {
    const stateEntries: string[] = [];
    if (comp.state) {
      if (comp.state.isOn !== undefined) stateEntries.push(`isOn: ${comp.state.isOn}`);
      if (comp.state.frequencyHz !== undefined) stateEntries.push(`freq: ${comp.state.frequencyHz}`);
      if (comp.state.storedValue !== undefined) stateEntries.push(`val: ${comp.state.storedValue}`);
      if (comp.state.color !== undefined) stateEntries.push(`color: "${comp.state.color}"`);
      if (comp.state.customIcId !== undefined) stateEntries.push(`customIcId: "${comp.state.customIcId}"`);
    }

    const stateStr = stateEntries.length > 0 ? `, state: { ${stateEntries.join(', ')} }` : '';
    const rotStr = comp.rotation ? `, rot: ${comp.rotation}` : '';

    lines.push(
      `    ${comp.id}: ${comp.type} { label: "${comp.label}", x: ${Math.round(comp.x)}, y: ${Math.round(comp.y)}${rotStr}${stateStr} }`
    );
  }
  lines.push(`  }`);
  lines.push(``);

  lines.push(`  WIRES {`);
  for (const wire of schematic.wires) {
    lines.push(
      `    CONNECT ${wire.fromComponentId}.${wire.fromPinId} -> ${wire.toComponentId}.${wire.toPinId}`
    );
  }
  lines.push(`  }`);
  lines.push(`}`);

  return lines.join('\n');
}

/**
 * Parses formal Circuit DSL / HDL text into a Schematic object with robust error recovery
 */
export function parseCircuitDSL(dslText: string): ParseResult {
  const errors: string[] = [];
  const components: CircuitComponent[] = [];
  const wires: CircuitWire[] = [];
  const customComponents: CustomComponentDef[] = [];

  let name = 'Circuito Importado';
  let author = 'Ingeniero';
  let version = '1.0.0';
  let description = '';

  const cleanText = dslText.trim();
  if (!cleanText) {
    return { errors: ['El archivo de descripción formal está vacío'] };
  }

  // Extract circuit name
  const circuitMatch = cleanText.match(/CIRCUIT\s+"([^"]+)"/i);
  if (circuitMatch) {
    name = circuitMatch[1];
  }

  // Extract metadata
  const authorMatch = cleanText.match(/author:\s*"([^"]+)"/i);
  if (authorMatch) author = authorMatch[1];

  const versionMatch = cleanText.match(/version:\s*"([^"]+)"/i);
  if (versionMatch) version = versionMatch[1];

  const descMatch = cleanText.match(/description:\s*"([^"]*)"/i);
  if (descMatch) description = descMatch[1];

  // Parse Custom Chips
  const chipBlockMatch = cleanText.match(/CUSTOM_CHIPS\s*\{([\s\S]*?)\}\s*(?=COMPONENTS|WIRES|$)/i);
  if (chipBlockMatch) {
    const chipText = chipBlockMatch[1];
    const chipRegex = /CHIP\s+([A-Za-z0-9_]+)\s*\{([\s\S]*?)\}/g;
    let chipMatch: RegExpExecArray | null;
    while ((chipMatch = chipRegex.exec(chipText)) !== null) {
      const chipId = chipMatch[1];
      const chipBody = chipMatch[2];

      const chipName = chipBody.match(/name:\s*"([^"]+)"/i)?.[1] || chipId;
      const chipAbbr = chipBody.match(/abbreviation:\s*"([^"]+)"/i)?.[1] || chipId.slice(0, 4);
      const chipColor = chipBody.match(/color:\s*"([^"]+)"/i)?.[1] || '#6366f1';

      const inputsRaw = chipBody.match(/inputs:\s*\[(.*?)\]/i)?.[1] || '';
      const outputsRaw = chipBody.match(/outputs:\s*\[(.*?)\]/i)?.[1] || '';

      const inputs = inputsRaw
        .split(',')
        .map((s) => s.replace(/["\s]/g, ''))
        .filter(Boolean)
        .map((name, idx) => ({ id: `in_${idx}`, name }));

      const outputs = outputsRaw
        .split(',')
        .map((s) => s.replace(/["\s]/g, ''))
        .filter(Boolean)
        .map((name, idx) => ({ id: `out_${idx}`, name }));

      const expressions: Record<string, string> = {};
      const exprBlock = chipBody.match(/expressions:\s*\{([\s\S]*?)\}/i)?.[1];
      if (exprBlock) {
        const exprLineRegex = /"([^"]+)"\s*:\s*"([^"]+)"/g;
        let exprMatch: RegExpExecArray | null;
        while ((exprMatch = exprLineRegex.exec(exprBlock)) !== null) {
          expressions[exprMatch[1]] = exprMatch[2];
        }
      }

      customComponents.push({
        id: chipId,
        name: chipName,
        abbreviation: chipAbbr,
        description: 'Chip personalizado definido en HDL',
        category: 'custom',
        color: chipColor,
        inputs,
        outputs,
        logicExpressions: Object.keys(expressions).length > 0 ? expressions : undefined,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Parse Components
  const compBlockMatch = cleanText.match(/COMPONENTS\s*\{([\s\S]*?)\}\s*(?=WIRES|$)/i);
  if (!compBlockMatch) {
    errors.push("Bloque 'COMPONENTS { ... }' no encontrado en el archivo DSL");
  } else {
    const compLines = compBlockMatch[1].split('\n');
    for (const rawLine of compLines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('#')) continue;

      // Format: id: TYPE { label: "...", x: 100, y: 150, rot: 0, state: { ... } }
      const match = line.match(
        /^([a-zA-Z0-9_-]+)\s*:\s*([A-Za-z0-9_]+)\s*\{([\s\S]*)\}$/
      );

      if (!match) {
        errors.push(`Sintaxis inválida en componente: "${line}"`);
        continue;
      }

      const id = match[1];
      const rawType = match[2].toUpperCase() as ComponentType;
      const propsStr = match[3];

      const labelMatch = propsStr.match(/label:\s*"([^"]*)"/i);
      const label = labelMatch ? labelMatch[1] : id;

      const xMatch = propsStr.match(/x:\s*(-?\d+)/i);
      const yMatch = propsStr.match(/y:\s*(-?\d+)/i);
      const x = xMatch ? parseInt(xMatch[1], 10) : 100;
      const y = yMatch ? parseInt(yMatch[1], 10) : 100;

      const rotMatch = propsStr.match(/rot:\s*(\d+)/i);
      const rot = rotMatch ? (parseInt(rotMatch[1], 10) as 0 | 90 | 180 | 270) : 0;

      // Custom chip check
      const customDef = customComponents.find((c) => c.id === rawType || c.id === id);
      const targetType = customDef ? 'CUSTOM_IC' : rawType;

      const template = getTemplateByType(targetType);
      if (!template && !customDef) {
        errors.push(`Tipo de componente desconocido "${rawType}" en componente ${id}`);
        continue;
      }

      const comp = createComponentInstance(targetType, x, y, label, customDef);
      comp.id = id;
      comp.rotation = rot;

      // Parse custom state
      if (propsStr.includes('isOn: true')) comp.state.isOn = true;
      if (propsStr.includes('isOn: false')) comp.state.isOn = false;
      const freqMatch = propsStr.match(/freq:\s*([\d.]+)/i);
      if (freqMatch) comp.state.frequencyHz = parseFloat(freqMatch[1]);
      const valMatch = propsStr.match(/val:\s*(\d+)/i);
      if (valMatch) comp.state.storedValue = parseInt(valMatch[1], 10);
      const colorMatch = propsStr.match(/color:\s*"([^"]+)"/i);
      if (colorMatch) comp.state.color = colorMatch[1];
      const customIcIdMatch = propsStr.match(/customIcId:\s*"([^"]+)"/i);
      if (customIcIdMatch) comp.state.customIcId = customIcIdMatch[1];

      components.push(comp);
    }
  }

  // Parse Wires
  const wireBlockMatch = cleanText.match(/WIRES\s*\{([\s\S]*?)\}/i);
  if (wireBlockMatch) {
    const wireLines = wireBlockMatch[1].split('\n');
    let wireIdx = 1;
    for (const rawLine of wireLines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('#')) continue;

      // Format: CONNECT comp1.pin1 -> comp2.pin2 or WIRE comp1.pin1 -> comp2.pin2
      const match = line.match(
        /^(?:CONNECT|WIRE)\s+([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\s*->\s*([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/i
      );

      if (!match) {
        errors.push(`Sintaxis inválida en conexión: "${line}"`);
        continue;
      }

      const [, fromComp, fromPin, toComp, toPin] = match;

      wires.push({
        id: `wire_${wireIdx++}_${Date.now().toString(36)}`,
        fromComponentId: fromComp,
        fromPinId: fromPin,
        toComponentId: toComp,
        toPinId: toPin,
        state: 0,
      });
    }
  }

  return {
    schematic: {
      name,
      author,
      version,
      description,
      components,
      wires,
      customComponents,
      updatedAt: new Date().toISOString(),
    },
    errors,
  };
}
