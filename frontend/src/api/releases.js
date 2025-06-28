import client from './client';

export const releasesApi = {
  getAll: () => client.get('/releases'),
  getById: (id) => client.get(`/releases/${id}`),
  create: (data) => client.post('/releases', data),
  update: (id, data) => client.put(`/releases/${id}`, data),
  delete: (id) => client.delete(`/releases/${id}`),
}; 