import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена авторизации
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ошибок
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Обработка ошибок от сервера
      const { status, data } = error.response;
      
      if (status === 401) {
        // Очистка токена при ошибке авторизации
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject(data.message || 'Произошла ошибка при выполнении запроса');
    }
    
    // Обработка ошибок сети
    return Promise.reject('Ошибка сети. Проверьте подключение к интернету.');
  }
);

export default client; 