<<<<<<< HEAD
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  useTheme, 
  alpha,
  Chip,
  Fade,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  BugReport,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { LiquidGlassIcon } from '@/shared/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon,
  color,
  delay = 0 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return theme.palette.success.main;
      case 'down': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Schedule;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Fade in timeout={1000 + delay}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 5, // More rounded for Apple design
          position: 'relative',
          overflow: 'hidden',
          // Authentic Liquid Glass background
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.12)} 50%,
              ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 100%
            ),
            linear-gradient(225deg, 
              ${alpha(color, 0.08)} 0%, 
              transparent 60%
            ),
            ${alpha(theme.palette.background.paper, isDark ? 0.5 : 0.85)}
          `,
          // Advanced backdrop filter
          backdropFilter: 'blur(40px) saturate(150%) contrast(120%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%) contrast(120%)',
          // Multi-layer border
          border: `1px solid ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)}`,
          // Enhanced shadow system
          boxShadow: `
            inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.3)},
            inset 0 -1px 0 ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)},
            0 4px 24px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)},
            0 1px 6px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.04)},
            0 0 0 1px ${alpha(color, 0.08)}
          `,
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          
          '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            backdropFilter: 'blur(50px) saturate(180%) contrast(130%)',
            WebkitBackdropFilter: 'blur(50px) saturate(180%) contrast(130%)',
            // Enhanced hover state
            background: `
              linear-gradient(135deg, 
                ${alpha(theme.palette.common.white, isDark ? 0.18 : 0.35)} 0%, 
                ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 50%,
                ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 100%
              ),
              linear-gradient(225deg, 
                ${alpha(color, 0.12)} 0%, 
                transparent 60%
              ),
              ${alpha(theme.palette.background.paper, isDark ? 0.6 : 0.9)}
            `,
            border: `1px solid ${alpha(color, 0.2)}`,
            boxShadow: `
              inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.2 : 0.4)},
              inset 0 -1px 0 ${alpha(theme.palette.common.black, isDark ? 0.25 : 0.08)},
              0 8px 32px ${alpha(color, 0.2)},
              0 2px 12px ${alpha(theme.palette.common.black, isDark ? 0.4 : 0.1)},
              0 0 0 1px ${alpha(color, 0.15)},
              0 0 20px ${alpha(color, 0.1)}
            `,
          },

          // Top light refraction
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: `
              linear-gradient(180deg, 
                ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)} 0%, 
                ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.1)} 40%,
                transparent 100%
              )
            `,
            borderRadius: '20px 20px 0 0',
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
          },

          // Dynamic specular highlights
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: `
              conic-gradient(from 45deg at 25% 25%, 
                ${alpha(color, 0.2)} 0deg,
                transparent 90deg,
                transparent 180deg,
                ${alpha(color, 0.15)} 270deg,
                transparent 360deg
              )
            `,
            borderRadius: 22,
            opacity: 0,
            transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
            zIndex: -1,
            filter: 'blur(1px)',
          },

          '&:hover::after': {
            opacity: 1,
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <LiquidGlassIcon
              icon={Icon}
              color={color}
              size={64}
              variant="secondary"
            />
            <Chip
              icon={<TrendIcon sx={{ fontSize: '1rem !important' }} />}
              label={change}
              size="small"
              sx={{
                // Liquid Glass chip
                background: `
                  linear-gradient(135deg, 
                    ${alpha(getTrendColor(), isDark ? 0.15 : 0.2)} 0%, 
                    ${alpha(getTrendColor(), isDark ? 0.08 : 0.12)} 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: getTrendColor(),
                border: `1px solid ${alpha(getTrendColor(), 0.2)}`,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                borderRadius: 3,
                boxShadow: `
                  inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)},
                  0 2px 8px ${alpha(getTrendColor(), 0.15)}
                `,
                '& .MuiChip-icon': {
                  filter: `drop-shadow(0 1px 2px ${alpha(theme.palette.common.black, 0.2)})`,
                },
              }}
            />
          </Box>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              mb: 0.5,
              // Text with subtle glow
              color: theme.palette.text.primary,
              textShadow: `0 1px 2px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.1)}`,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: alpha(theme.palette.text.secondary, 0.8),
              fontWeight: 500,
              textShadow: `0 1px 1px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)}`,
            }}
          >
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

export const DashboardStatsWidget: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Всего требований',
      value: 157,
      change: '+12%',
      trend: 'up' as const,
      icon: Assignment,
      color: theme.palette.primary.main,
    },
    {
      title: 'Активные проекты',
      value: 23,
      change: '+5%',
      trend: 'up' as const,
      icon: CheckCircle,
      color: theme.palette.success.main,
    },
    {
      title: 'Открытые дефекты',
      value: 8,
      change: '-3%',
      trend: 'down' as const,
      icon: BugReport,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <StatCard {...stat} delay={index * 150} />
          </Grid>
        ))}
      </Grid>
    </Box>
