/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LogicValue = 0 | 1 | null; // null = floating/undefined

export type ComponentCategory =
  | 'gates'
  | 'inputs'
  | 'outputs'
  | 'sequential'
  | 'arithmetic'
  | 'custom';

export type ComponentType =
  // Basic Logic Gates
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'XNOR'
  | 'BUFFER'
  | 'TRI_STATE'
  // Inputs & Signal Generators
  | 'SWITCH'
  | 'BUTTON'
  | 'CLOCK'
  | 'VCC'
  | 'GND'
  | 'BUS_INPUT_4BIT'
  // Outputs & Probes
  | 'LED'
  | 'DISPLAY_7SEG'
  | 'DISPLAY_HEX'
  | 'PROBE'
  | 'BUZZER'
  // Sequential & Memory
  | 'FLIPFLOP_D'
  | 'FLIPFLOP_JK'
  | 'FLIPFLOP_T'
  | 'SR_LATCH'
  | 'COUNTER_4BIT'
  | 'REGISTER_4BIT'
  // Arithmetic & MSI
  | 'HALF_ADDER'
  | 'FULL_ADDER'
  | 'MUX_2TO1'
  | 'MUX_4TO1'
  | 'DECODER_2TO4'
  // User Defined Custom Component
  | 'CUSTOM_IC';

export interface PinDefinition {
  id: string;
  name: string;
  type: 'input' | 'output';
  /** Relative offset or placement label: 'left-0', 'left-1', 'right-0', 'top-0', 'bottom-0' */
  slot?: string;
  relativeX?: number; // 0 to 1 relative to width
  relativeY?: number; // 0 to 1 relative to height
  state?: LogicValue;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  inputs: PinDefinition[];
  outputs: PinDefinition[];
  /** Internal component state (switch active, clock counter, flip-flop Q, etc.) */
  state: {
    isOn?: boolean; // switch or button
    isPressed?: boolean;
    frequencyHz?: number; // clock
    lastTick?: number;
    color?: string; // LED color
    storedValue?: number; // counter/register
    customIcId?: string; // reference for CUSTOM_IC
    propagationDelayMs?: number;
    [key: string]: any;
  };
}

export interface CircuitWire {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  state: LogicValue;
}

export interface CustomComponentDef {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  category: string;
  color: string;
  inputs: { id: string; name: string }[];
  outputs: { id: string; name: string }[];
  /** Boolean expressions per output pin. Example: { "OUT": "(A & B) | (~C)" } */
  logicExpressions?: Record<string, string>;
  /** Truth table matrix if configured */
  truthTable?: {
    inputs: number[];
    outputs: number[];
  }[];
  createdAt: string;
}

export interface CommitSnapshot {
  components: CircuitComponent[];
  wires: CircuitWire[];
}

export interface Commit {
  id: string;
  message: string;
  timestamp: string;
  author: string;
  componentsCount: number;
  wiresCount: number;
  snapshot: CommitSnapshot;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface CollaboratorUser {
  id: string;
  name: string;
  color: string;
  role: UserRole;
  cursor?: { x: number; y: number };
  activeComponentId?: string | null;
  lastActive: string;
}

export interface SchematicMetadata {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schematic extends SchematicMetadata {
  components: CircuitComponent[];
  wires: CircuitWire[];
  customComponents: CustomComponentDef[];
  commits: Commit[];
  activeBranch: string;
}

export interface SimulationStepResult {
  components: CircuitComponent[];
  wires: CircuitWire[];
  hasOscillation: boolean;
  activeSignalsCount: number;
}

export interface WaveformSample {
  timestamp: number;
  pinId: string;
  componentId: string;
  label: string;
  value: LogicValue;
}
