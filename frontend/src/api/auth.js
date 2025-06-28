import client from './client';

export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials),
  logout: () => client.post('/auth/logout'),
}; 