import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/store';
import { selectCurrentRoute } from '@/app/store/slices/routerSlice';
import { selectIsAuthenticated } from '@/features/auth/model/authSlice';
import { selectDashboardStats } from '@/features/dashboard/model/dashboardSlice';
import { PageType, PageNavigation, PageMetadata } from './types';

// Hook для получения текущей информации о странице
export const useCurrentPage = () => {
  const currentRoute = useAppSelector(selectCurrentRoute);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const getPageType = (): PageType => {
    switch (currentRoute) {
      case '/dashboard':
        return PageType.DASHBOARD;
      case '/':
        return PageType.HOME;
      case '/start':
        return PageType.START;
      case '/api-overview':
        return PageType.API_OVERVIEW;
      default:
        return PageType.HOME;
    }
  };

  return {
    currentRoute,
    pageType: getPageType(),
    isAuthenticated,
    requiresAuth: getPageType() === PageType.DASHBOARD,
  };
};

// Hook для навигации между страницами
export const usePageNavigation = (): PageNavigation => {
  const currentRoute = useAppSelector(selectCurrentRoute);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  
  useEffect(() => {
    setPreviousPage(currentRoute);
  }, [currentRoute]);

  return {
    currentPage: currentRoute,
    previousPage,
    canGoBack: Boolean(previousPage),
  };
};

// Hook для получения метаданных страницы
export const usePageMetadata = (pageType: PageType): PageMetadata => {
  const getMetadata = (): PageMetadata => {
    switch (pageType) {
      case PageType.DASHBOARD:
        return {
          title: 'Dashboard - Requify',
          description: 'Управление проектами и требованиями',
          keywords: ['dashboard', 'projects', 'requirements'],
          ogTitle: 'Dashboard - Requify',
          ogDescription: 'Управление проектами и требованиями',
        };
      case PageType.HOME:
        return {
          title: 'Home - Requify',
          description: 'Система управления требованиями',
          keywords: ['requirements', 'management', 'projects'],
          ogTitle: 'Requify - Requirements Management System',
          ogDescription: 'Профессиональная система управления требованиями',
        };
      case PageType.START:
        return {
          title: 'Get Started - Requify',
          description: 'Начните работу с Requify',
          keywords: ['getting started', 'tutorial', 'onboarding'],
          ogTitle: 'Get Started with Requify',
          ogDescription: 'Начните работу с системой управления требованиями',
        };
      case PageType.API_OVERVIEW:
        return {
          title: 'API Overview - Requify',
          description: 'Обзор API системы управления требованиями',
          keywords: ['api', 'documentation', 'reference'],
          ogTitle: 'API Overview - Requify',
          ogDescription: 'Полный обзор API системы управления требованиями',
        };
      default:
        return {
          title: 'Requify',
          description: 'Система управления требованиями',
        };
    }
  };

  return getMetadata();
};

// Hook для проверки доступности страницы
export const usePageAccess = (pageType: PageType) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      
      switch (pageType) {
        case PageType.DASHBOARD:
          setHasAccess(isAuthenticated);
          break;
        case PageType.HOME:
        case PageType.START:
        case PageType.API_OVERVIEW:
          setHasAccess(true);
          break;
        default:
          setHasAccess(false);
      }
      
      setIsLoading(false);
    };

    checkAccess();
  }, [pageType, isAuthenticated]);

  return {
    hasAccess,
    isLoading,
    requiresAuth: pageType === PageType.DASHBOARD,
  };
};

// Hook для получения статистики для dashboard страниц
export const useDashboardPageData = () => {
  const stats = useAppSelector(selectDashboardStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Логика обновления данных будет реализована при интеграции с Redux actions
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API вызова
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    refreshData,
  };
};

// Hook для обработки состояния загрузки страницы
export const usePageLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setPageError = (error: string) => {
    setError(error);
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setPageError,
    clearError,
  };
}; 