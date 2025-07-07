// Dashboard pages types
// В соответствии с FSD принципами, здесь определяются типы специфичные для страниц

// Типы для компонентов страниц
export interface DashboardPageProps {
  title?: string;
  showWelcome?: boolean;
}

export interface HomePageProps {
  isAuthenticated?: boolean;
}

export interface StartPageProps {
  onGetStarted?: () => void;
}

export interface ApiOverviewPageProps {
  expandedSections?: string[];
}

// Типы для состояния страниц
export interface DashboardPageState {
  isLoading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}

// Типы для навигации между страницами
export interface PageNavigation {
  currentPage: string;
  previousPage: string | null;
  canGoBack: boolean;
}

// Типы для конфигурации страниц
export interface PageConfig {
  title: string;
  description?: string;
  requiresAuth: boolean;
  layout: 'default' | 'auth' | 'admin';
}

// Enum для типов страниц
export enum PageType {
  DASHBOARD = 'dashboard',
  HOME = 'home',
  START = 'start',
  API_OVERVIEW = 'api-overview',
}

// Типы для метаданных страниц
export interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
} 