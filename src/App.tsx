/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  CircuitComponent,
  CircuitWire,
  CollaboratorUser,
  Commit,
  ComponentType,
  CustomComponentDef,
  LogicValue,
  Schematic,
  UserRole,
} from './types/circuit';
import { loadPresetSchematic } from './engine/presets';
import { simulateCircuit } from './engine/simulation';
import { autoLayoutCircuit } from './engine/autolayout';
import { createComponentInstance } from './engine/catalog';
import { parseCircuitDSL, serializeCircuitToDSL } from './engine/dsl';
import { validateCircuitDRC } from './engine/drc';

import { Toolbar } from './components/Toolbar';
import { ComponentDrawer } from './components/ComponentDrawer';
import { SchematicCanvas } from './components/SchematicCanvas';
import { DslPanel } from './components/DslPanel';
import { CustomComponentModal } from './components/CustomComponentModal';
import { VersionControlModal } from './components/VersionControlModal';
import { CollaborationModal } from './components/CollaborationModal';
import { GitHubModal } from './components/GitHubModal';
import { ExportModal } from './components/ExportModal';
import { OscilloscopePanel } from './components/OscilloscopePanel';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { DrcPanel } from './components/DrcPanel';
import { UmlViewerModal } from './components/UmlViewerModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuModal } from './components/MobileMenuModal';

