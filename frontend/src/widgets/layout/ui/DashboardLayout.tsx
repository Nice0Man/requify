import React, { useMemo, useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  useTheme,
  alpha,
} from "@mui/material";
import { DashboardThemeProvider } from "@/shared/providers";
import { SidebarWidget, useSidebarState } from "@/widgets/app-sidebar";
import { HeaderWidget } from "@/widgets/app-header";
import { DASHBOARD_TOKENS } from "@/shared/styles";
import { useLayoutCalculations } from "@/shared/hooks";
import type { DashboardMode, DashboardLayout as DashboardLayoutType, DashboardDensity } from "@/shared/types/dashboard";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  mode?: DashboardMode;
  layout?: DashboardLayoutType;
  density?: DashboardDensity;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  mode = "detailed",
  layout = "grid", 
  density = "comfortable"
}) => {
  const theme = useTheme();
  const { isCollapsed, isMobile } = useSidebarState();

  // Получаем точные расчеты для layout без overflow костылей
  const { dimensions, recalculate, breakpoints } = useLayoutCalculations({
    mode,
    layout,
    density,
    sidebarCollapsed: isCollapsed
  });

  // State для отслеживания изменений размеров окна
  const [currentDimensions, setCurrentDimensions] = useState(dimensions);

  // Пересчитываем размеры при изменении окна
  useEffect(() => {
    const handleResize = () => {
      const newDimensions = recalculate();
      setCurrentDimensions(newDimensions);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recalculate]);

  // Обновляем размеры при изменении параметров
  useEffect(() => {
    setCurrentDimensions(dimensions);
  }, [dimensions]);

  // Точные стили для корневого контейнера
  const rootContainerStyles = useMemo(() => ({
    display: "flex",
    height: `${currentDimensions.viewport.height}px`, // Точная высота viewport
    width: `${currentDimensions.viewport.width}px`, // Точная ширина viewport
    position: "relative" as const,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.background.default, 0.95)} 0%, 
      ${alpha(theme.palette.grey[50], 0.3)} 100%)`,
  }), [currentDimensions.viewport, theme]);

  // Точные стили для main content
  const mainContentStyles = useMemo(() => ({
    // Точный расчет ширины и позиции
    width: `${currentDimensions.content.width}px`,
    height: `${currentDimensions.content.height + currentDimensions.header.height}px`,
    marginLeft: `${currentDimensions.content.margin.left}px`,
    marginRight: `${currentDimensions.content.margin.right}px`,
    
    display: "flex",
    flexDirection: "column" as const,
    position: "relative" as const,
    
    // Transition для анимации при изменении sidebar
    transition: theme.transitions.create(["margin-left", "width"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  }), [currentDimensions, theme]);

  // Точные стили для content area
  const contentAreaStyles = useMemo(() => ({
    width: "100%",
    height: `${currentDimensions.content.height}px`,
    // Точные padding из расчетов
    paddingLeft: `${currentDimensions.content.padding.horizontal}px`,
    paddingRight: `${currentDimensions.content.padding.horizontal}px`,
    paddingTop: `${currentDimensions.content.padding.vertical}px`,
    paddingBottom: `${currentDimensions.content.padding.vertical}px`,
    
    backgroundColor: "transparent",
    position: "relative" as const,
    
    // Кастомный скроллбар
    "&::-webkit-scrollbar": {
      width: 6,
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: alpha(theme.palette.divider, 0.05),
      borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      borderRadius: 3,
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.3),
      },
    },
    
    // Плавный скролл только если нужен
    scrollBehavior: "smooth",
  }), [currentDimensions, theme]);

  return (
    <DashboardThemeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        {/* Root Container - точные размеры viewport */}
        <Box sx={rootContainerStyles}>
          
          {/* Sidebar - фиксированная позиция */}
          <SidebarWidget />

          {/* Main Content Area - точно рассчитанные размеры */}
          <Box
            component="main"
            sx={mainContentStyles}
          >
            {/* Header - фиксированная высота */}
            <HeaderWidget />

            {/* Content Area - точные размеры и padding */}
            <Box sx={contentAreaStyles}>
              {children}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </DashboardThemeProvider>
  );
};

export default DashboardLayout;
