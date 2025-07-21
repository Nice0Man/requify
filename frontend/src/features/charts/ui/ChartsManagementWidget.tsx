import React, { memo, useMemo, useCallback, Suspense, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  alpha,
  useTheme,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Chip,
  InputLabel,
  ButtonGroup,
  Button,
  Collapse,
  Alert,
} from "@mui/material";
import {
  ShowChart,
  DataUsage,
  Insights,
  TrendingUp,
  Refresh,
  Fullscreen,
  Settings,
  BarChart as BarChartIcon,
  ViewModule,
  ViewList,
  ExpandMore,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import {
  DashboardWidgetWrapper,
  type WidgetConfig,
  type DashboardMode,
  type DashboardLayout,
  type DashboardDensity,
} from "@/shared/ui";
import {
  usePerformanceMeasure,
  useRenderTracker,
} from "@/shared/hooks/usePerformanceOptimizations";

// New sizing hooks
import { useDashboardSizing, useChartSizing } from "@/shared/hooks";

// Chart components из entities/charts
import {
  LineChart as LineChartComponent,
  BarChart as BarChartComponent,
  PieChart as PieChartComponent,
} from "@/entities/charts";

// Chart components - оборачиваем в memo для оптимизации
const MemoizedLineChart = memo(LineChartComponent);
const MemoizedBarChart = memo(BarChartComponent);
const MemoizedPieChart = memo(PieChartComponent);

// API hooks
import {
  useProjectsDistribution,
  useRequirementsTimeline,
  useTeamWorkload,
  useProjectProgress,
  transformProjectsDistributionToChartData,
  transformRequirementsTimelineToChartData,
  transformTeamWorkloadToChartData,
  transformProjectProgressToChartData,
  chartUtils,
} from "../model/queries";
import { useDashboardStats } from "@/features/dashboard/model/queries";

// Placeholder components
import { ChartPlaceholder, ChartLoadingPlaceholder } from "./ChartPlaceholder";

// Chart configuration type
interface ChartConfig {
  id: string;
  title: string;
  type: "line" | "bar" | "pie";
  entity: "projects" | "requirements" | "teams" | "releases";
  data: any[];
  loading: boolean;
  error: string | null;
  color: string;
  icon: React.ReactElement;
  enabled: boolean;
  priority: number;
}

interface ChartsManagementWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;
  
  // Feature-specific props
  variant?: "minimal" | "compact" | "detailed";
  defaultExpanded?: boolean;
  showControls?: boolean;
  maxCharts?: number;
  maxItems?: number;
  refreshInterval?: number;
  onChartClick?: (chartId: string) => void;
  onRefresh?: () => void;
  masonry?: boolean;
  flexible?: boolean;
  maxHeight?: number;
  overflow?: string;
  
  // Wrapper props
  className?: string;
  loading?: boolean;
  error?: string | Error;
  onResize?: (size: { width: number; height: number }) => void;
  onCollapse?: (collapsed: boolean) => void;
}

// Конфигурация виджета для разных режимов дашборда
const chartsManagementWidgetConfig: WidgetConfig = {
  id: 'charts-management-widget',
  title: i18n.t('dashboard.widgets.charts.title', 'Управление графиками'),
  description: i18n.t('dashboard.widgets.charts.description', 'Настройка и просмотр аналитических графиков'),
  icon: ShowChart,
  
  // Настройки по умолчанию
  defaultSize: 'large',
  defaultPriority: 'high',
  defaultAspectRatio: 'wide',
  
  // Режимы дашборда
  modes: {
    minimal: {
      size: 'medium',
      visible: false, // Скрыт в минимальном режиме
      priority: 'normal',
    },
    compact: {
      size: 'large',
      visible: true,
      priority: 'high',
      aspectRatio: 'wide',
      spacing: { padding: '16px' },
    },
    detailed: {
      size: 'xlarge',
      visible: true,
      priority: 'high',
      aspectRatio: 'wide',
      spacing: { padding: '20px' },
    },
    fullscreen: {
      size: 'xlarge',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '24px' },
    },
  },
  
  // Лейауты
  layouts: {
    grid: {
      aspectRatio: 'wide',
      minHeight: '400px',
      maxHeight: '600px',
    },
    list: {
      size: 'large',
      aspectRatio: 'wide',
      minHeight: '300px',
      maxHeight: '500px',
    },
    masonry: {
      size: 'auto',
      aspectRatio: 'auto',
      minHeight: '350px',
    },
  },
  
  // Стили
  border: true,
  shadow: true,
  borderRadius: 12,
  
  // Поведение
  collapsible: true,
  resizable: false,
  draggable: false,
  
  // Производительность
  lazy: false,
  virtualizeContent: false,
};

