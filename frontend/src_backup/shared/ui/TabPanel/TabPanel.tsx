import React from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
  className?: string;
}

/**
 * TabPanel - компонент для отображения содержимого вкладок
 * Показывает контент только если value совпадает с index
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  className,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={className}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}; 