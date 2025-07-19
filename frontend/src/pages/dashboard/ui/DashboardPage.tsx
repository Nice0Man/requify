import React, {
  memo,
  useState,
  useCallback,
  startTransition,
  Suspense,
  useDeferredValue,
} from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Alert,
  Chip,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import {
  Refresh,
  ViewModule,
  ViewQuilt,
  TrendingUp,
  Speed,
  Update,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";

import { DashboardLayout } from "@/widgets/layout";
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
  dashboardKeys,
} from "@/features/dashboard";
import type { DashboardMetric } from "@/features/dashboard";
import { useLayoutMode } from "@/shared/contexts/PerformanceContext";

export interface DashboardPageProps {
  className?: string;
}

/**
 * Status Chips Component - Memoized for performance
 */
const StatusChips = memo<{ overview: any }>(({ overview }) => {
  const t = i18n.t;

  if (!overview?.stats) return null;

  const chipData = [
    {
      label: `${overview.stats.totalProjects || 0} ${t(
        "projects",
        "projects"
      )}`,
      color: "primary" as const,
      icon: <Speed sx={{ fontSize: 16 }} />,
    },
    {
      label: `${overview.stats.totalRequirements || 0} ${t(
        "requirements",
        "requirements"
      )}`,
      color: "secondary" as const,
      icon: <TrendingUp sx={{ fontSize: 16 }} />,
    },
    {
      label: `${overview.stats.completedTasks || 0} ${t(
        "completed",
        "completed"
      )}`,
      color: "success" as const,
      icon: <Update sx={{ fontSize: 16 }} />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mb: 2,
      }}
    >
      {chipData.map((chip) => (
        <Chip
          key={chip.label}
          icon={chip.icon}
          label={chip.label}
          color={chip.color}
          variant="outlined"
          size="small"
          sx={{
            height: 28,
            "& .MuiChip-icon": {
              fontSize: 16,
            },
          }}
        />
      ))}
    </Box>
  );
});

StatusChips.displayName = "StatusChips";

/**
 * Dashboard Loading Skeleton
 */
const DashboardSkeleton = memo(() => (
  <DashboardLayout>
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={120}
        sx={{ mb: 3 }}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>
        <Box>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} />
        </Box>
        <Box>
          <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={250} />
        </Box>
      </Box>
    </Box>
  </DashboardLayout>
));

DashboardSkeleton.displayName = "DashboardSkeleton";

/**
 * Activity Feed with Loading Fallback
 */