=======
/**
 * FSD Dashboard Stats Widget
 * Прогресс: [✅] Создан унифицированный виджет статистики
 * TODO: [ ] Добавить поддержку Context7
 * TODO: [ ] Интегрировать с API_ENDPOINTS
 * TODO: [ ] Добавить тесты
 */

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useState,
  useEffect 
} from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Grid,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
  alpha,
  useTheme,
  Stack,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";

// Shared imports
import { ErrorBoundary } from "@/shared/ui";
import { useDashboardSizing, useCardSizing } from "@/shared/hooks";

// Widget types
import type {
  DashboardStatsWidgetProps,
  DashboardMetric,
  TrendDirection,
  MetricType,
  DisplayConfig,
} from "../model/types";

/**
 * Получить цвет для тренда
 */
const getTrendColor = (
  direction: TrendDirection,
  theme: any
): string => {
  const colorMap: Record<TrendDirection, string> = {
    up: theme.palette.success.main,
    down: theme.palette.error.main,
    neutral: theme.palette.info.main,
  };
  return colorMap[direction];
};

/**
 * Получить иконку для тренда
 */
const getTrendIcon = (direction: TrendDirection): React.ReactElement => {
  const iconMap: Record<TrendDirection, React.ReactElement> = {
    up: <TrendingUpIcon />,
    down: <TrendingDownIcon />,
    neutral: <TrendingFlatIcon />,
  };
  return iconMap[direction];
};

/**
 * Получить иконку для типа статистики
 */
const getStatIcon = (type: MetricType): React.ReactElement => {
  const iconMap: Record<MetricType, React.ReactElement> = {
    count: <AssessmentIcon />,
    percentage: <AssessmentIcon />,
    currency: <AssessmentIcon />,
    time: <AssessmentIcon />,
    rating: <StarIcon />,
    progress: <AssessmentIcon />,
    trend: <TrendingUpIcon />,
    custom: <AssessmentIcon />,
  };
  return iconMap[type];
};

/**
 * Форматировать число для отображения
 */
const formatNumber = (
  value: number | string,
  format: "standard" | "compact" | "scientific" = "standard"
): string => {
  if (typeof value === "string") return value;
  
  switch (format) {
    case "compact":
      return new Intl.NumberFormat("ru-RU", {
        notation: "compact",
        compactDisplay: "short",
      }).format(value);
    case "scientific":
      return value.toExponential(2);
    default:
      return new Intl.NumberFormat("ru-RU").format(value);
  }
};

/**
 * Компонент карточки метрики
 */
