import { memo, useMemo, useState, useCallback, startTransition } from "react";
import {
  Box,
  Typography,
  Grid,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Refresh,
  Assessment,
  RocketLaunch,
  Assignment,
  Group,
  Speed,
  TrendingUp,
  ExpandMore,
  ShowChart,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

import { MetricCard, LineChart, BarChart } from "@/entities/charts";
import type { ChartMetric, TimeSeriesDataPoint } from "@/entities/charts";
import {
  useDashboardStats,
  useTimelineData,
  useDistributionData,
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
}

/**
 * Collapsible Charts Section Component
 */
const CollapsibleChartsSection = memo<{
  timelineData: TimeSeriesDataPoint[];
  distributionData: any[];
  isTimelineLoading: boolean;
  isDistributionLoading: boolean;
  timelineError: Error | null;
  distributionError: Error | null;
  defaultExpanded?: boolean;
}>(
  ({
    timelineData,
    distributionData,
    isTimelineLoading,
    isDistributionLoading,
    timelineError,
    distributionError,
    defaultExpanded = true,
  }) => {
    const theme = useTheme();
    const t = i18n.t;
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [isAnimating, setIsAnimating] = useState(false);

    // Count visible charts
    const chartCount = 2; // Timeline and Distribution

    // Responsive chart height
    const getChartHeight = () => {
      if (
        theme.breakpoints.values.md &&
        window.innerWidth >= theme.breakpoints.values.md
      ) {
        return 300;
      }
      if (
        theme.breakpoints.values.sm &&
        window.innerWidth >= theme.breakpoints.values.sm
      ) {
        return 280;
      }
      return 260;
    };

    const chartHeight = getChartHeight();

    const handleToggle = useCallback(() => {
      if (isAnimating) return;

      setIsAnimating(true);
      startTransition(() => {
        setExpanded(!expanded);
        setTimeout(() => setIsAnimating(false), 400);
      });
    }, [expanded, isAnimating]);

    return (
      <Box>
        {/* Charts Section Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: { xs: 2, sm: 2.5 }, // Responsive margin
            px: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease",
                ...(expanded && {
                  transform: { xs: "none", sm: "scale(1.05)" }, // No transform on mobile
                }),
              }}
            >
              <ShowChart sx={{ color: "white", fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: "1.125rem",
                  userSelect: "none",
                }}
              >
                {t("dashboard.charts.title", "Activity Charts")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.8rem",
                }}
              >
                {expanded
                  ? t(
                      "dashboard.charts.subtitle.expanded",
                      `${chartCount} charts visible`
                    )
                  : t(
                      "dashboard.charts.subtitle.collapsed",
                      `${chartCount} charts hidden`
                    )}
              </Typography>
            </Box>
          </Box>

          <Tooltip
            title={
              expanded
                ? t("dashboard.charts.collapse", "Collapse Charts")
                : t("dashboard.charts.expand", "Expand Charts")
            }
            arrow
            enterDelay={300}
          >
            <IconButton
              onClick={handleToggle}
              disabled={isAnimating}
              aria-label={expanded ? "Collapse charts" : "Expand charts"}
              aria-expanded={expanded}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.info.main, 0.08),
                  borderColor: alpha(theme.palette.info.main, 0.2),
                  transform: { xs: "none", sm: "scale(1.05)" }, // No transform on mobile
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <Box
                sx={{
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
                  color: expanded
                    ? theme.palette.info.main
                    : theme.palette.text.secondary,
                }}
              >
                <ExpandMore fontSize="small" />
              </Box>
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse
          in={expanded}
          timeout={400}
          easing={{
            enter: "cubic-bezier(0.4, 0, 0.2, 1)",
            exit: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          unmountOnExit={false}
        >
          <Fade in={expanded} timeout={300}>
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }} // Responsive spacing
              sx={{
                "& .MuiGrid-item": {
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              {/* Timeline Chart */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: `0 2px 20px ${alpha(
                      theme.palette.common.black,
                      0.04
                    )}`,
                    background: theme.palette.background.paper,
                    overflow: "hidden",
                    height: "100%", // Consistent height
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: { xs: "none", sm: "translateY(-1px)" }, // No transform on mobile
                      boxShadow: `0 4px 24px ${alpha(
                        theme.palette.common.black,
                        0.06
                      )}`,
                    },
                  }}
                >
                  <CardHeader
                    title={t(
                      "dashboard.charts.projectTimeline",
                      "Project Activity Timeline"
                    )}
                    titleTypographyProps={{
                      variant: "subtitle1",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: theme.palette.text.primary,
                    }}
                    sx={{
                      pb: 1,
                      px: { xs: 2, sm: 3 }, // Responsive padding
                      pt: { xs: 2, sm: 2.5 },
                      flexShrink: 0,
                      "& .MuiCardHeader-content": {
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                      },
                    }}
                  />
                  <CardContent
                    sx={{
                      pt: 0,
                      pb: { xs: 2, sm: 3 }, // Responsive padding
                      px: { xs: 2, sm: 3 },
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ height: "100%", minHeight: 0 }}>
                      <LineChart
                        data={timelineData}
                        height={chartHeight}
                        showPoints
                        showGrid
                        smooth
                        area
                        loading={isTimelineLoading}
                        error={(timelineError as any)?.message || null}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Status Distribution Chart */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: `0 2px 20px ${alpha(
                      theme.palette.common.black,
                      0.04
                    )}`,
                    background: theme.palette.background.paper,
                    overflow: "hidden",
                    height: "100%", // Consistent height
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: { xs: "none", sm: "translateY(-1px)" }, // No transform on mobile
                      boxShadow: `0 4px 24px ${alpha(
                        theme.palette.common.black,
                        0.06
                      )}`,
                    },
                  }}
                >
                  <CardHeader
                    title={t(
                      "dashboard.charts.statusDistribution",
                      "Project Status Distribution"
                    )}
                    titleTypographyProps={{
                      variant: "subtitle1",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: theme.palette.text.primary,
                    }}
                    sx={{
                      pb: 1,
                      px: { xs: 2, sm: 3 }, // Responsive padding
                      pt: { xs: 2, sm: 2.5 },
                      flexShrink: 0,
                      "& .MuiCardHeader-content": {
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                      },
                    }}
                  />
                  <CardContent
                    sx={{
                      pt: 0,
                      pb: { xs: 2, sm: 3 }, // Responsive padding
                      px: { xs: 2, sm: 3 },
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ height: "100%", minHeight: 0 }}>
                      <BarChart
                        data={distributionData}
                        height={chartHeight}
                        loading={isDistributionLoading}
                        error={(distributionError as any)?.message || null}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        </Collapse>
      </Box>
    );
  }
);

