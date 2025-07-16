import React, { useState, FormEvent } from 'react';
import { Computer } from '../types';
import { X } from 'lucide-react';

interface AddComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComputer: (computerData: Omit<Computer, 'id' | 'isOnline' | 'stats' | 'apps'>) => void;
}

export const AddComputerModal: React.FC<AddComputerModalProps> = ({ isOpen, onClose, onAddComputer }) => {
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress) {
      alert('Please fill in all fields.');
      return;
    }
    onAddComputer({ name, ipAddress });
    // Reset form
    setName('');
    setIpAddress('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative animate-fade-in-down" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Add New Computer</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Computer Name*</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Living Room PC" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="ipAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300">IP Address*</label>
              <input type="text" id="ipAddress" value={ipAddress} onChange={e => setIpAddress(e.target.value)} required placeholder="e.g., 192.168.1.100" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add Computer</button>
          </div>
        </form>
      </div>
    </div>
  );
};