const MetricCard: React.FC<{
  metric: DashboardMetric;
  isCompact: boolean;
  showTrends: boolean;
  isFavorite: boolean;
  numberFormat: "standard" | "compact" | "scientific";
  onMetricClick?: (metricId: string, metric: DashboardMetric) => void;
  onToggleFavorite?: (metricId: string) => void;
}> = memo(({
  metric,
  isCompact,
  showTrends,
  isFavorite,
  numberFormat,
  onMetricClick,
  onToggleFavorite,
}) => {
  const theme = useTheme();
  const cardSizing = useCardSizing(isCompact ? "minimal" : "detailed", "comfortable", false);

  const handleClick = useCallback(() => {
    onMetricClick?.(metric.id, metric);
  }, [metric, onMetricClick]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(metric.id);
  }, [metric.id, onToggleFavorite]);

  const color = metric.metadata?.color || theme.palette.primary.main;
  const formattedValue = metric.formatValue 
    ? metric.formatValue(metric.value)
    : formatNumber(metric.value, numberFormat);

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: "100%",
        minHeight: cardSizing.minHeight,
        cursor: onMetricClick ? "pointer" : "default",
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: onMetricClick ? "translateY(-2px)" : "none",
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          borderColor: alpha(color, 0.2),
        },
      }}
    >
      <CardContent sx={{ p: isCompact ? 2 : 3, height: "100%" }}>
        <Stack spacing={isCompact ? 1.5 : 2} sx={{ height: "100%" }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                width: isCompact ? 32 : 40,
                height: isCompact ? 32 : 40,
              }}
            >
              {metric.icon || getStatIcon(metric.type)}
            </Avatar>

            <Box display="flex" alignItems="center" gap={0.5}>
              {/* Trend indicator */}
              {showTrends && metric.trend && (
                <Chip
                  icon={getTrendIcon(metric.trend.direction)}
                  label={`${metric.trend.value > 0 ? "+" : ""}${metric.trend.value}%`}
                  size="small"
                  sx={{
                    height: 24,
                    backgroundColor: alpha(getTrendColor(metric.trend.direction, theme), 0.1),
                    color: getTrendColor(metric.trend.direction, theme),
                    "& .MuiChip-icon": {
                      fontSize: 14,
                    },
                  }}
                />
              )}

              {/* Favorite toggle */}
              {onToggleFavorite && (
                <IconButton size="small" onClick={handleToggleFavorite}>
                  {isFavorite ? (
                    <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                  ) : (
                    <StarBorderIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant={isCompact ? "body2" : "h6"}
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {metric.title}
          </Typography>

          {/* Value */}
          <Typography
            variant={isCompact ? "h5" : "h4"}
            sx={{
              fontWeight: 700,
              color: color,
              lineHeight: 1.2,
            }}
          >
            {formattedValue}
            {metric.metadata?.unit && (
              <Typography
                component="span"
                variant="body2"
                sx={{ ml: 0.5, color: theme.palette.text.secondary }}
              >
                {metric.metadata.unit}
              </Typography>
            )}
          </Typography>

          {/* Description */}
          {!isCompact && metric.metadata?.description && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {metric.metadata.description}
            </Typography>
          )}

          {/* Progress bar */}
          {metric.progress !== undefined && (
            <Box sx={{ mt: "auto" }}>
              <LinearProgress
                variant="determinate"
                value={metric.progress * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(color, 0.1),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: color,
                    borderRadius: 3,
                  },
                }}
              />
              {metric.metadata?.target && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10,
                    color: theme.palette.text.secondary,
                    mt: 0.5,
                    display: "block",
                  }}
                >
                  Цель: {formatNumber(metric.metadata.target, numberFormat)} {metric.metadata.unit}
                </Typography>
              )}
            </Box>
          )}

          {/* Trend label */}
          {showTrends && metric.trend && !isCompact && (
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,
                color: theme.palette.text.secondary,
                mt: "auto",
              }}
            >
              {metric.trend.label}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = "MetricCard";

/**
 * Компонент скелетона для загрузки
 */
const MetricsSkeleton: React.FC<{
  count: number;
  columns: number;
  isCompact: boolean;
}> = memo(({ count, columns, isCompact }) => {
  const gridConfig = useMemo(() => {
    const base = 12 / columns;
    return {
      xs: Math.max(12, base * 2),
      sm: Math.max(6, base),
      md: Math.max(4, base),
      lg: base,
      xl: base,
    };
  }, [columns]);

  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item {...gridConfig} key={index}>
          <Skeleton
            variant="rectangular"
            height={isCompact ? 160 : 200}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  );
});

MetricsSkeleton.displayName = "MetricsSkeleton";

/**
 * Основной компонент виджета статистики дашборда
 */
