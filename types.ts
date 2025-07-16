export interface Application {
  id: string;
  name: string;
  path: string;
  processName: string;
  args?: string;
  isRunning: boolean;
  cpuUsage: number;
  memUsage: number; // as a percentage
}

export interface SystemStats {
  cpuUsage: number; // as a percentage
  memUsage: number; // as a percentage
  totalProcesses: number;
}

export interface Computer {
  id: string;
  name: string;
  ipAddress: string;
  isOnline: boolean;
  stats: SystemStats;
  apps: Application[];
}