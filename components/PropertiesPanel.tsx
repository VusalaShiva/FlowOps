import React from 'react';
import { WorkflowNode, NodeType } from '../types';

interface Props {
  node: WorkflowNode | null;
  onChange: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

const SYSTEM_TEMPLATES = {
  custom: '',
  helpful: 'You are a helpful and concise AI assistant.',
  json_agent: `You are an AI assistant inside an n8n workflow.
Follow these rules strictly:

1. Always return responses ONLY in valid JSON format.
2. The JSON must contain:
   - "reply": The message to show to the user.
   - "metadata": Any structured data or flags needed by downstream nodes.

3. Do NOT include explanations, markdown, or additional text outside JSON.

4. Never break JSON formatting. No stray commas, no comments, no markdown.

5. Assume your output goes directly to a Chat Output Node that expects JSON.

6. If the user asks a question, answer normally inside the "reply" field.

7. If the user asks to generate data, provide it inside "metadata".

8. ERROR fallback rule:
   If something goes wrong or the request is unclear, respond with:
   {
     "reply": "I didn't understand that. Could you please clarify?",
     "metadata": {}
   }`,
  coder: `You are an expert software engineer.
Output only valid, production-ready code.
Do not wrap code in markdown blocks unless requested.
Focus on modern best practices.`
};

const PropertiesPanel: React.FC<Props> = ({ node, onChange, onDelete }) => {
  if (!node) {
    return (
      <div className="w-96 bg-slate-900 border-l border-slate-700 p-6 flex flex-col items-center justify-center text-center h-full text-slate-500">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
        </div>
        <p className="font-medium">Configuration Panel</p>
        <p className="text-sm mt-2">Select a node to edit its properties or input data.</p>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onChange(node.id, {
      ...node.data,
      config: {
        ...node.data.config,
        [key]: value
      }
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(node.id, {
        ...node.data,
        label: e.target.value
    });
  };

  const applyTemplate = (templateKey: string) => {
      const template = SYSTEM_TEMPLATES[templateKey as keyof typeof SYSTEM_TEMPLATES];
      if (template !== undefined) {
          handleChange('systemInstruction', template);
      }
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-slate-700 bg-slate-800/80 backdrop-blur">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-1 rounded">{node.data.type} Node</span>
            <button 
                onClick={() => onDelete(node.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                title="Delete Node"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
        <input 
            type="text" 
            value={node.data.label} 
            onChange={handleLabelChange}
            className="w-full bg-transparent text-xl font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors pb-1"
        />
        <div className="text-xs text-slate-500 font-mono mt-1 truncate">{node.id}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* START Node - Input Terminal */}
        {node.data.type === NodeType.START && (
            <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Input Terminal (JSON)
                </label>
                <div className="text-xs text-slate-400 mb-2">
                    Define the initial JSON data that will trigger the workflow.
                </div>
                <textarea
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm font-mono text-emerald-300 h-64 focus:outline-none focus:border-emerald-500 transition-colors"
                    value={node.data.config.initialData || '{\n  "message": "Hello World",\n  "value": 10\n}'}
                    onChange={(e) => handleChange('initialData', e.target.value)}
                    spellCheck={false}
                />
            </div>
        )}

        {/* LLM Configuration */}
        {node.data.type === NodeType.LLM && (
          <>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <label className="flex items-center justify-between cursor-pointer mb-2">
                    <span className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Enable Memory
                    </span>
                    <input 
                        type="checkbox" 
                        checked={node.data.config.useMemory || false} 
                        onChange={(e) => handleChange('useMemory', e.target.checked)}
                        className="w-4 h-4 accent-purple-500 rounded cursor-pointer" 
                    />
                </label>
                {node.data.config.useMemory && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                        <label className="block text-xs text-slate-400 mb-1">Memory Window (Last N Messages)</label>
                        <input 
                            type="number" 
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                            value={node.data.config.memoryWindow || 10}
                            onChange={(e) => handleChange('memoryWindow', e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                            The AI will remember the last {node.data.config.memoryWindow || 10} messages from previous runs.
                        </p>
                    </div>
                )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Model</label>
              <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={node.data.config.model || 'gemini-2.5-flash'}
                onChange={(e) => handleChange('model', e.target.value)}
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                 <label className="block text-xs font-medium text-slate-400">System Instructions</label>
                 <select 
                    className="text-[10px] bg-slate-800 border-none text-blue-400 cursor-pointer focus:ring-0"
                    onChange={(e) => applyTemplate(e.target.value)}
                    defaultValue="custom"
                 >
                    <option value="custom" disabled>Load Template...</option>
                    <option value="helpful">Helpful Assistant</option>
                    <option value="json_agent">Strict JSON Agent</option>
                    <option value="coder">Code Expert</option>
                 </select>
              </div>
              <textarea
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-32 resize-none font-mono text-xs leading-relaxed"
                value={node.data.config.systemInstruction || ''}
                onChange={(e) => handleChange('systemInstruction', e.target.value)}
                placeholder="You are a helpful assistant..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Prompt Template</label>
              <div className="relative">
                <textarea
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-40 resize-none font-mono"
                    value={node.data.config.prompt || ''}
                    onChange={(e) => handleChange('prompt', e.target.value)}
                    placeholder="Analyze this data: {{input}}"
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 bg-slate-900 px-1 rounded">Use {'{{input}}'} for data</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Temperature ({node.data.config.temperature || 0.7})</label>
              <input 
                type="range" min="0" max="1" step="0.1" 
                className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                value={node.data.config.temperature || 0.7}
                onChange={(e) => handleChange('temperature', e.target.value)}
              />
            </div>
          </>
        )}

        {/* HTTP Configuration */}
        {node.data.type === NodeType.HTTP && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Method</label>
              <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
                value={node.data.config.method || 'GET'}
                onChange={(e) => handleChange('method', e.target.value)}
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={node.data.config.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://api.example.com/data"
              />
            </div>
            {node.data.config.method !== 'GET' && (
               <div>
               <label className="block text-xs font-medium text-slate-400 mb-1">Body (JSON)</label>
               <textarea
                 className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm font-mono h-32"
                 value={node.data.config.body || '{}'}
                 onChange={(e) => handleChange('body', e.target.value)}
               />
             </div>
            )}
          </>
        )}

        {/* Code Configuration */}
        {node.data.type === NodeType.CODE && (
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">JavaScript Code</label>
                <div className="text-[10px] text-slate-500 mb-2">Available: <code>input</code>, <code>context</code>, <code>memory</code>. Return data to pass forward.</div>
                <textarea
                    className="w-full bg-slate-950 border border-slate-600 rounded px-3 py-2 text-sm font-mono text-amber-300 h-64 focus:outline-none focus:border-amber-500"
                    value={node.data.config.code || 'return {\n  processed: true,\n  original: input\n};'}
                    onChange={(e) => handleChange('code', e.target.value)}
                    spellCheck={false}
                />
            </div>
        )}

        {/* IF/ELSE Configuration */}
        {node.data.type === NodeType.IF_ELSE && (
             <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">Condition (JS Expression)</label>
             <textarea
                 className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm font-mono h-24 text-rose-300"
                 value={node.data.config.condition || 'input.value > 0'}
                 onChange={(e) => handleChange('condition', e.target.value)}
                 placeholder="input.status === 'active'"
             />
             <p className="text-[10px] text-slate-500 mt-1">Example: <code>input.price &gt; 100</code></p>
         </div>
        )}

         {/* Delay Configuration */}
         {node.data.type === NodeType.DELAY && (
             <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">Delay (ms)</label>
             <input
                 type="number"
                 className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
                 value={node.data.config.ms || 1000}
                 onChange={(e) => handleChange('ms', e.target.value)}
             />
         </div>
        )}

      </div>
    </div>
  );
};

export default PropertiesPanel;