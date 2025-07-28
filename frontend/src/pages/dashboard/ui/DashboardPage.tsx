import { memo, useCallback, useMemo } from "react";
import {
  Alert,
  Fab,
  Fade,
  IconButton,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Collapse,
  Skeleton,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  ViewQuilt as MasonryIcon,
  FullscreenExit as ExitFullscreenIcon,
  Fullscreen as FullscreenIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

// Shared imports
import { ErrorBoundary, LazyWidget } from "@/shared/ui";

// Dashboard context
import { DashboardProvider, useDashboard } from "../context/DashboardContext";
import type { DashboardLayoutType } from "@/shared/types/dashboard";
import {
  dashboardKeys,
  useDashboardOverview,
  useDashboardStats,
  useQuickActions,
  useSystemHealth,
} from "@/features/dashboard";
import { DashboardStatsWidget } from "@/widgets/dashboard-stats";
import { SystemHealthWidget } from "@/widgets/system-health";
import { ProjectOverviewWidget } from "@/widgets/project-overview";
import { QuickActionsWidget } from "@/widgets/quick-actions";
import { ActivityFeedWidget } from "@/widgets/activity-feed";

/**
 * Основной контейнер дашборда с правильным управлением scroll
 */
const DashboardScrollContainer = memo(
  ({ children }: { children: React.ReactNode }) => {
    const theme = useTheme();
    const { state } = useDashboard();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
      <Container
        maxWidth={state.mode === "fullscreen" ? false : "xl"}
        disableGutters={true}
        sx={{
          // Context7: Правильное управление scroll без конфликтов
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Предотвращаем scroll на уровне container
          // Context7: Убираем все padding и margin
          padding: 0,
          margin: 0,
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
          // Добавляем контролируемые отступы только для контента
          "& > *": {
            px: state.mode === "fullscreen" ? 0 : { xs: 2, sm: 3 },
            py: state.mode === "fullscreen" ? 0 : { xs: 1, sm: 2 },
          },
        }}
      >
        {/* Scrollable content area */}
        <Box
          sx={{
            // Context7: Убираем все отступы из scrollable области
            padding: 0,
            margin: 0,
            flexGrow: 1,
            overflow: "auto", // Только здесь разрешаем scroll
            width: "100%",
            // Context7: Оптимизация scroll performance
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              background:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              background:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(0,0,0,0.3)",
              borderRadius: 4,
              "&:hover": {
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(0,0,0,0.5)",
              },
            },
            // Предотвращаем scroll on touch devices если не нужен
            overscrollBehavior: "contain",
            // Context7: Добавляем отступы для содержимого через дочерние элементы
            "& > *": {
              px: state.mode === "fullscreen" ? 0 : { xs: 2, sm: 3 },
              py: state.mode === "fullscreen" ? 0 : { xs: 1, sm: 2 },
            },
          }}
        >
          {children}
        </Box>
      </Container>
    );
  }
);

DashboardScrollContainer.displayName = "DashboardScrollContainer";

/**
 * Заголовок дашборда с действиями
 */
