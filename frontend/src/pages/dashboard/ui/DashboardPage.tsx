import React, {
  memo,
  useState,
  useCallback,
  startTransition,
  Suspense,
  useDeferredValue,
  useEffect,
} from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardErrorBoundary } from "@/shared/ui";

import { DashboardLayout } from "@/widgets/layout";
import {
  DashboardContainer,
  DashboardMode,
  DashboardLayout as DashboardLayoutType,
} from "@/widgets/dashboard-container";
import { QuickActionsWidget } from "@/widgets";
import { ProjectOverviewWidget } from "@/widgets/project-overview";
import { SystemHealthWidget } from "@/widgets/system-health";
import { ActivityFeedWidget } from "@/widgets/dashboard-activity-feed";

// Import our enhanced chart components
import { EnhancedDashboardStatsWidget } from "@/features/dashboard/ui/EnhancedDashboardStatsWidget";
import { DashboardChartsGrid } from "@/features/charts";

import {
  useDashboardOverview,
  useRefreshDashboard,
  useSystemMetrics,
  useTimelineData,
  useDistributionData,
  dashboardKeys,
} from "@/features/dashboard";
import { useLayoutMode } from "@/shared/contexts/PerformanceContext";

export interface DashboardPageProps {
  className?: string;
}

/**
 * Activity Feed Section Component
 */
const ActivityFeedSection = memo(() => (
  <Suspense
    fallback={
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
        }}
      >
        <CircularProgress size={32} />
      </Box>
    }
  >
    <ActivityFeedWidget maxItems={8} showFilters infiniteScroll={false} />
  </Suspense>
));
ActivityFeedSection.displayName = "ActivityFeedSection";

/**
 * Main Dashboard Page Component with Context7 Design
 */