/**
 * Charts Management Widget with optimized performance and adaptive sizing
 * Мемоизированный компонент для улучшения производительности
 */
export const ChartsManagementWidget = memo<ChartsManagementWidgetProps>(
  ({
    mode,
    layout,
    density,
    variant = "detailed",
    showControls = true,
    maxItems = 4,
    maxCharts = 4,
    defaultExpanded = true,
    refreshInterval,
    onChartClick,
    onRefresh,
    masonry = false,
    flexible = false,
    maxHeight,
    overflow = "visible",
    className,
    loading: externalLoading = false,
    error: externalError,
    onResize,
    onCollapse,
    ...rest
  }) => {
    // Performance hooks
    useRenderTracker("ChartsManagementWidget", {
      mode,
      layout,
      density,
      variant,
      maxItems,
    });

    const performanceMeasure = usePerformanceMeasure("ChartsManagementWidget");

    // Theme and responsive hooks
    const theme = useTheme();
    const t = i18n.t;

    // New adaptive sizing system
    const sizing = useDashboardSizing({ 
      mode, 
      density, 
      layout, 
      masonry, 
      flexible 
    });
    
    const chartSizing = useChartSizing(mode, density, layout);

    // State
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [viewMode, setViewMode] = useState<"grid" | "list">(
      layout === "list" ? "list" : "grid"
    );
    const [selectedEntity, setSelectedEntity] = useState<
      "all" | "projects" | "requirements" | "teams" | "releases"
    >("all");

    // Data fetching with correct queries
    const {
      data: projectsDistributionData,
      isLoading: isProjectsDistributionLoading,
      error: projectsDistributionError,
    } = useProjectsDistribution();

    const {
      data: requirementsTimelineData,
      isLoading: isRequirementsTimelineLoading,
      error: requirementsTimelineError,
    } = useRequirementsTimeline();

    const {
      data: teamWorkloadData,
      isLoading: isTeamWorkloadLoading,
      error: teamWorkloadError,
    } = useTeamWorkload();

    const {
      data: projectProgressData,
      isLoading: isProjectProgressLoading,
      error: projectProgressError,
    } = useProjectProgress();

    const {
      data: stats,
      isLoading: isStatsLoading,
      error: statsError,
    } = useDashboardStats();

    // Generate sample data for Project Status Distribution
    const generateProjectStatusData = useMemo(() => {
      if (projectsDistributionData && projectsDistributionData.length > 0) {
        return transformProjectsDistributionToChartData(
          projectsDistributionData
        );
      }

      // Generate sample data if distribution is empty
      return [
        {
          id: "planning",
          label: t("dashboard.status.planning", "Planning"),
          value: stats?.totalProjects
            ? Math.round(stats.totalProjects * 0.2)
            : 3,
          color: theme.palette.info.main,
          percentage: 20,
        },
        {
          id: "in_progress",
          label: t("dashboard.status.in_progress", "In Progress"),
          value:
            stats?.activeProjects || stats?.totalProjects
              ? Math.round((stats.activeProjects || stats.totalProjects) * 0.5)
              : 8,
          color: theme.palette.primary.main,
          percentage: 50,
        },
        {
          id: "testing",
          label: t("dashboard.status.testing", "Testing"),
          value: stats?.totalProjects
            ? Math.round(stats.totalProjects * 0.15)
            : 2,
          color: theme.palette.warning.main,
          percentage: 15,
        },
        {
          id: "completed",
          label: t("dashboard.status.completed", "Completed"),
          value: stats?.totalProjects
            ? Math.round(stats.totalProjects * 0.1)
            : 2,
          color: theme.palette.success.main,
          percentage: 10,
        },
        {
          id: "on_hold",
          label: t("dashboard.status.on_hold", "On Hold"),
          value: stats?.totalProjects
            ? Math.round(stats.totalProjects * 0.05)
            : 1,
          color: theme.palette.error.main,
          percentage: 5,
        },
      ];
    }, [projectsDistributionData, stats, theme.palette, t]);

    // Generate charts configuration with adaptive sizing
    const allCharts = useMemo((): ChartConfig[] => {
      return [
        {
          id: "project-status",
          title: t("dashboard.charts.projectStatus", "Project Status"),
          type: "pie" as const,
          entity: "projects" as const,
          data: generateProjectStatusData,
          loading: isProjectsDistributionLoading,
          error: projectsDistributionError?.message || null,
          color: theme.palette.primary.main,
          icon: <DataUsage />,
          enabled: true,
          priority: 1,
        },
        {
          id: "requirements-timeline",
          title: t("dashboard.charts.requirementsTimeline", "Requirements Timeline"),
          type: "line" as const,
          entity: "requirements" as const,
          data: requirementsTimelineData
            ? transformRequirementsTimelineToChartData(requirementsTimelineData)
            : [],
          loading: isRequirementsTimelineLoading,
          error: requirementsTimelineError?.message || null,
          color: theme.palette.secondary.main,
          icon: <TrendingUp />,
          enabled: true,
          priority: 2,
        },
        {
          id: "team-workload",
          title: t("dashboard.charts.teamWorkload", "Team Workload"),
          type: "bar" as const,
          entity: "teams" as const,
          data: teamWorkloadData
            ? transformTeamWorkloadToChartData(teamWorkloadData)
            : [],
          loading: isTeamWorkloadLoading,
          error: teamWorkloadError?.message || null,
          color: theme.palette.info.main,
          icon: <BarChartIcon />,
          enabled: true,
          priority: 3,
        },
        {
          id: "project-progress",
          title: t("dashboard.charts.projectProgress", "Project Progress"),
          type: "bar" as const,
          entity: "projects" as const,
          data: projectProgressData
            ? transformProjectProgressToChartData(projectProgressData)
            : [],
          loading: isProjectProgressLoading,
          error: projectProgressError?.message || null,
          color: theme.palette.success.main,
          icon: <Insights />,
          enabled: variant !== "minimal",
          priority: 4,
        },
      ];
    }, [
      generateProjectStatusData,
      requirementsTimelineData,
      teamWorkloadData,
      projectProgressData,
      isProjectsDistributionLoading,
      isRequirementsTimelineLoading,
      isTeamWorkloadLoading,
      isProjectProgressLoading,
      projectsDistributionError,
      requirementsTimelineError,
      teamWorkloadError,
      projectProgressError,
      theme.palette,
      t,
      variant,
    ]);

    // Filter charts based on entity and enabled state
    const filteredCharts = useMemo(() => {
      return allCharts
        .filter((chart) => chart.enabled)
        .filter(
          (chart) => selectedEntity === "all" || chart.entity === selectedEntity
        )
        .slice(0, maxCharts);
    }, [allCharts, selectedEntity, maxCharts]);

    // Event handlers
    const handleToggle = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded]);

    const handleEntityFilter = useCallback((entity: typeof selectedEntity) => {
      setSelectedEntity(entity);
    }, []);

    const handleRefresh = useCallback(() => {
      // Refresh logic would go here
      console.log("Refreshing charts data...");
      onRefresh?.();
    }, [onRefresh]);

    // Render chart component with placeholders
    const renderChart = useCallback(
      (chart: ChartConfig) => {
        // Show loading placeholder
        if (chart.loading) {
          return (
            <ChartLoadingPlaceholder height={chartSizing.height} type={chart.type} />
          );
        }

        // Show error or no data placeholder
        if (chart.error || !chart.data || chart.data.length === 0) {
          return (
            <ChartPlaceholder
              type={chart.type}
              entity={chart.entity}
              height={chartSizing.height}
              message={chart.error || undefined}
              onAction={() => {
                // Trigger refresh of the specific chart data
                console.log(`Refreshing ${chart.entity} data...`);
                // This would trigger query refetch in real implementation
              }}
            />
          );
        }

        // Render actual chart with adaptive sizing
        const commonProps = {
          data: chart.data,
          height: chartSizing.height,
          loading: false,
          error: null,
          responsive: true,
          minHeight: mode === "minimal" ? 150 : mode === "compact" ? 180 : 200,
          maxHeight: mode === "minimal" ? 300 : mode === "compact" ? 400 : 500,
          aspectRatio: layout === "list" || viewMode === "list" ? 2.5 : 16 / 9,
          debounceMs: 100,
        };

        switch (chart.type) {
          case "line":
            return (
              <MemoizedLineChart
                {...commonProps}
                showPoints
                showGrid
                smooth
                area={variant !== "minimal"}
              />
            );
          case "bar":
            return (
              <MemoizedBarChart
                {...commonProps}
                horizontal={layout === "list" || viewMode === "list"}
              />
            );
          case "pie":
            return (
              <MemoizedPieChart
                {...commonProps}
                showLabels={variant !== "minimal"}
                showLegend={variant === "detailed"}
                aspectRatio={1} // Square for pie charts
              />
            );
          default:
            return <Box>Unsupported chart type</Box>;
        }
      },
      [chartSizing.height, variant, viewMode, layout]
    );

    if (isStatsLoading || externalLoading) {
      return (
        <DashboardWidgetWrapper
          config={chartsManagementWidgetConfig}
          mode={mode}
          layout={layout}
          density={density}
          className={className}
          loading={true}
          onResize={onResize}
          onCollapse={onCollapse}
          aria-label="Виджет управления графиками"
        >
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
          </Box>
        </DashboardWidgetWrapper>
      );
    }

    return (
      <DashboardWidgetWrapper
        config={chartsManagementWidgetConfig}
        mode={mode}
        layout={layout}
        density={density}
        className={className}
        loading={externalLoading || isStatsLoading}
        error={externalError}
        onResize={onResize}
        onCollapse={onCollapse}
        aria-label="Виджет управления графиками"
      >
        {/* Header */}
        <CardHeader
          avatar={
            <Box
              sx={{
                width: sizing.iconSize + 8,
                height: sizing.iconSize + 8,
                borderRadius: sizing.borderRadius.small,
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShowChart sx={{ color: "white", fontSize: sizing.iconSize }} />
            </Box>
          }
          title={
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: sizing.typography.title,
              }}
            >
              {t("dashboard.charts.title", "Analytics Charts")}
            </Typography>
          }
          subheader={
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: sizing.typography.caption }}
            >
              {expanded
                ? `${filteredCharts.length} charts visible`
                : `${filteredCharts.length} charts hidden`}
            </Typography>
          }
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Entity filter */}
              {showControls && (
                <>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Entity</InputLabel>
                    <Select
                      value={selectedEntity}
                      onChange={(e) => handleEntityFilter(e.target.value as typeof selectedEntity)}
                      label="Entity"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="projects">Projects</MenuItem>
                      <MenuItem value="requirements">Requirements</MenuItem>
                      <MenuItem value="teams">Teams</MenuItem>
                      <MenuItem value="releases">Releases</MenuItem>
                    </Select>
                  </FormControl>

                  {/* View mode toggle */}
                  <ButtonGroup size="small" variant="outlined">
                    <IconButton
                      onClick={() => setViewMode("grid")}
                      color={viewMode === "grid" ? "primary" : "default"}
                      size="small"
                    >
                      <ViewModule fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => setViewMode("list")}
                      color={viewMode === "list" ? "primary" : "default"}
                      size="small"
                    >
                      <ViewList fontSize="small" />
                    </IconButton>
                  </ButtonGroup>

                  {/* Refresh Button */}
                  <IconButton onClick={handleRefresh} size="small">
                    <Refresh fontSize="small" />
                  </IconButton>
                </>
              )}

              {/* Expand/Collapse Toggle */}
              <IconButton
                onClick={handleToggle}
                sx={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              >
                <ExpandMore />
              </IconButton>
            </Box>
          }
        />

        {/* Charts Content */}
        <Collapse in={expanded} timeout={300}>
          <CardContent
            sx={{
              // Adaptive padding based on density and mode using new sizing system
              px: {
                xs: sizing.padding.xs,
                sm: sizing.padding.sm,
                md: sizing.padding.md,
              },
              pb: {
                xs: sizing.padding.xs,
                sm: sizing.padding.sm,
                md: sizing.padding.md,
              },
              pt: 0, // No top padding
              overflow: overflow,
              maxHeight: maxHeight ? maxHeight - sizing.headerHeight : undefined,
            }}
          >
            {filteredCharts.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: sizing.borderRadius.small }}>
                {t(
                  "dashboard.charts.noData",
                  "No charts available for the selected entity."
                )}
              </Alert>
            ) : (
              <Grid
                container
                spacing={{
                  xs: sizing.spacing.xs,
                  sm: sizing.spacing.sm,
                  md: sizing.spacing.md,
                }}
                sx={{
                  // Layout-specific adjustments
                  ...((layout === "list" || viewMode === "list") && {
                    flexDirection: "column",
                    "& .MuiGrid-item": {
                      maxWidth: "none !important",
                      flexBasis: "auto",
                      width: "100%",
                    },
                  }),
                  ...(layout === "masonry" && {
                    alignItems: "flex-start",
                    "& .MuiGrid-item": {
                      display: "flex",
                      flexDirection: "column",
                    },
                  }),
                }}
              >
                {filteredCharts.map((chart) => {
                  // Calculate responsive grid sizes based on layout and mode
                  const getGridSizes = () => {
                    if (layout === "list" || viewMode === "list") {
                      return { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 };
                    }

                    if (mode === "minimal") {
                      return { xs: 12, sm: 12, md: 12, lg: 12, xl: 6 };
                    }

                    if (mode === "compact") {
                      return { xs: 12, sm: 6, md: 6, lg: 6, xl: 4 };
                    }

                    if (mode === "fullscreen") {
                      return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
                    }

                    // Default detailed mode
                    return { xs: 12, sm: 6, md: 6, lg: 4, xl: 4 };
                  };

                  const gridSizes = getGridSizes();

                  return (
                    <Grid item {...gridSizes} key={chart.id}>
                      <Card
                        sx={{
                          // Unified border radius with parent using new sizing
                          borderRadius: sizing.borderRadius.small,
                          // Lighter borders for nested cards to avoid double outlines
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            mode === "fullscreen" ? 0.04 : 0.06
                          )}`,
                          background: theme.palette.background.paper,
                          height: "100%",
                          minHeight: chartSizing.height + 80, // Chart + header
                          maxHeight: maxHeight ? maxHeight * 0.8 : undefined,
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.3s ease",
                          overflow: overflow,
                          // Subtle shadows for nested cards using new elevation system
                          boxShadow: chartSizing.elevation,
                          "&:hover": {
                            transform:
                              mode === "fullscreen"
                                ? "none"
                                : "translateY(-2px)",
                            boxShadow:
                              mode === "fullscreen"
                                ? `0 2px 8px ${alpha(
                                    theme.palette.common.black,
                                    0.03
                                  )}`
                                : `0 8px 32px ${alpha(
                                    theme.palette.common.black,
                                    0.08
                                  )}`,
                            borderColor: alpha(
                              chart.color,
                              mode === "fullscreen" ? 0.2 : 0.3
                            ),
                          },
                        }}
                      >
                        <CardHeader
                          avatar={
                            <Box
                              sx={{
                                width: sizing.iconSize,
                                height: sizing.iconSize,
                                borderRadius: sizing.borderRadius.small,
                                backgroundColor: alpha(chart.color, 0.1),
                                color: chart.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {chart.icon}
                            </Box>
                          }
                          title={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                fontSize: sizing.typography.subtitle,
                                color: theme.palette.text.primary,
                              }}
                            >
                              {chart.title}
                            </Typography>
                          }
                          action={
                            <Chip
                              label={chart.entity}
                              size="small"
                              sx={{
                                textTransform: "capitalize",
                                backgroundColor: alpha(chart.color, 0.1),
                                color: chart.color,
                                fontSize: sizing.typography.caption,
                              }}
                            />
                          }
                          sx={{ 
                            pb: 1,
                            px: sizing.padding.sm,
                            pt: sizing.padding.sm,
                          }}
                        />
                        <CardContent
                          sx={{
                            pt: 0,
                            pb: sizing.padding.sm,
                            px: sizing.padding.sm,
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                            overflow: overflow,
                          }}
                        >
                          <Box 
                            sx={{ 
                              flexGrow: 1, 
                              minHeight: 0,
                              overflow: overflow,
                              position: "relative",
                            }}
                          >
                            {renderChart(chart)}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Collapse>
      </DashboardWidgetWrapper>
    );
  }
);

ChartsManagementWidget.displayName = "ChartsManagementWidget";
