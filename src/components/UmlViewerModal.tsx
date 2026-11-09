/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Network,
  Database,
  ArrowRightLeft,
  Users,
  Compass,
  FileCode,
  Copy,
  Check,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';

interface UmlViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UmlViewerModal: React.FC<UmlViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'class' | 'er' | 'sequence' | 'interaction' | 'usecase' | 'domain'
  >('class');
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  if (!isOpen) return null;

  const diagrams = {
    class: {
      title: 'Diagrama de Clases (Class Diagram)',
      subtitle: 'Estructura orientada a objetos de la arquitectura CAD, motor de simulación, validador DRC y parseador DSL',
      code: `classDiagram
    class Schematic {
        +String id
        +String name
        +String author
        +String version
        +CircuitComponent[] components
        +CircuitWire[] wires
        +CustomComponentDef[] customComponents
        +Commit[] commits
        +String activeBranch
        +serializeToDSL() String
        +restoreCommit(commitId) void
    }

    class CircuitComponent {
        +String id
        +ComponentType type
        +String label
        +Number x
        +Number y
        +Number width
        +Number height
        +Rotation rotation
        +PinDefinition[] inputs
        +PinDefinition[] outputs
        +ComponentState state
        +toggleState(prop, val) void
        +getPinCoordinates(pinId) Point
    }

    class PinDefinition {
        +String id
        +String name
        +PinType type
        +Number relativeX
        +Number relativeY
        +LogicValue state
    }

    class CircuitWire {
        +String id
        +String fromComponentId
        +String fromPinId
        +String toComponentId
        +String toPinId
        +LogicValue state
        +propagateSignal(val) void
    }

    class CustomComponentDef {
        +String id
        +String name
        +String abbreviation
        +String color
        +PinDefinition[] inputs
        +PinDefinition[] outputs
        +Map~String, String~ logicExpressions
        +TruthTableRow[] truthTable
        +evaluate(inputEnv) Map
    }

    class SimulationEngine {
        +simulateCircuit(components, wires, customDefs) SimulationResult
        +evaluateBooleanExpression(expr, env) LogicValue
        +detectOscillations(iterations) Boolean
    }

    class DrcValidator {
        +validateCircuitDRC(components, wires) DrcReport
        -checkOutputContention(wires) void
        -checkFloatingInputs(components, wires) void
        -checkPowerShortCircuits(wires) void
    }

    class DslParser {
        +parseCircuitDSL(dslText) ParseResult
        +serializeCircuitToDSL(schematic) String
    }

    class Commit {
        +String id
        +String message
        +DateTime timestamp
        +String author
        +CommitSnapshot snapshot
    }

    class CollaboratorUser {
        +String id
        +String name
        +String color
        +UserRole role
        +Point cursor
    }

    Schematic "1" *-- "many" CircuitComponent : contiene
    Schematic "1" *-- "many" CircuitWire : conecta
    Schematic "1" *-- "many" CustomComponentDef : registra
    Schematic "1" *-- "many" Commit : almacena
    CircuitComponent "1" *-- "many" PinDefinition : terminales
    SimulationEngine ..> Schematic : evalua
    DrcValidator ..> Schematic : audita reglas
    DslParser ..> Schematic : serializa/parsea`,
    },
    er: {
      title: 'Diagrama Entidad-Relación (ER Diagram)',
      subtitle: 'Modelo relacional y esquema de persistencia para proyectos esquemáticos, componentes, terminales y revisiones',
      code: `erDiagram
    SCHEMATICS ||--|{ COMPONENTS : "contiene"
    SCHEMATICS ||--|{ WIRES : "interconecta"
    SCHEMATICS ||--o{ CUSTOM_ICS : "define"
    SCHEMATICS ||--|{ COMMITS : "registra historial"
    COMPONENTS ||--|{ PINS : "posee terminales"
    CUSTOM_ICS ||--|{ PINS : "define interfaz"
    WIRES }|--|| PINS : "salida origen (from)"
    WIRES }|--|| PINS : "entrada destino (to)"
    COMMITS ||--|{ COMMIT_SNAPSHOTS : "captura estado"
    SCHEMATICS ||--o{ COLLABORATORS : "participa en sala"
    SCHEMATICS ||--o{ DRC_VIOLATIONS : "genera alertas"

    SCHEMATICS {
        string id PK
        string name
        string author
        string version
        text description
        datetime created_at
        datetime updated_at
        string active_branch
    }

    COMPONENTS {
        string id PK
        string schematic_id FK
        string type
        string label
        int pos_x
        int pos_y
        int width
        int height
        int rotation
        json state_data
        string custom_ic_id FK
    }

    PINS {
        string id PK
        string component_id FK
        string name
        string pin_direction
        float rel_x
        float rel_y
        int default_logic_state
    }

    WIRES {
        string id PK
        string schematic_id FK
        string from_component_id FK
        string from_pin_id FK
        string to_component_id FK
        string to_pin_id FK
        int current_logic_state
    }

    CUSTOM_ICS {
        string id PK
        string schematic_id FK
        string name
        string abbreviation
        string color
        json logic_expressions
        json truth_table
    }

    COMMITS {
        string id PK
        string schematic_id FK
        string commit_message
        string author
        datetime timestamp
        int components_count
        int wires_count
    }

    DRC_VIOLATIONS {
        string id PK
        string schematic_id FK
        string rule_code
        string severity
        string message
        json target_component_ids
        json target_wire_ids
    }`,
    },
    sequence: {
      title: 'Diagramas de Secuencia (Sequence Diagrams)',
      subtitle: 'Flujo temporal en propagación de señales lógicas, validación DRC reactiva y síntesis asistida por IA',
      code: `sequenceDiagram
    autonumber
    actor Usuario as Diseñador
    participant Canvas as SchematicCanvas
    participant Engine as SimulationEngine
    participant DRC as DrcValidator
    participant Scope as OscilloscopePanel
    participant Server as Express/Gemini API

    Note over Usuario,Canvas: Flujo 1: Conmutación de Entrada y Simulación
    Usuario->>Canvas: Clic en Interruptor (Switch ON/OFF)
    Canvas->>Engine: simulateCircuit(components, wires)
    loop Propagación de Señales (max 25 iteraciones)
        Engine->>Engine: Evalúa compuertas (AND, OR, XOR, etc.)
        Engine->>Engine: Propaga niveles (1, 0, Z) a través de cables
    end
    Engine-->>Canvas: SimulationStepResult (estados actualizados)
    Canvas->>Scope: Registrar muestras de señal en canales
    Scope-->>Usuario: Dibuja formas de onda cuadradas en tiempo real

    Note over Usuario,DRC: Flujo 2: Trazado de Cable y Validación DRC en Tiempo Real
    Usuario->>Canvas: Conecta Cable de Salida A a Salida B (Conflicto)
    Canvas->>DRC: validateCircuitDRC(components, wires)
    DRC->>DRC: Detecta Contención Eléctrica (Múltiples drivers en un nodo)
    DRC-->>Canvas: DrcReport (conflictingWireIds, conflictingComponentIds)
    Canvas-->>Usuario: Ilumina cables en ROJO neón y muestra advertencia (!)

    Note over Usuario,Server: Flujo 3: Síntesis Asistida por IA con Gemini
    Usuario->>Server: POST /api/gemini/circuit-ai ("Diseña multiplexor 4:1")
    Server->>Server: Gemini 3.8 Flash genera código formal DSL
    Server-->>Canvas: { text, generatedDsl }
    Usuario->>Canvas: Clic en "Insertar en el Plano"
    Canvas->>Canvas: parseCircuitDSL() + autoLayoutCircuit()
    Canvas-->>Usuario: Plano generado y posicionado automáticamente`,
    },
    interaction: {
      title: 'Diagramas de Interacción y Comunicación (Collaboration & State Flow)',
      subtitle: 'Comunicación sincrónica y asincrónica entre módulos de renderizado, enrutador y sincronizador de sala',
      code: `sequenceDiagram
    participant CollabA as Cliente Local (Usuario A)
    participant StateManager as AppState (LogiCirc Core)
    participant DRC as DrcValidator
    participant RoomStore as CollabSync Service
    participant CollabB as Cliente Remoto (Usuario B)

    CollabA->>StateManager: onMoveComponent(id, newX, newY)
    StateManager->>DRC: Ejecutar verificación DRC
    DRC-->>StateManager: Reporte DRC (0 conflictos)
    StateManager->>RoomStore: Broadcast Cursor & Posición
    RoomStore-->>CollabB: Evento de Sincronización Remota
    CollabB->>CollabB: Renderizar cursor y mover compuerta de Usuario A
    
    CollabB->>RoomStore: onAddWire(AND.out -> LED.in)
    RoomStore-->>StateManager: Actualización de cable
    StateManager->>DRC: Revalidar DRC
    StateManager-->>CollabA: Cable sincronizado en vivo`,
    },
    usecase: {
      title: 'Diagramas de Casos de Uso (Use Case Diagrams)',
      subtitle: 'Actores del sistema (Ingeniero, Colaborador, Motor DRC, IA) y casos de uso de la plataforma CAD',
      code: `flowchart TD
    subgraph Actores
        User((Ingeniero / Diseñador))
        Peer((Colaborador Remoto))
        IA((Agente IA Gemini))
        GitHub((Servicio GitHub))
    end

    subgraph "Casos de Uso: Edición y Dibujo"
        UC1[Crear y Mover Compuertas]
        UC2[Trazar Conexiones Ortogonales Manhattan]
        UC3[Auto-Posicionamiento Topológico]
        UC4[Diseñar Chips Personalizados Subcircuitos]
    end

    subgraph "Casos de Uso: Simulación y Calidad"
        UC5[Simular Lógica Digital en Tiempo Real]
        UC6[Validar Reglas de Diseño DRC en Vivo]
        UC7[Analizar Formas de Onda en Osciloscopio]
    end

    subgraph "Casos de Uso: Gestión y Exportación"
        UC8[Sincronizar Bidireccionalmente Código DSL]
        UC9[Control de Versiones y Restauración de Commits]
        UC10[Exportar Alta Resolución PDF con Cajetín / PNG / SVG]
        UC11[Sincronizar Repositorio en GitHub]
        UC12[Consultar Asistente IA para Depurar o Generar]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12

    Peer --> UC1
    Peer --> UC2
    Peer --> UC5

    IA --> UC8
    IA --> UC12

    GitHub --> UC11`,
    },
    domain: {
      title: 'Diagrama de Modelo de Dominio (Domain Model Diagram)',
      subtitle: 'Conceptos fundamentales del dominio de la electrónica digital y representación abstracta en LogiCirc',
      code: `classDiagram
    class CircuitoLogico {
        +Nombre
        +Version
        +FrecuenciaReloj
    }

    class RedElectricaEquipotencial {
        +NivelLogico (0, 1, Z, Indefinido)
        +FrecuenciaHz
        +TieneContencionElectrica
    }

    class TerminalPin {
        +Direccion (Entrada, Salida)
        +Impedancia
        +EstaFlotante
    }

    class ElementoCircuito {
        +PosicionEspacial (X, Y)
        +RetardoPropagacion
        +Orientacion
    }

    class CompuertaCombinacional {
        +FuncionBooleana
        +TablaVerdad
    }

    class ElementoSecuencial {
        +EstadoInternoMemoria
        +DisparoPorFlanco (Ascendente)
    }

    class ChipSubcircuitoEncapsulado {
        +Abreviatura
        +InterfazPines
        +EncapsuladoColor
    }

    class ReglaDisenoDRC {
        +CodigoInfraccion
        +Severidad (Error, Advertencia)
        +SugerenciaIngenieria
    }

    CircuitoLogico "1" *-- "many" ElementoCircuito : compuesto por
    CircuitoLogico "1" *-- "many" RedElectricaEquipotencial : interconectado por
    ElementoCircuito <|-- CompuertaCombinacional : es un
    ElementoCircuito <|-- ElementoSecuencial : es un
    ElementoCircuito <|-- ChipSubcircuitoEncapsulado : es un
    ElementoCircuito "1" *-- "many" TerminalPin : expone
    RedElectricaEquipotencial "1" o-- "many" TerminalPin : enlaza
    CircuitoLogico "1" ..> "many" ReglaDisenoDRC : auditado por`,
    },
  };

  const currentDiagram = diagrams[activeTab];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentDiagram.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const markdownContent = `# Documentación de Arquitectura y Diagramas UML - LogiCirc

Generado automáticamente por el motor de modelado arquitectónico de LogiCirc.

---

## 1. Diagrama de Clases
\`\`\`mermaid
${diagrams.class.code}
\`\`\`

## 2. Diagrama Entidad-Relación (ER)
\`\`\`mermaid
${diagrams.er.code}
\`\`\`

## 3. Diagramas de Secuencia
\`\`\`mermaid
${diagrams.sequence.code}
\`\`\`

## 4. Diagramas de Interacción
\`\`\`mermaid
${diagrams.interaction.code}
\`\`\`

## 5. Diagramas de Caso de Uso
\`\`\`mermaid
${diagrams.usecase.code}
\`\`\`

## 6. Diagrama de Modelo de Dominio
\`\`\`mermaid
${diagrams.domain.code}
\`\`\`
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LogiCirc_Diagramas_UML.md';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Arquitectura y Diagramas UML"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Especificación Arquitectónica y Diagramas UML
              </h2>
              <p className="text-[11px] text-slate-400">
                Modelado formal del software CAD, motor de simulación, motor DRC y base de datos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
              title="Descargar todos los diagramas en Markdown / Mermaid"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar .MD</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              aria-label="Cerrar ventana UML"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-3 bg-slate-950/60 overflow-x-auto custom-scrollbar gap-1">
          {[
            { id: 'class', label: '1. Clases', icon: Layers },
            { id: 'er', label: '2. Entidad-Relación', icon: Database },
            { id: 'sequence', label: '3. Secuencia', icon: ArrowRightLeft },
            { id: 'interaction', label: '4. Interacción', icon: Users },
            { id: 'usecase', label: '5. Casos de Uso', icon: Compass },
            { id: 'domain', label: '6. Modelo de Dominio', icon: Network },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Diagram Viewport & Details */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/40">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentDiagram.title}</span>
              </h3>
              <p className="text-xs text-slate-400">{currentDiagram.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCode((prev) => !prev)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition cursor-pointer ${
                  showCode
                    ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {showCode ? 'Ocultar Código' : 'Ver Código Mermaid'}
              </button>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Visual Diagram Representation Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto custom-scrollbar">
            {showCode ? (
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto p-2">
                {currentDiagram.code}
              </pre>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Visual Architectural Cards according to diagram type */}
                {activeTab === 'class' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-3 space-y-2">
                      <div className="font-mono font-bold text-indigo-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>Schematic</span>
                        <span className="text-[10px] text-slate-400">«AggregateRoot»</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                        <div>+ id: String</div>
                        <div>+ name: String</div>
                        <div>+ components: CircuitComponent[]</div>
                        <div>+ wires: CircuitWire[]</div>
                        <div>+ customComponents: CustomComponentDef[]</div>
                        <div>+ commits: Commit[]</div>
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-mono text-[11px] text-emerald-400">
                        <div>+ serializeToDSL(): String</div>
                        <div>+ restoreCommit(id): void</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3 space-y-2">
                      <div className="font-mono font-bold text-emerald-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>CircuitComponent</span>
                        <span className="text-[10px] text-slate-400">«Entity»</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                        <div>+ id: String</div>
                        <div>+ type: ComponentType</div>
                        <div>+ x, y: Number</div>
                        <div>+ inputs: PinDefinition[]</div>
                        <div>+ outputs: PinDefinition[]</div>
                        <div>+ state: Object</div>
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-mono text-[11px] text-emerald-400">
                        <div>+ toggleState(key, val): void</div>
                        <div>+ getPinCoordinates(pinId): Point</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-3 space-y-2">
                      <div className="font-mono font-bold text-cyan-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>SimulationEngine</span>
                        <span className="text-[10px] text-slate-400">«DomainService»</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                        <div>+ maxIterations: 25</div>
                        <div>+ clockTicks: Number</div>
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-mono text-[11px] text-emerald-400">
                        <div>+ simulateCircuit(): Result</div>
                        <div>+ evaluateBooleanExpression(): Bit</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-3 space-y-2">
                      <div className="font-mono font-bold text-rose-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>DrcValidator</span>
                        <span className="text-[10px] text-slate-400">«QualityGuard»</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                        <div>+ ruleSet: DrcRule[]</div>
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-mono text-[11px] text-rose-300">
                        <div>+ validateCircuitDRC(): DrcReport</div>
                        <div>- checkOutputContention()</div>
                        <div>- checkFloatingInputs()</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-3 space-y-2">
                      <div className="font-mono font-bold text-purple-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>DslParser &amp; HDL</span>
                        <span className="text-[10px] text-slate-400">«FormalLanguage»</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                        <div>+ grammarRules: RegExp[]</div>
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-mono text-[11px] text-purple-300">
                        <div>+ parseCircuitDSL(dsl): Result</div>
                        <div>+ serializeCircuitToDSL(sch): Str</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 space-y-2">
                      <div className="font-mono font-bold text-amber-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>CustomComponentDef</span>
                        <span className="text-[10px] text-slate-400">«SubcircuitIC»</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                        <div>+ abbreviation: String</div>
                        <div>+ logicExpressions: Map</div>
                        <div>+ truthTable: Matrix</div>
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-mono text-[11px] text-amber-300">
                        <div>+ evaluatePins(env): Map</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'er' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <span className="font-bold text-indigo-400">TABLA SCHEMATICS (1)</span>
                        <div className="text-[11px] text-slate-400">
                          PK: id | name | author | version | active_branch | updated_at
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          Relación 1:N con COMPONENTS, WIRES, COMMITS, CUSTOM_ICS
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-400">TABLA COMPONENTS (N)</span>
                        <div className="text-[11px] text-slate-400">
                          PK: id | FK: schematic_id | type | label | pos_x | pos_y | rotation | state_data
                        </div>
                        <div className="text-[10px] text-cyan-400">
                          Relación 1:N con PINS (inputs/outputs)
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <span className="font-bold text-cyan-400">TABLA WIRES (N)</span>
                        <div className="text-[11px] text-slate-400">
                          PK: id | FK: from_comp_id | FK: from_pin_id | FK: to_comp_id | FK: to_pin_id | logic_state
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Enlaza PINS de salida a PINS de entrada (Red Equipotencial)
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <span className="font-bold text-rose-400">TABLA DRC_VIOLATIONS (N)</span>
                        <div className="text-[11px] text-slate-400">
                          PK: id | FK: schematic_id | rule_code | severity | message | target_refs
                        </div>
                        <div className="text-[10px] text-rose-300">
                          Auditoría de contención de salidas, bucles y pines flotantes
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sequence' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-emerald-400">Secuencia 1: Propagación Reactiva de Señales Lógicas</div>
                      <div className="text-[11px] text-slate-300 space-y-1 font-sans">
                        <div>1. El usuario conmuta un interruptor (SWITCH) en el lienzo esquemático.</div>
                        <div>2. <code>SchematicCanvas</code> despacha <code>simulateCircuit()</code> al motor de simulación.</div>
                        <div>3. El motor evalúa compuertas lógicas (AND, OR, NOT, Flip-Flops) y resuelve la cola de propagación.</div>
                        <div>4. Los cables calculan niveles lógicos (1, 0, Z) y se actualizan visualmente con iluminación neón.</div>
                        <div>5. El osciloscopio digital agrega muestras al buffer para graficar los diagramas de tiempo.</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-rose-400">Secuencia 2: Validación de Reglas de Diseño DRC en Tiempo Real</div>
                      <div className="text-[11px] text-slate-300 space-y-1 font-sans">
                        <div>1. Se traza un cable entre terminales o se modifica un componente.</div>
                        <div>2. <code>DrcValidator.validateCircuitDRC()</code> audita la red eléctrica en milisegundos.</div>
                        <div>3. Si dos salidas convergen en un nodo, se genera una infracción <code>OUTPUT_CONTENTION</code>.</div>
                        <div>4. El lienzo marca los cables en rojo neón parpadeante y muestra el icono de advertencia.</div>
                        <div>5. La barra de herramientas actualiza el contador de alertas DRC y permite enfocar el problema.</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'interaction' && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-sans text-xs">
                    <h4 className="font-bold text-blue-400">Flujo de Interacción Colaborativa Multiusuario</h4>
                    <p className="text-slate-300 leading-relaxed">
                      Cuando varios usuarios colaboran en la misma sala (<code>CIRCUIT-74LS</code>), cada movimiento de cursor y desplazamiento de compuertas se transmite a través del canal de sincronización. El motor local ejecuta inmediatamente el análisis DRC para asegurar que las modificaciones de cualquier participante mantengan la integridad eléctrica del circuito.
                    </p>
                  </div>
                )}

                {activeTab === 'usecase' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                      <span className="font-bold text-indigo-400">Actores Principales</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                        <li><strong>Diseñador / Ingeniero:</strong> Crea esquemáticos, conecta terminales, simula y exporta.</li>
                        <li><strong>Colaborador Concurrente:</strong> Visualiza o edita en vivo con permisos asignados.</li>
                        <li><strong>Agente IA Gemini:</strong> Asiste en la depuración, optimización de compuertas y generación HDL.</li>
                        <li><strong>Motor DRC:</strong> Supervisa en segundo plano la coherencia eléctrica del plano.</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                      <span className="font-bold text-emerald-400">Casos de Uso Nucleares</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                        <li>CU-01: Auto-posicionar compuertas topológicamente (DAG).</li>
                        <li>CU-02: Auditar contención de señales y entradas flotantes (DRC).</li>
                        <li>CU-03: Crear chips personalizados con expresiones booleanas o tablas de verdad.</li>
                        <li>CU-04: Sincronizar bidireccionalmente con lenguaje formal (Circuit DSL).</li>
                        <li>CU-05: Exportar plano formal con cajetín UNE/IEC a PDF de alta resolución.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'domain' && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 font-sans text-xs">
                    <h4 className="font-bold text-purple-400">Modelo Conceptual del Dominio de Electrónica Digital</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                        <strong className="text-white text-xs">Red Eléctrica (Net/Node)</strong>
                        <p className="text-[11px] text-slate-400">
                          Medio de conducción equipotencial que interconecta pines de salida con pines de entrada.
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                        <strong className="text-white text-xs">Nivel Lógico Cuadrivalente</strong>
                        <p className="text-[11px] text-slate-400">
                          Estados discretos: 1 (Alto / VCC), 0 (Bajo / GND), Z (Alta Impedancia), e Indefinido (Flotante).
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                        <strong className="text-white text-xs">Infracción DRC</strong>
                        <p className="text-[11px] text-slate-400">
                          Violación a reglas de integridad eléctrica: cortocircuitos, entradas flotantes o carreras combinacionales.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <span className="text-[11px] text-slate-400">
            Compatible con herramientas estándar UML (Mermaid, PlantUML y diagramadores de ingeniería).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
