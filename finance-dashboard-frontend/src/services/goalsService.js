import api from './api.js';

export async function fetchGoals(params) {
  const response = await api.get('/api/goals', { params });
  return response.data.data;
}

export async function fetchGoal(id) {
  const response = await api.get(`/api/goals/${id}`);
  return response.data.data;
}

export async function fetchGoalForecast(params) {
  const response = await api.get('/api/goals/forecast', { params });
  return response.data.data;
}

export async function createGoal(payload) {
  const response = await api.post('/api/goals', payload);
  return response.data.data;
}

export async function updateGoal(id, payload) {
  const response = await api.put(`/api/goals/${id}`, payload);
  return response.data.data;
}

export async function patchGoal(id, payload) {
  const response = await api.patch(`/api/goals/${id}`, payload);
  return response.data.data;
}

export async function deleteGoal(id) {
  const response = await api.delete(`/api/goals/${id}`);
  return response.data.data;
}
