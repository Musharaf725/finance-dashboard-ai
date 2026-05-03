import api from './api.js';

export async function fetchAiInsights(payload = {}) {
  const response = await api.post('/api/ai/insights', payload);
  return response.data.data;
}

export async function fetchAiAnomalies() {
  const response = await api.get('/api/ai/anomalies');
  return response.data.data;
}
