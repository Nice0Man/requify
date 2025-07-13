import React from 'react';
import { Box, useTheme, alpha, Fade, keyframes } from '@mui/material';

// Анимация появления
const dropAppear = keyframes`
  0% { 
    opacity: 0;
    transform: scaleX(0.3);
  }
  100% { 
    opacity: 1;
    transform: scaleX(1);
  }
`;

export const DropIndicator: React.FC = () => {
  const theme = useTheme();

  return (
    <Fade in={true} timeout={200}>
      <Box
        sx={{
          position: 'absolute',
          top: -1,
          left: 8,
          right: 8,
          height: 3,
          borderRadius: 1.5,
          background: `linear-gradient(90deg, 
            ${alpha(theme.palette.primary.main, 0.8)}, 
            ${theme.palette.primary.main}, 
            ${alpha(theme.palette.primary.main, 0.8)}
          )`,
          zIndex: 1000,
          animation: `${dropAppear} 0.3s ease-out`,
          boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.6)}`,
          transform: 'scaleX(1)',
          transformOrigin: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -1,
            left: -2,
            right: -2,
            bottom: -1,
            borderRadius: 2,
            background: `linear-gradient(90deg, 
              transparent, 
              ${alpha(theme.palette.primary.main, 0.2)}, 
              ${alpha(theme.palette.primary.main, 0.4)}, 
              ${alpha(theme.palette.primary.main, 0.2)}, 
              transparent
            )`,
            zIndex: -1,
          }
        }}
      />
    </Fade>
  );
}; 