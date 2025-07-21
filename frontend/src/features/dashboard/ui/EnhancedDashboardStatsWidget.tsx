import React, { memo, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  IconButton,
  Stack,
  Skeleton,
  LinearProgress,
  useMediaQuery,
} from "@mui/material";
import {
  Refresh,
  Assessment,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import {
  DashboardWidgetWrapper,
  type WidgetConfig,
  type DashboardMode,
  type DashboardLayout,
  type DashboardDensity,
} from "@/shared/ui";
import { useDashboardStats } from "../model/queries";
import { useCardSizing, useDashboardSizing } from "@/shared/hooks";

interface MetricCardData {
  id: string;
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label: string;
  };
  progress?: number;
  formatValue?: (value: number | string) => string;
  metadata?: {
    target?: number;
    unit?: string;
    description?: string;
  };
}

interface EnhancedDashboardStatsWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  
  // Feature-specific props
  variant?: "minimal" | "compact" | "detailed";
  showTrends?: boolean;
  onMetricClick?: (metricId: string) => void;
  masonry?: boolean;
  flexible?: boolean;
  maxHeight?: number;
  overflow?: string;
  
  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}

// Конфигурация виджета для разных режимов дашборда
const enhancedStatsWidgetConfig: WidgetConfig = {
  id: 'enhanced-stats-widget',
  title: 'Расширенная статистика',
  description: 'Детальные метрики и KPI с трендами',
  icon: Assessment,
  
  // Настройки по умолчанию
  defaultSize: 'xlarge',
  defaultPriority: 'critical',
  defaultAspectRatio: 'wide',
  
  // Режимы дашборда
  modes: {
    minimal: {
      size: 'large',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '16px' },
    },
    compact: {
      size: 'xlarge',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '20px' },
    },
    detailed: {
      size: 'xlarge',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '24px' },
    },
    fullscreen: {
      size: 'xlarge',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '32px' },
    },
  },
  
  // Лейауты
  layouts: {
    grid: {
      aspectRatio: 'wide',
      minHeight: '300px',
      maxHeight: '500px',
    },
    list: {
      size: 'xlarge',
      aspectRatio: 'wide',
      minHeight: '200px',
      maxHeight: '400px',
    },
    masonry: {
      size: 'auto',
      aspectRatio: 'auto',
      minHeight: '280px',
    },
  },
  
  // Стили
  border: true,
  shadow: true,
  borderRadius: 12,
  
  // Поведение
  collapsible: true,
  resizable: false,
  draggable: false,
  
  // Производительность
  lazy: false,
  virtualizeContent: false,
};

