import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { HeaderWidget } from '@/widgets/header';
import { SidebarWidget } from '@/widgets/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark');

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Здесь будет логика переключения темы через ThemeProvider
    console.log('Theme toggle:', !isDarkMode);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <HeaderWidget onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
      
      {/* Sidebar */}
      <SidebarWidget />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Отступ для фиксированного header
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 