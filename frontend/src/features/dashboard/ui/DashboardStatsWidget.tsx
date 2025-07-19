import React, { memo, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button,
} from "@mui/material";
import {
  Refresh,
  Assessment,
  TrendingUp,
  Update,
  Speed,
  Group,
  Remove,
  TrendingDown,
  RocketLaunch,
  Assignment,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

import type {
  DashboardMetric,
  MetricCategory,
} from "@/entities/dashboard/model/types";
import {
  useDashboardStats,
  useRefreshDashboard,
  useExportDashboardData,
  dashboardQueryKeys,
} from "../model/queries";
import {
  useRenderTracker,
  usePerformanceMeasure,
} from "@/shared/hooks/usePerformanceOptimizations";

interface DashboardStatsWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  showFilters?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  category?: MetricCategory[];
  period?: "1h" | "24h" | "7d" | "30d" | "90d";
  onMetricClick?: (metric: DashboardMetric) => void;
  className?: string;
  showTrends?: boolean;
  layout?: "grid" | "list";
  customMetrics?: DashboardMetric[];
}

export const DashboardStatsWidget = memo<DashboardStatsWidgetProps>(
  ({
    variant = "detailed",
    showTrends = true,
    className,
    onMetricClick,
    layout = "grid",
    customMetrics = [],
  }) => {
    // Performance monitoring
    useRenderTracker("DashboardStatsWidget");
    usePerformanceMeasure("DashboardStatsWidget");

    // Hooks and services
    const theme = useTheme();
    const t = i18n.t;

    // Backup-style design constants (subtle, clean approach)
    const isCompact = variant === "compact";

    // Query
    const {
      data: stats,
      isLoading,
      error,
      isError,
      refetch,
      isFetching,
    } = useDashboardStats();

    // Memoized metrics configuration with backup-style colors
    const metrics = useMemo(() => {
      const baseMetrics = [
        {
          id: "totalProjects",
          title: t("dashboard.metrics.totalProjects", "Total Projects"),
          value: stats?.totalProjects || 0,
          icon: <RocketLaunch />,
          color: theme.palette.primary.main,
          trend: stats?.trends?.totalProjects,
          change: stats?.changes?.totalProjects,
          progress: 100,
        },
        {
          id: "activeProjects",
          title: t("dashboard.metrics.activeProjects", "Active Projects"),
          value: stats?.activeProjects || 0,
          icon: <Assignment />,
          color: theme.palette.info.main,
          trend: stats?.trends?.activeProjects,
          change: stats?.changes?.activeProjects,
          progress: stats?.totalProjects
            ? Math.round(
                ((stats?.activeProjects || 0) / stats.totalProjects) * 100
              )
            : 0,
        },
        {
          id: "totalRequirements",
          title: t("dashboard.metrics.totalRequirements", "Total Requirements"),
          value: stats?.totalRequirements || 0,
          icon: <Assessment />,
          color: theme.palette.secondary.main,
          trend: stats?.trends?.totalRequirements,
          change: stats?.changes?.totalRequirements,
          progress: 100,
        },
        {
          id: "completionRate",
          title: t("dashboard.metrics.completionRate", "Completion Rate"),
          value: Math.round(stats?.completionRate || 0),
          icon: <TrendingUp />,
          color: theme.palette.success.main,
          trend: stats?.trends?.completionRate,
          change: stats?.changes?.completionRate,
          progress: stats?.completionRate || 0,
          suffix: "%",
        },
        {
          id: "teamMembers",
          title: t("dashboard.metrics.teamMembers", "Team Members"),
          value: stats?.teamMembers || 0,
          icon: <Group />,
          color: theme.palette.warning.main,
          trend: stats?.trends?.teamMembers,
          change: stats?.changes?.teamMembers,
          progress: 100,
        },
        {
          id: "teamVelocity",
          title: t("dashboard.metrics.teamVelocity", "Team Velocity"),
          value: Math.round(stats?.teamVelocity || 0),
          icon: <Speed />,
          color: theme.palette.error.main,
          trend: stats?.trends?.teamVelocity,
          change: stats?.changes?.teamVelocity,
          progress: Math.min((stats?.teamVelocity || 0) * 10, 100),
        },
      ];

      return [...baseMetrics, ...customMetrics];
    }, [stats, theme.palette, customMetrics, t]);

    // Enhanced trend icon component with backup style
    const TrendIcon = ({ trend }: { trend: any }) => {
      if (!trend || trend.direction === "stable") {
        return <Remove sx={{ fontSize: 16, transform: "rotate(0deg)" }} />;
      }

      const Icon = trend.direction === "up" ? TrendingUp : TrendingDown;
      return (
        <Icon
          sx={{
            fontSize: 16,
            transform:
              trend.direction === "up" ? "rotate(0deg)" : "rotate(0deg)",
            color: trend.direction === "up" ? "success.main" : "error.main",
          }}
        />
      );
    };

    // Backup-style loading state
    if (isLoading) {
      return (
        <Box className={className} sx={{ width: "100%" }}>
          {/* Container with same styling as Quick Actions */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backgroundColor: theme.palette.background.paper,
              width: "100%",
            }}
          >
            <Stack spacing={3}>
              {/* Header skeleton */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Skeleton variant="rounded" width={32} height={32} />
                    <Skeleton variant="text" width={200} height={32} />
                  </Box>
                  <Skeleton variant="text" width={300} height={20} />
                </Stack>
                <Skeleton variant="rounded" width={40} height={40} />
              </Box>

              {/* Centered metrics grid skeleton */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Grid 
                  container 
                  spacing={3} 
                  alignItems="stretch"
                  justifyContent="center"
                  sx={{
                    maxWidth: "100%",
                    width: "100%",
                  }}
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4} 
                      lg={3} 
                      xl={2} 
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ width: "100%", maxWidth: 280 }}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            height: "100%",
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Skeleton variant="rounded" width={48} height={48} />
                                <Skeleton variant="rounded" width={60} height={24} />
                              </Box>
                              <Stack spacing={0.5} alignItems="flex-start">
                                <Skeleton variant="text" width="80%" height={40} />
                                <Skeleton variant="text" width="60%" height={20} />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Stack>
          </Box>
        </Box>
      );
    }

    // Error state with consistent styling
    if (isError) {
      return (
        <Box className={className} sx={{ width: "100%" }}>
          {/* Container with same styling as Quick Actions */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backgroundColor: theme.palette.background.paper,
              width: "100%",
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Assessment
                sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3 }}
              />
              <Typography color="error" variant="body2" textAlign="center">
                {t("errors.loadingError")}:{" "}
                {error?.message || "Unknown error"}
              </Typography>
              <Button
                onClick={() => refetch()}
                size="small"
                variant="outlined"
                sx={{ textTransform: "none" }}
                disabled={isFetching}
              >
                {t("common.retry", "Try Again")}
              </Button>
            </Stack>
          </Box>
        </Box>
      );
    }

    // Backup-style metric card component
    const MetricCard = ({ metric }: { metric: any }) => (
      <Card
        onClick={() => onMetricClick?.(metric)}
        sx={{
          cursor: onMetricClick ? "pointer" : "default",
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: theme.palette.background.paper,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": onMetricClick
            ? {
                transform: "translateY(-2px)",
                boxShadow: `0 8px 40px ${alpha(
                  theme.palette.common.black,
                  0.12
                )}`,
                borderColor: alpha(metric.color, 0.2),
              }
            : {},
        }}
      >
        <CardContent
          sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
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
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
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
                  sx: { color: metric.color, fontSize: 24 },
                })}
              </Box>

              {metric.trend && showTrends && (
                <Chip
                  icon={<TrendIcon trend={metric.trend} />}
                  label={`${
                    metric.trend.direction === "up"
                      ? "+"
                      : metric.trend.direction === "down"
                      ? "-"
                      : ""
                  }${Math.abs(metric.trend.value || 0)}%`}
                  size="small"
                  color={
                    metric.trend.direction === "up"
                      ? "success"
                      : metric.trend.direction === "down"
                      ? "error"
                      : "default"
                  }
                  variant="outlined"
                  sx={{
                    fontSize: "0.75rem",
                    height: 24,
                    "& .MuiChip-icon": { fontSize: 14 },
                    "& .MuiChip-label": { px: 1 },
                    borderRadius: 1.5,
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Stack spacing={0.5}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: isCompact ? "1.5rem" : "2rem",
                  lineHeight: 1.2,
                }}
              >
                {metric.value.toLocaleString()}
                {metric.suffix || ""}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  letterSpacing: "0.02em",
                }}
              >
                {metric.title}
              </Typography>
            </Stack>

            {/* Progress bar */}
            {metric.progress !== undefined && (
              <LinearProgress
                variant="determinate"
                value={metric.progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.divider, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${
                      metric.color
                    }, ${alpha(metric.color, 0.7)})`,
                  },
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    );

    return (
      <Box className={className} sx={{ width: "100%" }}>
        {/* Container with same styling as Quick Actions */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundColor: theme.palette.background.paper,
            width: "100%",
          }}
        >
          <Stack spacing={3}>
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
                      width: 32,
                      height: 32,
                      borderRadius: 2,
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
                      fontSize: isCompact ? "1.25rem" : "1.5rem",
                    }}
                  >
                    {t("dashboard.metrics.title", "Key Metrics")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.875rem",
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t(
                    "dashboard.metrics.subtitle",
                    "Real-time project statistics"
                  )}
                </Typography>
              </Stack>

              <IconButton
                onClick={() => refetch()}
                disabled={isFetching}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  ...(isFetching && {
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }),
                }}
              >
                <Refresh />
              </IconButton>
            </Box>

            {/* Centered metrics grid with full container width */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Grid
                container
                spacing={3}
                alignItems="stretch"
                justifyContent="center"
                sx={{
                  maxWidth: "100%",
                  width: "100%",
                }}
              >
                {metrics.map((metric) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    xl={2}
                    key={metric.id}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ width: "100%", maxWidth: 280 }}>
                      <MetricCard metric={metric} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }
);

DashboardStatsWidget.displayName = "DashboardStatsWidget";
