import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LazyWidgetProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

const DefaultFallback: React.FC<{ name?: string }> = ({ name }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
      p: 3,
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="textSecondary">
      Загрузка {name || 'виджета'}...
    </Typography>
  </Box>
);

/**
 * LazyWidget - компонент для ленивой загрузки виджетов
 * Обеспечивает code splitting и улучшает производительность
 */
export const LazyWidget: React.FC<LazyWidgetProps> = ({ 
  children, 
  fallback, 
  name 
}) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback name={name} />}>
      {children}
    </Suspense>
  );
};

export default LazyWidget; 