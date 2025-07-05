import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export interface LoadingSpinnerProps {
  size?: number | string;
  message?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  thickness?: number;
  variant?: 'determinate' | 'indeterminate';
  value?: number;
  fullHeight?: boolean;
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  color = 'primary',
  thickness = 3.6,
  variant = 'indeterminate',
  value,
  fullHeight = false,
  centered = true,
}) => {
  const content = (
    <>
      <CircularProgress
        size={size}
        color={color}
        thickness={thickness}
        variant={variant}
        value={value}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {message}
        </Typography>
      )}
    </>
  );

  if (centered) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={fullHeight ? '100vh' : 'auto'}
        padding={2}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {content}
    </Box>
  );
}; 