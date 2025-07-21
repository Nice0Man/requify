import React, { memo, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  LinearProgress,
  alpha,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  AvatarGroup,
  Skeleton,
  Alert,
  useTheme,
  Fade,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Search,
  Refresh,
  Add,
  Timeline,
  Assignment,
  BugReport,
  Flag,
  FolderOpen,
  TrendingUp,
  Work,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DashboardWidgetWrapper,
  type WidgetConfig,
  type DashboardMode,
  type DashboardLayout,
  type DashboardDensity,
} from "@/shared/ui";
import { projectApi } from "@/entities/project/api/projectApi";
import type { Project, ProjectFilters } from "@/entities/project/model/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// New sizing hooks
import { useDashboardSizing, useCardSizing } from "@/shared/hooks";

// Enhanced types for widget display
interface ExtendedProject extends Project {
  progress?: number;
  requirements?: { total: number; completed: number; approved: number };
  testCases?: { total: number; passed: number; failed: number };
  team?: Array<{ id: string; name: string; avatar: string; role: string }>;
  budget?: { allocated: number; spent: number; currency: string };
  lastActivity?: string;
}

interface ProjectOverviewWidgetProps {
  // Dashboard settings
  mode: DashboardMode;
  layout: DashboardLayout;
  density: DashboardDensity;

  // Feature-specific props
  limit?: number;
  showFilters?: boolean;
  showActions?: boolean;
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

// Project-specific hooks
const useProjects = (filters: ProjectFilters) => {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectApi.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Status chip component
const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#4CAF50";
      case "planning":
        return "#2196F3";
      case "completed":
        return "#9C27B0";
      case "on_hold":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: alpha(getStatusColor(status), 0.1),
        color: getStatusColor(status),
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    />
  );
};

