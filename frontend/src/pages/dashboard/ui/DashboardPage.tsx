import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Alert,
  Card,
  CardContent,
  Paper,
  Chip,
} from "@mui/material";
import {
  Refresh,
  Settings,
  Fullscreen,
  FullscreenExit,
  ViewModule,
  ViewQuilt,
  Tune,
  TrendingUp,
  Speed,
  Update,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";

import { DashboardLayout } from "@/widgets/layout";
import { DashboardStatsWidget, QuickActionsWidget } from "@/widgets";
import { ActivityFeedWidget } from "@/widgets/dashboard-activity-feed";
import { ProjectOverviewWidget } from "@/widgets/project-overview";
import { SystemHealthWidget } from "@/widgets/system-health";
import {
  useDashboardOverview,
  useRefreshDashboard,
  dashboardKeys,
} from "@/features/dashboard";
import {
  useTheme as useThemeMode,
  useLayoutMode,
  useLoadingState,
  usePerformanceMonitor,
} from "@/shared/contexts/PerformanceContext";
import {
  useRenderTracker,
  usePerformanceMeasure,
  useDebounced,
  useBatchedUpdates,
} from "@/shared/hooks/usePerformanceOptimizations";
import type {
  DashboardWidget,
  WidgetType,
  DashboardMetric,
  ActivityItem as ActivityItemType,
  MetricCategory,
} from "@/entities/dashboard";

interface DashboardPageProps {
  // Для будущего расширения
}

/**
 * Dashboard Page - Context7 Design System Implementation
 * Features: 8px grid system, smooth 60fps animations, collision-free layouts, mobile-first responsive design
 */
const DashboardPage = memo<DashboardPageProps>(() => {
  // Performance monitoring
  useRenderTracker("DashboardPage");
  usePerformanceMeasure("DashboardPage");

  // Hooks and services
  const t = i18n.t;
  const muiTheme = useTheme();
  const themeMode = useThemeMode();
  const { mode: globalLayoutMode, setMode: setGlobalLayoutMode } =
    useLayoutMode();
  const { isLoading: globalLoading } = useLoadingState();
  const queryClient = useQueryClient();

  // Local state with batched updates for performance
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localLayoutMode, setLocalLayoutMode] = useState<"grid" | "list">(
    globalLayoutMode === "grid" ? "grid" : "list"
  );
  const [refreshing, setRefreshing] = useState(false);

  // Batched updates for better performance
  const [batchedState, updateBatchedState] = useBatchedUpdates({
    isFullscreen: false,
    refreshing: false,
  });

  // Queries
  const {
    data: overview,
    isLoading,
    error,
    isError,
    isFetching,
  } = useDashboardOverview();

  const refreshMutation = useRefreshDashboard({
    onMutate: () => setRefreshing(true),
    onSettled: () => setRefreshing(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });

  // Event handlers
  const handleRefresh = useCallback(() => {
    refreshMutation.mutate();
  }, [refreshMutation]);

  const handleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleLayoutModeChange = useCallback(() => {
    const newMode = localLayoutMode === "grid" ? "list" : "grid";
    setLocalLayoutMode(newMode);
    setGlobalLayoutMode(newMode);
  }, [localLayoutMode, setGlobalLayoutMode]);

  const handleMetricClick = useCallback((metric: any) => {
    // Handle metric click - navigate to detailed view
    console.log("Metric clicked:", metric);
  }, []);

  const handleActivityClick = useCallback((activity: ActivityItemType) => {
    // Handle activity click - navigate to activity detail
    console.log("Activity clicked:", activity);
  }, []);

  // Context7 Design System - 8px grid spacing
  const spacing = useMemo(
    () => ({
      xs: 8, // 8px
      sm: 16, // 16px
      md: 24, // 24px
      lg: 32, // 32px
      xl: 40, // 40px
      xxl: 48, // 48px
    }),
    []
  );

  // Context7 Animation System
  const animations = useMemo(
    () => ({
      // Fast micro-interactions
      fast: {
        duration: 150,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Material Design standard
      },
      // Standard transitions
      standard: {
        duration: 300,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
      // Complex animations
      complex: {
        duration: 500,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
      // Entrance animations
      entrance: {
        duration: 400,
        easing: "cubic-bezier(0.0, 0.0, 0.2, 1)",
      },
    }),
    []
  );

  // Memoized computed values
  const isCompactMode = useMemo(
    () => localLayoutMode === "list",
    [localLayoutMode]
  );
  const gridSpacing = useMemo(
    () => (isCompactMode ? spacing.sm : spacing.md),
    [isCompactMode, spacing]
  );
  const containerSpacing = useMemo(
    () => (isCompactMode ? spacing.lg : spacing.xl),
    [isCompactMode, spacing]
  );

  // Context7 Color System
  const colors = useMemo(
    () => ({
      surface: {
        primary: muiTheme.palette.background.paper,
        secondary: alpha(muiTheme.palette.background.paper, 0.6),
        elevated: alpha(muiTheme.palette.background.paper, 0.9),
      },
      accent: {
        primary: muiTheme.palette.primary.main,
        secondary: muiTheme.palette.secondary.main,
        success: muiTheme.palette.success.main,
        warning: muiTheme.palette.warning.main,
        error: muiTheme.palette.error.main,
        info: muiTheme.palette.info.main,
      },
      elevation: {
        subtle: `0 2px 8px ${alpha(muiTheme.palette.common.black, 0.04)}`,
        medium: `0 4px 16px ${alpha(muiTheme.palette.common.black, 0.08)}`,
        high: `0 8px 32px ${alpha(muiTheme.palette.common.black, 0.12)}`,
        extreme: `0 16px 64px ${alpha(muiTheme.palette.common.black, 0.16)}`,
      },
    }),
    [muiTheme.palette]
  );

  // Loading state with Context7 design
  if (isLoading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            minHeight: "100vh",
            background: `linear-gradient(135deg, 
              ${alpha(colors.accent.primary, 0.02)} 0%, 
              ${alpha(colors.accent.secondary, 0.015)} 50%,
              ${alpha(colors.accent.success, 0.01)} 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Context7 Loading Animation */}
          <Box
            sx={{
              position: "absolute",
              top: -200,
              right: -200,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: `radial-gradient(circle, 
                ${alpha(colors.accent.primary, 0.06)} 0%, 
                transparent 70%)`,
              animation: "contextFloat 8s ease-in-out infinite",
              "@keyframes contextFloat": {
                "0%, 100%": {
                  transform: "translateY(0px) scale(1)",
                  opacity: 0.6,
                },
                "50%": {
                  transform: "translateY(-20px) scale(1.05)",
                  opacity: 0.8,
                },
              },
            }}
          />

          <Container
            maxWidth="xl"
            sx={{
              py: containerSpacing / 8,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack spacing={gridSpacing / 8}>
              {/* Header Skeleton with Context7 design */}
              <Box sx={{ mb: spacing.lg / 8 }}>
                <Skeleton
                  variant="text"
                  width="min(400px, 80vw)"
                  height={64}
                  sx={{
                    borderRadius: spacing.xs / 8,
                    transform: "scale(1)",
                    animation: "contextPulse 2s ease-in-out infinite",
                    "@keyframes contextPulse": {
                      "0%, 100%": { opacity: 0.3 },
                      "50%": { opacity: 0.6 },
                    },
                  }}
                />
                <Skeleton
                  variant="text"
                  width="min(600px, 90vw)"
                  height={24}
                  sx={{
                    mt: spacing.xs / 8,
                    borderRadius: spacing.xs / 8,
                    animation: "contextPulse 2s ease-in-out infinite 0.3s",
                  }}
                />
              </Box>

              {/* Stats Skeleton Grid */}
              <Grid container spacing={gridSpacing / 8}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} lg={3} key={i}>
                    <Skeleton
                      variant="rectangular"
                      height={isCompactMode ? 120 : 160}
                      sx={{
                        borderRadius: spacing.sm / 8,
                        animation: `contextSlideIn 0.6s ease-out ${
                          i * 0.1
                        }s both`,
                        "@keyframes contextSlideIn": {
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
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Content Skeleton */}
              <Grid container spacing={gridSpacing / 8}>
                <Grid item xs={12} lg={8}>
                  <Skeleton
                    variant="rectangular"
                    height={isCompactMode ? 300 : 400}
                    sx={{
                      borderRadius: spacing.sm / 8,
                      animation: "contextSlideIn 0.6s ease-out 0.5s both",
                    }}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Skeleton
                    variant="rectangular"
                    height={isCompactMode ? 300 : 400}
                    sx={{
                      borderRadius: spacing.sm / 8,
                      animation: "contextSlideIn 0.6s ease-out 0.6s both",
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </Box>
      </DashboardLayout>
    );
  }

  // Error state with Context7 design
  if (isError) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            minHeight: "100vh",
            background: `linear-gradient(135deg, 
              ${alpha(colors.accent.error, 0.02)} 0%, 
              ${alpha(colors.accent.error, 0.005)} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: spacing.md / 8,
          }}
        >
          <Container maxWidth="md">
            <Paper
              elevation={0}
              sx={{
                p: spacing.xl / 8,
                borderRadius: spacing.md / 8,
                textAlign: "center",
                background: colors.surface.elevated,
                border: `1px solid ${alpha(colors.accent.error, 0.1)}`,
                backdropFilter: "blur(20px)",
                boxShadow: colors.elevation.high,
                animation: "contextErrorIn 0.5s ease-out",
                "@keyframes contextErrorIn": {
                  "0%": {
                    opacity: 0,
                    transform: "scale(0.9) translateY(20px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "scale(1) translateY(0)",
                  },
                },
              }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: spacing.sm / 8,
                  border: `1px solid ${alpha(colors.accent.error, 0.2)}`,
                  background: `linear-gradient(135deg, 
                    ${alpha(colors.accent.error, 0.05)} 0%, 
                    ${alpha(colors.accent.error, 0.02)} 100%)`,
                  "& .MuiAlert-icon": {
                    fontSize: 32,
                  },
                }}
                action={
                  <IconButton
                    color="inherit"
                    size="large"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                      borderRadius: spacing.sm / 8,
                      transition: `all ${animations.fast.duration}ms ${animations.fast.easing}`,
                      "&:hover": {
                        transform: "scale(1.05)",
                        background: alpha(colors.accent.error, 0.1),
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                }
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {t("errors.loadingError")}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {error?.message || "Неизвестная ошибка"}
                </Typography>
              </Alert>
            </Paper>
          </Container>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Context7 Gradient Background System */}
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, 
            ${alpha(colors.accent.primary, 0.025)} 0%, 
            ${alpha(colors.accent.secondary, 0.015)} 25%,
            ${alpha(colors.accent.success, 0.02)} 50%,
            ${alpha(colors.accent.info, 0.015)} 75%,
            ${alpha(colors.accent.primary, 0.01)} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Context7 Floating Elements */}
        <Box
          sx={{
            position: "absolute",
            top: -300,
            right: -300,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, 
              ${alpha(colors.accent.primary, 0.06)} 0%, 
              transparent 70%)`,
            animation: "contextPrimaryFloat 12s ease-in-out infinite",
            "@keyframes contextPrimaryFloat": {
              "0%, 100%": {
                transform: "translateY(0px) rotate(0deg) scale(1)",
                opacity: 0.4,
              },
              "50%": {
                transform: "translateY(-40px) rotate(180deg) scale(1.1)",
                opacity: 0.6,
              },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -200,
            left: -200,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, 
              ${alpha(colors.accent.secondary, 0.04)} 0%, 
              transparent 70%)`,
            animation: "contextSecondaryFloat 15s ease-in-out infinite reverse",
            "@keyframes contextSecondaryFloat": {
              "0%, 100%": {
                transform: "translateX(0px) scale(1)",
                opacity: 0.3,
              },
              "50%": {
                transform: "translateX(30px) scale(1.15)",
                opacity: 0.5,
              },
            },
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            py: containerSpacing / 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Context7 Hero Header */}
          <Fade in timeout={animations.entrance.duration}>
            <Box mb={spacing.xl / 8}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={spacing.md / 8}
                mb={spacing.md / 8}
              >
                {/* Title Section with Context7 Typography */}
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: {
                        xs: "2rem",
                        sm: "2.5rem",
                        md: "3rem",
                        lg: "3.5rem",
                      },
                      lineHeight: { xs: 1.2, md: 1.1 },
                      background: `linear-gradient(135deg, 
                        ${colors.accent.primary} 0%, 
                        ${colors.accent.secondary} 50%,
                        ${colors.accent.success} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: spacing.xs / 8,
                      letterSpacing: "-0.02em",
                      animation: "contextTitleIn 0.8s ease-out",
                      "@keyframes contextTitleIn": {
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
                    {t("dashboard.title", "Dashboard")}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: muiTheme.palette.text.secondary,
                      fontWeight: 400,
                      maxWidth: { xs: "100%", md: 600 },
                      lineHeight: 1.6,
                      opacity: 0.9,
                      animation: "contextSubtitleIn 0.8s ease-out 0.2s both",
                      "@keyframes contextSubtitleIn": {
                        "0%": {
                          opacity: 0,
                          transform: "translateY(20px)",
                        },
                        "100%": {
                          opacity: 0.9,
                          transform: "translateY(0)",
                        },
                      },
                    }}
                  >
                    {t(
                      "dashboard.subtitle",
                      "Welcome back! Here's what's happening with your projects."
                    )}
                  </Typography>
                </Box>

                {/* Context7 Action Controls */}
                <Stack
                  direction="row"
                  spacing={spacing.sm / 8}
                  sx={{
                    animation: "contextActionsIn 0.8s ease-out 0.4s both",
                    "@keyframes contextActionsIn": {
                      "0%": {
                        opacity: 0,
                        transform: "translateX(20px)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "translateX(0)",
                      },
                    },
                  }}
                >
                  {[
                    {
                      icon:
                        localLayoutMode === "grid" ? (
                          <ViewQuilt />
                        ) : (
                          <ViewModule />
                        ),
                      onClick: handleLayoutModeChange,
                      tooltip: t("dashboard.layoutMode"),
                      color: colors.accent.primary,
                    },
                    {
                      icon: <Refresh />,
                      onClick: handleRefresh,
                      tooltip: t("common.refresh"),
                      color: colors.accent.success,
                      disabled: refreshing || isFetching,
                      loading: refreshing,
                    },
                    {
                      icon: isFullscreen ? <FullscreenExit /> : <Fullscreen />,
                      onClick: handleFullscreen,
                      tooltip: isFullscreen
                        ? t("common.exitFullscreen")
                        : t("common.fullscreen"),
                      color: colors.accent.info,
                    },
                  ].map((action, index) => (
                    <Tooltip key={index} title={action.tooltip}>
                      <Box>
                        <IconButton
                          onClick={action.onClick}
                          disabled={action.disabled}
                          sx={{
                            width: { xs: 48, md: 56 },
                            height: { xs: 48, md: 56 },
                            borderRadius: spacing.sm / 8,
                            border: `1px solid ${alpha(action.color, 0.15)}`,
                            background: `linear-gradient(135deg, 
                              ${colors.surface.elevated} 0%, 
                              ${alpha(colors.surface.elevated, 0.8)} 100%)`,
                            backdropFilter: "blur(20px)",
                            boxShadow: colors.elevation.subtle,
                            transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,
                            color: action.color,

                            "&:hover": {
                              transform: "translateY(-2px) scale(1.02)",
                              boxShadow: `${
                                colors.elevation.medium
                              }, 0 0 20px ${alpha(action.color, 0.2)}`,
                              borderColor: alpha(action.color, 0.3),
                              background: `linear-gradient(135deg, 
                                ${colors.surface.elevated} 0%, 
                                ${alpha(action.color, 0.05)} 100%)`,
                            },

                            "&:active": {
                              transform: "translateY(0) scale(0.98)",
                              transition: `all ${animations.fast.duration}ms ${animations.fast.easing}`,
                            },

                            ...(action.loading && {
                              animation: "contextSpin 1s linear infinite",
                              "@keyframes contextSpin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" },
                              },
                            }),
                          }}
                        >
                          {action.icon}
                        </IconButton>
                      </Box>
                    </Tooltip>
                  ))}
                </Stack>
              </Stack>

              {/* Context7 Status Indicators */}
              <Stack
                direction="row"
                spacing={spacing.sm / 8}
                flexWrap="wrap"
                gap={spacing.xs / 8}
                sx={{
                  animation: "contextChipsIn 0.8s ease-out 0.6s both",
                  "@keyframes contextChipsIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(15px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                {[
                  {
                    icon: <TrendingUp />,
                    label: t("dashboard.upToDate"),
                    color: colors.accent.success,
                  },
                  {
                    icon: <Speed />,
                    label: `${overview?.stats?.activeProjects || 0} ${t(
                      "dashboard.activeProjects"
                    )}`,
                    color: colors.accent.primary,
                  },
                  {
                    icon: <Update />,
                    label: t("dashboard.lastUpdate", "Last updated 2 min ago"),
                    color: muiTheme.palette.text.secondary,
                  },
                ].map((chip, index) => (
                  <Chip
                    key={index}
                    icon={chip.icon}
                    label={chip.label}
                    size="medium"
                    sx={{
                      borderRadius: spacing.sm / 8,
                      px: spacing.sm / 8,
                      py: spacing.xs / 8,
                      height: 36,
                      background: `linear-gradient(135deg, 
                        ${alpha(chip.color, 0.1)} 0%, 
                        ${alpha(chip.color, 0.05)} 100%)`,
                      border: `1px solid ${alpha(chip.color, 0.2)}`,
                      color: chip.color,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      transition: `all ${animations.fast.duration}ms ${animations.fast.easing}`,

                      "& .MuiChip-icon": {
                        color: chip.color,
                        fontSize: 18,
                      },

                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: `0 4px 12px ${alpha(chip.color, 0.2)}`,
                        borderColor: alpha(chip.color, 0.3),
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Fade>

          {/* Context7 Grid Layout System */}
          <Grid container spacing={gridSpacing}>
            {/* Key Metrics - Full Width */}
            <Grid item xs={12}>
              <Fade
                in
                timeout={animations.entrance.duration}
                style={{ transitionDelay: "100ms" }}
              >
                <Box
                  sx={{
                    animation: "contextMetricsIn 0.8s ease-out 0.1s both",
                    "@keyframes contextMetricsIn": {
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
                  <DashboardStatsWidget
                    variant={isCompactMode ? "compact" : "detailed"}
                    onMetricClick={handleMetricClick}
                    showExport
                    showRefresh
                  />
                </Box>
              </Fade>
            </Grid>

            {/* Main Content Area */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={gridSpacing / 8}>
                {/* Quick Actions */}
                <Fade
                  in
                  timeout={animations.entrance.duration}
                  style={{ transitionDelay: "200ms" }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: spacing.md / 8, md: spacing.lg / 8 },
                      borderRadius: spacing.md / 8,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.06
                      )}`,
                      background: colors.surface.elevated,
                      backdropFilter: "blur(20px)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: colors.elevation.medium,
                      transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,

                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: colors.elevation.high,
                      },

                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, 
                          ${colors.accent.primary} 0%, 
                          ${colors.accent.secondary} 50%,
                          ${colors.accent.success} 100%)`,
                      },

                      animation:
                        "contextQuickActionsIn 0.8s ease-out 0.2s both",
                      "@keyframes contextQuickActionsIn": {
                        "0%": {
                          opacity: 0,
                          transform: "translateY(30px) translateX(-10px)",
                        },
                        "100%": {
                          opacity: 1,
                          transform: "translateY(0) translateX(0)",
                        },
                      },
                    }}
                  >
                    <QuickActionsWidget
                      variant={isCompactMode ? "compact" : "detailed"}
                      maxActions={isCompactMode ? 4 : 8}
                      showCategories={!isCompactMode}
                      showShortcuts={!isCompactMode}
                      showFavorites
                    />
                  </Paper>
                </Fade>

                {/* Project Overview */}
                <Fade
                  in
                  timeout={animations.entrance.duration}
                  style={{ transitionDelay: "300ms" }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: spacing.md / 8, md: spacing.lg / 8 },
                      borderRadius: spacing.md / 8,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.06
                      )}`,
                      background: colors.surface.elevated,
                      backdropFilter: "blur(20px)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: colors.elevation.medium,
                      transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,

                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: colors.elevation.high,
                      },

                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, 
                          ${colors.accent.info} 0%, 
                          ${colors.accent.warning} 100%)`,
                      },

                      animation: "contextProjectIn 0.8s ease-out 0.3s both",
                      "@keyframes contextProjectIn": {
                        "0%": {
                          opacity: 0,
                          transform: "translateY(30px) translateX(-15px)",
                        },
                        "100%": {
                          opacity: 1,
                          transform: "translateY(0) translateX(0)",
                        },
                      },
                    }}
                  >
                    <ProjectOverviewWidget />
                  </Paper>
                </Fade>
              </Stack>
            </Grid>

            {/* Sidebar Content */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={gridSpacing / 8}>
                {/* Recent Activity */}
                <Fade
                  in
                  timeout={animations.entrance.duration}
                  style={{ transitionDelay: "400ms" }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: spacing.md / 8, md: spacing.lg / 8 },
                      borderRadius: spacing.md / 8,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.06
                      )}`,
                      background: colors.surface.elevated,
                      backdropFilter: "blur(20px)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: colors.elevation.medium,
                      transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,

                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: colors.elevation.high,
                      },

                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, 
                          ${colors.accent.secondary} 0%, 
                          ${colors.accent.error} 100%)`,
                      },

                      animation: "contextActivityIn 0.8s ease-out 0.4s both",
                      "@keyframes contextActivityIn": {
                        "0%": {
                          opacity: 0,
                          transform: "translateY(30px) translateX(15px)",
                        },
                        "100%": {
                          opacity: 1,
                          transform: "translateY(0) translateX(0)",
                        },
                      },
                    }}
                  >
                    <ActivityFeedWidget
                      variant={isCompactMode ? "compact" : "detailed"}
                      maxItems={isCompactMode ? 5 : 8}
                      showFilters={!isCompactMode}
                      showSearch={!isCompactMode}
                      autoRefresh
                      refreshInterval={30000}
                      onActivityClick={handleActivityClick}
                    />
                  </Paper>
                </Fade>

                {/* System Health */}
                <Fade
                  in
                  timeout={animations.entrance.duration}
                  style={{ transitionDelay: "500ms" }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: spacing.md / 8, md: spacing.lg / 8 },
                      borderRadius: spacing.md / 8,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.06
                      )}`,
                      background: colors.surface.elevated,
                      backdropFilter: "blur(20px)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: colors.elevation.medium,
                      transition: `all ${animations.standard.duration}ms ${animations.standard.easing}`,

                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: colors.elevation.high,
                      },

                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, 
                          ${colors.accent.success} 0%, 
                          ${colors.accent.info} 100%)`,
                      },

                      animation: "contextHealthIn 0.8s ease-out 0.5s both",
                      "@keyframes contextHealthIn": {
                        "0%": {
                          opacity: 0,
                          transform: "translateY(30px) translateX(20px)",
                        },
                        "100%": {
                          opacity: 1,
                          transform: "translateY(0) translateX(0)",
                        },
                      },
                    }}
                  >
                    <SystemHealthWidget />
                  </Paper>
                </Fade>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DashboardLayout>
  );
});

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
