import api from './api.js';

export async function fetchUsers(params) {
  const response = await api.get('/api/users', { params });
  return response.data.data;
}

export async function updateUserRole(id, role) {
  const response = await api.patch(`/api/users/${id}/role`, { role });
  return response.data.data;
}

export async function updateUserStatus(id, status) {
  const response = await api.patch(`/api/users/${id}/status`, { status });
  return response.data.data;
}

export async function deleteUser(id) {
  const response = await api.delete(`/api/users/${id}`);
  return response.data.data;
}
