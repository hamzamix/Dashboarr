import { Application, Computer } from '../types';

const API_BASE_URL = '/api'; // Assumes the backend is served from the same origin

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown API error occurred');
  }
  if (response.status === 204) { // No Content
    return;
  }
  return response.json();
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  return handleResponse(response);
};

// --- Computer API ---

export const getComputers = async (): Promise<Computer[]> => {
  return apiRequest('/computers');
};

export const addComputer = async (computerData: Omit<Computer, 'id' | 'isOnline' | 'stats' | 'apps'>): Promise<Computer> => {
  return apiRequest('/computers', {
    method: 'POST',
    body: JSON.stringify(computerData),
  });
};

export const deleteComputer = async (computerId: string): Promise<void> => {
  return apiRequest(`/computers/${computerId}`, {
    method: 'DELETE',
  });
};

// --- Application API ---

export const addApp = async (computerId: string, appData: Omit<Application, 'id' | 'isRunning' | 'cpuUsage' | 'memUsage'>): Promise<Application> => {
  return apiRequest(`/computers/${computerId}/apps`, {
    method: 'POST',
    body: JSON.stringify(appData),
  });
};

export const deleteApp = async (computerId: string, appId: string): Promise<void> => {
  return apiRequest(`/computers/${computerId}/apps/${appId}`, {
    method: 'DELETE',
  });
};

// --- Action APIs ---

export const appAction = async (computerId: string, appId: string, action: 'start' | 'stop'): Promise<void> => {
  return apiRequest(`/computers/${computerId}/apps/${appId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
};

export const systemAction = async (computerId: string, action: 'shutdown' | 'restart'): Promise<void> => {
  return apiRequest(`/computers/${computerId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
};
