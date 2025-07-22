import { useCallback, useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { DASHBOARD_TOKENS } from '@/shared/styles/dashboard-tokens';
import type { DashboardMode, DashboardLayout, DashboardDensity } from '@/shared/types/dashboard';

export interface LayoutDimensions {
  viewport: {
    width: number;
    height: number;
  };
  sidebar: {
    width: number;
    collapsedWidth: number;
    isCollapsed: boolean;
    isMobile: boolean;
  };
  header: {
    height: number;
  };
  content: {
    width: number;
    height: number;
    maxWidth: number;
    padding: {
      horizontal: number;
      vertical: number;
    };
    margin: {
      left: number;
      right: number;
    };
  };
  grid: {
    columns: number;
    gap: number;
    itemWidth: number;
    itemHeight: number;
  };
}

export interface UseLayoutCalculationsProps {
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  sidebarCollapsed?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export const useLayoutCalculations = ({
  mode,
  layout,
  density,
  sidebarCollapsed = false,
  containerRef
}: UseLayoutCalculationsProps) => {
  const theme = useTheme();
  
  // Breakpoints для точных расчетов
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isWidescreen = useMediaQuery(theme.breakpoints.up('xl'));
  const isUltrawide = useMediaQuery('(min-width: 1920px)');

  // Базовые размеры из токенов
  const tokens = DASHBOARD_TOKENS;
  
  // Расчет размеров viewport
  const getViewportDimensions = useCallback(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }, []);

  // Расчет размеров sidebar
  const getSidebarDimensions = useCallback(() => {
    const expandedWidth = tokens.layout.sidebar.expanded;
    const collapsedWidth = tokens.layout.sidebar.collapsed;
    
    return {
      width: sidebarCollapsed ? collapsedWidth : expandedWidth,
      collapsedWidth,
      isCollapsed: sidebarCollapsed,
      isMobile
    };
  }, [sidebarCollapsed, isMobile, tokens]);

  // Расчет высоты header
  const getHeaderDimensions = useCallback(() => {
    const baseHeight = isMobile ? 56 : 64; // Material Design App Bar heights
    return {
      height: baseHeight
    };
  }, [isMobile]);

  // Расчет padding на основе density и screen size
  const getPadding = useCallback(() => {
    const basePadding = {
      dense: { xs: 4, sm: 6, md: 8, lg: 12 },
      compact: { xs: 6, sm: 8, md: 12, lg: 16 },
      comfortable: { xs: 8, sm: 12, md: 16, lg: 24 }
    };

    const densityPadding = basePadding[density];
    
    let horizontal: number;
    let vertical: number;

    if (isMobile) {
      horizontal = densityPadding.xs;
      vertical = densityPadding.xs;
    } else if (isTablet) {
      horizontal = densityPadding.sm;
      vertical = densityPadding.sm;
    } else if (isDesktop) {
      horizontal = densityPadding.md;
      vertical = densityPadding.md;
    } else {
      horizontal = densityPadding.lg;
      vertical = densityPadding.lg;
    }

    return { horizontal, vertical };
  }, [density, isMobile, isTablet, isDesktop]);

  // Расчет размеров content area
  const getContentDimensions = useCallback(() => {
    const viewport = getViewportDimensions();
    const sidebar = getSidebarDimensions();
    const header = getHeaderDimensions();
    const padding = getPadding();

    // Точный расчет ширины content area
    const sidebarWidth = isMobile ? 0 : sidebar.width;
    const availableWidth = viewport.width - sidebarWidth;
    
    // Вычитаем горизонтальный padding (left + right)
    const contentWidth = availableWidth - (padding.horizontal * 2);
    
    // Высота content area (viewport - header - vertical padding)
    const contentHeight = viewport.height - header.height - (padding.vertical * 2);

    // MaxWidth для разных breakpoints
    let maxWidth: number;
    if (mode === 'fullscreen') {
      maxWidth = contentWidth; // Полная ширина в fullscreen
    } else {
      // Ограничиваем максимальную ширину для обычных режимов
      if (isUltrawide) {
        maxWidth = Math.min(contentWidth, 1600); // Макс 1600px на ultrawide
      } else if (isWidescreen) {
        maxWidth = Math.min(contentWidth, 1400);
      } else if (isDesktop) {
        maxWidth = Math.min(contentWidth, 1200);
      } else {
        maxWidth = contentWidth;
      }
    }

    return {
      width: contentWidth,
      height: contentHeight,
      maxWidth,
      padding,
      margin: {
        left: sidebarWidth,
        right: 0
      }
    };
  }, [mode, isMobile, getViewportDimensions, getSidebarDimensions, getHeaderDimensions, getPadding, isUltrawide, isWidescreen, isDesktop]);

  // Расчет grid параметров
  const getGridDimensions = useCallback(() => {
    const content = getContentDimensions();
    
    // Количество колонок в зависимости от layout и screen size
    let columns: number;
    if (layout === 'list') {
      columns = 1;
    } else if (layout === 'masonry') {
      if (isMobile) columns = 1;
      else if (isTablet) columns = 2;
      else if (isDesktop) columns = 3;
      else if (isWidescreen) columns = 4;
      else columns = 5; // ultrawide
    } else { // grid
      if (mode === 'minimal') {
        if (isMobile) columns = 1;
        else if (isTablet) columns = 2;
        else columns = 3;
      } else {
        if (isMobile) columns = 1;
        else if (isTablet) columns = 2;
        else if (isDesktop) columns = 3;
        else if (isWidescreen) columns = 4;
        else columns = 6; // ultrawide
      }
    }

    // Gap между элементами
    const gapMap = {
      dense: { xs: 8, sm: 12, md: 16, lg: 20 },
      compact: { xs: 12, sm: 16, md: 20, lg: 24 },
      comfortable: { xs: 16, sm: 20, md: 24, lg: 32 }
    };

    let gap: number;
    if (isMobile) gap = gapMap[density].xs;
    else if (isTablet) gap = gapMap[density].sm;
    else if (isDesktop) gap = gapMap[density].md;
    else gap = gapMap[density].lg;

    // Расчет ширины одного item'а
    const totalGapWidth = gap * (columns - 1);
    const availableWidth = Math.min(content.width, content.maxWidth);
    const itemWidth = (availableWidth - totalGapWidth) / columns;

    // Высота item'а в зависимости от режима
    let itemHeight: number;
    if (mode === 'minimal') {
      itemHeight = itemWidth * 0.6; // 3:5 соотношение
    } else if (mode === 'compact') {
      itemHeight = itemWidth * 0.75; // 4:3 соотношение
    } else {
      itemHeight = itemWidth * 0.8; // Близко к квадрату
    }

    return {
      columns,
      gap,
      itemWidth: Math.floor(itemWidth), // Округляем для точности
      itemHeight: Math.floor(itemHeight)
    };
  }, [layout, mode, density, isMobile, isTablet, isDesktop, isWidescreen, getContentDimensions]);

  // Мемоизированные расчеты
  const layoutDimensions = useMemo<LayoutDimensions>(() => {
    const viewport = getViewportDimensions();
    const sidebar = getSidebarDimensions();
    const header = getHeaderDimensions();
    const content = getContentDimensions();
    const grid = getGridDimensions();

    return {
      viewport,
      sidebar,
      header,
      content,
      grid
    };
  }, [getViewportDimensions, getSidebarDimensions, getHeaderDimensions, getContentDimensions, getGridDimensions]);

  // Функция для обновления расчетов при изменении размеров
  const recalculate = useCallback(() => {
    // Эта функция будет вызываться при resize
    return {
      viewport: getViewportDimensions(),
      sidebar: getSidebarDimensions(),
      header: getHeaderDimensions(),
      content: getContentDimensions(),
      grid: getGridDimensions()
    };
  }, [getViewportDimensions, getSidebarDimensions, getHeaderDimensions, getContentDimensions, getGridDimensions]);

  return {
    dimensions: layoutDimensions,
    recalculate,
    breakpoints: {
      isMobile,
      isTablet,
      isDesktop,
      isWidescreen,
      isUltrawide
    }
  };
};

export default useLayoutCalculations; 