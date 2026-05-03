import api from './api.js';

export async function login(credentials) {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
}

export async function register(payload) {
  const response = await api.post('/api/auth/register', payload);
  return response.data;
}