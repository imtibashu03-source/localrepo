import { api } from '../context/AuthContext';

// Records
export const recordsAPI = {
  getAll: (params) => api.get('/records', { params }),
  getOne: (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
};

// Blockchain
export const blockchainAPI = {
  getChain: () => api.get('/blockchain/chain'),
  verify: (hash) => api.get(`/blockchain/verify/${hash}`),
  getBlock: (id) => api.get(`/blockchain/block/${id}`),
  getStats: () => api.get('/blockchain/stats'),
};

// Threats
export const threatAPI = {
  predict: (features) => api.post('/threats/predict', features),
  getLogs: (params) => api.get('/threats/logs', { params }),
  getAlerts: () => api.get('/threats/alerts'),
  resolveAlert: (id) => api.put(`/threats/alerts/${id}/resolve`),
  getStats: () => api.get('/threats/stats'),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getLogs: () => api.get('/admin/logs'),
};