export const EnhancedDashboardStatsWidget =
  memo<EnhancedDashboardStatsWidgetProps>(
    ({
      mode,
      layout,
      density,
      variant = "detailed",
      showTrends = true,
      onMetricClick,
      masonry = false,
      flexible = false,
      maxHeight,
      overflow = "visible",
      className,
      loading: externalLoading = false,
      error: externalError,
      onResize,
      onCollapse,
    }) => {
      const { t } = useTranslation();
      const theme = useTheme();

      // New adaptive sizing system
      const sizing = useDashboardSizing({
        mode,
        density,
        layout,
        masonry,
        flexible,
      });

      const cardSizing = useCardSizing(mode, density, masonry);

      // Responsive breakpoints
      const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
      const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

      // Fetch stats data
      const {
        data: stats,
        isLoading,
        error,
        refetch,
        isFetching,
      } = useDashboardStats();

      const isCompact = variant === "minimal" || mode === "minimal";

      // Generate metrics based on stats data
      const keyMetrics = useMemo((): MetricCardData[] => {
        if (!stats) return [];

        return [
          {
            id: "total-projects",
            title: t("dashboard.metrics.totalProjects", "Total Projects"),
            value: stats.totalProjects || 0,
            icon: <Assessment />,
            color: theme.palette.primary.main,
            trend: stats.trends?.totalProjects && {
              value: stats.trends.totalProjects.percentage || 0,
              direction:
                stats.trends.totalProjects.direction === "stable"
                  ? "neutral"
                  : stats.trends.totalProjects.direction,
              label: "vs last month",
            },
            progress: stats.totalProjects
              ? (stats.activeProjects || 0) / stats.totalProjects
              : 0,
            metadata: {
              target: undefined,
              unit: "projects",
              description: "Active projects in the system",
            },
          },
          {
            id: "active-requirements",
            title: t(
              "dashboard.metrics.activeRequirements",
              "Active Requirements"
            ),
            value: stats.activeRequirements || 0,
            icon: <TrendingUp />,
            color: theme.palette.success.main,
            trend: stats.trends?.activeRequirements && {
              value: stats.trends.activeRequirements.percentage || 0,
              direction:
                stats.trends.activeRequirements.direction === "stable"
                  ? "neutral"
                  : stats.trends.activeRequirements.direction,
              label: "vs last month",
            },
            progress: stats.totalRequirements
              ? (stats.activeRequirements || 0) / stats.totalRequirements
              : 0,
            metadata: {
              target: undefined,
              unit: "requirements",
              description: "Requirements being tracked",
            },
          },
          {
            id: "completion-rate",
            title: t("dashboard.metrics.completionRate", "Completion Rate"),
            value: `${Math.round(stats.completionRate || 0)}%`,
            icon: <TrendingUp />,
            color: theme.palette.info.main,
            trend: stats.trends?.completionRate && {
              value: stats.trends.completionRate.percentage || 0,
              direction:
                stats.trends.completionRate.direction === "stable"
                  ? "neutral"
                  : stats.trends.completionRate.direction,
              label: "vs last month",
            },
            progress: (stats.completionRate || 0) / 100,
            metadata: {
              target: 100,
              unit: "%",
              description: "Overall project completion rate",
            },
          },
          {
            id: "team-velocity",
            title: t("dashboard.metrics.teamVelocity", "Team Velocity"),
            value: Math.round(stats.teamVelocity || 0),
            icon: <Assessment />,
            color: theme.palette.warning.main,
            trend: stats.trends?.teamVelocity && {
              value: stats.trends.teamVelocity.percentage || 0,
              direction:
                stats.trends.teamVelocity.direction === "stable"
                  ? "neutral"
                  : stats.trends.teamVelocity.direction,
              label: "vs last month",
            },
            progress: Math.min((stats.teamVelocity || 0) / 100, 1),
            metadata: {
              target: 85,
              unit: "points",
              description: "Team productivity metrics",
            },
          },
          {
            id: "completed-tasks",
            title: t("dashboard.metrics.completedTasks", "Completed Tasks"),
            value: stats.completedTasks || 0,
            icon: <TrendingDown />,
            color: theme.palette.error.main,
            trend: stats.trends?.completedTasks && {
              value: stats.trends.completedTasks.percentage || 0,
              direction:
                stats.trends.completedTasks.direction === "stable"
                  ? "neutral"
                  : stats.trends.completedTasks.direction,
              label: "vs last month",
            },
            metadata: {
              target: undefined,
              unit: "tasks",
              description: "Tasks completed successfully",
            },
          },
          {
            id: "team-members",
            title: t("dashboard.metrics.teamMembers", "Team Members"),
            value: stats.teamMembers || 0,
            icon: <TrendingUp />,
            color: theme.palette.secondary.main,
            trend: stats.trends?.teamMembers && {
              value: stats.trends.teamMembers.percentage || 0,
              direction:
                stats.trends.teamMembers.direction === "stable"
                  ? "neutral"
                  : stats.trends.teamMembers.direction,
              label: "vs last month",
            },
            metadata: {
              target: undefined,
              unit: "members",
              description: "Active team members",
            },
          },
        ];
      }, [stats, theme, t]);

      // Handle refresh
      const handleRefresh = useCallback(() => {
        refetch();
      }, [refetch]);

      // Responsive grid configuration using new sizing system
      const getGridConfig = () => {
        if (layout === "list") {
          return { xs: 12 }; // Full width for list
        }

        // Use sizing system for responsive grid
        const { columns } = sizing.gridConfig;

        if (isMobile) {
          return { xs: 12, sm: 6 };
        }

        if (isTablet) {
          return { xs: 12, sm: 6, md: 4 };
        }

        // Desktop and beyond - use calculated columns
        if (columns >= 6) {
          return { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };
        } else if (columns >= 4) {
          return { xs: 12, sm: 6, md: 4, lg: 3 };
        } else if (columns >= 3) {
          return { xs: 12, sm: 6, md: 4 };
        } else {
          return { xs: 12, sm: 6 };
        }
      };

      const gridConfig = getGridConfig();

      // MetricCard component with new sizing
      const MetricCard: React.FC<{ metric: MetricCardData }> = ({ metric }) => {
        const handleClick = () => {
          onMetricClick?.(metric.id);
        };

        return (
          <Card
            onClick={handleClick}
            sx={{
              height: "100%",
              minHeight: cardSizing.minHeight,
              maxHeight: maxHeight,
              overflow: overflow,
              borderRadius: cardSizing.borderRadius,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: cardSizing.elevation,
              background: theme.palette.background.paper,
              cursor: onMetricClick ? "pointer" : "default",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.common.black,
                  0.12
                )}`,
                borderColor: alpha(metric.color, 0.2),
              },
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: cardSizing.padding.xs,
                  sm: cardSizing.padding.sm,
                  md: cardSizing.padding.md,
                },
                "&:last-child": { pb: cardSizing.padding.sm },
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack spacing={2} sx={{ height: "100%" }}>
                {/* Header */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box
                    sx={{
                      width: cardSizing.iconSize + 16,
                      height: cardSizing.iconSize + 16,
                      borderRadius: cardSizing.borderRadius,
                      background: `linear-gradient(135deg, ${alpha(
                        metric.color,
                        0.1
                      )}, ${alpha(metric.color, 0.05)})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${alpha(metric.color, 0.1)}`,
                    }}
                  >
                    {React.cloneElement(metric.icon, {
                      sx: {
                        color: metric.color,
                        fontSize: cardSizing.iconSize,
                      },
                    })}
                  </Box>

                  {/* Trend indicator */}
                  {showTrends && metric.trend && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: alpha(
                          metric.trend.direction === "up"
                            ? theme.palette.success.main
                            : metric.trend.direction === "down"
                            ? theme.palette.error.main
                            : theme.palette.grey[500],
                          0.1
                        ),
                      }}
                    >
                      {metric.trend.direction === "up" ? (
                        <TrendingUp sx={{ fontSize: 14 }} />
                      ) : metric.trend.direction === "down" ? (
                        <TrendingDown sx={{ fontSize: 14 }} />
                      ) : null}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: sizing.typography.caption,
                          fontWeight: 600,
                          color:
                            metric.trend.direction === "up"
                              ? theme.palette.success.main
                              : metric.trend.direction === "down"
                              ? theme.palette.error.main
                              : theme.palette.grey[600],
                        }}
                      >
                        {metric.trend.value > 0 ? "+" : ""}
                        {metric.trend.value}%
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Title */}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: sizing.typography.body,
                    fontWeight: 500,
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
                  variant="h4"
                  sx={{
                    fontSize: sizing.typography.title,
                    fontWeight: 700,
                    color: metric.color,
                    lineHeight: 1.2,
                  }}
                >
                  {metric.value}
                </Typography>

                {/* Progress bar */}
                {metric.progress !== undefined && (
                  <Box sx={{ mt: "auto" }}>
                    <LinearProgress
                      variant="determinate"
                      value={metric.progress * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(metric.color, 0.1),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: metric.color,
                          borderRadius: 3,
                        },
                      }}
                    />
                    {metric.metadata?.target && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: sizing.typography.caption,
                          color: theme.palette.text.secondary,
                          mt: 0.5,
                          display: "block",
                        }}
                      >
                        Target: {metric.metadata.target} {metric.metadata.unit}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Trend label */}
                {showTrends && metric.trend && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: sizing.typography.caption,
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
      };

      if (isLoading) {
        return (
          <Box className={className} sx={{ width: "100%" }}>
            <Box
              sx={{
                p: sizing.padding,
                borderRadius: sizing.borderRadius.medium,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                backgroundColor: theme.palette.background.paper,
                width: "100%",
              }}
            >
              <Stack spacing={3}>
                {/* Header */}
                <Skeleton variant="text" width="40%" height={40} />

                {/* Grid */}
                <Grid container spacing={sizing.spacing}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Grid item {...gridConfig} key={index}>
                      <Skeleton
                        variant="rectangular"
                        height={cardSizing.minHeight}
                        sx={{ borderRadius: cardSizing.borderRadius }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Box>
          </Box>
        );
      }

      return (
        <DashboardWidgetWrapper
          config={enhancedStatsWidgetConfig}
          mode={mode}
          layout={layout}
          density={density}
          className={className}
          loading={externalLoading || isLoading}
          error={externalError}
          onResize={onResize}
          onCollapse={onCollapse}
          aria-label="Виджет расширенной статистики"
        >
          <Stack spacing={sizing.spacing}>
            {/* Header Section */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: sizing.headerHeight - 20,
                      height: sizing.headerHeight - 20,
                      borderRadius: sizing.borderRadius.small,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Assessment sx={{ color: "white", fontSize: 18 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      fontSize: sizing.typography.title,
                    }}
                  >
                    {t("dashboard.metrics.title", "Key Metrics")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: sizing.typography.body,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t(
                    "dashboard.metrics.subtitle",
                    "Real-time project statistics"
                  )}
                </Typography>
              </Stack>

              {/* Refresh Button */}
              <IconButton
                onClick={handleRefresh}
                disabled={isFetching}
                sx={{
                  borderRadius: sizing.borderRadius.small,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Refresh
                  sx={{
                    ...(isFetching && {
                      animation: "spin 1s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }),
                  }}
                />
              </IconButton>
            </Box>

            {/* Key Metrics Grid */}
            <Box>
              <Grid
                container
                spacing={{
                  xs: sizing.spacing.xs,
                  sm: sizing.spacing.sm,
                  md: sizing.spacing.md,
                }}
              >
                {keyMetrics.map((metric) => (
                  <Grid item {...gridConfig} key={metric.id}>
                    <MetricCard metric={metric} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </DashboardWidgetWrapper>
      );
    }
  );

EnhancedDashboardStatsWidget.displayName = "EnhancedDashboardStatsWidget";