export const DashboardStatsWidget = memo<DashboardStatsWidgetProps>(({
  mode = "detailed",
  layout = "grid",
  density = "comfortable",
  metrics = [],
  groups = [],
  favoriteMetrics = [],
  displayConfig: userDisplayConfig,
  filters,
  comparison,
  isDataLoading = false,
  dataError = null,
  onRefresh,
  onMetricClick,
  onToggleFavorite,
  onExport,
  onSettings,
  showSettings = true,
  showExport = true,
  customTitle,
  customIcon,
  className,
  sx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sizing = useDashboardSizing({ mode, density, layout });

  // Локальное состояние
  const [refreshing, setRefreshing] = useState(false);

  // Конфигурация отображения по умолчанию
  const defaultDisplayConfig = useMemo((): DisplayConfig => ({
    variant: mode === "minimal" ? "compact" : mode === "compact" ? "compact" : "detailed",
    showTrends: mode !== "minimal",
    showPercentageChange: mode !== "minimal",
    showProgress: mode === "detailed" || mode === "fullscreen",
    showDescriptions: mode === "detailed" || mode === "fullscreen",
    animations: true,
    columns: isMobile ? 2 : mode === "minimal" ? 2 : mode === "compact" ? 3 : 4,
    maxMetrics: mode === "minimal" ? 4 : mode === "compact" ? 6 : 12,
    groupByCategory: false,
    compact: mode === "minimal" || mode === "compact",
    autoRefresh: true,
    refreshInterval: 60,
    numberFormat: "compact",
    showFavoritesOnly: false,
  }), [mode, isMobile]);

  const displayConfig = useMemo(() => ({
    ...defaultDisplayConfig,
    ...userDisplayConfig,
  }), [defaultDisplayConfig, userDisplayConfig]);

  // Фильтрация и сортировка метрик
  const filteredMetrics = useMemo(() => {
    let filtered = [...metrics];

    if (displayConfig.showFavoritesOnly) {
      filtered = filtered.filter((m) => favoriteMetrics.includes(m.id));
    }

    if (filters?.categories?.length) {
      filtered = filtered.filter((m) =>
        filters.categories!.includes(m.metadata?.category || "")
      );
    }

    if (filters?.types?.length) {
      filtered = filtered.filter((m) => filters.types!.includes(m.type));
    }

    if (filters?.trends?.length && filtered.length > 0) {
      filtered = filtered.filter((m) => 
        m.trend && filters.trends!.includes(m.trend.direction)
      );
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(search) ||
        m.metadata?.description?.toLowerCase().includes(search)
      );
    }

    if (filters?.visibleOnly) {
      filtered = filtered.filter((m) => m.visible !== false);
    }

    // Сортировка по приоритету
    filtered.sort((a, b) => (a.metadata?.priority || 999) - (b.metadata?.priority || 999));

    return filtered.slice(0, displayConfig.maxMetrics);
  }, [metrics, displayConfig, filters, favoriteMetrics]);

  // Grid конфигурация
  const gridConfig = useMemo(() => {
    if (layout === "list") {
      return { xs: 12 };
    }

    const base = 12 / displayConfig.columns;
    return {
      xs: Math.max(12, base * 2),
      sm: Math.max(6, base),
      md: Math.max(4, base),
      lg: base,
      xl: base,
    };
  }, [layout, displayConfig.columns]);

  // Обработчик обновления
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  // Компактный режим
  const isCompact = displayConfig.compact;

  // Рендер ошибки
  if (dataError) {
    return (
      <Card className={className} sx={{ ...sx }}>
        <CardContent>
          <Typography color="error" align="center">
            Ошибка загрузки статистики: {dataError.message}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Рендер загрузки
  if (isDataLoading) {
    return (
      <Card className={className} sx={{ ...sx }}>
        <CardHeader
          title={<Skeleton variant="text" width="40%" />}
          action={<Skeleton variant="circular" width={40} height={40} />}
        />
        <CardContent>
          <MetricsSkeleton
            count={displayConfig.maxMetrics}
            columns={displayConfig.columns}
            isCompact={isCompact}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <Card
        className={className}
        sx={{
          height: layout === "list" ? "fit-content" : "auto",
          minHeight: isCompact ? 300 : 400,
          ...sx,
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: isCompact ? 32 : 40,
                height: isCompact ? 32 : 40,
              }}
            >
              {customIcon || <AssessmentIcon fontSize={isCompact ? "small" : "medium"} />}
            </Avatar>
          }
          title={
            <Typography variant={isCompact ? "subtitle2" : "h6"} fontWeight={600}>
              {customTitle || "Статистика"}
            </Typography>
          }
          subheader={
            !isCompact && (
              <Typography variant="body2" color="text.secondary">
                {filteredMetrics.length} метрик
              </Typography>
            )
          }
          action={
            <Stack direction="row" spacing={1}>
              {/* Export Button */}
              {showExport && onExport && (
                <Tooltip title="Экспорт">
                  <IconButton size="small" onClick={() => onExport("csv")}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* Settings Button */}
              {showSettings && onSettings && (
                <Tooltip title="Настройки">
                  <IconButton size="small" onClick={onSettings}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* Refresh Button */}
              {onRefresh && (
                <Tooltip title="Обновить">
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshIcon
                      sx={{
                        ...(refreshing && {
                          animation: "spin 1s linear infinite",
                          "@keyframes spin": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" },
                          },
                        }),
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          }
        />

        <CardContent sx={{ pt: 0 }}>
          {filteredMetrics.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <AssessmentIcon
                sx={{
                  fontSize: 48,
                  color: "text.disabled",
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary" align="center">
                {metrics.length === 0
                  ? "Нет данных статистики"
                  : "Нет совпадений с фильтрами"}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={isCompact ? 1.5 : 2}>
              {filteredMetrics.map((metric) => (
                <Grid item {...gridConfig} key={metric.id}>
                  <MetricCard
                    metric={metric}
                    isCompact={isCompact}
                    showTrends={displayConfig.showTrends}
                    isFavorite={favoriteMetrics.includes(metric.id)}
                    numberFormat={displayConfig.numberFormat}
                    onMetricClick={onMetricClick}
                    onToggleFavorite={onToggleFavorite}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
>>>>>>> 561cfbf79a41517e070303e2a3e30da6de4d02f6
  );
});

DashboardStatsWidget.displayName = "DashboardStatsWidget"; 