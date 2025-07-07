/**
 * API utilities
 */

import type { AxiosError, AxiosResponse } from 'axios';

/**
 * Обработчик ошибок API
 */
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.detail || data.message || 'Произошла ошибка API';
  }
  
  if (error.request) {
    return 'Нет ответа от сервера';
  }
  
  return error.message || 'Неизвестная ошибка';
};

/**
 * Проверка успешности ответа
 */
export const isSuccessResponse = (response: AxiosResponse): boolean => {
  return response.status >= 200 && response.status < 300;
};

/**
 * Извлечение данных из ответа
 */
export const extractResponseData = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

/**
 * Создание заголовков для запроса
 */
export const createHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
};

/**
 * Формирование URL с параметрами
 */
export const buildUrl = (baseUrl: string, params: Record<string, any> = {}): string => {
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}; 