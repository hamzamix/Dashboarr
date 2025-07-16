
import React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-900/50',
    border: 'border-green-400 dark:border-green-600',
  },
  error: {
    icon: <XCircle className="h-6 w-6 text-red-500" />,
    bg: 'bg-red-50 dark:bg-red-900/50',
    border: 'border-red-400 dark:border-red-600',
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    bg: 'bg-amber-50 dark:bg-amber-900/50',
    border: 'border-amber-400 dark:border-amber-600',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = toastConfig[type];

  return (
    <div className={`max-w-sm w-full ${config.bg} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border ${config.border} animate-fade-in-right`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={onClose} className="rounded-md inline-flex text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
