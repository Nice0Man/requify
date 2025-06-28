import client from './client';

export const projectsApi = {
  getAll: () => client.get('/projects'),
  getById: (id) => client.get(`/projects/${id}`),
  create: (data) => client.post('/projects', data),
  update: (id, data) => client.put(`/projects/${id}`, data),
  delete: (id) => client.delete(`/projects/${id}`),
}; 