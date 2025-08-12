import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
  getSystemHealth: () => api.get('/dashboard/system-health'),
  getRecentDeployments: (limit = 10) => api.get(`/dashboard/recent-deployments?limit=${limit}`),
  getDeploymentTrends: (days = 7) => api.get(`/dashboard/deployment-trends?days=${days}`),
  getAlerts: () => api.get('/dashboard/alerts'),
};

// Deployments API
export const deploymentsApi = {
  getAll: () => api.get('/deployments'),
  getById: (id) => api.get(`/deployments/${id}`),
  create: (deployment) => api.post('/deployments', deployment),
  update: (id, updates) => api.put(`/deployments/${id}`, updates),
};

// Monitoring API
export const monitoringApi = {
  getServices: () => api.get('/monitoring/services'),
  getService: (id) => api.get(`/monitoring/services/${id}`),
  updateService: (id, updates) => api.put(`/monitoring/services/${id}`, updates),
  getLogs: (service, limit) => api.get('/monitoring/logs', { params: { service, limit } }),
  addLog: (log) => api.post('/monitoring/logs', log),
  getMetrics: (service) => api.get('/monitoring/metrics', { params: { service } }),
  getEnvironments: () => api.get('/monitoring/environments'),
  updateEnvironment: (id, updates) => api.put(`/monitoring/environments/${id}`, updates),
};

// Simulator API
export const simulatorApi = {
  start: (deployment) => api.post('/simulator/start', deployment),
  getStatus: (deploymentId) => api.get(`/simulator/status/${deploymentId}`),
  getLogs: (deploymentId) => api.get(`/simulator/logs/${deploymentId}`),
  stop: (deploymentId) => api.post(`/simulator/stop/${deploymentId}`),
  getTemplates: () => api.get('/simulator/templates'),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

export default api; 