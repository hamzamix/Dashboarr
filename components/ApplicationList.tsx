import React from 'react';
import { Application } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationListProps {
  apps: Application[];
  onStartApp: (appId: string, appName: string) => void;
  onStopApp: (appId: string, appName: string) => void;
  onDeleteApp: (appId: string, appName: string) => void;
  disabled: boolean;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({ apps, onStartApp, onStopApp, onDeleteApp, disabled }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Managed Applications</h2>
       {disabled && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-inner border border-dashed border-slate-300 dark:border-slate-700 mb-6">
            <p className="text-slate-500 dark:text-slate-400 font-semibold">Computer is Offline</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Application controls are disabled.</p>
        </div>
      )}
      {apps.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {apps.map(app => (
            <ApplicationCard 
              key={app.id} 
              app={app} 
              onStart={() => onStartApp(app.id, app.name)}
              onStop={() => onStopApp(app.id, app.name)}
              onDelete={() => onDeleteApp(app.id, app.name)}
            />
          ))}
        </div>
      ) : (
         !disabled && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <p className="text-slate-500 dark:text-slate-400">No applications configured for this computer.</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Click 'Add App' to get started.</p>
            </div>
         )
      )}
    </div>
  );
};
