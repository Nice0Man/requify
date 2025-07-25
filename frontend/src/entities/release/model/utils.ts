import type { Release } from './types';

/**
 * Утилитарные функции для работы с релизами
 */

/**
 * Получить цвет для статуса релиза
 */
export const getStatusColor = (status: Release['status']): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colorMap: Record<Release['status'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    draft: 'default', 
    planned: 'info',  
    in_progress: 'primary',
    ready: 'warning',
    published: 'success',
    archived: 'secondary',
  };
  return colorMap[status] || 'default';
};

/**
 * Получить текст статуса на русском
 */
export const getStatusText = (status: Release['status']): string => {
  const statusMap: Record<Release['status'], string> = {
    draft: 'Черновик',
    planned: 'Запланирован',
    in_progress: 'В разработке',
    ready: 'Готов к выпуску',
    published: 'Опубликован',
    archived: 'Архивирован',
  };
  return statusMap[status] || status;
};

/**
 * Рассчитать прогресс релиза
 */
export const calculateProgress = (release: Release): number => {
  if (!release.stats) return 0;
  const { total_requirements, completed_requirements } = release.stats;
  if (total_requirements === 0) return 100;
  return Math.round((completed_requirements / total_requirements) * 100);
};

/**
 * Форматировать дату
 */
export const formatReleaseDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Проверить возможность публикации релиза
 */
export const canPublishRelease = (release: Release): boolean => {
  return release.status === 'ready';
};

/**
 * Проверить опубликован ли релиз
 */
export const isReleasePublished = (release: Release): boolean => {
  return release.status === 'published';
}; 