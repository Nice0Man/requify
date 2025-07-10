import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { HeaderWidget } from '@/widgets/header';
import { SidebarWidget, SidebarProvider, useSidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/widgets/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = 64;

// Внутренний компонент для использования контекста сайдбара
const DashboardLayoutContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { isCollapsed } = useSidebar();
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark');

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Здесь будет логика переключения темы через ThemeProvider
    console.log('Theme toggle:', !isDarkMode);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Фиксированная боковая панель */}
      <SidebarWidget />
      
      {/* Основная область с header и content */}
      <Box 
        sx={{ 
          flex: 1,
          marginLeft: isCollapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
          // Для мобильных устройств убираем отступ
          '@media (max-width: 768px)': {
            marginLeft: 0,
          },
        }}
      >
        {/* Header */}
        <HeaderWidget onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            pt: `${HEADER_HEIGHT}px`, // Отступ для фиксированного header
            backgroundColor: theme.palette.background.default,
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
            position: 'relative',
            overflow: 'hidden',
            // Добавляем небольшой padding для контента
            '@media (min-width: 768px)': {
              pl: 2,
              pr: 2,
            },
          }}
        >
          {/* Фоновые декоративные элементы */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.02,
              pointerEvents: 'none',
              background: `radial-gradient(circle at 20% 20%, ${theme.palette.primary.main} 0%, transparent 50%), 
                          radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
              zIndex: 0,
            }}
          />
          
          {/* Контент */}
          <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Основной компонент с провайдером
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}; 