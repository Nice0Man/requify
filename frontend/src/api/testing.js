import client from './client';

export const testingApi = {
  getAll: () => client.get('/tests'),
  getById: (id) => client.get(`/tests/${id}`),
  create: (data) => client.post('/tests', data),
  update: (id, data) => client.put(`/tests/${id}`, data),
  delete: (id) => client.delete(`/tests/${id}`),
  
  // Методы для работы с шагами теста
  addStep: (testId, data) => client.post(`/tests/${testId}/steps`, data),
  updateStep: (testId, stepId, data) => client.put(`/tests/${testId}/steps/${stepId}`, data),
  deleteStep: (testId, stepId) => client.delete(`/tests/${testId}/steps/${stepId}`),
}; 