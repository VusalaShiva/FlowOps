import React from 'react';
import { NodeType } from '../types';
import { NodeIcons, UI_ICONS } from './Icons';

interface SidebarProps {
  onOpenTour?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenTour }) => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getBgColor = (type: NodeType) => {
     switch (type) {
        case NodeType.START: return 'hover:border-emerald-500 hover:shadow-emerald-500/10';
        case NodeType.LLM: return 'hover:border-purple-500 hover:shadow-purple-500/10';
        case NodeType.HTTP: return 'hover:border-blue-500 hover:shadow-blue-500/10';
        case NodeType.CODE: return 'hover:border-amber-500 hover:shadow-amber-500/10';
        case NodeType.IF_ELSE: return 'hover:border-rose-500 hover:shadow-rose-500/10';
        default: return 'hover:border-slate-500';
     }
  }

  const items = [
    { type: NodeType.START, label: 'Start Trigger', desc: 'Entry point' },
    { type: NodeType.LLM, label: 'LLM (Gemini)', desc: 'Generate text with AI' },
    { type: NodeType.HTTP, label: 'HTTP Request', desc: 'Fetch external data' },
    { type: NodeType.CODE, label: 'Code Execution', desc: 'Run JavaScript' },
    { type: NodeType.IF_ELSE, label: 'If / Else', desc: 'Conditional Logic' },
    { type: NodeType.DELAY, label: 'Delay', desc: 'Pause execution' },
    { type: NodeType.END, label: 'End', desc: 'Workflow termination' },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full z-10 shadow-xl">
      <div className="p-5 border-b border-slate-800 bg-slate-900/50">
        <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          ctrlchecks
        </h1>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">Workflow Automation</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Available Nodes</div>
        {items.map((item) => (
          <div
            key={item.type}
            className={`
                group flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 
                cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-lg
                ${getBgColor(item.type)}
            `}
            onDragStart={(event) => onDragStart(event, item.type, item.label)}
            draggable
          >
            <div className={`p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white transition-colors border border-slate-700`}>
                {NodeIcons[item.type]}
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-200 group-hover:text-white">{item.label}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 flex flex-col items-center gap-2">
         {onOpenTour && (
             <button 
                onClick={onOpenTour}
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-900 w-full justify-center"
             >
                {UI_ICONS.help}
                Help / Tour
             </button>
         )}
        <div className="text-[10px] text-slate-600 font-mono">
           v1.1.0 &bull; ctrlchecks.ai
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;