import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { 
  LayoutConfig, 
  LayoutState, 
  PageTitleMap
} from "./types";
import { 
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_PAGE_TITLES 
} from "./types";

export interface UseLayoutReturn {
  state: LayoutState;
  config: LayoutConfig;
  actions: {
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
    setPageTitle: (title: string, subtitle?: string) => void;
  };
}

/**
 * Хук для управления состоянием layout виджета
 * Управляет заголовками страниц, состоянием сайдбара и конфигурацией
 */
export const useLayout = (
  userConfig?: Partial<LayoutConfig>,
  pageTitles: PageTitleMap = DEFAULT_PAGE_TITLES,
  onSidebarStateChange?: (collapsed: boolean) => void
): UseLayoutReturn => {
  const location = useLocation();
  
  // Объединяем конфигурацию с настройками по умолчанию
  const config = useMemo(() => ({
    ...DEFAULT_LAYOUT_CONFIG,
    ...userConfig,
  }), [userConfig]);

  // Состояние сайдбара (начальное значение из localStorage или конфигурации)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('layout-sidebar-collapsed');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return true; // По умолчанию свернут
  });

  // Определяем заголовок и подзаголовок на основе текущего пути
  const { pageTitle, pageSubtitle } = useMemo(() => {
    const currentPath = location.pathname;
    
    // Ищем наиболее подходящий путь
    const matchingPath = Object.keys(pageTitles).find(path => 
      currentPath.startsWith(path)
    );
    
    if (matchingPath && pageTitles[matchingPath]) {
      return {
        pageTitle: pageTitles[matchingPath].title,
        pageSubtitle: pageTitles[matchingPath].subtitle,
      };
    }
    
    // Значения по умолчанию
    return {
      pageTitle: "Приложение",
      pageSubtitle: undefined,
    };
  }, [location.pathname, pageTitles]);

  // Пользовательские заголовки (могут переопределять автоматические)
  const [customTitle, setCustomTitle] = useState<string | undefined>();
  const [customSubtitle, setCustomSubtitle] = useState<string | undefined>();

  // Сохраняем состояние сайдбара в localStorage
  useEffect(() => {
    localStorage.setItem('layout-sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
    onSidebarStateChange?.(isSidebarCollapsed);
  }, [isSidebarCollapsed, onSidebarStateChange]);

  // Действия для управления состоянием
  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev: boolean) => !prev);
  }, []);

  const setPageTitle = useCallback((title: string, subtitle?: string) => {
    setCustomTitle(title);
    setCustomSubtitle(subtitle);
  }, []);

  // Сбрасываем пользовательские заголовки при изменении маршрута
  useEffect(() => {
    setCustomTitle(undefined);
    setCustomSubtitle(undefined);
  }, [location.pathname]);

  // Финальное состояние
  const state: LayoutState = useMemo(() => ({
    isSidebarCollapsed,
    pageTitle: customTitle || pageTitle,
    pageSubtitle: customSubtitle || pageSubtitle,
    currentPath: location.pathname,
  }), [
    isSidebarCollapsed,
    customTitle,
    pageTitle,
    customSubtitle,
    pageSubtitle,
    location.pathname,
  ]);

  return {
    state,
    config,
    actions: {
      setSidebarCollapsed,
      toggleSidebar,
      setPageTitle,
    },
  };
}; 