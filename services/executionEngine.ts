import { WorkflowNode, WorkflowEdge, NodeType, NodeStatus, ExecutionLog, MemoryMessage } from '../types';
import { generateText } from './geminiService';

export class ExecutionEngine {
  private nodes: WorkflowNode[];
  private edges: WorkflowEdge[];
  private context: Record<string, any>;
  private memory: MemoryMessage[];
  private updateNodeStatus: (nodeId: string, status: NodeStatus, output?: any, error?: string, duration?: number) => void;
  private logExecution: (log: ExecutionLog) => void;

  constructor(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    context: Record<string, any>,
    memory: MemoryMessage[],
    updateNodeStatus: (nodeId: string, status: NodeStatus, output?: any, error?: string, duration?: number) => void,
    logExecution: (log: ExecutionLog) => void
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.context = { ...context };
    this.memory = [...memory]; // Create a local copy to work with during execution
    this.updateNodeStatus = updateNodeStatus;
    this.logExecution = logExecution;
  }

  private getNodeById(id: string): WorkflowNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }

  private getOutgoingEdges(nodeId: string, handleId?: string | null): WorkflowEdge[] {
    return this.edges.filter((e) => {
      if (e.source !== nodeId) return false;
      if (handleId && e.sourceHandle && e.sourceHandle !== handleId) return false;
      return true;
    });
  }

  private evaluateExpression(expression: string, input: any): any {
    try {
      // Basic safety check could be added here, but for workflow tools, users often need full power.
      const func = new Function('input', 'context', `return ${expression};`);
      return func(input, this.context);
    } catch (err: any) {
      console.error("Expression Eval Error", err);
      throw new Error(`Condition failed: ${err.message}`);
    }
  }

  // Getter to retrieve the updated memory after execution
  public getMemory(): MemoryMessage[] {
    return this.memory;
  }

  async executeNode(nodeId: string, inputData: any) {
    const node = this.getNodeById(nodeId);
    if (!node) return;

    const startTime = performance.now();
    this.updateNodeStatus(nodeId, NodeStatus.RUNNING);

    let outputData = inputData;
    let nextHandle: string | null = null;
    let errorMsg: string | undefined;
    let usedMemoryContext: MemoryMessage[] | undefined;

    try {
      switch (node.data.type) {
        case NodeType.START:
          try {
            const initialJson = node.data.config.initialData || '{}';
            outputData = JSON.parse(initialJson);
          } catch (e) {
            outputData = { error: "Invalid JSON in Start Node" };
            throw new Error("Invalid JSON in Start Node configuration");
          }
          break;

        case NodeType.LLM:
          const { model, prompt, systemInstruction, temperature, useMemory, memoryWindow } = node.data.config;
          
          // Interpolate prompt
          const interpolatedPrompt = (prompt || '').replace(/\{\{input\}\}/g, typeof inputData === 'string' ? inputData : JSON.stringify(inputData));
          
          // Prepare Memory Context
          let history: MemoryMessage[] = [];
          if (useMemory) {
              const windowSize = parseInt(memoryWindow) || 10;
              // Get last N messages
              history = this.memory.slice(-windowSize);
              usedMemoryContext = [...history]; // Snapshot for logs
          }

          // Call AI
          const textResponse = await generateText(
            model || 'gemini-2.5-flash',
            interpolatedPrompt,
            systemInstruction,
            parseFloat(temperature) || 0.7,
            history
          );
          
          // Update Memory if enabled
          if (useMemory) {
              this.memory.push({
                  role: 'user',
                  parts: [{ text: interpolatedPrompt }],
                  timestamp: Date.now()
              });
              this.memory.push({
                  role: 'model',
                  parts: [{ text: textResponse }],
                  timestamp: Date.now()
              });
          }

          outputData = { text: textResponse };
          break;

        case NodeType.CODE:
            const { code } = node.data.config;
            const sandbox = new Function('input', 'context', 'memory', `
                try {
                    ${code}
                } catch(e) { throw e; }
            `);
            outputData = await sandbox(inputData, this.context, this.memory);
            break;

        case NodeType.HTTP:
            const { url, method, body } = node.data.config;
            let headers = {};
            if (node.data.config.headers) {
                try {
                    headers = JSON.parse(node.data.config.headers);
                } catch (e) {
                    throw new Error("Invalid JSON in Headers field");
                }
            }
            
            if (!url) throw new Error("URL is required for HTTP Request");

            const finalUrl = url.replace(/\{\{input\}\}/g, encodeURIComponent(JSON.stringify(inputData)));

            const response = await fetch(finalUrl, {
                method: method || 'GET',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: (method !== 'GET' && method !== 'HEAD') ? body : undefined
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            
            // Try to parse JSON, fall back to text
            const text = await response.text();
            try {
                outputData = JSON.parse(text);
            } catch {
                outputData = { text };
            }
            break;

        case NodeType.DELAY:
            const { ms } = node.data.config;
            await new Promise(resolve => setTimeout(resolve, parseInt(ms) || 1000));
            break;

        case NodeType.IF_ELSE:
             const { condition } = node.data.config;
             const isTrue = this.evaluateExpression(condition || 'true', inputData);
             outputData = inputData;
             nextHandle = isTrue ? 'true' : 'false';
             break;

        case NodeType.END:
            outputData = inputData;
            break;
            
        default:
          break;
      }

      const duration = performance.now() - startTime;
      this.updateNodeStatus(nodeId, NodeStatus.SUCCESS, outputData, undefined, duration);
      
      this.logExecution({
        nodeId,
        nodeLabel: node.data.label,
        status: NodeStatus.SUCCESS,
        input: inputData,
        output: outputData,
        timestamp: Date.now(),
        duration,
        memoryContext: usedMemoryContext
      });

      const outgoing = this.getOutgoingEdges(nodeId, nextHandle);
      await Promise.all(outgoing.map(edge => this.executeNode(edge.target, outputData)));

    } catch (err: any) {
      const duration = performance.now() - startTime;
      errorMsg = err.message || "Unknown error";
      this.updateNodeStatus(nodeId, NodeStatus.ERROR, undefined, errorMsg, duration);
      
      this.logExecution({
        nodeId,
        nodeLabel: node.data.label,
        status: NodeStatus.ERROR,
        input: inputData,
        output: null,
        timestamp: Date.now(),
        duration,
        error: errorMsg
      });
    }
  }

  async run() {
    const startNode = this.nodes.find(n => n.data.type === NodeType.START);
    if (!startNode) {
      throw new Error("No Start Node found. Please drag a 'Start' node onto the canvas.");
    }
    await this.executeNode(startNode.id, {});
  }
}