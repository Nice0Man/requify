import React, { memo, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  alpha,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  useTheme,
  Fade,
  Grid,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Refresh,
  TrendingUp,
  Assessment,
  FolderOpen,
  Add,
  BarChart,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ProjectStatusDistribution,
  ProjectFilters,
} from "@/entities/project";
import { projectApi } from "@/entities/project";

interface ProjectStatsWidgetProps {
  className?: string;
  variant?: "default" | "minimal" | "detailed";
  showFilters?: boolean;
  showActions?: boolean;
  period?: "week" | "month" | "quarter" | "year";
}

// Empty state placeholder component
const EmptyStatePlaceholder = memo(() => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: "center",
        bgcolor: "background.default",
        border: "2px dashed",
        borderColor: "divider",
        borderRadius: 2,
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <FolderOpen
        sx={{
          fontSize: 48,
          color: "text.disabled",
          mb: 1,
        }}
      />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t("projects.stats.empty.title", "Нет данных для статистики")}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
        {t(
          "projects.stats.empty.description",
          "Создайте проекты для отображения статистики"
        )}
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("create-project", { detail: {} })
          );
        }}
      >
        {t("projects.empty.action", "Создать проект")}
      </Button>
    </Paper>
  );
});

// Hook for fetching project stats with real API
const useProjectStats = (filters: ProjectFilters, period: string = "month") => {
  return useQuery({
    queryKey: ["projects", "stats", filters, period],
    queryFn: () => {
      const filtersWithPeriod = { ...filters, period } as ProjectFilters & {
        period: string;
      };
      return projectApi.getProjectsStats(filtersWithPeriod);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    select: (data) => {
      // Ensure data structure matches what we expect
      return {
        overview: data.overview || [],
        statusDistribution: data.statusDistribution || [],
        timeline: data.timeline || [],
        trends: data.trends || [],
      };
    },
  });
};

// Memoized components
const StatCard = memo<{
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: { value: number; label: string };
  color?: string;
  icon?: React.ReactNode;
}>(({ title, value, subtitle, trend, color = "#3b82f6", icon }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(
          color,
          0.05
        )} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            {icon && <Box sx={{ color: color }}>{icon}</Box>}
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ color: color }}>
            {value}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {trend && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${trend.value > 0 ? "+" : ""}${trend.value}%`}
                size="small"
                sx={{
                  bgcolor:
                    trend.value > 0
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                  color:
                    trend.value > 0
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  fontWeight: 600,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {trend.label}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});

const TrendsChart = memo<{
  data: any[];
}>(({ data }) => {
  return <div>TrendsChart</div>;
});

const TimelineChart = memo<{
  data: any[];
}>(({ data }) => {
  return <div>TimelineChart</div>;
});

const StatusDistributionChart = memo<{
  data: ProjectStatusDistribution[];
}>(({ data }) => {
  const { t } = useTranslation();

  const statusColors = useMemo(
    () => ({
      planning: "#94a3b8",
      in_progress: "#3b82f6",
      testing: "#f59e0b",
      completed: "#10b981",
      on_hold: "#ef4444",
      cancelled: "#6b7280",
    }),
    []
  );

  const statusLabels = useMemo(
    () => ({
      planning: t("status.planning", "Планирование"),
      in_progress: t("status.in_progress", "В работе"),
      testing: t("status.testing", "Тестирование"),
      completed: t("status.completed", "Завершен"),
      on_hold: t("status.on_hold", "Приостановлен"),
      cancelled: t("status.cancelled", "Отменен"),
    }),
    [t]
  );

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {t("projects.stats.no_distribution", "Нет данных для отображения")}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {data.map((item) => {
        const color =
          statusColors[item.status as keyof typeof statusColors] || "#94a3b8";
        const label =
          statusLabels[item.status as keyof typeof statusLabels] || item.status;

        return (
          <Box key={item.status}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.count} ({item.percentage}%)
              </Typography>
            </Box>
            <Box
              sx={{
                height: 8,
                bgcolor: alpha(color, 0.2),
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${item.percentage}%`,
                  bgcolor: color,
                  borderRadius: 4,
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
});

