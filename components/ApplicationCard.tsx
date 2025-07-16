
import React, { useState } from 'react';
import { Application } from '../types';
import { StatusIndicator } from './StatusIndicator';
import { Play, Square, Trash2, Cpu, MemoryStick, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface ApplicationCardProps {
  app: Application;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, onStart, onStop, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsWorking(true);
    await action();
    setIsWorking(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <StatusIndicator isRunning={app.isRunning} />
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{app.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction(app.isRunning ? onStop : onStart)}
              disabled={isWorking}
              className={`p-2 rounded-full transition-colors ${app.isRunning ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50' : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50'} disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={app.isRunning ? 'Stop App' : 'Start App'}
            >
              {isWorking ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500"></div> : (app.isRunning ? <Square size={20} /> : <Play size={20} />)}
            </button>
             <button
              onClick={() => handleAction(onDelete)}
              disabled={isWorking}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              aria-label="Delete App"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-around text-center text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Cpu size={16} className="text-sky-500" />
            <span>{app.cpuUsage.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <MemoryStick size={16} className="text-emerald-500" />
            <span>{app.memUsage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/70 p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex justify-center items-center gap-1 transition-colors"
      >
        <span>Details</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-sm animate-fade-in-down">
          <p className="text-slate-500 dark:text-slate-400 break-all"><strong>Path:</strong> {app.path}</p>
          <p className="text-slate-500 dark:text-slate-400 mt-1 break-all"><strong>Process:</strong> {app.processName}</p>
           {app.args && (
            <div className="mt-2 text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <Terminal size={16} className="mt-0.5 flex-shrink-0" />
                <p className="break-all font-mono text-xs bg-slate-200 dark:bg-slate-700 p-1 rounded">
                  {app.args}
                </p>
            </div>
           )}
        </div>
      )}
    </div>
  );
};
