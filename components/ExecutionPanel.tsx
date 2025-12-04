import React, { useState, useEffect } from 'react';
import { ExecutionLog, NodeStatus } from '../types';

interface Props {
  logs: ExecutionLog[];
  isRunning: boolean;
  onClear: () => void;
}

const ExecutionPanel: React.FC<Props> = ({ logs, isRunning, onClear }) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (logs.length > 0 && !selectedLogId) {
        setSelectedLogId(logs[logs.length - 1].nodeId + logs[logs.length - 1].timestamp);
    }
  }, [logs]);

  const selectedLog = logs.find(l => (l.nodeId + l.timestamp) === selectedLogId) || logs[logs.length - 1];

  return (
    <div className="h-80 border-t border-slate-700 bg-slate-900 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-20">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Workflow Execution
            </h3>
            {isRunning && (
                <span className="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400 text-[10px] font-bold animate-pulse border border-blue-800">
                    EXECUTING...
                </span>
            )}
        </div>
        <button onClick={onClear} className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors text-slate-300">
          Clear Logs
        </button>
      </div>
      
      {logs.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50">
            <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm">Ready to execute. Press "Run Workflow".</span>
         </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left: Step List */}
            <div className="w-1/3 border-r border-slate-700 flex flex-col bg-slate-900">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950">Execution Steps</div>
                <div className="overflow-y-auto flex-1">
                    {logs.map((log, idx) => {
                        const isSelected = (log.nodeId + log.timestamp) === (selectedLog ? (selectedLog.nodeId + selectedLog.timestamp) : '');
                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedLogId(log.nodeId + log.timestamp)}
                                className={`
                                    px-4 py-3 border-b border-slate-800 cursor-pointer transition-colors flex items-center justify-between group
                                    ${isSelected ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : 'hover:bg-slate-800 border-l-4 border-l-transparent'}
                                `}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className={`font-medium text-sm ${isSelected ? 'text-blue-300' : 'text-slate-300'}`}>{log.nodeLabel}</span>
                                    <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()} &bull; {log.duration.toFixed(0)}ms</span>
                                </div>
                                <div>
                                    {log.status === NodeStatus.SUCCESS && <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                    {log.status === NodeStatus.ERROR && <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Inspector */}
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                {selectedLog ? (
                    <>
                        <div className="flex border-b border-slate-800">
                             <div className="px-4 py-2 text-xs font-bold text-slate-400 border-b-2 border-emerald-500 text-emerald-500">Output Data</div>
                             <div className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-400 cursor-not-allowed">Input Data</div>
                             {selectedLog.memoryContext && (
                                <div className="px-4 py-2 text-xs font-bold text-slate-400 border-b-2 border-purple-500 text-purple-500 ml-auto">Memory Context ({selectedLog.memoryContext.length})</div>
                             )}
                        </div>
                        <div className="flex-1 overflow-auto p-4 font-mono text-xs">
                             {selectedLog.error ? (
                                 <div className="p-4 rounded bg-rose-900/20 border border-rose-900 text-rose-400">
                                     <h4 className="font-bold mb-2">Error Occurred</h4>
                                     <p>{selectedLog.error}</p>
                                 </div>
                             ) : (
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Result</div>
                                        <pre className="text-emerald-300 whitespace-pre-wrap">{JSON.stringify(selectedLog.output, null, 2)}</pre>
                                    </div>
                                    
                                    {selectedLog.memoryContext && selectedLog.memoryContext.length > 0 && (
                                        <div className="pt-4 border-t border-slate-800">
                                            <div className="text-[10px] text-purple-500 uppercase font-bold mb-2 flex items-center gap-2">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Session Memory Used
                                            </div>
                                            <div className="space-y-2">
                                                {selectedLog.memoryContext.map((msg, i) => (
                                                    <div key={i} className={`p-2 rounded text-[10px] ${msg.role === 'user' ? 'bg-slate-800 ml-4' : 'bg-slate-900 border border-slate-800 mr-4'}`}>
                                                        <span className="font-bold text-slate-500 uppercase mr-2">{msg.role}</span>
                                                        <span className="text-slate-300">{msg.parts[0].text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                             )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-700">Select a step to view details</div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionPanel;