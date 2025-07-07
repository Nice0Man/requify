import { PageType, PageMetadata, PageConfig } from './types';

// Утилиты для работы с метаданными страниц
export const updatePageTitle = (title: string) => {
  if (typeof document !== 'undefined') {
    document.title = title;
  }
};

export const updatePageMetadata = (metadata: PageMetadata) => {
  if (typeof document !== 'undefined') {
    // Обновляем title
    document.title = metadata.title;
    
    // Обновляем meta description
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    if (metadata.description) {
      descriptionMeta.setAttribute('content', metadata.description);
    }
    
    // Обновляем keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    if (metadata.keywords) {
      keywordsMeta.setAttribute('content', metadata.keywords.join(', '));
    }
    
    // Обновляем Open Graph теги
    if (metadata.ogTitle) {
      updateOrCreateMetaTag('property', 'og:title', metadata.ogTitle);
    }
    if (metadata.ogDescription) {
      updateOrCreateMetaTag('property', 'og:description', metadata.ogDescription);
    }
    if (metadata.ogImage) {
      updateOrCreateMetaTag('property', 'og:image', metadata.ogImage);
    }
  }
};

// Вспомогательная функция для создания/обновления meta тегов
const updateOrCreateMetaTag = (attribute: string, name: string, content: string) => {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

// Утилиты для работы с конфигурацией страниц
export const getPageConfig = (pageType: PageType): PageConfig => {
  switch (pageType) {
    case PageType.DASHBOARD:
      return {
        title: 'Dashboard',
        description: 'Главная панель управления проектами',
        requiresAuth: true,
        layout: 'default',
      };
    case PageType.HOME:
      return {
        title: 'Home',
        description: 'Главная страница системы',
        requiresAuth: false,
        layout: 'default',
      };
    case PageType.START:
      return {
        title: 'Get Started',
        description: 'Начало работы с системой',
        requiresAuth: false,
        layout: 'default',
      };
    case PageType.API_OVERVIEW:
      return {
        title: 'API Overview',
        description: 'Обзор API системы',
        requiresAuth: false,
        layout: 'default',
      };
    default:
      return {
        title: 'Page',
        requiresAuth: false,
        layout: 'default',
      };
  }
};

// Утилиты для валидации страниц
export const validatePageAccess = (pageType: PageType, isAuthenticated: boolean): boolean => {
  const config = getPageConfig(pageType);
  return !config.requiresAuth || isAuthenticated;
};

// Утилиты для форматирования данных страниц
export const formatPageUrl = (pageType: PageType, params?: Record<string, string>): string => {
  let baseUrl = '';
  
  switch (pageType) {
    case PageType.DASHBOARD:
      baseUrl = '/dashboard';
      break;
    case PageType.HOME:
      baseUrl = '/';
      break;
    case PageType.START:
      baseUrl = '/start';
      break;
    case PageType.API_OVERVIEW:
      baseUrl = '/api-overview';
      break;
    default:
      baseUrl = '/';
  }
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    baseUrl += `?${searchParams.toString()}`;
  }
  
  return baseUrl;
};

// Утилиты для работы с breadcrumbs
export const getBreadcrumbs = (pageType: PageType) => {
  const breadcrumbs = [
    { label: 'Home', url: '/' },
  ];
  
  switch (pageType) {
    case PageType.DASHBOARD:
      breadcrumbs.push({ label: 'Dashboard', url: '/dashboard' });
      break;
    case PageType.START:
      breadcrumbs.push({ label: 'Get Started', url: '/start' });
      break;
    case PageType.API_OVERVIEW:
      breadcrumbs.push({ label: 'API Overview', url: '/api-overview' });
      break;
    default:
      break;
  }
  
  return breadcrumbs;
};

// Утилиты для работы с локализацией страниц
export const getLocalizedPageTitle = (pageType: PageType, locale: string = 'ru'): string => {
  const titles = {
    ru: {
      [PageType.DASHBOARD]: 'Панель управления',
      [PageType.HOME]: 'Главная',
      [PageType.START]: 'Начало работы',
      [PageType.API_OVERVIEW]: 'Обзор API',
    },
    en: {
      [PageType.DASHBOARD]: 'Dashboard',
      [PageType.HOME]: 'Home',
      [PageType.START]: 'Get Started',
      [PageType.API_OVERVIEW]: 'API Overview',
    },
  };
  
  return titles[locale]?.[pageType] || titles.en[pageType] || 'Page';
};

// Утилиты для работы с историей страниц
export const getPageHistory = (): string[] => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const history = sessionStorage.getItem('pageHistory');
    return history ? JSON.parse(history) : [];
  }
  return [];
};

export const addToPageHistory = (pageType: PageType) => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const history = getPageHistory();
    const newHistory = [...history, pageType].slice(-10); // Сохраняем последние 10 страниц
    sessionStorage.setItem('pageHistory', JSON.stringify(newHistory));
  }
};

export const clearPageHistory = () => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.removeItem('pageHistory');
  }
}; 