const DashboardPage: React.FC<DashboardPageProps> = ({ className }) => {
  // Hooks
  const t = i18n.t;
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { mode: layoutMode, setMode: setLayoutMode } = useLayoutMode();

  // Responsive
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>(
    isMobile ? "compact" : "detailed"
  );
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayoutType>(
    isMobile ? "list" : "grid"
  );
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to prevent Fade errors
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Data fetching
  const { data: overview, isError, error, isFetching } = useDashboardOverview();
  const {
    data: systemMetrics,
    isLoading: isSystemMetricsLoading,
    isError: isSystemMetricsError,
  } = useSystemMetrics();

  // Chart data from API
  const { data: timelineData, isLoading: isTimelineLoading } =
    useTimelineData();
  const { data: distributionData, isLoading: isDistributionLoading } =
    useDistributionData();

  // Performance optimization with useDeferredValue
  const deferredOverview = useDeferredValue(overview);
  const deferredSystemMetrics = useDeferredValue(systemMetrics);

  // Mutation for refresh
  const refreshMutation = useRefreshDashboard({
    onMutate: () => setIsRefreshing(true),
    onSettled: () => setIsRefreshing(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });

  // Event handlers
  const handleRefresh = useCallback(() => {
    if (!isRefreshing) {
      refreshMutation.mutate();
    }
  }, [refreshMutation, isRefreshing]);

  const handleModeChange = useCallback((mode: DashboardMode) => {
    startTransition(() => {
      setDashboardMode(mode);
    });
  }, []);

  const handleLayoutChange = useCallback(
    (layout: DashboardLayoutType) => {
      startTransition(() => {
        setDashboardLayout(layout);
        // Sync with legacy layout mode
        if (layout === "grid") {
          setLayoutMode("grid");
        } else {
          setLayoutMode("list");
        }
      });
    },
    [setLayoutMode]
  );

  // Helper function to get compatible mode for components
  const getCompatibleMode = useCallback(
    (mode: DashboardMode): "minimal" | "compact" | "detailed" => {
      if (mode === "fullscreen") return "detailed";
      return mode;
    },
    []
  );

  // Handler for chart metrics (compatible with ChartMetric type)
  const handleChartMetricClick = useCallback((metric: any) => {
    console.log("Chart metric clicked:", metric);
  }, []);

  // Show minimal loading if not mounted to prevent Fade errors
  if (!isMounted) {
    return (
      <DashboardLayout>
        <DashboardContainer showModeControls={false}>
          <Box
            sx={{
              p: { xs: 2.5, sm: 3, md: 3.5 },
              borderRadius: 4,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backgroundColor: (theme) => theme.palette.background.paper,
              opacity: 0.7,
            }}
          >
            <Typography variant="h1" sx={{ fontWeight: 800, mb: 0.5 }}>
              {t("dashboard.title", "Dashboard")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("dashboard.subtitle", "Loading...")}
            </Typography>
          </Box>
        </DashboardContainer>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <DashboardContainer showModeControls={false}>
          <Alert
            severity="error"
            action={
              <IconButton color="inherit" size="small" onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            }
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.error.light, 0.1)} 0%, 
                ${alpha(theme.palette.error.main, 0.05)} 100%)`,
            }}
          >
            {error?.message || "Error loading dashboard"}
          </Alert>
        </DashboardContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContainer
        className={className}
        defaultMode={dashboardMode}
        defaultLayout={dashboardLayout}
        onModeChange={handleModeChange}
        onLayoutChange={handleLayoutChange}
        showModeControls={!isMobile} // Hide controls on mobile for cleaner UI
      >
        {/* Header Section with Context7 styling */}
        <Box
          sx={{
            animation: "fadeInDown 0.6s ease-out",
            "@keyframes fadeInDown": {
              "0%": {
                opacity: 0,
                transform: "translateY(-20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          <Box
            sx={{
              p: { xs: 2.5, sm: 3, md: 3.5 },
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
              backdropFilter: "blur(20px)",
              boxShadow: `0 8px 40px ${alpha(
                theme.palette.common.black,
                0.06
              )}`,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 50%, 
                  ${theme.palette.info.main} 100%)`,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 2, sm: 1.5, md: 2 },
              }}
            >
              {/* Title Section */}
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: {
                      xs: "1.75rem",
                      sm: "2rem",
                      md: dashboardMode === "detailed" ? "2.5rem" : "2rem",
                    },
                    lineHeight: 1.1,
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.main} 0%, 
                      ${theme.palette.secondary.main} 70%, 
                      ${theme.palette.info.main} 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0.5,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("dashboard.title", "Dashboard")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    color: theme.palette.text.secondary,
                    fontWeight: 400,
                  }}
                >
                  {t(
                    "dashboard.subtitle",
                    "Welcome back! Here's what's happening with your projects."
                  )}
                </Typography>
              </Box>

              {/* Refresh Button with Context7 styling */}
              <Tooltip title="Refresh Dashboard" arrow>
                <IconButton
                  onClick={handleRefresh}
                  disabled={isFetching || isRefreshing}
                  sx={{
                    width: { xs: 44, sm: 48 },
                    height: { xs: 44, sm: 48 },
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                      ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: {
                        xs: "none",
                        sm: "translateY(-2px) scale(1.02)",
                      },
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.15)} 0%, 
                        ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                      boxShadow: `0 8px 25px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                >
                  <Refresh
                    sx={{
                      fontSize: { xs: 22, sm: 24 },
                      color: theme.palette.primary.main,
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
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Key Metrics Section */}
        <Box
          sx={{
            animation: "fadeInUp 0.8s ease-out",
            "@keyframes fadeInUp": {
              "0%": {
                opacity: 0,
                transform: "translateY(20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          <EnhancedDashboardStatsWidget
            variant={getCompatibleMode(dashboardMode)}
            showCharts={dashboardMode !== "minimal"}
            showTrends={dashboardMode === "detailed"}
            onMetricClick={handleChartMetricClick}
          />
        </Box>

        {/* Charts Section - адаптивное отображение */}
        {dashboardMode !== "minimal" && (
          <Box
            sx={{
              animation: "fadeIn 1.0s ease-out",
              "@keyframes fadeIn": {
                "0%": { opacity: 0 },
                "100%": { opacity: 1 },
              },
            }}
          >
            <DashboardChartsGrid
              projectMetrics={{
                totalProjects: deferredOverview?.stats?.totalProjects || 0,
                activeProjects: deferredOverview?.stats?.activeProjects || 0,
                completedProjects: deferredOverview?.stats?.completedTasks || 0,
                inProgressProjects:
                  deferredOverview?.stats?.activeProjects || 0,
                avgProgress: deferredOverview?.stats?.completionRate || 0,
                statusDistribution: distributionData
                  ? distributionData.map((item) => ({
                      status: item.id,
                      label: item.label,
                      count: item.value,
                      percentage: item.percentage || 0,
                      color: item.color,
                    }))
                  : [],
                timeline: timelineData || [],
                trends: [],
              }}
              requirementMetrics={{
                totalRequirements:
                  deferredOverview?.stats?.totalRequirements || 0,
                completedRequirements:
                  deferredOverview?.stats?.completedTasks || 0,
                pendingRequirements:
                  deferredOverview?.stats?.activeRequirements || 0,
                approvedRequirements: 0,
                rejectedRequirements: 0,
                velocity: Math.round(
                  deferredOverview?.stats?.teamVelocity || 0
                ),
                burndown: [],
                timeline: timelineData || [],
                statusDistribution: distributionData
                  ? distributionData.map((item) => ({
                      status: item.id,
                      label: item.label,
                      count: item.value,
                      percentage: item.percentage || 0,
                      color: item.color,
                    }))
                  : [],
              }}
              teamMetrics={{
                totalMembers: deferredOverview?.stats?.teamMembers || 0,
                activeMembers: deferredOverview?.stats?.teamMembers || 0,
                productivity: deferredOverview?.stats?.completionRate || 0,
                velocity: Math.round(
                  deferredOverview?.stats?.teamVelocity || 0
                ),
                workload: [],
                performance: [],
              }}
              loading={
                isFetching ||
                isSystemMetricsLoading ||
                isTimelineLoading ||
                isDistributionLoading
              }
              error={
                isError
                  ? (error as any)?.message || "Error loading charts"
                  : isSystemMetricsError
                  ? "Error loading system metrics"
                  : null
              }
            />
          </Box>
        )}

        {/* Main Content Grid - адаптивная сетка */}
        <Box
          sx={{
            animation: "slideIn 1.2s ease-out",
            "@keyframes slideIn": {
              "0%": {
                opacity: 0,
                transform: "translateY(30px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          <Grid
            container
            spacing={{ xs: 2.5, sm: 3, md: 3.5 }}
            sx={{
              "& .MuiGrid-item": {
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            {/* Main Content Column */}
            <Grid
              item
              xs={12}
              lg={dashboardLayout === "list" ? 12 : 8}
              sx={{
                order: { xs: 2, lg: 1 },
              }}
            >
              <Grid container spacing={{ xs: 2.5, sm: 3, md: 3 }}>
                {/* Quick Actions */}
                <Grid item xs={12}>
                  <QuickActionsWidget
                    variant={getCompatibleMode(dashboardMode)}
                    maxActions={dashboardMode === "minimal" ? 4 : 8}
                    showCategories={dashboardMode === "detailed"}
                    showShortcuts
                    showFavorites={dashboardMode !== "minimal"}
                  />
                </Grid>

                {/* Project Overview */}
                <Grid item xs={12}>
                  <ProjectOverviewWidget />
                </Grid>
              </Grid>
            </Grid>

            {/* Sidebar Column */}
            {dashboardLayout === "grid" && (
              <Grid
                item
                xs={12}
                lg={4}
                sx={{
                  order: { xs: 1, lg: 2 },
                }}
              >
                <Grid container spacing={{ xs: 2.5, sm: 3, md: 3 }}>
                  {/* Activity Feed */}
                  <Grid item xs={12}>
                    <ActivityFeedSection />
                  </Grid>

                  {/* System Health */}
                  {dashboardMode !== "minimal" && (
                    <Grid item xs={12}>
                      <SystemHealthWidget />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}

            {/* Full-width components for list layout */}
            {dashboardLayout === "list" && (
              <>
                <Grid item xs={12}>
                  <ActivityFeedSection />
                </Grid>
                {dashboardMode !== "minimal" && (
                  <Grid item xs={12}>
                    <SystemHealthWidget />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Box>
      </DashboardContainer>
    </DashboardLayout>
  );
};

export const DashboardPageWithSuspense = () => (
  <DashboardErrorBoundary>
    <Suspense
      fallback={
        <DashboardLayout>
          <DashboardContainer showModeControls={false}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
              }}
            >
              <CircularProgress size={48} thickness={4} />
            </Box>
          </DashboardContainer>
        </DashboardLayout>
      }
    >
      <DashboardPage />
    </Suspense>
  </DashboardErrorBoundary>
);

export default memo(DashboardPageWithSuspense);
