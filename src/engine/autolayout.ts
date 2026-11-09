/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, CircuitWire } from '../types/circuit';

export interface LayoutOptions {
  startX?: number;
  startY?: number;
  layerGapX?: number;
  nodeGapY?: number;
  gridSnap?: number;
}

/**
 * Automatically calculates optimal topological coordinates for all components in the schematic
 * using a layered DAG / Sugiyama-style rank assignment.
 */
export function autoLayoutCircuit(
  components: CircuitComponent[],
  wires: CircuitWire[],
  options: LayoutOptions = {}
): CircuitComponent[] {
  if (components.length === 0) return [];

  const startX = options.startX ?? 80;
  const startY = options.startY ?? 100;
  const layerGapX = options.layerGapX ?? 240;
  const nodeGapY = options.nodeGapY ?? 110;
  const gridSnap = options.gridSnap ?? 20;

  // Build adjacency
  const inEdges = new Map<string, string[]>(); // compId -> list of source compIds
  const outEdges = new Map<string, string[]>(); // compId -> list of target compIds

  for (const c of components) {
    inEdges.set(c.id, []);
    outEdges.set(c.id, []);
  }

  for (const w of wires) {
    if (inEdges.has(w.toComponentId) && outEdges.has(w.fromComponentId)) {
      inEdges.get(w.toComponentId)!.push(w.fromComponentId);
      outEdges.get(w.fromComponentId)!.push(w.toComponentId);
    }
  }

  // Identify pure input components
  const inputTypes = new Set(['SWITCH', 'BUTTON', 'CLOCK', 'VCC', 'GND', 'BUS_INPUT_4BIT']);
  const outputTypes = new Set(['LED', 'DISPLAY_7SEG', 'DISPLAY_HEX', 'PROBE', 'BUZZER']);

  // Assign ranks (layers)
  const ranks = new Map<string, number>();

  // Initialize input ranks
  for (const c of components) {
    if (inputTypes.has(c.type) || (inEdges.get(c.id)?.length === 0 && !outputTypes.has(c.type))) {
      ranks.set(c.id, 0);
    }
  }

  // Iteratively compute longest path rank for DAG components (up to N passes to prevent infinite loop on cycles)
  let changed = true;
  let pass = 0;
  const MAX_PASSES = components.length + 5;

  while (changed && pass < MAX_PASSES) {
    changed = false;
    pass++;

    for (const c of components) {
      if (inputTypes.has(c.type)) continue;

      const sources = inEdges.get(c.id) || [];
      if (sources.length > 0) {
        let maxSourceRank = -1;
        for (const srcId of sources) {
          const srcRank = ranks.get(srcId);
          if (srcRank !== undefined && srcRank > maxSourceRank) {
            maxSourceRank = srcRank;
          }
        }

        const newRank = maxSourceRank >= 0 ? maxSourceRank + 1 : 0;
        const currentRank = ranks.get(c.id) ?? 0;
        if (newRank > currentRank) {
          ranks.set(c.id, newRank);
          changed = true;
        }
      } else if (!ranks.has(c.id)) {
        ranks.set(c.id, 0);
        changed = true;
      }
    }
  }

  // Push output types to at least max rank of their inputs or rightmost column
  let maxAssignedRank = 0;
  for (const r of ranks.values()) {
    if (r > maxAssignedRank) maxAssignedRank = r;
  }

  for (const c of components) {
    if (outputTypes.has(c.type)) {
      const cur = ranks.get(c.id) ?? 0;
      if (cur < maxAssignedRank) {
        ranks.set(c.id, Math.max(cur, maxAssignedRank));
      }
    }
  }

  // Group components by rank
  const layers = new Map<number, CircuitComponent[]>();
  for (const c of components) {
    const r = ranks.get(c.id) ?? 0;
    if (!layers.has(r)) layers.set(r, []);
    layers.get(r)!.push(c);
  }

  const sortedRankKeys = Array.from(layers.keys()).sort((a, b) => a - b);

  // Position components per layer
  const updatedComponents: CircuitComponent[] = [];

  // Calculate maximum layer height to vertically balance columns
  let maxLayerHeight = 0;
  for (const rank of sortedRankKeys) {
    const list = layers.get(rank)!;
    const h = list.reduce((sum, item) => sum + item.height + nodeGapY, 0) - nodeGapY;
    if (h > maxLayerHeight) maxLayerHeight = h;
  }

  for (const rank of sortedRankKeys) {
    const list = layers.get(rank)!;

    // Sort components in layer by barycenter of their sources (or destinations) to reduce wire crossings
    list.sort((a, b) => {
      const getBarycenter = (comp: CircuitComponent) => {
        const sources = inEdges.get(comp.id) || [];
        if (sources.length === 0) return a.y;
        let sumY = 0;
        let count = 0;
        for (const sId of sources) {
          const sComp = components.find((compItem) => compItem.id === sId);
          if (sComp) {
            sumY += sComp.y;
            count++;
          }
        }
        return count > 0 ? sumY / count : a.y;
      };
      return getBarycenter(a) - getBarycenter(b);
    });

    const colX = startX + rank * layerGapX;
    const layerTotalHeight = list.reduce((sum, item) => sum + item.height + nodeGapY, 0) - nodeGapY;
    // Center column vertically relative to maxLayerHeight
    let currentY = startY + Math.max(0, (maxLayerHeight - layerTotalHeight) / 2);

    for (const comp of list) {
      const snappedX = Math.round(colX / gridSnap) * gridSnap;
      const snappedY = Math.round(currentY / gridSnap) * gridSnap;

      updatedComponents.push({
        ...comp,
        x: snappedX,
        y: snappedY,
      });

      currentY += comp.height + nodeGapY;
    }
  }

  return updatedComponents;
}
