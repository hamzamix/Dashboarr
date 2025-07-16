import React from 'react';
import { Power, RotateCw } from 'lucide-react';

interface SystemControlsProps {
  onSystemAction: (action: 'shutdown' | 'restart') => void;
  disabled: boolean;
}

export const SystemControls: React.FC<SystemControlsProps> = ({ onSystemAction, disabled }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row sm:col-span-2 lg:col-span-1 sm:items-center justify-around gap-4 ${disabled ? 'opacity-50' : ''}`}>
      <button
        onClick={() => onSystemAction('restart')}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        <RotateCw size={20} />
        Restart
      </button>
      <button
        onClick={() => onSystemAction('shutdown')}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        <Power size={20} />
        Shutdown
      </button>
    </div>
  );
};
