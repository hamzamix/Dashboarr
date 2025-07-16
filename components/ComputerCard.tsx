import React from 'react';
import { Computer } from '../types';
import { StatusIndicator } from './StatusIndicator';
import { Trash2, Cpu, MemoryStick, Server } from 'lucide-react';

interface ComputerCardProps {
    computer: Computer;
    onSelect: () => void;
    onDelete: () => void;
}

export const ComputerCard: React.FC<ComputerCardProps> = ({ computer, onSelect, onDelete }) => {
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent onSelect from firing when delete is clicked
        onDelete();
    };

    return (
        <div 
            onClick={onSelect} 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col"
        >
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <StatusIndicator isRunning={computer.isOnline} />
                        <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{computer.name}</span>
                    </div>
                    <button
                        onClick={handleDeleteClick}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Delete Computer"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                     <Server size={16} />
                     <span>{computer.ipAddress}</span>
                </div>

                <div className="mt-4 flex justify-around text-center text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Cpu size={16} className="text-sky-500" />
                        <span>{computer.isOnline ? `${computer.stats.cpuUsage.toFixed(1)}%` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MemoryStick size={16} className="text-emerald-500" />
                        <span>{computer.isOnline ? `${computer.stats.memUsage.toFixed(1)}%` : 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 text-center font-semibold text-indigo-600 dark:text-indigo-400 rounded-b-xl">
                View Details
            </div>
        </div>
    );
};