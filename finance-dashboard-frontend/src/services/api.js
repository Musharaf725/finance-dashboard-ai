import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('finance-auth');
  if (stored) {
    try {
      const auth = JSON.parse(stored);
      if (auth?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch (error) {
      console.warn('Unable to read auth token from localStorage', error);
    }
  }
  return config;
});

export async function login(credentials) {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
}

export async function register(payload) {
  const response = await api.post('/api/auth/register', payload);
  return response.data;
}

export async function getRecords(params) {
  const response = await api.get('/api/records', { params });
  return response.data;
}

export async function createRecord(payload) {
  const response = await api.post('/api/records', payload);
  return response.data;
}

export async function updateRecord(id, payload) {
  const response = await api.patch(`/api/records/${id}`, payload);
  return response.data;
}

export async function deleteRecord(id) {
  const response = await api.delete(`/api/records/${id}`);
  return response.data;
}

export async function getDashboardAnalytics(params) {
  const response = await api.get('/api/dashboard/summary', { params });
  return response.data;
}

export async function getUsers(params) {
  const response = await api.get('/api/users', { params });
  return response.data;
}

export function setAuthToken() {
  // Token is handled by the request interceptor
  // This function is kept for compatibility with existing code
}

export default api;