export const ProjectStatsWidget = memo<ProjectStatsWidgetProps>(
  ({
    className,
    showFilters = true,
    showActions = true,
    period: initialPeriod = "month",
  }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [period, setPeriod] = useState(initialPeriod);
    const [viewMode, setViewMode] = useState<"overview" | "detailed">(
      "overview"
    );

    // Build filters object
    const filters = useMemo(
      (): ProjectFilters => ({
        // Add any default filters here
      }),
      []
    );

    // Fetch project stats using real API
    const {
      data: stats,
      isLoading,
      error,
      refetch,
    } = useProjectStats(filters, period);

    const handleRefresh = useCallback(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["projects", "stats"] });
    }, [refetch, queryClient]);

    const handlePeriodChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        setPeriod(event.target.value as "week" | "month" | "quarter" | "year");
      },
      []
    );

    const handleViewModeChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        setViewMode(event.target.value as "overview" | "detailed");
      },
      []
    );

    // Calculate overview statistics
    const overviewStats = useMemo(() => {
      if (!stats?.overview) return null;

      const total = stats.overview.length;
      const completed = stats.overview.filter(
        (p: any) => p.progressPercentage === 100
      ).length;
      const inProgress = stats.overview.filter(
        (p: any) => p.progressPercentage > 0 && p.progressPercentage < 100
      ).length;
      const avgProgress =
        total > 0
          ? Math.round(
              stats.overview.reduce(
                (sum: number, p: any) => sum + (p.progressPercentage || 0),
                0
              ) / total
            )
          : 0;

      return {
        total,
        completed,
        inProgress,
        avgProgress,
        totalRequirements: stats.overview.reduce(
          (sum: number, p: any) => sum + (p.totalRequirements || 0),
          0
        ),
        completedRequirements: stats.overview.reduce(
          (sum: number, p: any) => sum + (p.completedRequirements || 0),
          0
        ),
        totalTestCases: stats.overview.reduce(
          (sum: number, p: any) => sum + (p.totalTestCases || 0),
          0
        ),
        passedTestCases: stats.overview.reduce(
          (sum: number, p: any) => sum + (p.passedTestCases || 0),
          0
        ),
      };
    }, [stats]);

    if (error) {
      return (
        <Card className={className}>
          <CardContent>
            <Alert
              severity="error"
              action={
                <IconButton size="small" onClick={handleRefresh}>
                  <Refresh />
                </IconButton>
              }
            >
              {t("projects.stats.error", "Ошибка загрузки статистики")}:{" "}
              {error.message}
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Assessment color="primary" />
              <Typography variant="h6">
                {t("projects.stats.title", "Статистика проектов")}
              </Typography>
            </Box>
          }
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              {showActions && (
                <Tooltip title={t("common.refresh", "Обновить")}>
                  <span>
                    <IconButton onClick={handleRefresh} disabled={isLoading}>
                      <Refresh />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          }
        />

        <CardContent>
          {/* Filters */}
          {showFilters && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>
                    {t("projects.stats.period", "Период")}
                  </InputLabel>
                  <Select value={period} onChange={handlePeriodChange}>
                    <MenuItem value="week">
                      {t("period.week", "Неделя")}
                    </MenuItem>
                    <MenuItem value="month">
                      {t("period.month", "Месяц")}
                    </MenuItem>
                    <MenuItem value="quarter">
                      {t("period.quarter", "Квартал")}
                    </MenuItem>
                    <MenuItem value="year">{t("period.year", "Год")}</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>{t("projects.stats.view", "Вид")}</InputLabel>
                  <Select value={viewMode} onChange={handleViewModeChange}>
                    <MenuItem value="overview">
                      {t("view.overview", "Обзор")}
                    </MenuItem>
                    <MenuItem value="detailed">
                      {t("view.detailed", "Детально")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          )}

          {/* Content */}
          {isLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton
                        variant="text"
                        width="40%"
                        height={48}
                        sx={{ my: 1 }}
                      />
                      <Skeleton variant="rectangular" width="80%" height={24} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : !overviewStats || overviewStats.total === 0 ? (
            <EmptyStatePlaceholder />
          ) : (
            <Fade in={!isLoading}>
              <Box>
                {/* Overview Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title={t("projects.stats.total", "Всего проектов")}
                      value={overviewStats.total}
                      icon={<BarChart />}
                      color="#3b82f6"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title={t("projects.stats.completed", "Завершено")}
                      value={overviewStats.completed}
                      subtitle={`${Math.round(
                        (overviewStats.completed / overviewStats.total) * 100
                      )}% от общего`}
                      icon={<TrendingUp />}
                      color="#10b981"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title={t("projects.stats.in_progress", "В работе")}
                      value={overviewStats.inProgress}
                      subtitle={`${Math.round(
                        (overviewStats.inProgress / overviewStats.total) * 100
                      )}% от общего`}
                      icon={<Assessment />}
                      color="#f59e0b"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title={t(
                        "projects.stats.avg_progress",
                        "Средний прогресс"
                      )}
                      value={`${overviewStats.avgProgress}%`}
                      icon={<BarChart />}
                      color="#3b82f6"
                    />
                  </Grid>
                </Grid>

                {/* Detailed View */}
                {viewMode === "detailed" && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StatusDistributionChart
                        data={stats?.statusDistribution || []}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TimelineChart data={stats?.timeline || []} />
                    </Grid>
                    <Grid item xs={12}>
                      <TrendsChart data={stats?.trends || []} />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    );
  }
);

export default ProjectStatsWidget;
