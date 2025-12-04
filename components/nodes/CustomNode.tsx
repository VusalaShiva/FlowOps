import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType, NodeStatus, NodeData } from '../../types';

// Icons
const Icons: Record<NodeType, React.ReactNode> = {
  [NodeType.START]: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [NodeType.LLM]: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  [NodeType.HTTP]: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  [NodeType.CODE]: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  [NodeType.IF_ELSE]: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [NodeType.DELAY]: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [NodeType.END]: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const HeaderColors: Record<NodeType, string> = {
  [NodeType.START]: 'bg-emerald-600',
  [NodeType.LLM]: 'bg-purple-600',
  [NodeType.HTTP]: 'bg-blue-600',
  [NodeType.CODE]: 'bg-amber-600',
  [NodeType.IF_ELSE]: 'bg-rose-600',
  [NodeType.DELAY]: 'bg-slate-600',
  [NodeType.END]: 'bg-slate-700',
};

const CustomNode = ({ data, selected }: NodeProps<NodeData>) => {
  const isIfElse = data.type === NodeType.IF_ELSE;
  
  let statusRing = "";
  if (data.status === NodeStatus.RUNNING) statusRing = "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900";
  else if (data.status === NodeStatus.SUCCESS) statusRing = "ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900";
  else if (data.status === NodeStatus.ERROR) statusRing = "ring-2 ring-rose-500 ring-offset-2 ring-offset-slate-900";

  return (
    <div className={`
      relative min-w-[180px] max-w-[240px] rounded-xl bg-slate-800 shadow-xl transition-all duration-200 border border-slate-700
      ${selected ? 'ring-2 ring-white/50' : ''}
      ${statusRing}
    `}>
      {/* Inputs */}
      {data.type !== NodeType.START && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-slate-200 !w-3 !h-3 !border-2 !border-slate-800 hover:!bg-blue-400 transition-colors"
        />
      )}

      {/* Header with Color Bar */}
      <div className={`h-1.5 w-full rounded-t-xl ${HeaderColors[data.type]}`} />

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${HeaderColors[data.type]} bg-opacity-20 text-${HeaderColors[data.type].replace('bg-', '')}-200`}>
             {Icons[data.type]}
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-100 truncate">{data.label}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{data.type}</span>
            </div>
        </div>
      </div>

      {/* Status Indicators */}
      {data.executionTime !== undefined && (
        <div className="px-3 pb-2 flex justify-end">
            <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                {data.executionTime.toFixed(0)}ms
            </span>
        </div>
      )}

      {/* Outputs */}
      {data.type !== NodeType.END && !isIfElse && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-slate-200 !w-3 !h-3 !border-2 !border-slate-800 hover:!bg-blue-400 transition-colors"
        />
      )}

      {/* IF/ELSE Specific Outputs */}
      {isIfElse && (
        <>
          <div className="absolute -right-3 top-8 flex items-center group">
            <span className="absolute right-4 text-[10px] text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 rounded">TRUE</span>
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-slate-800"
              style={{ top: 32 }}
            />
          </div>
          <div className="absolute -right-3 bottom-4 flex items-center group">
             <span className="absolute right-4 text-[10px] text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1 rounded">FALSE</span>
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!bg-rose-500 !w-3 !h-3 !border-2 !border-slate-800"
              style={{ top: 'auto', bottom: 16 }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default memo(CustomNode);