// Priority chip component
const PriorityChip: React.FC<{ priority?: string }> = ({ priority }) => {
  const getPriorityColor = (priority?: string) => {
    if (!priority) return "#757575";

    switch (priority.toLowerCase()) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  return (
    <Chip
      label={priority || "не указан"}
      size="small"
      variant="outlined"
      sx={{
        borderColor: getPriorityColor(priority),
        color: getPriorityColor(priority),
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    />
  );
};

// Date formatter
const formatDate = (date: string | Date) => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd.MM.yyyy", { locale: ru });
  } catch {
    return "Invalid date";
  }
};

// Project card component with adaptive sizing
const ProjectCard = memo<{
  project: ExtendedProject;
  _onEdit: (project: ExtendedProject) => void;
  cardSizing: any;
  sizing: any;
  mode?: DashboardMode;
  maxHeight?: number;
  overflow?: string;
}>(({ project, _onEdit, cardSizing, sizing, mode, maxHeight, overflow }) => {
  const theme = useTheme();
  const { t } = i18n;

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: cardSizing.minHeight,
        maxHeight: maxHeight,
        overflow: overflow,
        borderRadius: cardSizing.borderRadius,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: cardSizing.elevation,
        background: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: mode === "fullscreen" ? "none" : "translateY(-2px)",
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
        },
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                flex: 1,
                fontSize: sizing.typography.subtitle,
                fontWeight: 600,
              }}
            >
              {project.name}
            </Typography>
            <StatusChip status={project.status} />
          </Box>
        }
        subheader={
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ fontSize: sizing.typography.body }}
            >
              {project.description}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <PriorityChip priority={project.priority} />
              {(project.tags || []).slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: sizing.typography.caption,
                  }}
                />
              ))}
            </Box>
          </Box>
        }
        sx={{
          pb: 1,
          px: cardSizing.padding.sm,
          pt: cardSizing.padding.sm,
        }}
      />

      <CardContent
        sx={{
          flexGrow: 1,
          px: cardSizing.padding.sm,
          pb: cardSizing.padding.sm,
          pt: 0,
          overflow: overflow,
        }}
      >
        {/* Progress */}
        {project.progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: sizing.typography.body }}
              >
                {t("projects.progress", "Прогресс")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ fontSize: sizing.typography.body }}
              >
                {Math.round(project.progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {project.requirements && (
            <Grid item xs={6}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1,
                  bgcolor: "background.default",
                  borderRadius: sizing.borderRadius.small,
                }}
              >
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontSize: sizing.typography.subtitle }}
                >
                  {project.requirements.completed}/{project.requirements.total}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: sizing.typography.caption }}
                >
                  {t("projects.requirements", "Требования")}
                </Typography>
              </Box>
            </Grid>
          )}
          {project.testCases && (
            <Grid item xs={6}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1,
                  bgcolor: "background.default",
                  borderRadius: sizing.borderRadius.small,
                }}
              >
                <Typography
                  variant="h6"
                  color="success.main"
                  sx={{ fontSize: sizing.typography.subtitle }}
                >
                  {project.testCases.passed}/{project.testCases.total}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: sizing.typography.caption }}
                >
                  {t("projects.tests", "Тесты")}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Team */}
        {project.team && project.team.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: sizing.typography.body }}
            >
              {t("projects.team", "Команда")}
            </Typography>
            <AvatarGroup max={4} sx={{ justifyContent: "flex-start" }}>
              {(project.team || []).map((member) => (
                <Tooltip
                  key={member.id}
                  title={`${member.name} (${member.role})`}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {member.name.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}

        {/* Timeline */}
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mt: "auto" }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: sizing.typography.caption }}
          >
            {t("projects.started", "Начат")}: {formatDate(project.startDate)}
          </Typography>
          {project.endDate && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: sizing.typography.caption }}
            >
              {formatDate(project.endDate)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

// Конфигурация виджета для разных режимов дашборда
const projectOverviewWidgetConfig: WidgetConfig = {
  id: "project-overview-widget",
  title: i18n.t("dashboard.widgets.projectOverview.title", "Обзор проектов"),
  description: i18n.t(
    "dashboard.widgets.projectOverview.description",
    "Список проектов с основной информацией"
  ),
  icon: Work,

  // Настройки по умолчанию
  defaultSize: "medium",
  defaultPriority: "normal",
  defaultAspectRatio: "wide",

  // Режимы дашборда
  modes: {
    minimal: {
      size: "small",
      visible: false, // Скрыт в минимальном режиме
      priority: "low",
    },
    compact: {
      size: "medium",
      visible: true,
      priority: "normal",
      aspectRatio: "square",
      spacing: { padding: "16px" },
    },
    detailed: {
      size: "large",
      visible: true,
      priority: "normal",
      aspectRatio: "wide",
      spacing: { padding: "20px" },
    },
    fullscreen: {
      size: "xlarge",
      visible: true,
      priority: "high",
      aspectRatio: "wide",
      spacing: { padding: "24px" },
    },
  },

  // Лейауты
  layouts: {
    grid: {
      aspectRatio: "wide",
      minHeight: "350px",
      maxHeight: "500px",
    },
    list: {
      size: "large",
      aspectRatio: "wide",
      minHeight: "250px",
      maxHeight: "400px",
    },
    masonry: {
      size: "auto",
      aspectRatio: "auto",
      minHeight: "300px",
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
  lazy: true,
  virtualizeContent: false,
};

export const ProjectOverviewWidget = memo<ProjectOverviewWidgetProps>(
  ({
    mode,
    layout,
    density,
    limit = 6,
    showFilters = true,
    showActions = true,
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
    const { t } = i18n;
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    // New adaptive sizing system
    const sizing = useDashboardSizing({
      mode,
      density,
      layout,
      masonry,
      flexible,
    });

    const cardSizing = useCardSizing(mode, density, masonry);

    // Адаптируем настройки на основе dashboard mode и density
    const adaptedLimit = useMemo(() => {
      if (mode === "minimal") return Math.min(limit, 3);
      if (density === "dense") return Math.min(limit, 4);
      if (layout === "list") return Math.min(limit, 8);
      return limit;
    }, [mode, density, layout, limit]);

    const adaptedShowFilters = useMemo(() => {
      if (mode === "minimal" || density === "dense") return false;
      return showFilters;
    }, [mode, density, showFilters]);

    const adaptedShowActions = useMemo(() => {
      if (mode === "minimal") return false;
      return showActions;
    }, [mode, showActions]);

    // Build filters object
    const filters = useMemo(
      (): ProjectFilters => ({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
      }),
      [searchQuery, statusFilter, priorityFilter]
    );

    // Fetch projects using real API
    const {
      data: projects = [],
      isLoading,
      error,
      refetch,
    } = useProjects(filters);

    // Apply limit for display
    const displayProjects = useMemo(() => {
      return projects.slice(0, adaptedLimit);
    }, [projects, adaptedLimit]);

    const handleRefresh = useCallback(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }, [refetch, queryClient]);

    const handleSearchChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
      },
      []
    );

    const handleStatusChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        setStatusFilter(event.target.value);
      },
      []
    );

    const handlePriorityChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        setPriorityFilter(event.target.value);
      },
      []
    );

    const handleEditProject = useCallback((project: ExtendedProject) => {
      // Emit event to parent components
      window.dispatchEvent(
        new CustomEvent("edit-project", { detail: { project } })
      );
    }, []);

    // Empty state placeholder
    const EmptyStatePlaceholder = () => (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 4,
        }}
      >
        <FolderOpen
          sx={{
            fontSize: 64,
            color: "text.secondary",
            opacity: 0.3,
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t("projects.overview.empty.title", "Нет проектов")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t(
            "projects.overview.empty.description",
            "Создайте новый проект, чтобы начать работу."
          )}
        </Typography>
        {showActions && (
          <Button variant="contained" startIcon={<Add />}>
            {t("projects.overview.empty.action", "Создать проект")}
          </Button>
        )}
      </Box>
    );

    // Responsive grid configuration using new sizing system
    const getGridConfig = () => {
      if (layout === "list") {
        return { xs: 12 }; // Full width for list
      }

      // Use sizing system for responsive grid
      const { columns } = sizing.gridConfig;

      if (mode === "minimal") {
        return { xs: 12, sm: 6, md: 4 };
      }

      // Adaptive based on columns
      if (columns >= 6) {
        return { xs: 12, sm: 6, md: 4, lg: 3 };
      } else if (columns >= 4) {
        return { xs: 12, sm: 6, md: 4 };
      } else {
        return { xs: 12, sm: 6 };
      }
    };

    const gridConfig = getGridConfig();

    return (
      <DashboardWidgetWrapper
        config={projectOverviewWidgetConfig}
        mode={mode}
        layout={layout}
        density={density}
        className={className}
        loading={externalLoading || isLoading}
        error={externalError || (error ? error : undefined)}
        onResize={onResize}
        onCollapse={onCollapse}
        aria-label="Виджет обзора проектов"
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
                  <FolderOpen sx={{ color: "white", fontSize: 18 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontSize: sizing.typography.title,
                  }}
                >
                  {t("projects.overview.title", "Обзор проектов")}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: sizing.typography.body,
                  color: theme.palette.text.secondary,
                }}
              >
                {t(
                  "projects.overview.subtitle",
                  "Управление активными проектами"
                )}
              </Typography>
            </Stack>

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {adaptedShowActions && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  size="small"
                  sx={{ borderRadius: sizing.borderRadius.small }}
                >
                  {t("projects.create", "Создать")}
                </Button>
              )}
              {adaptedShowActions && (
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading}
                  sx={{
                    borderRadius: sizing.borderRadius.small,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Refresh
                    sx={{
                      ...(isLoading && {
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }),
                    }}
                  />
                </IconButton>
              )}

              {adaptedShowActions && (
                <Tooltip
                  title={t("projects.overview.addProject", "Добавить проект")}
                >
                  <IconButton
                    onClick={() => console.log("Add project")}
                    sx={{
                      borderRadius: sizing.borderRadius.small,
                      color: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.08
                        ),
                      },
                    }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Filters */}
          {adaptedShowFilters && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t(
                      "projects.search.placeholder",
                      "Поиск проектов..."
                    )}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>
                      {t("projects.filters.status", "Статус")}
                    </InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={handleStatusChange}
                      label={t("projects.filters.status", "Статус")}
                    >
                      <MenuItem value="all">
                        {t("projects.filters.all", "Все")}
                      </MenuItem>
                      <MenuItem value="active">
                        {t("projects.status.active", "Активные")}
                      </MenuItem>
                      <MenuItem value="planning">
                        {t("projects.status.planning", "Планирование")}
                      </MenuItem>
                      <MenuItem value="completed">
                        {t("projects.status.completed", "Завершенные")}
                      </MenuItem>
                      <MenuItem value="on_hold">
                        {t("projects.status.onHold", "Приостановленные")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>
                      {t("projects.filters.priority", "Приоритет")}
                    </InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={handlePriorityChange}
                      label={t("projects.filters.priority", "Приоритет")}
                    >
                      <MenuItem value="all">
                        {t("projects.filters.all", "Все")}
                      </MenuItem>
                      <MenuItem value="high">
                        {t("projects.priority.high", "Высокий")}
                      </MenuItem>
                      <MenuItem value="medium">
                        {t("projects.priority.medium", "Средний")}
                      </MenuItem>
                      <MenuItem value="low">
                        {t("projects.priority.low", "Низкий")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Content */}
          <Box>
            {isLoading ? (
              <Grid container spacing={sizing.spacing}>
                {Array.from({ length: adaptedLimit }).map((_, index) => (
                  <Grid item {...gridConfig} key={index}>
                    <Skeleton
                      variant="rectangular"
                      height={cardSizing.minHeight}
                      sx={{ borderRadius: cardSizing.borderRadius }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : displayProjects.length === 0 ? (
              <EmptyStatePlaceholder />
            ) : (
              <Fade in={!isLoading}>
                <Grid
                  container
                  spacing={{
                    xs: sizing.spacing.xs,
                    sm: sizing.spacing.sm,
                    md: sizing.spacing.md,
                  }}
                >
                  {displayProjects.map((project) => (
                    <Grid item {...gridConfig} key={project.id}>
                      <ProjectCard
                        project={project}
                        _onEdit={handleEditProject}
                        cardSizing={cardSizing}
                        sizing={sizing}
                        mode={mode}
                        maxHeight={maxHeight}
                        overflow={overflow}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Fade>
            )}

            {/* Show more link */}
            {!isLoading &&
              displayProjects.length > 0 &&
              projects.length > adaptedLimit && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // Navigate to full projects page
                      console.log("Navigate to projects page");
                    }}
                    sx={{ borderRadius: sizing.borderRadius.small }}
                  >
                    {t("projects.overview.showMore", "Показать все проекты")} (
                    {projects.length - adaptedLimit} {t("common.more", "ещё")})
                  </Button>
                </Box>
              )}

            {/* Error state */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: sizing.borderRadius.small,
                  mt: 2,
                }}
              >
                {t("projects.overview.error", "Ошибка загрузки проектов")}
              </Alert>
            )}
          </Box>
        </Stack>
      </DashboardWidgetWrapper>
    );
  }
);

ProjectOverviewWidget.displayName = "ProjectOverviewWidget";
