import { Node, Edge } from 'reactflow';

export enum NodeType {
  START = 'start',
  LLM = 'llm',
  HTTP = 'http',
  CODE = 'code',
  IF_ELSE = 'if_else',
  DELAY = 'delay',
  END = 'end'
}

export enum NodeStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  SKIPPED = 'skipped'
}

export interface NodeData {
  label: string;
  type: NodeType;
  status?: NodeStatus;
  config: Record<string, any>;
  output?: any;
  error?: string;
  executionTime?: number; // ms
}

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge;

export interface MemoryMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}

export interface ExecutionLog {
  nodeId: string;
  nodeLabel: string;
  status: NodeStatus;
  input: any;
  output: any;
  timestamp: number;
  duration: number;
  error?: string;
  memoryContext?: MemoryMessage[]; // Snapshot of memory used for this execution
}

export interface WorkflowContext {
  variables: Record<string, any>;
  memory: MemoryMessage[];
  history: ExecutionLog[];
}