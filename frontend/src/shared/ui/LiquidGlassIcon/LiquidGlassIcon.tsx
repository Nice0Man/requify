import React from 'react';
import { Box, SxProps, Theme, alpha, useTheme } from '@mui/material';

interface LiquidGlassIconProps {
  icon: React.ElementType;
  color: string;
  size?: number;
  gradient?: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  clickable?: boolean;
  variant?: 'primary' | 'secondary' | 'subtle';
}

export const LiquidGlassIcon: React.FC<LiquidGlassIconProps> = ({
  icon: Icon,
  color,
  size = 56,
  gradient,
  onClick,
  sx,
  clickable = false,
  variant = 'primary',
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: gradient || `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(color, 0.2)}`,
          boxShadow: `
            0 8px 32px ${alpha(color, 0.25)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)},
            inset 0 -1px 0 ${alpha(theme.palette.common.black, 0.1)}
          `,
        };
      case 'secondary':
        return {
          background: `linear-gradient(135deg, 
            ${alpha(color, 0.1)} 0%, 
            ${alpha(color, 0.05)} 50%,
            ${alpha(color, 0.08)} 100%
          )`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(color, 0.15)}`,
          boxShadow: `
            0 4px 24px ${alpha(color, 0.15)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
          `,
        };
      case 'subtle':
        return {
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.default, 0.6)} 100%
          )`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: `
            0 2px 16px ${alpha(theme.palette.common.black, 0.08)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.05)}
          `,
        };
      default:
        return {};
    }
  };

  const iconColor = variant === 'primary' ? 'white' : color;

  return (
    <Box
      component={clickable ? 'button' : 'div'}
      onClick={clickable ? onClick : undefined}
      sx={{
        width: size,
        height: size,
        borderRadius: 4, // Rounded square instead of circle
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        border: 'none',
        outline: 'none',
        overflow: 'hidden',
        ...getVariantStyles(),
        
        // Liquid Glass hover effects
        '&:hover': clickable ? {
          transform: 'translateY(-2px) scale(1.05)',
          boxShadow: variant === 'primary' 
            ? `
              0 12px 40px ${alpha(color, 0.35)},
              0 0 0 1px ${alpha(color, 0.3)},
              inset 0 1px 0 ${alpha(theme.palette.common.white, 0.3)},
              inset 0 -1px 0 ${alpha(theme.palette.common.black, 0.1)}
            `
            : `
              0 8px 32px ${alpha(color, 0.25)},
              0 0 0 1px ${alpha(color, 0.25)},
              inset 0 1px 0 ${alpha(theme.palette.common.white, 0.15)}
            `,
          filter: 'brightness(1.1)',
        } : {},

        // Liquid Glass pressed effect
        '&:active': clickable ? {
          transform: 'translateY(0) scale(0.98)',
          transition: 'all 0.1s ease',
        } : {},

        // Light refraction effect
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, 
            ${alpha(theme.palette.common.white, 0.1)} 0%, 
            transparent 100%
          )`,
          borderRadius: '16px 16px 0 0',
          pointerEvents: 'none',
        },

        // Subtle shimmer effect
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: `conic-gradient(from 0deg, 
            transparent 0deg,
            ${alpha(color, 0.1)} 90deg,
            transparent 180deg,
            ${alpha(color, 0.1)} 270deg,
            transparent 360deg
          )`,
          borderRadius: 4,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: -1,
        },

        '&:hover::after': clickable ? {
          opacity: 1,
        } : {},

        ...sx,
      }}
    >
      <Icon 
        sx={{ 
          color: iconColor,
          fontSize: size * 0.5,
          filter: variant === 'primary' 
            ? `drop-shadow(0 2px 4px ${alpha(theme.palette.common.black, 0.2)})` 
            : 'none',
          transition: 'all 0.3s ease',
        }} 
      />
    </Box>
  );
}; 