const DashboardHeader = memo(() => {
  const { state, setLayout, setMode, setRefreshing, setError } = useDashboard();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Обработчик обновления всех данных
  const handleRefreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    } catch (error) {
      console.error("Ошибка при обновлении дашборда:", error);
      setError(true, "Не удалось обновить данные дашборда");
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, setRefreshing, setError]);

  // Обработчики переключения layout
  const handleLayoutChange = useCallback(
    (newLayout: DashboardLayoutType) => {
      setLayout(newLayout);
    },
    [setLayout]
  );

  const toggleFullscreen = useCallback(() => {
    setMode(state.mode === "fullscreen" ? "detailed" : "fullscreen");
  }, [state.mode, setMode]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: { xs: 2, md: 3 },
        flexWrap: isMobile ? "wrap" : "nowrap",
        gap: 2,
      }}
    >
      {/* Заголовок */}
      <Box sx={{ minWidth: 0 }}>
        <Box
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontWeight: 700,
            margin: 0,
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          Дашборд
        </Box>
        <Box
          component="p"
          sx={{
            fontSize: "0.875rem",
            color: "text.secondary",
            margin: 0,
            mt: 0.5,
          }}
        >
          Обзор системы и ключевые показатели
        </Box>
      </Box>

      {/* Действия */}
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        {/* Layout controls - скрываем на мобильных */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              onClick={() => handleLayoutChange("grid")}
              color={state.layout === "grid" ? "primary" : "default"}
              size="small"
              title="Сеточный вид"
              sx={{
                transition: "all 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <GridIcon />
            </IconButton>
            <IconButton
              onClick={() => handleLayoutChange("list")}
              color={state.layout === "list" ? "primary" : "default"}
              size="small"
              title="Списочный вид"
              sx={{
                transition: "all 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <ListIcon />
            </IconButton>
            <IconButton
              onClick={() => handleLayoutChange("masonry")}
              color={state.layout === "masonry" ? "primary" : "default"}
              size="small"
              title="Масонри вид"
              sx={{
                transition: "all 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <MasonryIcon />
            </IconButton>
          </Box>
        )}

        {/* Fullscreen toggle */}
        <IconButton
          onClick={toggleFullscreen}
          color={state.mode === "fullscreen" ? "primary" : "default"}
          size="small"
          title={
            state.mode === "fullscreen"
              ? "Выйти из полноэкранного режима"
              : "Полноэкранный режим"
          }
          sx={{
            transition: "all 0.2s ease-in-out",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          {state.mode === "fullscreen" ? (
            <ExitFullscreenIcon />
          ) : (
            <FullscreenIcon />
          )}
        </IconButton>

        {/* Refresh button */}
        <IconButton
          onClick={handleRefreshAll}
          disabled={state.isRefreshing}
          size="small"
          title="Обновить дашборд"
          sx={{
            transition: "all 0.2s ease-in-out",
            "&:hover": { transform: "scale(1.05)" },
            ...(state.isRefreshing && {
              animation: "rotation 1s linear infinite",
              "@keyframes rotation": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }),
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
    </Box>
  );
});

DashboardHeader.displayName = "DashboardHeader";

/**
 * Сетка виджетов с адаптивным layout
 */
const DashboardWidgetGrid = memo(() => {
  const { state, spacing } = useDashboard();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  // Widget loading skeleton
  const WidgetSkeleton = memo(() => (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
    </Box>
  ));

  // Адаптивная сетка на основе layout mode
  const getGridStyles = useMemo(() => {
    const baseGap = isMobile ? 16 : 24; // Используем константы вместо spacing.sm/md

    switch (state.layout) {
      case "list":
        return {
          display: "flex",
          flexDirection: "column" as const,
          gap: baseGap / 8,
        };
      case "masonry":
        return {
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: baseGap / 8,
          alignItems: "start",
        };
      default: // grid
        return {
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: baseGap / 8,
        };
    }
  }, [state.layout, isMobile]);

  return (
    <Box
      sx={{
        ...getGridStyles,
        // Context7: Плавный переход между layout modes
        transition: "all 0.3s ease-in-out",
        // Предотвращаем scroll внутри grid
        minHeight: 0,
      }}
    >
      {/* Dashboard Stats Widget */}
      <ErrorBoundary>
        <Fade in timeout={300} style={{ transitionDelay: "0ms" }}>
          <Box>
            {statsLoading ? (
              <WidgetSkeleton />
            ) : (
              <DashboardStatsWidget
                mode={state.mode}
                layout={state.layout}
                density={state.density}
                isDataLoading={statsLoading}
                dataError={statsError || undefined}
              />
            )}
          </Box>
        </Fade>
      </ErrorBoundary>

      {/* System Health Widget */}
      <ErrorBoundary>
        <Fade in timeout={300} style={{ transitionDelay: "100ms" }}>
          <Box>
            <LazyWidget name="Системное здоровье">
              {systemHealthLoading ? (
                <WidgetSkeleton />
              ) : (
                <SystemHealthWidget
                  mode={state.mode}
                  layout={state.layout}
                  density={state.density}
                  isDataLoading={systemHealthLoading}
                  dataError={systemHealthError}
                  onRefresh={refetchSystemHealth}
                />
              )}
            </LazyWidget>
          </Box>
        </Fade>
      </ErrorBoundary>

      {/* Project Overview */}
      <ErrorBoundary>
        <Fade in timeout={300} style={{ transitionDelay: "200ms" }}>
          <Box>
            <LazyWidget name="Обзор проектов">
              {overviewLoading ? (
                <WidgetSkeleton />
              ) : (
                <ProjectOverviewWidget
                  mode={state.mode}
                  layout={state.layout}
                  density={state.density}
                  projects={[]}
                  isDataLoading={overviewLoading}
                  dataError={overviewError}
                  maxProjects={state.mode === "minimal" ? 3 : 5}
                  onRefresh={refetchOverview}
                />
              )}
            </LazyWidget>
          </Box>
        </Fade>
      </ErrorBoundary>

      {/* Quick Actions */}
      <ErrorBoundary>
        <Fade in timeout={300} style={{ transitionDelay: "300ms" }}>
          <Box>
            <LazyWidget name="Быстрые действия">
              {quickActionsLoading ? (
                <WidgetSkeleton />
              ) : (
                <QuickActionsWidget
                  mode={state.mode}
                  layout={state.layout}
                  density={state.density}
                  actions={quickActions || []}
                  isDataLoading={quickActionsLoading}
                  dataError={quickActionsError}
                  onRefresh={refetchQuickActions}
                />
              )}
            </LazyWidget>
          </Box>
        </Fade>
      </ErrorBoundary>

      {/* Activity Feed */}
      <ErrorBoundary>
        <Fade in timeout={300} style={{ transitionDelay: "400ms" }}>
          <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
            <LazyWidget name="Лента активности">
              {overviewLoading ? (
                <WidgetSkeleton />
              ) : (
                <ActivityFeedWidget
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
              )}
            </LazyWidget>
          </Box>
        </Fade>
      </ErrorBoundary>
    </Box>
  );
});

DashboardWidgetGrid.displayName = "DashboardWidgetGrid";

/**
 * Основной компонент дашборда
 */
const DashboardContent = memo(() => {
  const { state, spacing } = useDashboard();
  const theme = useTheme();

  // Data queries для определения общего состояния
  const { error: overviewError } = useDashboardOverview();

  const { error: statsError } = useDashboardStats();

  const { error: systemHealthError } = useSystemHealth();

  const hasError = !!(overviewError || statsError || systemHealthError);

  return (
    <Box
      sx={{
        // Context7: Полная высота без overflow конфликтов
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden", // Предотвращаем scroll на root level
      }}
    >
      {/* Main dashboard content */}
      <DashboardScrollContainer>
        <DashboardHeader />

        {/* Error alert */}
        <Collapse in={state.hasError || hasError}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            {state.errorMessage || "Произошла ошибка при загрузке дашборда"}
          </Alert>
        </Collapse>

        {/* Widget grid */}
        <DashboardWidgetGrid />

        {/* Bottom spacing for FAB */}
        <Box sx={{ height: 80 }} />
      </DashboardScrollContainer>

      {/* Floating Action Button */}
      <Fade in={!state.isRefreshing} timeout={300}>
        <Fab
          color="primary"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: theme.zIndex.fab,
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <RefreshIcon />
        </Fab>
      </Fade>
    </Box>
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
