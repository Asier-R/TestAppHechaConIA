/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schematic } from '../types/circuit';
import { parseCircuitDSL } from './dsl';

export interface PresetCircuit {
  id: string;
  name: string;
  category: string;
  description: string;
  dsl: string;
}

export const PRESET_CIRCUITS: PresetCircuit[] = [
  {
    id: 'full_adder',
    name: 'Sumador Completo de 1 Bit',
    category: 'Aritmética',
    description: 'Calcula la suma aritmética de 2 bits (A, B) y un acarreo de entrada (Cin), generando Suma y Acarreo de Salida (Cout).',
    dsl: `CIRCUIT "Sumador Completo de 1 Bit" {
  METADATA {
    author: "LogiCirc Presets"
    version: "1.0.0"
    description: "Sumador binario con lógica de suma y acarreo para circuitos de computación"
  }

  COMPONENTS {
    sw_a: SWITCH { label: "Entrada A", x: 80, y: 100, state: { isOn: true } }
    sw_b: SWITCH { label: "Entrada B", x: 80, y: 220, state: { isOn: true } }
    sw_cin: SWITCH { label: "Acarreo Cin", x: 80, y: 340, state: { isOn: false } }
    
    fa_block: FULL_ADDER { label: "FA-74LS283", x: 300, y: 180 }
    
    led_sum: LED { label: "Suma (S)", x: 540, y: 160, state: { color: "#10b981" } }
    led_cout: LED { label: "Acarreo (Cout)", x: 540, y: 260, state: { color: "#3b82f6" } }
  }

  WIRES {
    CONNECT sw_a.out -> fa_block.a
    CONNECT sw_b.out -> fa_block.b
    CONNECT sw_cin.out -> fa_block.cin
    CONNECT fa_block.sum -> led_sum.in1
    CONNECT fa_block.cout -> led_cout.in1
  }
}`,
  },
  {
    id: 'calculator_2bit_alu',
    name: 'Calculadora Aritmética 2-Bit (Suma / Resta)',
    category: 'Aritmética y Calculadoras',
    description: 'Calculadora de 2 operandos (A y B de 0 a 3) capaz de realizar sumas (A + B) y restas (A - B) en complemento a dos con visualización en display HEX numérico y LEDs.',
    dsl: `CIRCUIT "Calculadora Aritmética 2-Bit (Suma / Resta)" {
  METADATA {
    author: "LogiCirc Presets"
    version: "1.0.0"
    description: "Calculadora binaria de 2 bits con selección de operación Suma/Resta, acarreo y display digital"
  }

  COMPONENTS {
    sw_a0: SWITCH { label: "Operando A0", x: 60, y: 80, state: { isOn: true } }
    sw_a1: SWITCH { label: "Operando A1", x: 60, y: 190, state: { isOn: true } }
    sw_b0: SWITCH { label: "Operando B0", x: 60, y: 310, state: { isOn: true } }
    sw_b1: SWITCH { label: "Operando B1", x: 60, y: 420, state: { isOn: false } }
    sw_op: SWITCH { label: "Modo: Resta (1) / Suma (0)", x: 60, y: 530, state: { isOn: false } }

    xor_b0: XOR { label: "Inversor B0", x: 260, y: 310 }
    xor_b1: XOR { label: "Inversor B1", x: 260, y: 420 }
    not_sub: NOT { label: "NOT-Modo", x: 260, y: 530 }

    fa_0: FULL_ADDER { label: "ALU Bit 0", x: 440, y: 140 }
    fa_1: FULL_ADDER { label: "ALU Bit 1", x: 440, y: 320 }
    and_cout: AND { label: "Mascara Acarreo", x: 600, y: 220 }

    gnd_d3: GND { label: "GND", x: 440, y: 480 }

    disp_calc: DISPLAY_HEX { label: "Display Resultado", x: 740, y: 140 }

    led_s0: LED { label: "Bit S0", x: 740, y: 270, state: { color: "#10b981" } }
    led_s1: LED { label: "Bit S1", x: 740, y: 360, state: { color: "#06b6d4" } }
    led_cout: LED { label: "Acarreo / Signo", x: 740, y: 450, state: { color: "#f59e0b" } }
    led_sub: LED { label: "Resta Activa", x: 740, y: 530, state: { color: "#ef4444" } }
  }

  WIRES {
    CONNECT sw_b0.out -> xor_b0.in1
    CONNECT sw_op.out -> xor_b0.in2
    CONNECT sw_b1.out -> xor_b1.in1
    CONNECT sw_op.out -> xor_b1.in2
    CONNECT sw_op.out -> not_sub.in1

    CONNECT sw_a0.out -> fa_0.a
    CONNECT xor_b0.out -> fa_0.b
    CONNECT sw_op.out -> fa_0.cin

    CONNECT sw_a1.out -> fa_1.a
    CONNECT xor_b1.out -> fa_1.b
    CONNECT fa_0.cout -> fa_1.cin

    CONNECT fa_1.cout -> and_cout.in1
    CONNECT not_sub.out -> and_cout.in2

    CONNECT fa_0.sum -> disp_calc.d0
    CONNECT fa_1.sum -> disp_calc.d1
    CONNECT and_cout.out -> disp_calc.d2
    CONNECT gnd_d3.out -> disp_calc.d3

    CONNECT fa_0.sum -> led_s0.in1
    CONNECT fa_1.sum -> led_s1.in1
    CONNECT fa_1.cout -> led_cout.in1
    CONNECT sw_op.out -> led_sub.in1
  }
}`,
  },
  {
    id: 'counter_clock_hex',
    name: 'Contador Binario 4-Bit con Reloj y Display HEX',
    category: 'Secuencial',
    description: 'Generador de reloj periódico que incrementa automáticamente un contador binario de 4 bits visualizado en un display hexadecimal de 0 a F.',
    dsl: `CIRCUIT "Contador 4-Bit con Reloj" {
  METADATA {
    author: "LogiCirc Presets"
    version: "1.0.0"
    description: "Generador de reloj y contador síncrono reflejado en display hexadecimal"
  }

  COMPONENTS {
    clk_gen: CLOCK { label: "Reloj 1Hz", x: 80, y: 140, state: { frequencyHz: 1, isOn: true } }
    sw_reset: SWITCH { label: "Reset (RST)", x: 80, y: 240, state: { isOn: false } }
    vcc_en: VCC { label: "VCC", x: 80, y: 340 }

    counter: COUNTER_4BIT { label: "74LS161", x: 300, y: 180 }

    display: DISPLAY_HEX { label: "Display HEX", x: 540, y: 160 }
    led_carry: LED { label: "Fin de Cuenta (CO)", x: 540, y: 300, state: { color: "#f59e0b" } }
  }

  WIRES {
    CONNECT clk_gen.out -> counter.clk
    CONNECT sw_reset.out -> counter.rst
    CONNECT vcc_en.out -> counter.en
    CONNECT counter.q0 -> display.d0
    CONNECT counter.q1 -> display.d1
    CONNECT counter.q2 -> display.d2
    CONNECT counter.q3 -> display.d3
    CONNECT counter.carry -> led_carry.in1
  }
}`,
  },
  {
    id: 'sr_memory_latch',
    name: 'Celda de Memoria Latch SR (Set / Reset)',
    category: 'Memoria',
    description: 'Biestable elemental con control de fijación (Set) y borrado (Reset), mostrando el estado almacenado Q y su complementario negado Q̄.',
    dsl: `CIRCUIT "Celda de Memoria Latch SR" {
  METADATA {
    author: "LogiCirc Presets"
    version: "1.0.0"
    description: "Circuito de memoria básico con salidas Q y Q negada"
  }

  COMPONENTS {
    btn_set: BUTTON { label: "Set (S)", x: 80, y: 120, state: { isPressed: false } }
    btn_rst: BUTTON { label: "Reset (R)", x: 80, y: 240, state: { isPressed: false } }

    latch: SR_LATCH { label: "Latch SR", x: 300, y: 160 }

    led_q: LED { label: "Salida Q", x: 540, y: 140, state: { color: "#10b981" } }
    led_q_bar: LED { label: "Salida Q̄", x: 540, y: 240, state: { color: "#ef4444" } }
  }

  WIRES {
    CONNECT btn_set.out -> latch.s
    CONNECT btn_rst.out -> latch.r
    CONNECT latch.q -> led_q.in1
    CONNECT latch.q_bar -> led_q_bar.in1
  }
}`,
  },
  {
    id: 'mux_gate_synthesis',
    name: 'Multiplexor 2:1 Sintetizado con Puertas Básicas',
    category: 'Lógica Combinacional',
    description: 'Implementación canónica de un multiplexor mediante compuertas AND, OR e inversor NOT: Y = (I0 & ~SEL) | (I1 & SEL).',
    dsl: `CIRCUIT "Multiplexor 2:1 Canónico" {
  METADATA {
    author: "LogiCirc Presets"
    version: "1.0.0"
    description: "Selector de 2 canales implementado a nivel de compuertas lógicas primitivas"
  }

  COMPONENTS {
    sw_i0: SWITCH { label: "Canal I0", x: 80, y: 80, state: { isOn: true } }
    sw_i1: SWITCH { label: "Canal I1", x: 80, y: 200, state: { isOn: false } }
    sw_sel: SWITCH { label: "Selector S", x: 80, y: 320, state: { isOn: false } }

    gate_not: NOT { label: "NOT-S", x: 260, y: 320 }
    gate_and0: AND { label: "AND-0", x: 440, y: 100 }
    gate_and1: AND { label: "AND-1", x: 440, y: 240 }
    gate_or: OR { label: "OR-OUT", x: 620, y: 160 }

    led_out: LED { label: "Salida Y", x: 780, y: 160, state: { color: "#8b5cf6" } }
  }

  WIRES {
    CONNECT sw_sel.out -> gate_not.in1
    CONNECT sw_i0.out -> gate_and0.in1
    CONNECT gate_not.out -> gate_and0.in2
    CONNECT sw_i1.out -> gate_and1.in1
    CONNECT sw_sel.out -> gate_and1.in2
    CONNECT gate_and0.out -> gate_or.in1
    CONNECT gate_and1.out -> gate_or.in2
    CONNECT gate_or.out -> led_out.in1
  }
}`,
  },
  {
    id: 'parity_xor',
    name: 'Generador / Comprobador de Paridad Par (XOR)',
    category: 'Lógica Combinacional',
    description: 'Cadena de puertas XOR para calcular la paridad par de un bus de 4 interruptores independientes.',
    dsl: `CIRCUIT "Comprobador de Paridad" {
  METADATA {
    author: "LogiCirc Presets"
    version: "1.0.0"
    description: "Detector de bits impares y generador de bit de paridad con compuertas XOR"
  }

  COMPONENTS {
    sw_d0: SWITCH { label: "Bit D0", x: 80, y: 80, state: { isOn: true } }
    sw_d1: SWITCH { label: "Bit D1", x: 80, y: 180, state: { isOn: false } }
    sw_d2: SWITCH { label: "Bit D2", x: 80, y: 280, state: { isOn: true } }
    sw_d3: SWITCH { label: "Bit D3", x: 80, y: 380, state: { isOn: false } }

    xor_stage1_a: XOR { label: "XOR-1A", x: 280, y: 120 }
    xor_stage1_b: XOR { label: "XOR-1B", x: 280, y: 320 }
    xor_final: XOR { label: "XOR-Final", x: 480, y: 220 }

    led_parity: LED { label: "Paridad Impar (1)", x: 680, y: 220, state: { color: "#ec4899" } }
  }

  WIRES {
    CONNECT sw_d0.out -> xor_stage1_a.in1
    CONNECT sw_d1.out -> xor_stage1_a.in2
    CONNECT sw_d2.out -> xor_stage1_b.in1
    CONNECT sw_d3.out -> xor_stage1_b.in2
    CONNECT xor_stage1_a.out -> xor_final.in1
    CONNECT xor_stage1_b.out -> xor_final.in2
    CONNECT xor_final.out -> led_parity.in1
  }
}`,
  },
];

/**
 * Loads a preset circuit as a full Schematic instance
 */
export function loadPresetSchematic(presetId: string): Schematic {
  const preset = PRESET_CIRCUITS.find((p) => p.id === presetId) || PRESET_CIRCUITS[0];
  const { schematic } = parseCircuitDSL(preset.dsl);
  const now = new Date().toISOString();

  return {
    id: `schematic_${preset.id}_${Date.now()}`,
    name: schematic?.name || preset.name,
    author: schematic?.author || 'LogiCirc',
    version: schematic?.version || '1.0.0',
    description: schematic?.description || preset.description,
    createdAt: now,
    updatedAt: now,
    components: schematic?.components || [],
    wires: schematic?.wires || [],
    customComponents: schematic?.customComponents || [],
    commits: [
      {
        id: `commit_init_${Date.now()}`,
        message: `Carga inicial del circuito "${preset.name}"`,
        timestamp: now,
        author: 'Sistema',
        componentsCount: schematic?.components?.length || 0,
        wiresCount: schematic?.wires?.length || 0,
        snapshot: {
          components: schematic?.components || [],
          wires: schematic?.wires || [],
        },
      },
    ],
    activeBranch: 'main',
  };
}
