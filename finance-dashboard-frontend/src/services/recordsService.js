import api from './api.js';

export async function fetchRecords(params) {
  const response = await api.get('/api/records', { params });
  return response.data.data;
}

export async function fetchRecord(id) {
  const response = await api.get(`/api/records/${id}`);
  return response.data.data;
}

export async function createRecord(payload) {
  const response = await api.post('/api/records', payload);
  return response.data.data;
}

export async function updateRecord(id, payload) {
  const response = await api.patch(`/api/records/${id}`, payload);
  return response.data.data;
}

export async function deleteRecord(id) {
  const response = await api.delete(`/api/records/${id}`);
  return response.data.data;
}
