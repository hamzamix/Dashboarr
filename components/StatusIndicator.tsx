
import React from 'react';

interface StatusIndicatorProps {
  isRunning: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isRunning }) => {
  return (
    <div className="flex items-center justify-center">
      <span className={`relative flex h-3 w-3`}>
        {isRunning && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${
            isRunning ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></span>
      </span>
    </div>
  );
};
