import React, { memo, useMemo } from "react";
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
  CardHeader,
  Button,
} from "@mui/material";
import {
  Refresh,
  Assessment,
  TrendingUp,
  Group,
  Speed,
  RocketLaunch,
  Assignment,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

import { MetricCard, LineChart, BarChart } from "@/entities/charts";
import type {
  ChartMetric,
  TimeSeriesDataPoint,
  ChartDataPoint,
  ProjectMetrics,
  TeamMetrics,
} from "@/entities/charts";
import {
  useDashboardStats,
  useRefreshDashboard,
  dashboardQueryKeys,
} from "../model/queries";
import {
  useRenderTracker,
  usePerformanceMeasure,
} from "@/shared/hooks/usePerformanceOptimizations";

interface EnhancedDashboardStatsWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  showCharts?: boolean;
  showTrends?: boolean;
  className?: string;
  onMetricClick?: (metric: ChartMetric) => void;
  layout?: "grid" | "list";
}

export const EnhancedDashboardStatsWidget =
  memo<EnhancedDashboardStatsWidgetProps>(
    ({
      variant = "detailed",
      showCharts = true,
      showTrends = true,
      className,
      onMetricClick,
      layout = "grid",
    }) => {
      // Performance monitoring
      useRenderTracker("EnhancedDashboardStatsWidget");
      usePerformanceMeasure("EnhancedDashboardStatsWidget");

      // Hooks and services
      const theme = useTheme();
      const t = i18n.t;
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

      // Transform data to chart format
      const { keyMetrics, chartData } = useMemo(() => {
        if (!stats) {
          return {
            keyMetrics: [],
            chartData: { timeline: [], distribution: [] },
          };
        }

        const metrics: ChartMetric[] = [
          {
            id: "totalProjects",
            title: t("dashboard.metrics.totalProjects", "Total Projects"),
            value: stats.totalProjects || 0,
            icon: <RocketLaunch />,
            color: theme.palette.primary.main,
            format: "number",
            trend: stats.trends?.totalProjects
              ? {
                  direction: stats.trends.totalProjects.direction,
                  value: stats.trends.totalProjects.current,
                  percentage: stats.trends.totalProjects.percentage,
                  label: "vs last month",
                }
              : undefined,
          },
          {
            id: "activeProjects",
            title: t("dashboard.metrics.activeProjects", "Active Projects"),
            value: stats.activeProjects || 0,
            icon: <Assignment />,
            color: theme.palette.info.main,
            format: "number",
            trend: stats.trends?.activeProjects
              ? {
                  direction: stats.trends.activeProjects.direction,
                  value: stats.trends.activeProjects.current,
                  percentage: stats.trends.activeProjects.percentage,
                  label: "vs last month",
                }
              : undefined,
          },
          {
            id: "completionRate",
            title: t("dashboard.metrics.completionRate", "Completion Rate"),
            value: Math.round(stats.completionRate || 0),
            icon: <TrendingUp />,
            color: theme.palette.success.main,
            format: "percentage",
            target: 100,
            trend: stats.trends?.completionRate
              ? {
                  direction: stats.trends.completionRate.direction,
                  value: stats.trends.completionRate.current,
                  percentage: stats.trends.completionRate.percentage,
                  label: "vs target",
                }
              : undefined,
          },
          {
            id: "teamMembers",
            title: t("dashboard.metrics.teamMembers", "Team Members"),
            value: stats.teamMembers || 0,
            icon: <Group />,
            color: theme.palette.warning.main,
            format: "number",
            trend: stats.trends?.teamMembers
              ? {
                  direction: stats.trends.teamMembers.direction,
                  value: stats.trends.teamMembers.current,
                  percentage: stats.trends.teamMembers.percentage,
                  label: "vs last month",
                }
              : undefined,
          },
          {
            id: "teamVelocity",
            title: t("dashboard.metrics.teamVelocity", "Team Velocity"),
            value: Math.round(stats.teamVelocity || 0),
            icon: <Speed />,
            color: theme.palette.error.main,
            format: "number",
            unit: "pts/sprint",
            trend: stats.trends?.teamVelocity
              ? {
                  direction: stats.trends.teamVelocity.direction,
                  value: stats.trends.teamVelocity.current,
                  percentage: stats.trends.teamVelocity.percentage,
                  label: "vs avg velocity",
                }
              : undefined,
          },
        ];

        // Generate sample timeline data (replace with real API data)
        const timeline: TimeSeriesDataPoint[] = Array.from(
          { length: 30 },
          (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
            value:
              Math.floor(Math.random() * 50) + (stats.activeProjects || 0) - 25,
            label: `Day ${i + 1}`,
          })
        );

        // Generate sample distribution data
        const distribution: ChartDataPoint[] = [
          {
            id: "planning",
            label: "Planning",
            value: Math.floor((stats.totalProjects || 0) * 0.2),
            color: theme.palette.info.main,
          },
          {
            id: "development",
            label: "Development",
            value: Math.floor((stats.totalProjects || 0) * 0.5),
            color: theme.palette.warning.main,
          },
          {
            id: "testing",
            label: "Testing",
            value: Math.floor((stats.totalProjects || 0) * 0.2),
            color: theme.palette.error.main,
          },
          {
            id: "completed",
            label: "Completed",
            value: Math.floor((stats.totalProjects || 0) * 0.1),
            color: theme.palette.success.main,
          },
        ];

        return {
          keyMetrics: metrics,
          chartData: { timeline, distribution },
        };
      }, [stats, theme.palette, t]);

      // Loading state
      if (isLoading) {
        return (
          <Box className={className} sx={{ width: "100%" }}>
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
                      <Skeleton variant="text" width={150} height={32} />
                    </Box>
                    <Skeleton variant="text" width={200} height={20} />
                  </Stack>
                </Box>

                {/* Metrics skeleton */}
                <Box>
                  <Grid container spacing={3}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                        <Skeleton
                          variant="rectangular"
                          height={160}
                          sx={{ borderRadius: 3 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Charts skeleton */}
                {showCharts && (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Skeleton
                          variant="rectangular"
                          height={300}
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Skeleton
                          variant="rectangular"
                          height={300}
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        );
      }

      // Error state
      if (isError) {
        return (
          <Box className={className} sx={{ width: "100%" }}>
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

      return (
        <Box className={className} sx={{ width: "100%" }}>
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
                <Grid container spacing={3}>
                  {keyMetrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={metric.id}>
                      <MetricCard
                        metric={metric}
                        variant={variant === "minimal" ? "compact" : variant}
                        showTrend={showTrends}
                        showProgress
                        onClick={onMetricClick}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Charts Section */}
              {showCharts && (
                <Box>
                  <Grid container spacing={3}>
                    {/* Timeline Chart */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardHeader
                          title="Project Activity Timeline"
                          titleTypographyProps={{
                            variant: "h6",
                            fontWeight: 600,
                          }}
                        />
                        <CardContent>
                          <LineChart
                            data={chartData.timeline}
                            height={280}
                            showPoints
                            showGrid
                            smooth
                            area
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Status Distribution Chart */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardHeader
                          title="Project Status Distribution"
                          titleTypographyProps={{
                            variant: "h6",
                            fontWeight: 600,
                          }}
                        />
                        <CardContent>
                          <BarChart
                            data={chartData.distribution}
                            height={280}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      );
    }
  );

EnhancedDashboardStatsWidget.displayName = "EnhancedDashboardStatsWidget";
