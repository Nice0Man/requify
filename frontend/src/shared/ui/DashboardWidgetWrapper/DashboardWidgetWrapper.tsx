import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Skeleton,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDashboardWidgetSettings } from '@/shared/hooks/useDashboardWidgetSettings';
import type { DashboardWidgetWrapperProps } from '@/shared/types/dashboard';

export const DashboardWidgetWrapper = memo<DashboardWidgetWrapperProps>(
  ({
    children,
    config,
    mode,
    layout,
    density,
    className,
    style,
    size: sizeOverride,
    priority: priorityOverride,
    onResize,
    onCollapse,
    onError,
    loading = false,
    error,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Локальное состояние для коллапса
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Вычисляем настройки виджета
    const settings = useDashboardWidgetSettings(
      config,
      mode,
      layout,
      density,
      {
        size: sizeOverride,
        priority: priorityOverride,
      }
    );

    // Обработка коллапса
    const handleToggleCollapse = useCallback(() => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    }, [isCollapsed, onCollapse]);

    // Отслеживание изменения размеров
    useEffect(() => {
      if (!containerRef.current || !onResize) return;

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          onResize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, [onResize]);

    // Обработка ошибок
    useEffect(() => {
      if (error && onError) {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        onError(errorObj);
      }
    }, [error, onError]);

    // Если виджет скрыт в текущем режиме
    if (!settings.visible) {
      return null;
    }

    // Стили контейнера
    const containerStyles = {
      width: settings.dimensions.width,
      height: isCollapsed ? 'auto' : settings.dimensions.height,
      minWidth: settings.dimensions.minWidth,
      minHeight: settings.dimensions.minHeight,
      maxWidth: settings.dimensions.maxWidth,
      maxHeight: isCollapsed ? undefined : settings.dimensions.maxHeight,
      margin: settings.spacing.margin,
      opacity: settings.opacity,
      transform: settings.transform,
      transition: settings.transition,
      zIndex: settings.zIndex,
      position: 'relative' as const,
      ...style,
    };

    // Стили Paper компонента
    const paperStyles = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      background: config.background || theme.palette.background.paper,
      borderRadius: config.borderRadius || theme.shape.borderRadius,
      border: config.border ? `1px solid ${alpha(theme.palette.divider, 0.12)}` : 'none',
      boxShadow: config.shadow 
        ? `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}, 0 1px 4px ${alpha(theme.palette.common.black, 0.04)}`
        : 'none',
      transition: theme.transitions.create(['box-shadow', 'transform'], {
        duration: theme.transitions.duration.short,
      }),
      '&:hover': config.shadow ? {
        boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.12)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        transform: isMobile ? 'none' : 'translateY(-1px)',
      } : {},
    };

    // Рендер содержимого
    const renderContent = () => {
      if (loading) {
        return (
          <Box sx={{ padding: settings.spacing.padding }}>
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="text" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        );
      }

      if (error) {
        return (
          <Box sx={{ padding: settings.spacing.padding }}>
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
              sx={{ 
                borderRadius: 1,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem',
                },
              }}
            >
              {typeof error === 'string' ? error : 'Произошла ошибка при загрузке виджета'}
            </Alert>
          </Box>
        );
      }

      return (
        <Collapse in={!isCollapsed} timeout="auto">
          <Box 
            sx={{ 
              padding: settings.spacing.padding,
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: 6,
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                },
              },
            }}
          >
            {children}
          </Box>
        </Collapse>
      );
    };

    return (
      <Box
        ref={containerRef}
        className={className}
        sx={containerStyles}
        role="region"
        aria-label={ariaLabel || config.title || `Виджет ${config.id}`}
        aria-describedby={ariaDescribedBy}
      >
        <Paper elevation={0} sx={paperStyles}>
          {/* Заголовок виджета с кнопкой коллапса */}
          {(config.title || config.collapsible) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${theme.spacing(1)} ${settings.spacing.padding}`,
                borderBottom: !isCollapsed ? `1px solid ${alpha(theme.palette.divider, 0.08)}` : 'none',
                minHeight: 48,
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              {config.title && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {config.icon && (
                    <config.icon 
                      sx={{ 
                        fontSize: 20, 
                        color: theme.palette.primary.main,
                        opacity: 0.8,
                      }} 
                    />
                  )}
                  <Box
                    component="h3"
                    sx={{
                      margin: 0,
                      fontSize: density === 'dense' ? '0.875rem' : '1rem',
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      lineHeight: 1.2,
                    }}
                  >
                    {config.title}
                  </Box>
                </Box>
              )}
              
              {config.collapsible && (
                <Tooltip title={isCollapsed ? 'Развернуть' : 'Свернуть'}>
                  <IconButton
                    onClick={handleToggleCollapse}
                    size="small"
                    sx={{
                      padding: 0.5,
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      },
                    }}
                    aria-label={isCollapsed ? 'Развернуть виджет' : 'Свернуть виджет'}
                  >
                    {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          {/* Основное содержимое */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {renderContent()}
          </Box>
        </Paper>
      </Box>
    );
  }
);

DashboardWidgetWrapper.displayName = 'DashboardWidgetWrapper'; 