import React, { memo, useMemo, useCallback, startTransition } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import { Speed, TrendingUp, Cached, Memory } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

import {
  useDashboardStats,
  useQuickActions,
  useSystemHealth,
  usePrefetchDashboard,
  useInvalidateDashboard,
} from "../model/queries";
import { DashboardStats } from "@/entities";
import {
  useRenderTracker,
  usePerformanceMeasure,
} from "@/shared/hooks/usePerformanceOptimizations";
import i18n from "@/shared/lib/i18n";
import { ActivityType, MetricCategory } from "@/entities/dashboard";

interface PerformanceMetric {
  name: string;
  value: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

interface DashboardPerformanceOptimizationsProps {
  className?: string;
}

/**
 * Компонент демонстрирующий лучшие практики производительности TanStack Query:
 * - Query keys factories для типизации
 * - Optimistic updates в мутациях
 * - Prefetching для улучшения UX
 * - Selective invalidation
 * - Background refetching
 * - Stale while revalidate pattern
 * - React transitions для non-urgent updates
 */
export const DashboardPerformanceOptimizations =
  memo<DashboardPerformanceOptimizationsProps>(({ className }) => {
    useRenderTracker("DashboardPerformanceOptimizations");
    usePerformanceMeasure("DashboardPerformanceOptimizations");
    const { t } = i18n;
    const theme = useTheme();
    const queryClient = useQueryClient();

    // Prefetch hooks для proactive data loading
    const { prefetchStats, prefetchActivity } = usePrefetchDashboard();

    // Invalidation hooks для selective cache invalidation
    const { invalidateStats, invalidateQuickActions } =
      useInvalidateDashboard();

    // Queries с оптимизированными настройками
    const statsQuery = useDashboardStats(
      { category: ["performance"], period: "24h" },
      {
        // Более агрессивное кэширование для performance metrics
        staleTime: 2 * 60 * 1000, // 2 минуты
        gcTime: 10 * 60 * 1000, // 10 минут

        // Background refetching для актуальных данных
        refetchInterval: 30 * 1000, // Каждые 30 секунд
        refetchIntervalInBackground: false, // Не в фоне

        // Select для оптимизации re-renders
        select: useCallback(
          (data: DashboardStats) => ({
            ...data,
            // Кастомная обработка данных
            performanceScore: Math.round(
              ((data.totalProjects ?? 0) * 85) / 100
            ),
          }),
          []
        ),
      }
    );

    const quickActionsQuery = useQuickActions({
      // Долгое кэширование для relatively static data
      staleTime: 15 * 60 * 1000, // 15 минут
      gcTime: 60 * 60 * 1000, // 1 час
    });

    const systemHealthQuery = useSystemHealth({
      // Короткое кэширование для real-time data
      staleTime: 30 * 1000, // 30 секунд
      refetchInterval: 15 * 1000, // Каждые 15 секунд
    });

    // Performance metrics вычисляются memoized
    const performanceMetrics = useMemo((): PerformanceMetric[] => {
      const cacheKeys = queryClient.getQueryCache().getAll().length;
      const activeQueries = queryClient
        .getQueryCache()
        .getAll()
        .filter((query) => query.state.fetchStatus !== "idle").length;

      return [
        {
          name: "Query Cache Size",
          value: `${cacheKeys} keys`,
          description: "Количество закэшированных запросов",
          color: theme.palette.primary.main,
          icon: <Memory />,
        },
        {
          name: "Active Queries",
          value: `${activeQueries}`,
          description: "Активных запросов в данный момент",
          color: theme.palette.info.main,
          icon: <Cached />,
        },
        {
          name: "Performance Score",
          value: `${statsQuery.data?.totalProjects ?? 0}%`,
          description: "Общий показатель производительности",
          color: theme.palette.success.main,
          icon: <TrendingUp />,
        },
        {
          name: "Health Status",
          value: systemHealthQuery.data?.status ?? "Loading...",
          description: "Состояние системы в реальном времени",
          color:
            systemHealthQuery.data?.status === "healthy"
              ? theme.palette.success.main
              : theme.palette.warning.main,
          icon: <Speed />,
        },
      ];
    }, [
      queryClient,
      statsQuery.data?.totalProjects,
      systemHealthQuery.data?.status,
      theme.palette,
    ]);

    // Optimized event handlers с useCallback
    const handlePrefetchOnHover = useCallback(() => {
      // Prefetch данные при hover для мгновенной загрузки
      startTransition(() => {
        prefetchStats({
          category: [
            MetricCategory.PROJECTS,
            MetricCategory.REQUIREMENTS,
            MetricCategory.PERFORMANCE,
            MetricCategory.SYSTEM,
          ],
          period: [
            {
              labels: ["7d"],
              datasets: [],
            },
          ],
        });
        prefetchActivity({
          type: [ActivityType.PROJECT_UPDATED],
        });
      });
    }, [prefetchStats, prefetchActivity]);

    const handleSelectiveInvalidation = useCallback(() => {
      // Селективная invalidation instead of full cache clear
      startTransition(() => {
        invalidateStats();
        invalidateQuickActions();
      });
    }, [invalidateStats, invalidateQuickActions]);

    const handleBackgroundRefresh = useCallback(() => {
      // Background refetch без блокировки UI
      startTransition(() => {
        statsQuery.refetch();
        systemHealthQuery.refetch();
      });
    }, [statsQuery.refetch, systemHealthQuery.refetch]);

    return (
      <Box className={className} sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t("dashboard.performanceOptimizationsTitle")}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title={t("dashboard.performanceOptimizationsTooltip")}>
              <IconButton
                size="small"
                onMouseEnter={handlePrefetchOnHover}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                <Memory />
              </IconButton>
            </Tooltip>

            <Tooltip title={t("dashboard.performanceOptimizationsTooltip")}>
              <IconButton
                size="small"
                onClick={handleSelectiveInvalidation}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                <Cached />
              </IconButton>
            </Tooltip>

            <Tooltip title={t("dashboard.performanceOptimizationsTooltip")}>
              <IconButton
                size="small"
                onClick={handleBackgroundRefresh}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                <TrendingUp />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Performance Metrics Display */}
        <Stack spacing={2}>
          {performanceMetrics.map((metric) => (
            <Box
              key={metric.name}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(metric.color, 0.02),
                transition: "all 0.2s ease",
                "&:hover": {
                  background: alpha(metric.color, 0.05),
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: alpha(metric.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: metric.color,
                  }}
                >
                  {metric.icon}
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {metric.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: metric.color,
                  }}
                >
                  {metric.value}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>

        {/* Query Status Information */}
        <Box mt={3}>
          <Alert severity="info" icon={<Speed />}>
            <Typography variant="body2">
              <strong>{t("dashboard.performanceOptimizationsTips")}</strong>
              <br />• {t("dashboard.performanceOptimizationsTips1")}
              <br />• {t("dashboard.performanceOptimizationsTips2")}
              <br />• {t("dashboard.performanceOptimizationsTips3")}
              <br />• {t("dashboard.performanceOptimizationsTips4")}
              <br />• {t("dashboard.performanceOptimizationsTips5")}
            </Typography>
          </Alert>
        </Box>

        {/* Loading States */}
        <Stack direction="row" spacing={1} mt={2}>
          {statsQuery.isFetching && (
            <Chip
              label={t("dashboard.statsLoading")}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {systemHealthQuery.isFetching && (
            <Chip
              label={t("dashboard.healthLoading")}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
          {quickActionsQuery.isFetching && (
            <Chip
              label={t("dashboard.quickActionsLoading")}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>
    );
  });

DashboardPerformanceOptimizations.displayName =
  "DashboardPerformanceOptimizations";
