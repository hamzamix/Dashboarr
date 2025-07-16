import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Application, Computer } from './types';
import * as api from './services/api';
import { Header } from './components/Header';
import { SystemControls } from './components/SystemControls';
import { StatCard } from './components/StatCard';
import { ApplicationList } from './components/ApplicationList';
import { AddAppModal } from './components/AddAppModal';
import { AddComputerModal } from './components/AddComputerModal';
import { ComputerCard } from './components/ComputerCard';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { useToast } from './hooks/useToast';
import { Cpu, MemoryStick, Activity, Plus, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [selectedComputerId, setSelectedComputerId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddAppModalOpen, setAddAppModalOpen] = useState<boolean>(false);
  const [isAddComputerModalOpen, setAddComputerModalOpen] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string, description: string, onConfirm: () => void } | null>(null);

  const { addToast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      const fetchedComputers = await api.getComputers();
      setComputers(fetchedComputers);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to connect to server. Is it running? Error: ${errorMessage}`);
      // Don't show a toast on poll failure to avoid spamming. The error message is enough.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const pollInterval = setInterval(fetchDashboardData, 5000); // Poll every 5 seconds
    return () => clearInterval(pollInterval);
  }, [fetchDashboardData]);

  const handleControlAction = async (action: () => Promise<any>, successMessage: string) => {
    try {
      await action();
      addToast(successMessage, 'success');
      await fetchDashboardData(); // Refresh data immediately after action
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      addToast(`Action failed: ${errorMessage}`, 'error');
    }
  };

  const handleAddComputer = (computerData: Omit<Computer, 'id' | 'isOnline' | 'stats' | 'apps'>) => {
    handleControlAction(() => api.addComputer(computerData), `Computer "${computerData.name}" added. Run the agent on it to bring it online.`);
    setAddComputerModalOpen(false);
  };
  
  const handleDeleteComputer = (computer: Computer) => {
     setConfirmAction({
        title: `Delete ${computer.name}?`,
        description: `Are you sure you want to delete ${computer.name}? This will remove it from the dashboard.`,
        onConfirm: () => {
            handleControlAction(() => api.deleteComputer(computer.id), `Computer "${computer.name}" deleted.`);
            setConfirmAction(null);
        }
     });
  };

  const selectedComputer = useMemo(() => computers.find(c => c.id === selectedComputerId) || null, [computers, selectedComputerId]);

  const renderDashboard = () => (
    <>
      <Header title="Computers Dashboard">
        <button
          onClick={() => setAddComputerModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Computer</span>
        </button>
      </Header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {computers.map(comp => (
            <ComputerCard 
                key={comp.id} 
                computer={comp} 
                onSelect={() => setSelectedComputerId(comp.id)}
                onDelete={() => handleDeleteComputer(comp)}
            />
        ))}
      </div>
      {computers.length === 0 && !loading && (
         <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md col-span-full">
            <p className="text-slate-500 dark:text-slate-400">No computers configured.</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Click 'Add Computer' to get started.</p>
        </div>
      )}
    </>
  );

  const renderComputerDetail = (computer: Computer) => {
    const handleAddApp = (appData: Omit<Application, 'id' | 'isRunning' | 'cpuUsage' | 'memUsage'>) => {
        handleControlAction(() => api.addApp(computer.id, appData), `Application "${appData.name}" added.`);
        setAddAppModalOpen(false);
    };
  
    const handleDeleteApp = (appId: string, appName: string) => {
        handleControlAction(() => api.deleteApp(computer.id, appId), `Application "${appName}" deleted.`);
    };

    const handleSystemAction = (type: 'shutdown' | 'restart') => {
        const action = () => api.systemAction(computer.id, type);
        const message = `System ${type} command sent.`;
        setConfirmAction({
            title: `Confirm ${type}`,
            description: `Are you sure you want to ${type} ${computer.name}?`,
            onConfirm: () => {
                handleControlAction(action, message);
                setConfirmAction(null);
            },
        });
    };
    
    const handleAppAction = (appId: string, appName: string, type: 'start' | 'stop') => {
        const action = () => api.appAction(computer.id, appId, type);
        const message = `Command to ${type} "${appName}" sent.`;
        handleControlAction(action, message);
    };

    const HeaderTitle = (
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setSelectedComputerId(null)} 
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 -ml-2"
                aria-label="Go back"
            >
                <ArrowLeft size={22} />
            </button>
            <span>{computer.name}</span>
        </div>
    );

    return (
        <>
        <Header title={HeaderTitle}>
             <button
                onClick={() => setAddAppModalOpen(true)}
                disabled={!computer.isOnline}
                className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                <Plus size={20} />
                <span className="hidden sm:inline">Add App</span>
            </button>
        </Header>
         <main>
            {/* System Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SystemControls onSystemAction={handleSystemAction} disabled={!computer.isOnline} />
                <StatCard icon={<Cpu className="w-8 h-8 text-sky-500" />} title="CPU Usage" value={computer.isOnline ? `${computer.stats.cpuUsage.toFixed(1)}%` : 'Offline'} />
                <StatCard icon={<MemoryStick className="w-8 h-8 text-emerald-500" />} title="Memory Usage" value={computer.isOnline ? `${computer.stats.memUsage.toFixed(1)}%`: 'Offline'} />
                <StatCard icon={<Activity className="w-8 h-8 text-amber-500" />} title="Processes" value={computer.isOnline ? computer.stats.totalProcesses.toString() : 'Offline'} />
            </div>

            {/* Application List */}
            <ApplicationList 
                apps={computer.apps} 
                onStartApp={(appId, appName) => handleAppAction(appId, appName, 'start')}
                onStopApp={(appId, appName) => handleAppAction(appId, appName, 'stop')}
                onDeleteApp={handleDeleteApp}
                disabled={!computer.isOnline}
            />
            </main>
            <AddAppModal isOpen={isAddAppModalOpen} onClose={() => setAddAppModalOpen(false)} onAddApp={handleAddApp} />
        </>
    );
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}
        
        {loading ? (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                <p className="ml-4 text-lg">Connecting to server...</p>
             </div>
        ) : (
            selectedComputer ? renderComputerDetail(selectedComputer) : renderDashboard()
        )}
      </div>

      <AddComputerModal isOpen={isAddComputerModalOpen} onClose={() => setAddComputerModalOpen(false)} onAddComputer={handleAddComputer} />
      
      {confirmAction && (
        <ConfirmationDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          description={confirmAction.description}
        />
      )}
    </div>
  );
};

export default App;