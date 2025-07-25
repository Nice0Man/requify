import { memo, useCallback, useMemo } from "react";
import { Grid, Alert, Fab, Fade, IconButton } from "@mui/material";
import {
  Refresh as RefreshIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  ViewQuilt as MasonryIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

// Shared imports
import { PageLayout, ErrorBoundary, LazyWidget } from "@/shared/ui";

// Dashboard features
import {
  EnhancedDashboardStatsWidget,
  useDashboardOverview,
  useDashboardStats,
  useSystemHealth,
  useQuickActions,
  dashboardKeys,
} from "@/features/dashboard";

// Lazy widgets для code splitting
import {
  LazyProjectOverviewWidget,
  LazyActivityFeedWidget,
  LazyQuickActionsWidget,
  LazySystemHealthWidget,
} from "@/widgets/lazy";

// Dashboard context
import {
  DashboardProvider,
  useDashboard,
  useDashboardWidgets,
} from "../context/DashboardContext";
import { useWidgetStyles } from "../styles/DashboardWidgetStyles";
import type { DashboardLayoutType } from "@/shared/types/dashboard";

/**
 * Основной компонент дашборда
 */
const DashboardContent = memo(() => {
  const queryClient = useQueryClient();
  const { state, setLayout, setRefreshing, setError, spacing } = useDashboard();

  const { visibleWidgets: _visibleWidgets } = useDashboardWidgets();

  // Получение стилей для контейнера
  const { containerStyles: _containerStyles } = useWidgetStyles({
    mode: state.mode,
    layout: state.layout,
    density: state.density,
  });

  // Data queries с интеграцией
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useDashboardOverview();

  const {
    data: _stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: _systemHealth,
    isLoading: systemHealthLoading,
    error: systemHealthError,
    refetch: refetchSystemHealth,
  } = useSystemHealth();

  const {
    data: quickActions,
    isLoading: quickActionsLoading,
    error: quickActionsError,
    refetch: refetchQuickActions,
  } = useQuickActions();

  // Общее состояние загрузки
  const isLoading = overviewLoading || statsLoading || systemHealthLoading;
  const hasError = !!(overviewError || statsError || systemHealthError);

  // Обработчик обновления всех данных
  const handleRefreshAll = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        refetchOverview(),
        refetchStats(),
        refetchSystemHealth(),
        refetchQuickActions(),
      ]);

      // Invalidate all dashboard queries
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    } catch (error) {
      console.error("Ошибка при обновлении дашборда:", error);
      setError(true, "Не удалось обновить данные дашборда");
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchOverview,
    refetchStats,
    refetchSystemHealth,
    refetchQuickActions,
    queryClient,
    setRefreshing,
    setError,
  ]);

  // Обработчики переключения layout
  const handleLayoutChange = useCallback(
    (newLayout: DashboardLayoutType) => {
      setLayout(newLayout);
    },
    [setLayout]
  );

  // Header actions
  const headerActions = useMemo(
    () => [
      <IconButton
        key="refresh"
        onClick={handleRefreshAll}
        disabled={state.isRefreshing}
        size="small"
        title="Обновить дашборд"
      >
        <RefreshIcon />
      </IconButton>,
      <IconButton
        key="grid-layout"
        onClick={() => handleLayoutChange("grid")}
        color={state.layout === "grid" ? "primary" : "default"}
        size="small"
        title="Сеточный вид"
      >
        <GridIcon />
      </IconButton>,
      <IconButton
        key="list-layout"
        onClick={() => handleLayoutChange("list")}
        color={state.layout === "list" ? "primary" : "default"}
        size="small"
        title="Списочный вид"
      >
        <ListIcon />
      </IconButton>,
      <IconButton
        key="masonry-layout"
        onClick={() => handleLayoutChange("masonry")}
        color={state.layout === "masonry" ? "primary" : "default"}
        size="small"
        title="Масонри вид"
      >
        <MasonryIcon />
      </IconButton>,
    ],
    [state.layout, state.isRefreshing, handleRefreshAll, handleLayoutChange]
  );

  // Если есть критическая ошибка
  if (hasError && !isLoading) {
    return (
      <PageLayout
        title="Дашборд"
        subtitle="Обзор системы и ключевые показатели"
        actions={headerActions}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          Произошла ошибка при загрузке дашборда. Попробуйте обновить страницу.
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Дашборд"
      subtitle="Обзор системы и ключевые показатели"
      actions={headerActions}
    >
      {/* Основной контент дашборда */}
      <ErrorBoundary>
        {state.hasError && (
          <Alert severity="error" sx={{ mb: spacing.container }}>
            {state.errorMessage || "Произошла ошибка"}
          </Alert>
        )}

        <Grid container spacing={spacing.grid}>
          {/* Enhanced Dashboard Stats Widget */}
          <Grid item xs={12} lg={8}>
            <ErrorBoundary>
              <EnhancedDashboardStatsWidget
                mode={state.mode}
                layout={state.layout}
                density={state.density}
                variant="detailed"
                showTrends={true}
                loading={statsLoading}
                error={statsError || undefined}
                onMetricClick={(metricId) => {
                  console.log("Metric clicked:", metricId);
                }}
              />
            </ErrorBoundary>
          </Grid>

          {/* System Health Widget */}
          <Grid item xs={12} lg={4}>
            <ErrorBoundary>
              <LazyWidget name="Системное здоровье">
                <LazySystemHealthWidget
                  mode={state.mode}
                  layout={state.layout}
                  density={state.density}
                  isDataLoading={systemHealthLoading}
                  dataError={systemHealthError}
                  onRefresh={refetchSystemHealth}
                />
              </LazyWidget>
            </ErrorBoundary>
          </Grid>

          {/* Project Overview */}
          <Grid item xs={12} md={6}>
            <ErrorBoundary>
              <LazyWidget name="Обзор проектов">
                <LazyProjectOverviewWidget
                  mode={state.mode}
                  layout={state.layout}
                  density={state.density}
                  projects={[]}
                  isDataLoading={overviewLoading}
                  dataError={overviewError}
                  maxProjects={state.mode === "minimal" ? 3 : 5}
                  onRefresh={refetchOverview}
                />
              </LazyWidget>
            </ErrorBoundary>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <ErrorBoundary>
              <LazyWidget name="Быстрые действия">
                <LazyQuickActionsWidget
                  mode={state.mode}
                  layout={state.layout}
                  density={state.density}
                  actions={quickActions || []}
                  isDataLoading={quickActionsLoading}
                  dataError={quickActionsError}
                  onRefresh={refetchQuickActions}
                />
              </LazyWidget>
            </ErrorBoundary>
          </Grid>

          {/* Activity Feed */}
          <Grid item xs={12}>
            <ErrorBoundary>
              <LazyWidget name="Лента активности">
                <LazyActivityFeedWidget
                  mode={state.mode}
                  layout={state.layout}
                  density={state.density}
                  data={overview?.recentActivity || []}
                  isDataLoading={overviewLoading}
                  dataError={overviewError}
                  maxItems={state.mode === "minimal" ? 5 : 10}
                  showFilters={state.mode !== "minimal"}
                  onRefresh={refetchOverview}
                />
              </LazyWidget>
            </ErrorBoundary>
          </Grid>
        </Grid>
      </ErrorBoundary>

      {/* Floating Action Button */}
      <Fade in={!state.isRefreshing} timeout={300}>
        <Fab
          color="primary"
          onClick={handleRefreshAll}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <RefreshIcon />
        </Fab>
      </Fade>
    </PageLayout>
  );
});

DashboardContent.displayName = "DashboardContent";

/**
 * Главная страница дашборда с провайдером контекста
 */
export const DashboardPage = memo(() => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
});

DashboardPage.displayName = "DashboardPage";
