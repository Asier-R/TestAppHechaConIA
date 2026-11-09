# Especificación Arquitectónica y Diagramas UML - LogiCirc

Este documento describe formalmente la arquitectura del software **LogiCirc**, su modelo relacional, flujo de señales reactivas, interacción de componentes, casos de uso y modelo de dominio.

---

## 1. Diagrama de Clases (Class Diagram)

\`\`\`mermaid
classDiagram
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
    DslParser ..> Schematic : serializa/parsea
\`\`\`

---

## 2. Diagrama Entidad-Relación (Entity-Relationship Diagram)

\`\`\`mermaid
erDiagram
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
    }
\`\`\`

---

## 3. Diagramas de Secuencia (Sequence Diagrams)

### Secuencia A: Ciclo de Simulación y Propagación de Señal
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Usuario as Diseñador
    participant Canvas as SchematicCanvas
    participant Engine as SimulationEngine
    participant DRC as DrcValidator
    participant Scope as OscilloscopePanel

    Usuario->>Canvas: Clic en Interruptor (Switch ON/OFF)
    Canvas->>Engine: simulateCircuit(components, wires)
    loop Propagación de Señales (max 25 iteraciones)
        Engine->>Engine: Evalúa compuertas (AND, OR, XOR, etc.)
        Engine->>Engine: Propaga niveles (1, 0, Z) a través de cables
    end
    Engine-->>Canvas: SimulationStepResult (estados actualizados)
    Canvas->>Scope: Registrar muestras de señal en canales
    Scope-->>Usuario: Dibuja formas de onda cuadradas en tiempo real
\`\`\`

### Secuencia B: Validación de Reglas de Diseño DRC en Tiempo Real
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Usuario as Diseñador
    participant Canvas as SchematicCanvas
    participant DRC as DrcValidator

    Usuario->>Canvas: Conecta Cable de Salida A a Salida B (Conflicto Eléctrico)
    Canvas->>DRC: validateCircuitDRC(components, wires)
    DRC->>DRC: Detecta OUTPUT_CONTENTION (Múltiples drivers en un nodo)
    DRC-->>Canvas: DrcReport (conflictingWireIds, conflictingComponentIds)
    Canvas-->>Usuario: Ilumina cables en ROJO neón y muestra badge de advertencia (!)
\`\`\`

---

## 4. Diagramas de Interacción y Comunicación (Collaboration & State Flow)

\`\`\`mermaid
sequenceDiagram
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
    StateManager-->>CollabA: Cable sincronizado en vivo
\`\`\`

---

## 5. Diagramas de Casos de Uso (Use Case Diagrams)

\`\`\`mermaid
flowchart TD
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

    GitHub --> UC11
\`\`\`

---

## 6. Diagrama de Modelo de Dominio (Domain Model Diagram)

\`\`\`mermaid
classDiagram
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
    CircuitoLogico "1" ..> "many" ReglaDisenoDRC : auditado por
\`\`\`