export default function App() {
  // Initialize with Full Adder preset or saved project
  const [schematic, setSchematic] = useState<Schematic>(() => {
    try {
      const saved = localStorage.getItem('logicirc_current_schematic');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return loadPresetSchematic('full_adder');
  });

  // UI Selection State
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(2); // Hz
  const [hasOscillation, setHasOscillation] = useState(false);
  const [activeSignalsCount, setActiveSignalsCount] = useState(0);

  // Appearance & Theme
  const [isDarkMode, setIsDarkMode] = useState(true);

  // User & Permissions
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<CollaboratorUser>({
    id: `usr_${Math.random().toString(36).substring(2, 7)}`,
    name: 'Ingeniero',
    color: '#10b981',
    role: 'admin',
    lastActive: new Date().toISOString(),
  });

  // Collaboration Room
  const [roomId, setRoomId] = useState('CIRCUIT-74LS');
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);

  // Modal & Drawer States
  const [isDslPanelOpen, setIsDslPanelOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isOscilloscopeOpen, setIsOscilloscopeOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDrcPanelOpen, setIsDrcPanelOpen] = useState(false);
  const [isUmlModalOpen, setIsUmlModalOpen] = useState(false);
  const [isComponentDrawerOpen, setIsComponentDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real-Time Design Rule Check (DRC) validation report
  const drcReport = useMemo(() => {
    return validateCircuitDRC(schematic.components, schematic.wires);
  }, [schematic.components, schematic.wires]);

  // Oscilloscope Waveforms History
  const [waveformChannels, setWaveformChannels] = useState<
    Array<{ id: string; label: string; history: LogicValue[] }>
  >([]);
  const [isOscilloscopePaused, setIsOscilloscopePaused] = useState(false);

  // Hidden File Input for Importing .json or .hdl
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('logicirc_current_schematic', JSON.stringify(schematic));
    } catch {
      // storage quota or private mode
    }
  }, [schematic]);

  // Simulation Evaluation Tick
  const runSimulationStep = useCallback(
    (clockTick = false) => {
      setSchematic((prev) => {
        const result = simulateCircuit(
          prev.components,
          prev.wires,
          prev.customComponents,
          { clockTick }
        );

        setHasOscillation(result.hasOscillation);
        setActiveSignalsCount(result.activeSignalsCount);

        // Record waveform history for monitored outputs
        if (!isOscilloscopePaused) {
          setWaveformChannels((prevChans) => {
            const nextChans = [...prevChans];
            for (const comp of result.components) {
              for (const pin of comp.outputs) {
                const chanId = `${comp.id}:${pin.id}`;
                const chanIdx = nextChans.findIndex((c) => c.id === chanId);
                const val = pin.state ?? 0;
                if (chanIdx >= 0) {
                  const updatedHistory = [...nextChans[chanIdx].history, val];
                  if (updatedHistory.length > 50) updatedHistory.shift();
                  nextChans[chanIdx] = {
                    ...nextChans[chanIdx],
                    history: updatedHistory,
                  };
                } else if (nextChans.length < 8) {
                  // Auto-register channel
                  nextChans.push({
                    id: chanId,
                    label: `${comp.label}.${pin.name}`,
                    history: [val],
                  });
                }
              }
            }
            return nextChans;
          });
        }

        return {
          ...prev,
          components: result.components,
          wires: result.wires,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [isOscilloscopePaused]
  );

  // Active Simulation Interval Loop
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = Math.max(40, Math.round(1000 / simulationSpeed));
    let tickCount = 0;

    const timer = setInterval(() => {
      tickCount++;
      const isClockPulse = tickCount % 2 === 0;
      runSimulationStep(isClockPulse);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simulationSpeed, runSimulationStep]);

  // Peer cursor subtle drift simulation for realism
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setCollaborators((prev) =>
        prev.map((c) => {
          if (!c.cursor) return c;
          const dx = (Math.random() - 0.5) * 8;
          const dy = (Math.random() - 0.5) * 8;
          return {
            ...c,
            cursor: {
              x: Math.max(100, Math.min(900, c.cursor.x + dx)),
              y: Math.max(100, Math.min(600, c.cursor.y + dy)),
            },
          };
        })
      );
    }, 1500);

    return () => clearInterval(cursorTimer);
  }, []);

  // Handlers for Canvas Interactions
  const handleSelectComponent = (id: string, multiSelect = false) => {
    if (!id) {
      setSelectedComponentIds([]);
      return;
    }
    if (multiSelect) {
      setSelectedComponentIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedComponentIds([id]);
    }
    setSelectedWireId(null);
  };

  const handleSelectWire = (wireId: string | null) => {
    setSelectedWireId(wireId);
    if (wireId) {
      setSelectedComponentIds([]);
    }
  };

  const handleMoveComponents = (moves: Array<{ id: string; x: number; y: number }>) => {
    if (userRole === 'viewer') return;
    setSchematic((prev) => {
      const moveMap = new Map(moves.map((m) => [m.id, { x: m.x, y: m.y }]));
      const updatedComponents = prev.components.map((c) => {
        const nextPos = moveMap.get(c.id);
        return nextPos ? { ...c, x: nextPos.x, y: nextPos.y } : c;
      });
      return { ...prev, components: updatedComponents };
    });
  };

  const handleAddWire = (
    fromCompId: string,
    fromPinId: string,
    toCompId: string,
    toPinId: string
  ) => {
    if (userRole === 'viewer') return;

    setSchematic((prev) => {
      // Avoid duplicate wire
      const exists = prev.wires.some(
        (w) =>
          w.fromComponentId === fromCompId &&
          w.fromPinId === fromPinId &&
          w.toComponentId === toCompId &&
          w.toPinId === toPinId
      );
      if (exists) return prev;

      const newWire: CircuitWire = {
        id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromComponentId: fromCompId,
        fromPinId: fromPinId,
        toComponentId: toCompId,
        toPinId: toPinId,
        state: 0,
      };

      const updatedWires = [...prev.wires, newWire];
      return { ...prev, wires: updatedWires };
    });

    // Re-evaluate simulation immediately
    setTimeout(() => runSimulationStep(false), 20);
  };

  const handleDeleteSelected = () => {
    if (userRole === 'viewer') return;

    if (selectedComponentIds.length > 0) {
      setSchematic((prev) => {
        const remainingComps = prev.components.filter(
          (c) => !selectedComponentIds.includes(c.id)
        );
        const remainingWires = prev.wires.filter(
          (w) =>
            !selectedComponentIds.includes(w.fromComponentId) &&
            !selectedComponentIds.includes(w.toComponentId)
        );
        return { ...prev, components: remainingComps, wires: remainingWires };
      });
      setSelectedComponentIds([]);
    } else if (selectedWireId) {
      setSchematic((prev) => ({
        ...prev,
        wires: prev.wires.filter((w) => w.id !== selectedWireId),
      }));
      setSelectedWireId(null);
    }
    setTimeout(() => runSimulationStep(false), 20);
  };

  const handleDuplicateSelected = () => {
    if (userRole === 'viewer' || selectedComponentIds.length === 0) return;

    setSchematic((prev) => {
      const newComps: CircuitComponent[] = [];
      const newIds: string[] = [];

      for (const id of selectedComponentIds) {
        const target = prev.components.find((c) => c.id === id);
        if (target) {
          const customDef = target.state.customIcId
            ? prev.customComponents.find((c) => c.id === target.state.customIcId)
            : undefined;
          const dup = createComponentInstance(
            target.type,
            target.x + 30,
            target.y + 30,
            `${target.label}_Copia`,
            customDef
          );
          dup.state = { ...target.state };
          newComps.push(dup);
          newIds.push(dup.id);
        }
      }

      return {
        ...prev,
        components: [...prev.components, ...newComps],
      };
    });
  };

  const handleRotateSelected = () => {
    if (userRole === 'viewer' || selectedComponentIds.length === 0) return;

    setSchematic((prev) => {
      const updated = prev.components.map((c) => {
        if (selectedComponentIds.includes(c.id)) {
          const nextRot = ((c.rotation || 0) + 90) % 360 as 0 | 90 | 180 | 270;
          return { ...c, rotation: nextRot };
        }
        return c;
      });
      return { ...prev, components: updated };
    });
  };

  const handleToggleComponentState = (
    componentId: string,
    updates: Record<string, any>
  ) => {
    setSchematic((prev) => {
      const updated = prev.components.map((c) =>
        c.id === componentId ? { ...c, state: { ...c.state, ...updates } } : c
      );
      return { ...prev, components: updated };
    });
    // Instant step
    setTimeout(() => runSimulationStep(false), 10);
  };

  const handleDropNewComponent = (
    type: ComponentType,
    x: number,
    y: number,
    customDefId?: string
  ) => {
    if (userRole === 'viewer') return;

    const customDef = customDefId
      ? schematic.customComponents.find((c) => c.id === customDefId)
      : undefined;

    const newComp = createComponentInstance(type, x, y, undefined, customDef);

    setSchematic((prev) => ({
      ...prev,
      components: [...prev.components, newComp],
    }));

    setSelectedComponentIds([newComp.id]);
    setTimeout(() => runSimulationStep(false), 20);
  };

  // Auto-Layout
  const handleAutoLayout = () => {
    if (userRole === 'viewer') return;
    const arranged = autoLayoutCircuit(schematic.components, schematic.wires);
    setSchematic((prev) => ({
      ...prev,
      components: arranged,
    }));
  };

  // Load Preset Circuit
  const handleLoadPreset = (presetId: string) => {
    const loaded = loadPresetSchematic(presetId);
    setSchematic(loaded);
    setSelectedComponentIds([]);
    setSelectedWireId(null);
    setTimeout(() => runSimulationStep(false), 20);
  };

  // Create Commit Snapshot
  const handleCreateCommit = (message: string) => {
    const newCommit: Commit = {
      id: `commit_${Date.now().toString(36)}`,
      message,
      timestamp: new Date().toISOString(),
      author: currentUser.name,
      componentsCount: schematic.components.length,
      wiresCount: schematic.wires.length,
      snapshot: {
        components: schematic.components,
        wires: schematic.wires,
      },
    };

    setSchematic((prev) => ({
      ...prev,
      commits: [newCommit, ...(prev.commits || [])],
    }));
  };

  // Restore Commit Snapshot
  const handleRestoreCommit = (commit: Commit) => {
    if (userRole === 'viewer') return;
    setSchematic((prev) => ({
      ...prev,
      components: commit.snapshot.components,
      wires: commit.snapshot.wires,
      updatedAt: new Date().toISOString(),
    }));
    setTimeout(() => runSimulationStep(false), 20);
  };

  // Save Project as JSON file download
  const handleSaveProject = () => {
    const jsonStr = JSON.stringify(schematic, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(schematic.name || 'circuito').replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger file picker for import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (parsed.components && parsed.wires) {
            setSchematic(parsed);
          }
        } else {
          // Parse as formal HDL / DSL
          const { schematic: parsedSch } = parseCircuitDSL(content);
          if (parsedSch) {
            handleApplyDsl(parsedSch);
          }
        }
      } catch (err) {
        alert('Error al leer el archivo. Asegúrate de que sea un archivo JSON o HDL válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Apply parsed DSL to circuit
  const handleApplyDsl = (updated: Partial<Schematic>) => {
    setSchematic((prev) => ({
      ...prev,
      ...updated,
      components: updated.components || prev.components,
      wires: updated.wires || prev.wires,
      customComponents: updated.customComponents || prev.customComponents,
      updatedAt: new Date().toISOString(),
    }));
    setTimeout(() => runSimulationStep(false), 20);
  };

  // Save custom component to library
  const handleSaveCustomComponent = (def: CustomComponentDef) => {
    setSchematic((prev) => ({
      ...prev,
      customComponents: [...(prev.customComponents || []), def],
    }));
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Hidden File Import Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.hdl,.dsl,.txt"
        className="hidden"
      />

      {/* Top Main Toolbar */}
      <Toolbar
        projectName={schematic.name}
        onUpdateProjectName={(name) => setSchematic((prev) => ({ ...prev, name }))}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating((prev) => !prev)}
        onStepSimulation={() => runSimulationStep(true)}
        onResetSimulation={() => {
          setSchematic((prev) => ({
            ...prev,
            components: prev.components.map((c) => ({
              ...c,
              state: { ...c.state, isOn: false, isPressed: false, storedValue: 0 },
            })),
          }));
          setTimeout(() => runSimulationStep(false), 20);
        }}
        simulationSpeed={simulationSpeed}
        onChangeSimulationSpeed={setSimulationSpeed}
        onAutoLayout={handleAutoLayout}
        onLoadPreset={handleLoadPreset}
        onSaveProject={handleSaveProject}
        onImportClick={handleImportClick}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenVersionModal={() => setIsVersionModalOpen(true)}
        onOpenCollabModal={() => setIsCollabModalOpen(true)}
        onOpenGithubModal={() => setIsGithubModalOpen(true)}
        onToggleDslPanel={() => setIsDslPanelOpen((prev) => !prev)}
        isDslPanelOpen={isDslPanelOpen}
        onToggleOscilloscope={() => setIsOscilloscopeOpen((prev) => !prev)}
        isOscilloscopeOpen={isOscilloscopeOpen}
        onToggleAiAssistant={() => setIsAiAssistantOpen((prev) => !prev)}
        isAiAssistantOpen={isAiAssistantOpen}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        activeBranch={schematic.activeBranch || 'main'}
        commitsCount={schematic.commits?.length || 1}
        collaboratorsCount={collaborators.length + 1}
        activeSignalsCount={activeSignalsCount}
        hasOscillation={hasOscillation}
        drcReport={drcReport}
        isDrcPanelOpen={isDrcPanelOpen}
        onToggleDrcPanel={() => setIsDrcPanelOpen((prev) => !prev)}
        onOpenUmlModal={() => setIsUmlModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Workspace Area (Left Palette + Center Canvas + Right Drawers) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Component Drawer */}
        <ComponentDrawer
          onSelectComponent={(type, customDef) => {
            handleDropNewComponent(type, 260, 180, customDef?.id);
          }}
          customComponents={schematic.customComponents || []}
          onOpenCustomModal={() => setIsCustomModalOpen(true)}
          isReadOnly={userRole === 'viewer'}
          isOpenOnMobile={isComponentDrawerOpen}
          onCloseMobile={() => setIsComponentDrawerOpen(false)}
        />

        {/* Center Canvas Area + Oscilloscope */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <SchematicCanvas
            components={schematic.components}
            wires={schematic.wires}
            selectedComponentIds={selectedComponentIds}
            selectedWireId={selectedWireId}
            onSelectComponent={handleSelectComponent}
            onSelectWire={handleSelectWire}
            onMoveComponents={handleMoveComponents}
            onAddWire={handleAddWire}
            onDeleteSelected={handleDeleteSelected}
            onDuplicateSelected={handleDuplicateSelected}
            onRotateSelected={handleRotateSelected}
            onToggleComponentState={handleToggleComponentState}
            onDropNewComponent={handleDropNewComponent}
            customComponents={schematic.customComponents || []}
            collaborators={collaborators}
            isDarkMode={isDarkMode}
            isReadOnly={userRole === 'viewer'}
            drcReport={drcReport}
          />

          {/* Oscilloscope Panel at Bottom */}
          <OscilloscopePanel
            isOpen={isOscilloscopeOpen}
            onClose={() => setIsOscilloscopeOpen(false)}
            channels={waveformChannels}
            onClearHistory={() => setWaveformChannels([])}
            isPaused={isOscilloscopePaused}
            onTogglePause={() => setIsOscilloscopePaused((p) => !p)}
          />
        </div>

        {/* Right Side: Bidirectional DSL Editor Panel */}
        <DslPanel
          isOpen={isDslPanelOpen}
          onClose={() => setIsDslPanelOpen(false)}
          schematic={schematic}
          onApplyDsl={handleApplyDsl}
          isReadOnly={userRole === 'viewer'}
        />

        {/* Right Side: DRC Design Rule Inspector Drawer */}
        <DrcPanel
          isOpen={isDrcPanelOpen}
          onClose={() => setIsDrcPanelOpen(false)}
          report={drcReport}
          onSelectComponent={(compId) => {
            setSelectedComponentIds([compId]);
            setSelectedWireId(null);
          }}
          onSelectWire={(wireId) => {
            setSelectedWireId(wireId);
            setSelectedComponentIds([]);
          }}
        />

        {/* Right Side: AI Assistant Drawer */}
        <AiAssistantDrawer
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          schematic={schematic}
          onApplyGeneratedDsl={handleApplyDsl}
        />
      </div>

      {/* Modals */}
      <CustomComponentModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveComponent={handleSaveCustomComponent}
      />

      <VersionControlModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        commits={schematic.commits || []}
        currentBranch={schematic.activeBranch || 'main'}
        userRole={userRole}
        onChangeUserRole={setUserRole}
        onCreateCommit={handleCreateCommit}
        onRestoreCommit={handleRestoreCommit}
        currentComponentsCount={schematic.components.length}
        currentWiresCount={schematic.wires.length}
      />

      <CollaborationModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        roomId={roomId}
        collaborators={collaborators}
        currentUser={currentUser}
        onUpdateCurrentUser={(updates) => setCurrentUser((prev) => ({ ...prev, ...updates }))}
        onJoinRoom={(newRoomId) => setRoomId(newRoomId)}
      />

      <GitHubModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        projectName={schematic.name}
        dslContent={serializeCircuitToDSL(schematic)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        schematic={schematic}
      />

      <UmlViewerModal
        isOpen={isUmlModalOpen}
        onClose={() => setIsUmlModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Thumb-First Ergonomics) */}
      <MobileBottomNav
        onOpenComponentDrawer={() => setIsComponentDrawerOpen((prev) => !prev)}
        isComponentDrawerOpen={isComponentDrawerOpen}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating((prev) => !prev)}
        onStepSimulation={() => runSimulationStep(true)}
        drcReport={drcReport}
        onToggleDrcPanel={() => setIsDrcPanelOpen((prev) => !prev)}
        isDrcPanelOpen={isDrcPanelOpen}
        isOscilloscopeOpen={isOscilloscopeOpen}
        onToggleOscilloscope={() => setIsOscilloscopeOpen((prev) => !prev)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Tools & Features Sheet Modal */}
      <MobileMenuModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLoadPreset={handleLoadPreset}
        onAutoLayout={handleAutoLayout}
        onSaveProject={handleSaveProject}
        onImportClick={handleImportClick}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenVersionModal={() => setIsVersionModalOpen(true)}
        onOpenCollabModal={() => setIsCollabModalOpen(true)}
        onOpenGithubModal={() => setIsGithubModalOpen(true)}
        onOpenDslPanel={() => setIsDslPanelOpen(true)}
        onOpenUmlModal={() => setIsUmlModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onResetSimulation={() => {
          setSchematic((prev) => ({
            ...prev,
            components: prev.components.map((c) => ({
              ...c,
              state: { ...c.state, isOn: false, isPressed: false, storedValue: 0 },
            })),
          }));
          setTimeout(() => runSimulationStep(false), 20);
        }}
        simulationSpeed={simulationSpeed}
        onChangeSimulationSpeed={setSimulationSpeed}
        activeBranch={schematic.activeBranch || 'main'}
        commitsCount={schematic.commits?.length || 1}
        collaboratorsCount={collaborators.length + 1}
      />
    </div>
  );
}
