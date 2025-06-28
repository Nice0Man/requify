import client from './client';

export const adminApi = {
  // Методы для работы с пользователями
  getAllUsers: () => client.get('/admin/users'),
  createUser: (data) => client.post('/admin/users', data),
  updateUser: (id, data) => client.put(`/admin/users/${id}`, data),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),

  // Методы для работы с настройками
  getSettings: () => client.get('/admin/settings'),
  updateSettings: (data) => client.put('/admin/settings', data),
}; 