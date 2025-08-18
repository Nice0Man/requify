import React, { memo, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Stack,
  IconButton,
  Skeleton,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import {
  Refresh,
  Assessment,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
// import { DashboardWidgetWrapper } from "@/shared/ui"; // TODO: Fix import path
import { Box as DashboardWidgetWrapper } from "@mui/material";
import { useDashboardStats } from "../model/queries";
import { useDashboardSizing, useCardSizing } from "@/shared/hooks";
import type { EnhancedDashboardStatsWidgetProps, MetricCardData } from "../model/types";
import { enhancedStatsWidgetConfig } from "../model/config";
import { MetricCard } from "./MetricCard";

export const EnhancedDashboardStatsWidget = memo<EnhancedDashboardStatsWidgetProps>(
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

    // Adaptive sizing system
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
                     trend: stats.trends?.totalProjects && stats.trends.totalProjects.direction ? {
             value: stats.trends.totalProjects.percentage || 0,
             direction:
               stats.trends.totalProjects.direction === "stable"
                 ? "neutral"
                 : (stats.trends.totalProjects.direction as "up" | "down"),
             label: "vs last month",
           } : undefined,
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
           title: t("dashboard.metrics.activeRequirements", "Active Requirements"),
           value: stats.activeRequirements || 0,
           icon: <TrendingUp />,
           color: theme.palette.success.main,
           progress: stats.totalRequirements
             ? (stats.activeRequirements || 0) / stats.totalRequirements
             : 0,
           metadata: {
             target: undefined,
             unit: "requirements",
             description: "Requirements being tracked",
           },
         },
      ];
    }, [stats, theme, t]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
      refetch();
    }, [refetch]);

    // Responsive grid configuration
    const getGridConfig = () => {
      if (layout === "list") {
        return { xs: 12 };
      }

      const { columns } = sizing.gridConfig;

      if (isMobile) {
        return { xs: 12, sm: 6 };
      }

      if (isTablet) {
        return { xs: 12, sm: 6, md: 4 };
      }

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
              <Skeleton variant="text" width="40%" height={40} />
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
         className={className}
         sx={{
           p: sizing.padding,
           borderRadius: sizing.borderRadius.medium,
           border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
           backgroundColor: theme.palette.background.paper,
         }}
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
                {t("dashboard.metrics.subtitle", "Real-time project statistics")}
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
                  <MetricCard
                    metric={metric}
                    onMetricClick={onMetricClick}
                    showTrends={showTrends}
                    mode={mode}
                    density={density}
                    maxHeight={maxHeight}
                    overflow={overflow}
                  />
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
