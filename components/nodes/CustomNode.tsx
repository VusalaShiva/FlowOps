import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType, NodeStatus, NodeData } from '../../types';
import { NodeIcons } from '../Icons';

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
             {NodeIcons[data.type]}
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