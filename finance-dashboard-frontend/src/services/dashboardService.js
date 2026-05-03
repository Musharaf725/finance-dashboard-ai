import api from './api.js';

export async function fetchAnalytics(params) {
  const response = await api.get('/api/dashboard/summary', { params });
  return response.data;
}
