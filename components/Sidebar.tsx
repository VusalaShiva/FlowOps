import React from 'react';
import { NodeType } from '../types';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.START:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case NodeType.LLM:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
      case NodeType.HTTP:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
      case NodeType.CODE:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
      case NodeType.IF_ELSE:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case NodeType.DELAY:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case NodeType.END:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default:
        return null;
    }
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
                {getIcon(item.type)}
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-200 group-hover:text-white">{item.label}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center font-mono">
        v1.1.0 &bull; ctrlchecks.ai
      </div>
    </aside>
  );
};

export default Sidebar;