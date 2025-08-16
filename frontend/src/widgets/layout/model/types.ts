import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material";

// Конфигурация layout
export interface LayoutConfig {
  /** Показывать сайдбар */
  showSidebar: boolean;
  /** Показывать заголовок */
  showHeader: boolean;
  /** Отступы контента */
  contentPadding: number;
  /** Overflow контента */
  contentOverflow: "auto" | "hidden" | "visible";
  /** Анимации переходов */
  enableTransitions: boolean;
}

// Состояние layout
export interface LayoutState {
  /** Свернут ли сайдбар */
  isSidebarCollapsed: boolean;
  /** Заголовок страницы */
  pageTitle: string;
  /** Подзаголовок страницы */
  pageSubtitle?: string;
  /** Путь текущей страницы */
  currentPath: string;
}

// Пропсы для MainLayout
export interface MainLayoutProps {
  /** Дочерние элементы (основной контент страницы) */
  children: ReactNode;
  
  /** Заголовок страницы */
  title?: string;
  
  /** Подзаголовок страницы */
  subtitle?: string;
  
  /** Действия для заголовка */
  actions?: ReactNode;
  
  /** Конфигурация layout */
  config?: Partial<LayoutConfig>;
  
  /** CSS классы */
  className?: string;
  
  /** Material-UI стили */
  sx?: SxProps<Theme>;
  
  /** Callback при изменении состояния сайдбара */
  onSidebarStateChange?: (collapsed: boolean) => void;
}

// Маппинг путей к заголовкам
export interface PageTitleMap {
  [path: string]: {
    title: string;
    subtitle?: string;
  };
}

// Конфигурация по умолчанию
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  showSidebar: true,
  showHeader: true,
  contentPadding: 3,
  contentOverflow: "auto",
  enableTransitions: true,
};

// Маппинг путей к заголовкам страниц
export const DEFAULT_PAGE_TITLES: PageTitleMap = {
  "/dashboard": {
    title: "Дашборд",
    subtitle: "Обзор системы и ключевые показатели",
  },
  "/projects": {
    title: "Проекты",
    subtitle: "Управление проектами и задачами",
  },
  "/requirements": {
    title: "Требования", 
    subtitle: "Анализ и управление требованиями",
  },
  "/releases": {
    title: "Релизы",
    subtitle: "Планирование и управление релизами",
  },
  "/testing": {
    title: "Тестирование",
    subtitle: "Контроль качества и тестирование",
  },
  "/reports": {
    title: "Отчеты",
    subtitle: "Аналитика и отчетность",
  },
  "/settings": {
    title: "Настройки",
    subtitle: "Настройки пользователя и системы",
  },
  "/admin": {
    title: "Администрирование",
    subtitle: "Административная панель",
  },
}; 