const ActivityFeedSection = memo(() => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            height: "100%",
            minHeight: 200,
            border: (theme) =>
              `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundColor: (theme) => theme.palette.background.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading activity feed...
            </Typography>
          </Box>
        </Box>
      }
    >
      <ActivityFeedWidget
        variant="detailed"
        maxItems={10}
        showFilters={false}
        showSearch={true}
        showHeader={true}
        autoRefresh={true}
        refreshInterval={30000}
      />
    </Suspense>
  );
});

ActivityFeedSection.displayName = "ActivityFeedSection";

/**
 * Main Dashboard Page Component
 */
const DashboardPage: React.FC<DashboardPageProps> = ({ className }) => {
  // Hooks
  const t = i18n.t;
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { mode: layoutMode, setMode: setLayoutMode } = useLayoutMode();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data fetching
  const { data: overview, isError, error, isFetching } = useDashboardOverview();
  const { 
    data: systemMetrics, 
    isLoading: isSystemMetricsLoading, 
    isError: isSystemMetricsError 
  } = useSystemMetrics();

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

  const handleLayoutToggle = useCallback(() => {
    startTransition(() => {
      const newMode = layoutMode === "grid" ? "list" : "grid";
      setLayoutMode(newMode);
    });
  }, [layoutMode, setLayoutMode]);

  const handleMetricClick = useCallback((metric: DashboardMetric) => {
    console.log("Metric clicked:", metric);
  }, []);

  // Handler for chart metrics (compatible with ChartMetric type)
  const handleChartMetricClick = useCallback((metric: any) => {
    console.log("Chart metric clicked:", metric);
  }, []);

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <IconButton color="inherit" size="small" onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            }
          >
            {error?.message || "Error loading dashboard"}
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box
        className={className}
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          p: 3,
          // CSS Grid Layout for modern responsive design
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr",
            lg: "2fr 1fr",
            xl: "2fr 1fr",
          },
          gridTemplateRows: {
            xs: "auto auto auto auto auto auto",
            lg: "auto auto auto 1fr",
          },
          gridTemplateAreas: {
            xs: `
              "header"
              "status"
              "stats"
              "charts"
              "main"
              "sidebar"
            `,
            lg: `
              "header header"
              "status status"
              "stats stats"
              "charts charts"
              "main sidebar"
            `,
          },
          gap: 3,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* Header Area */}
        <Box
          sx={{
            gridArea: "header",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          {/* Title Section */}
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                lineHeight: 1.2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
              }}
            >
              {t("dashboard.title", "Dashboard")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t(
                "dashboard.subtitle",
                "Welcome back! Here's what's happening with your projects."
              )}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Dashboard">
              <IconButton
                onClick={handleRefresh}
                disabled={isFetching || isRefreshing}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
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
            </Tooltip>

            <Tooltip
              title={`Switch to ${
                layoutMode === "grid" ? "list" : "grid"
              } view`}
            >
              <IconButton
                onClick={handleLayoutToggle}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                {layoutMode === "grid" ? <ViewModule /> : <ViewQuilt />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Status Chips Area */}
        <Box sx={{ gridArea: "status" }}>
          <StatusChips overview={deferredOverview} />
        </Box>

        {/* Enhanced Stats Widget with Charts */}
        <Box sx={{ gridArea: "stats" }}>
          <EnhancedDashboardStatsWidget
            variant="detailed"
            showCharts={true}
            showTrends={true}
            onMetricClick={handleChartMetricClick}
          />
        </Box>

        {/* Interactive Charts Grid - Only if we have valid data */}
        {deferredOverview?.stats && (
          <Box sx={{ gridArea: "charts", mt: 3 }}>
            <DashboardChartsGrid
              projectMetrics={{
                totalProjects: deferredOverview.stats.totalProjects || 0,
                activeProjects: deferredOverview.stats.activeProjects || 0,
                completedProjects: deferredOverview.stats.completedTasks || 0,
                inProgressProjects: deferredOverview.stats.activeProjects || 0,
                avgProgress: deferredOverview.stats.completionRate || 0,
                statusDistribution: [
                  {
                    status: "active",
                    count: deferredOverview.stats.activeProjects || 0,
                    percentage: Math.round(
                      ((deferredOverview.stats.activeProjects || 0) /
                        Math.max(deferredOverview.stats.totalProjects || 1, 1)) *
                        100
                    ),
                    color: theme.palette.primary.main,
                  },
                  {
                    status: "completed",
                    count: deferredOverview.stats.completedTasks || 0,
                    percentage: Math.round(
                      ((deferredOverview.stats.completedTasks || 0) /
                        Math.max(deferredOverview.stats.totalRequirements || 1, 1)) *
                        100
                    ),
                    color: theme.palette.success.main,
                  },
                ],
                timeline: [],
                trends: [],
              }}
              teamMetrics={{
                totalMembers: deferredOverview.stats.teamMembers || 0,
                activeMembers: deferredOverview.stats.teamMembers || 0,
                productivity: deferredOverview.stats.completionRate || 0,
                velocity: Math.round(deferredOverview.stats.teamVelocity || 0),
                workload: [],
                performance: [],
              }}
              systemMetrics={{
                cpuUsage: deferredSystemMetrics?.cpuUsage || 0,
                memoryUsage: deferredSystemMetrics?.memoryUsage || 0,
                diskUsage: deferredSystemMetrics?.diskUsage || 0,
                networkLatency: deferredSystemMetrics?.networkLatency || 0,
                uptime: deferredSystemMetrics?.uptime || 0,
                activeUsers: deferredSystemMetrics?.activeUsers || deferredOverview?.stats?.teamMembers || 0,
                responseTime: deferredSystemMetrics?.responseTime || 0,
                errorRate: deferredSystemMetrics?.errorRate || 0,
                throughput: deferredSystemMetrics?.throughput || 0,
                availability: deferredSystemMetrics?.availability || 0,
              }}
              loading={isFetching || isSystemMetricsLoading}
              error={
                isError ? (error as any)?.message || "Error loading charts" : 
                isSystemMetricsError ? "Error loading system metrics" : null
              }
            />
          </Box>
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            gridArea: "main",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minHeight: 0, // Important for proper grid sizing
          }}
        >
          {/* Quick Actions */}
          <Box sx={{ flex: "0 0 auto" }}>
            <QuickActionsWidget
              variant="detailed"
              maxActions={8}
              showCategories
              showShortcuts
              showFavorites
            />
          </Box>

          {/* Project Overview */}
          <Box sx={{ flex: "1 1 auto", minHeight: 200 }}>
            <ProjectOverviewWidget />
          </Box>
        </Box>

        {/* Sidebar Area */}
        <Box
          sx={{
            gridArea: "sidebar",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minHeight: 0, // Important for proper grid sizing
          }}
        >
          {/* Activity Feed - Deferred for performance */}
          <Box sx={{ flex: "1 1 auto", minHeight: 200 }}>
            <ActivityFeedSection />
          </Box>

          {/* System Health */}
          <Box sx={{ flex: "0 0 auto" }}>
            <SystemHealthWidget />
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

// Export with Suspense wrapper
const DashboardPageWithSuspense: React.FC<DashboardPageProps> = (props) => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage {...props} />
    </Suspense>
  );
};

export default DashboardPageWithSuspense;
