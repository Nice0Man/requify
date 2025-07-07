import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { HeaderWidget } from '@/widgets/header';
import { SidebarWidget } from '@/widgets/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const HEADER_HEIGHT = 64;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
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
          marginLeft: `${SIDEBAR_WIDTH}px`, // Начальный отступ для развернутой боковой панели
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          // Реагируем на изменение ширины sidebar через CSS переменные или медиазапросы
          '@media (max-width: 1200px)': {
            marginLeft: `${SIDEBAR_COLLAPSED_WIDTH}px`,
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
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}; 