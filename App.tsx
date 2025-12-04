import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  useReactFlow,
  MiniMap
} from 'reactflow';

import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import ExecutionPanel from './components/ExecutionPanel';
import CustomNode from './components/nodes/CustomNode';
import OnboardingTour from './components/OnboardingTour';
import { NodeType, NodeStatus, ExecutionLog, MemoryMessage } from './types';
import { ExecutionEngine } from './services/executionEngine';

// Node Types Registry
const nodeTypes = {
  [NodeType.START]: CustomNode,
  [NodeType.LLM]: CustomNode,
  [NodeType.HTTP]: CustomNode,
  [NodeType.CODE]: CustomNode,
  [NodeType.IF_ELSE]: CustomNode,
  [NodeType.DELAY]: CustomNode,
  [NodeType.END]: CustomNode,
};

// Initial Data
const initialNodes: Node[] = [
  { 
    id: 'start-1', 
    type: NodeType.START, 
    position: { x: 100, y: 300 }, 
    data: { 
        label: 'Start Trigger', 
        type: NodeType.START, 
        config: { initialData: '{\n  "query": "Tell me a joke about programming",\n  "user": "Developer"\n}' } 
    } 
  },
  {
    id: 'llm-1',
    type: NodeType.LLM,
    position: { x: 400, y: 300 },
    data: {
        label: 'Gemini Agent',
        type: NodeType.LLM,
        config: {
            model: 'gemini-2.5-flash',
            prompt: '{{input.query}}',
            temperature: 0.7
        }
    }
  }
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'start-1', target: 'llm-1', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }
];

const FlowArea = ({ 
    logs, setLogs, isRunning, setIsRunning, 
    selectedNodeId, setSelectedNodeId, 
    sessionMemory, setSessionMemory,
    isTourOpen, closeTour, openTour
}: any) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow/type') as NodeType;
            const label = event.dataTransfer.getData('application/reactflow/label');

            if (typeof type === 'undefined' || !type) return;

            // Check if instance is ready
            if (!reactFlowInstance) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { 
                    label: label, 
                    type: type, 
                    config: {}, 
                    status: NodeStatus.IDLE 
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, [setSelectedNodeId]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, [setSelectedNodeId]);

    const handleDeleteNode = (id: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        setSelectedNodeId(null);
    };

    const updateNodeData = (id: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: newData };
                }
                return node;
            })
        );
    };

    const updateNodeStatus = (id: string, status: NodeStatus, output?: any, error?: string, duration?: number) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                return {
                    ...node,
                    data: {
                    ...node.data,
                    status,
                    output: output !== undefined ? output : node.data.output,
                    error,
                    executionTime: duration
                    }
                };
                }
                return node;
            })
        );
    };

    const handleRun = async () => {
        if (isRunning) return;
        
        setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: NodeStatus.IDLE, error: undefined, executionTime: undefined } })));
        setLogs([]);
        setIsRunning(true);

        try {
            const engine = new ExecutionEngine(
                nodes, 
                edges, 
                {}, 
                sessionMemory, // Pass current memory
                updateNodeStatus, 
                (log) => setLogs((prev: any) => [...prev, log])
            );
            
            await engine.run();
            
            // Update session memory with result from engine
            setSessionMemory(engine.getMemory());

        } catch (e: any) {
            console.error("Execution failed", e);
            alert("Workflow Error: " + e.message);
        } finally {
            setIsRunning(false);
        }
    };

    const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            <Sidebar onOpenTour={openTour} />
            
            <div className="flex-1 h-full relative flex flex-col">
                <div className="flex-1 relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                        snapToGrid
                        deleteKeyCode={["Backspace", "Delete"]}
                        className="bg-slate-950"
                    >
                        <Controls className="bg-slate-800 border-slate-700 fill-slate-200" />
                        <MiniMap 
                            className="!bg-slate-900 !border-slate-800" 
                            maskColor="rgba(15, 23, 42, 0.6)"
                            nodeColor={(n) => {
                                if (n.type === NodeType.START) return '#10b981';
                                if (n.type === NodeType.IF_ELSE) return '#f43f5e';
                                return '#64748b';
                            }} 
                        />
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
                        
                        <Panel position="top-right" className="flex gap-2 p-2">
                             <div className="bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-700 flex gap-2">
                                <div className="px-3 py-2 flex items-center gap-2 border-r border-slate-700">
                                    <span className="text-[10px] uppercase font-bold text-slate-500">Session Memory</span>
                                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-xs font-mono text-purple-400">{sessionMemory.length} msgs</span>
                                    {sessionMemory.length > 0 && (
                                        <button 
                                            onClick={() => setSessionMemory([])}
                                            className="ml-2 text-[10px] text-rose-500 hover:text-rose-400 hover:underline"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={handleRun}
                                    disabled={isRunning}
                                    className={`
                                        px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-all shadow-xl
                                        ${isRunning 
                                            ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'
                                        }
                                    `}
                                >
                                    {isRunning ? (
                                        <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Running...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Run Workflow
                                        </>
                                    )}
                                </button>
                             </div>
                        </Panel>
                    </ReactFlow>
                </div>
                
                <ExecutionPanel logs={logs} isRunning={isRunning} onClear={() => setLogs([])} />
            </div>

            <PropertiesPanel node={selectedNode} onChange={updateNodeData} onDelete={handleDeleteNode} />
            
            <OnboardingTour isOpen={isTourOpen} onClose={closeTour} />
        </div>
    );
};

const App = () => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sessionMemory, setSessionMemory] = useState<MemoryMessage[]>([]);
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    // Show tour every time the app loads (per user request)
    setTimeout(() => setIsTourOpen(true), 500);
  }, []);

  const closeTour = () => {
      setIsTourOpen(false);
  };

  const openTour = () => {
      setIsTourOpen(true);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col">
        <FlowArea
          logs={logs}
          setLogs={setLogs}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          sessionMemory={sessionMemory}
          setSessionMemory={setSessionMemory}
          isTourOpen={isTourOpen}
          closeTour={closeTour}
          openTour={openTour}
        />
      </div>
    </ReactFlowProvider>
  );
};

export default App;