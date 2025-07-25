import React from 'react';
import { Box, Card, CardContent, Typography, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Api,
  Security,
  CloudSync,
  GitHub,
  Chat,
  Assignment,
  Groups,
  Description,
} from '@mui/icons-material';
import type { IntegrationCardProps } from '../model/types';

const MotionCard = motion(Card);

// Мапинг иконок
const ICON_MAP = {
  Api,
  Security,
  CloudSync,
  GitHub,
  Chat,
  Assignment,
  Groups,
  Description,
} as const;

export const IntegrationCard: React.FC<IntegrationCardProps> = React.memo(({
  integration,
  onClick,
  isVisible = true,
  blurLevel = 0,
  scale = 1,
  isDragging = false,
  className,
}) => {
  const theme = useTheme();
  const IconComponent = ICON_MAP[integration.icon as keyof typeof ICON_MAP] || Api;

  const handleClick = () => {
    // Не обрабатываем клик во время drag или если карточка не видимая
    if (onClick && isVisible && !isDragging) {
      onClick(integration);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick && isVisible && !isDragging) {
      event.preventDefault();
      onClick(integration);
    }
  };

  // Динамические цвета на основе темы и категории
  const getCardColors = () => {
    const baseColor = integration.color || theme.palette.primary.main;
    const isDark = theme.palette.mode === 'dark';
    
    return {
      // Glassmorphism background
      background: isDark
        ? `linear-gradient(145deg, 
            ${theme.palette.background.paper}F0 0%, 
            ${theme.palette.background.paper}E8 25%,
            ${baseColor}08 50%,
            ${theme.palette.background.paper}E8 75%,
            ${theme.palette.background.paper}F0 100%)`
        : `linear-gradient(145deg, 
            ${theme.palette.background.paper}FC 0%, 
            ${theme.palette.background.paper}F8 25%,
            ${baseColor}06 50%,
            ${theme.palette.background.paper}F8 75%,
            ${theme.palette.background.paper}FC 100%)`,
      
      // Icon container with glassmorphism
      iconBackground: isDark
        ? `linear-gradient(135deg, 
            ${baseColor}20 0%, 
            ${baseColor}15 50%, 
            ${baseColor}25 100%)`
        : `linear-gradient(135deg, 
            ${baseColor}15 0%, 
            ${baseColor}10 50%, 
            ${baseColor}20 100%)`,
      
      iconBorder: `${baseColor}40`,
      iconGlow: `radial-gradient(circle at 30% 30%, ${baseColor}25 0%, transparent 70%)`,
      
      // Enhanced borders
      topBorder: `linear-gradient(90deg, 
        transparent, 
        ${baseColor}60 20%, 
        ${baseColor}80 50%, 
        ${baseColor}60 80%, 
        transparent)`,
      
      // Active state border
      activeBorder: `linear-gradient(135deg, 
        ${baseColor}60 0%, 
        ${baseColor}40 25%, 
        transparent 50%, 
        ${baseColor}40 75%, 
        ${baseColor}60 100%)`,
    };
  };

  const colors = getCardColors();

  // Цвета для бейджей с glassmorphism
  const getBadgeColors = () => {
    if (integration.isPopular) {
      return {
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(255,107,107,0.9) 0%, rgba(238,90,82,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255,107,107,0.95) 0%, rgba(238,90,82,0.95) 100%)',
        color: theme.palette.common.white,
        backdropFilter: 'blur(10px) saturate(180%)',
      };
    }
    if (integration.isNew) {
      return {
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(81,207,102,0.9) 0%, rgba(64,192,87,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(81,207,102,0.95) 0%, rgba(64,192,87,0.95) 100%)',
        color: theme.palette.common.white,
        backdropFilter: 'blur(10px) saturate(180%)',
      };
    }
    return {};
  };

  const badgeColors = getBadgeColors();

  // Вычисляем параллакс эффекты на основе позиции карточки
  const getParallaxEffects = () => {
    const centerOffset = (1 - scale) * 100;
    const rotateY = centerOffset * 0.08; // Уменьшаем вращение
    const translateZ = scale * 15 - 5; // Уменьшаем глубину для более мягкого эффекта
    
    return {
      transform: `perspective(1200px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      transformOrigin: 'center center',
    };
  };

  const parallaxEffects = getParallaxEffects();

  // Определяем активность карточки (центральная или близкая к центру)
  const isActive = blurLevel === 0;
  const isNearActive = blurLevel < 1;

  return (
    <MotionCard
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isVisible ? 0 : -1}
      role="button"
      aria-label={`Интеграция с ${integration.title}: ${integration.description}`}
      whileHover={isVisible && isNearActive ? { 
        y: isActive ? -16 : -8, 
        scale: scale * (isActive ? 1.05 : 1.02),
        rotateY: 0,
        translateZ: isActive ? 40 : 20,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
      } : {}}
      whileTap={isVisible && isNearActive ? { 
        scale: scale * 0.98,
        y: isActive ? -8 : -4,
        transition: { duration: 0.15 }
      } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      }}
      sx={{
        height: 320,
        width: '100%',
        cursor: isVisible && isNearActive ? 'pointer' : 'default',
        borderRadius: 4,
        background: colors.background,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.08)' 
          : 'rgba(0,0,0,0.05)',
        
        // Enhanced glassmorphism shadows
        boxShadow: isActive
          ? theme.palette.mode === 'dark'
            ? `0 20px 60px rgba(0,0,0,0.4), 
               0 10px 30px rgba(0,0,0,0.3), 
               inset 0 1px 0 rgba(255,255,255,0.1),
               0 0 0 1px ${colors.iconBorder}`
            : `0 20px 60px rgba(0,0,0,0.12), 
               0 10px 30px rgba(0,0,0,0.08), 
               inset 0 1px 0 rgba(255,255,255,0.8),
               0 0 0 1px ${colors.iconBorder}`
          : isNearActive
          ? theme.palette.mode === 'dark'
            ? `0 12px 40px rgba(0,0,0,0.3), 
               0 6px 20px rgba(0,0,0,0.2),
               inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 12px 40px rgba(0,0,0,0.08), 
               0 6px 20px rgba(0,0,0,0.04),
               inset 0 1px 0 rgba(255,255,255,0.6)`
          : theme.palette.mode === 'dark'
          ? `0 6px 20px rgba(0,0,0,0.2), 
             inset 0 1px 0 rgba(255,255,255,0.03)`
          : `0 6px 20px rgba(0,0,0,0.04), 
             inset 0 1px 0 rgba(255,255,255,0.4)`,

        // Enhanced glassmorphism backdrop filter
        backdropFilter: isActive 
          ? 'blur(20px) saturate(180%)' 
          : isNearActive 
          ? 'blur(16px) saturate(160%)'
          : 'blur(12px) saturate(140%)',
        
        overflow: 'hidden',
        position: 'relative',
        ...parallaxEffects,
        
        // Убираем агрессивное размытие, оставляем только opacity
        filter: 'none', // Убираем blur filter
        opacity: isActive ? 1 : isNearActive ? 0.9 : blurLevel > 0 ? 0.7 : 1,
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, opacity',
        transformStyle: 'preserve-3d',
        
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
        
        // Top gradient border
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: colors.topBorder,
          opacity: isActive ? 1 : isNearActive ? 0.8 : 0.5,
          borderRadius: '4px 4px 0 0',
        },
        
        // Enhanced glow effect for active cards
        ...(isActive && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: colors.activeBorder,
            borderRadius: 'inherit',
            zIndex: -1,
            opacity: 0.6,
            filter: 'blur(4px)',
          },
        }),
      }}
    >
      {/* Enhanced Popular Badge */}
      {integration.isPopular && (
        <MotionCard
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
        >
          <Chip
            label="🔥 Популярно"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 3,
              background: badgeColors.background,
              backdropFilter: badgeColors.backdropFilter,
              color: badgeColors.color,
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 28,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />
        </MotionCard>
      )}

      {/* Enhanced New Badge */}
      {integration.isNew && (
        <MotionCard
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
        >
          <Chip
            label="✨ Новое"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 3,
              background: badgeColors.background,
              backdropFilter: badgeColors.backdropFilter,
              color: badgeColors.color,
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 28,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />
        </MotionCard>
      )}

      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 4,
          position: 'relative',
          '&:last-child': { pb: 4 },
        }}
      >
        {/* Enhanced Icon Container with glassmorphism */}
        <Box
          component={motion.div}
          whileHover={{ 
            scale: isActive ? 1.15 : 1.08, 
            rotateY: isActive ? 15 : 8,
            transition: { duration: 0.3 }
          }}
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            background: colors.iconBackground,
            border: '1px solid',
            borderColor: colors.iconBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            transformStyle: 'preserve-3d',
            backdropFilter: 'blur(10px) saturate(180%)',
            boxShadow: theme.palette.mode === 'dark' 
              ? `0 12px 35px rgba(0,0,0,0.3), 
                 inset 0 1px 0 rgba(255,255,255,0.1)`
              : `0 12px 35px rgba(0,0,0,0.1), 
                 inset 0 1px 0 rgba(255,255,255,0.8)`,
            
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colors.iconGlow,
              opacity: 0.6,
              borderRadius: 'inherit',
            },
            
            // Shimmer effect
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              transition: 'left 0.8s ease',
              borderRadius: 'inherit',
            },
            
            '&:hover::after': {
              left: '100%',
            },
          }}
        >
          <IconComponent
            sx={{
              fontSize: 36,
              color: integration.color || theme.palette.primary.main,
              position: 'relative',
              zIndex: 2,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
            }}
          />
        </Box>

        {/* Enhanced Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: '1.3rem',
              lineHeight: 1.3,
              mb: 2,
              color: 'text.primary',
              textShadow: theme.palette.mode === 'dark' 
                ? '0 2px 4px rgba(0,0,0,0.3)' 
                : '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {integration.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              mb: 'auto',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {integration.description}
          </Typography>

          {/* Enhanced Connections Stats with glassmorphism */}
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: '1px solid',
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.06)',
              position: 'relative',
              
              // Glassmorphism divider
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '15%',
                right: '15%',
                height: '1px',
                background: `linear-gradient(90deg, 
                  transparent, 
                  ${colors.iconBorder}, 
                  transparent)`,
              },
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 2,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.02)'
                : 'rgba(0,0,0,0.02)',
              backdropFilter: 'blur(8px)',
            }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {integration.connections}
              </Typography>
              
              {/* Enhanced connection indicator */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, 
                    ${integration.color || theme.palette.primary.main}, 
                    ${integration.color || theme.palette.primary.light})`,
                  boxShadow: `0 0 12px ${integration.color || theme.palette.primary.main}60`,
                  position: 'relative',
                  
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: theme.palette.common.white,
                    animation: 'pulse 2s infinite',
                  },
                  
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                      transform: 'translate(-50%, -50%) scale(1)',
                    },
                    '50%': {
                      opacity: 0.7,
                      transform: 'translate(-50%, -50%) scale(1.2)',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );
});

IntegrationCard.displayName = 'IntegrationCard';