CollapsibleChartsSection.displayName = "CollapsibleChartsSection";

export const EnhancedDashboardStatsWidget =
  memo<EnhancedDashboardStatsWidgetProps>(
    ({
      variant = "detailed",
      showCharts = true,
      showTrends = true,
      className,
      onMetricClick,
    }) => {
      // Performance monitoring
      useRenderTracker("EnhancedDashboardStatsWidget");
      usePerformanceMeasure("EnhancedDashboardStatsWidget");

      // Hooks and services
      const theme = useTheme();
      const t = i18n.t;
      const isCompact = variant === "compact";

      // API Queries
      const {
        data: stats,
        isLoading: isStatsLoading,
        error: statsError,
        isError: isStatsError,
        refetch: refetchStats,
        isFetching: isStatsFetching,
      } = useDashboardStats();

      // Chart data queries
      const {
        data: timelineData,
        isLoading: isTimelineLoading,
        error: timelineError,
      } = useTimelineData();

      const {
        data: distributionData,
        isLoading: isDistributionLoading,
        error: distributionError,
      } = useDistributionData();

      // Combine loading states
      const isLoading =
        isStatsLoading || isTimelineLoading || isDistributionLoading;
      const isFetching = isStatsFetching;
      const combinedError = statsError || timelineError || distributionError;
      const isError = isStatsError || !!timelineError || !!distributionError;

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
            id: "totalRequirements",
            title: t(
              "dashboard.metrics.totalRequirements",
              "Total Requirements"
            ),
            value: stats.totalRequirements || 0,
            icon: <Assignment />,
            color: theme.palette.secondary.main,
            format: "number",
            trend: stats.trends?.totalRequirements
              ? {
                  direction: stats.trends.totalRequirements.direction,
                  value: stats.trends.totalRequirements.current,
                  percentage: stats.trends.totalRequirements.percentage,
                  label: "vs last week",
                }
              : undefined,
          },
          {
            id: "completionRate",
            title: t("dashboard.metrics.completionRate", "Completion Rate"),
            value: stats.completionRate || 0,
            icon: <TrendingUp />,
            color: theme.palette.success.main,
            format: "percentage",
            target: 100,
            trend: stats.trends?.completionRate
              ? {
                  direction: stats.trends.completionRate.direction,
                  value: stats.trends.completionRate.current,
                  percentage: stats.trends.completionRate.percentage,
                  label: "vs last month",
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
          },
          {
            id: "teamVelocity",
            title: t("dashboard.metrics.teamVelocity", "Team Velocity"),
            value: Math.round(stats.teamVelocity || 0),
            icon: <Speed />,
            color: theme.palette.error.main,
            format: "number",
            trend: stats.trends?.teamVelocity
              ? {
                  direction: stats.trends.teamVelocity.direction,
                  value: stats.trends.teamVelocity.current,
                  percentage: stats.trends.teamVelocity.percentage,
                  label: "vs last month",
                }
              : undefined,
          },
        ];

        // Transform timeline data for LineChart
        const timeline = (timelineData || []).map((point) => ({
          id: `timeline_${point.date}_${point.value}`,
          label: point.label,
          value: point.value,
          date: point.date,
          category: point.category,
          metadata: point.metadata,
        }));

        // Transform distribution data for BarChart
        const distribution = (distributionData || []).map((point) => ({
          id: point.id,
          label: point.label,
          value: point.value,
          color: point.color,
          metadata: point.metadata,
        }));

        return {
          keyMetrics: metrics,
          chartData: { timeline, distribution },
        };
      }, [stats, timelineData, distributionData, theme.palette, t]);

      // Loading state
      if (isLoading) {
        return (
          <Box className={className} sx={{ width: "100%" }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 2px 20px ${alpha(
                  theme.palette.common.black,
                  0.04
                )}`,
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: `3px solid ${theme.palette.primary.main}`,
                      borderTopColor: "transparent",
                      animation: "spin 1s linear infinite",
                      mb: 2,
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {t("common.loading", "Loading...")}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      }

      // Error state
      if (isError) {
        return (
          <Box className={className} sx={{ width: "100%" }}>
            <Alert
              severity="error"
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => refetchStats()}
                >
                  <Refresh />
                </IconButton>
              }
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              {(combinedError as any)?.message ||
                t("dashboard.error", "Error loading dashboard data")}
            </Alert>
          </Box>
        );
      }

      return (
        <Box className={className} sx={{ width: "100%" }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0 2px 20px ${alpha(
                theme.palette.common.black,
                0.04
              )}`,
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
                  onClick={() => refetchStats()}
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
                    <Grid item xs={12} sm={6} md={4} lg={2} key={metric.id}>
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

              {/* Collapsible Charts Section */}
              {showCharts && (
                <CollapsibleChartsSection
                  timelineData={chartData.timeline}
                  distributionData={chartData.distribution}
                  isTimelineLoading={isTimelineLoading}
                  isDistributionLoading={isDistributionLoading}
                  timelineError={timelineError}
                  distributionError={distributionError}
                  defaultExpanded={variant !== "compact"}
                />
              )}
            </Stack>
          </Box>
        </Box>
      );
    }
  );

EnhancedDashboardStatsWidget.displayName = "EnhancedDashboardStatsWidget";
