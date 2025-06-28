import client from './client';

export const requirementsApi = {
  getAll: () => client.get('/requirements'),
  getById: (id) => client.get(`/requirements/${id}`),
  create: (data) => client.post('/requirements', data),
  update: (id, data) => client.put(`/requirements/${id}`, data),
  delete: (id) => client.delete(`/requirements/${id}`),
}; 