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
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "@/entities/project/api/projectApi";
import type { Project, ProjectFilters } from "@/entities/project/model/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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
  className?: string;
  variant?: "default" | "minimal" | "detailed";
  limit?: number;
  showFilters?: boolean;
  showActions?: boolean;
}

// Empty state placeholder component
const EmptyStatePlaceholder = memo(() => {
  const { t } = i18n;

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
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <FolderOpen
        sx={{
          fontSize: 64,
          color: "text.disabled",
          mb: 1,
        }}
      />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t("projects.empty.title", "Нет проектов")}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
        {t(
          "projects.empty.description",
          "Создайте первый проект для начала работы"
        )}
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => {
          // Emit action to create new project
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

// Hook for fetching projects with real API
const useProjects = (filters: ProjectFilters) => {
  return useQuery({
    queryKey: ["projects", "overview", filters],
    queryFn: () => projectApi.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data: Project[]) => {
      // Transform data to include additional fields for display
      return data.map((project): ExtendedProject => {
        const projectWithStats = project as any; // Cast to allow additional properties
        return {
          ...project,
          // Use real progress from API or calculate from requirements if available
          progress: projectWithStats.progress || 0,
          requirements: {
            total: projectWithStats.totalRequirements || 0,
            completed: projectWithStats.completedRequirements || 0,
            approved: projectWithStats.approvedRequirements || 0,
          },
          testCases: {
            total: projectWithStats.totalTestCases || 0,
            passed: projectWithStats.passedTestCases || 0,
            failed: projectWithStats.failedTestCases || 0,
          },
          team: projectWithStats.team || [
            {
              id: "1",
              name: i18n.t("projects.defaultTeam", "Project Team"),
              avatar: "",
              role: "Developer",
            },
          ],
          budget: projectWithStats.budget || {
            allocated: 0,
            spent: 0,
            currency: "₽",
          },
          lastActivity:
            projectWithStats.updatedAt ||
            projectWithStats.createdAt ||
            new Date().toISOString(),
        };
      });
    },
  });
};

// Memoized components
const StatusChip = memo<{ status: string }>(({ status }) => {
  const getStatusConfig = useCallback((status: string) => {
    const configs = {
      planning: {
        label: "Планирование",
        color: "#94a3b8",
        icon: <Assignment fontSize="small" />,
      },
      in_progress: {
        label: "В работе",
        color: "#3b82f6",
        icon: <Timeline fontSize="small" />,
      },
      testing: {
        label: "Тестирование",
        color: "#f59e0b",
        icon: <BugReport fontSize="small" />,
      },
      completed: {
        label: "Завершен",
        color: "#10b981",
        icon: <Flag fontSize="small" />,
      },
      on_hold: {
        label: "Приостановлен",
        color: "#ef4444",
        icon: <Flag fontSize="small" />,
      },
      cancelled: {
        label: "Отменен",
        color: "#6b7280",
        icon: <Flag fontSize="small" />,
      },
    };
    return configs[status as keyof typeof configs] || configs.planning;
  }, []);

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.2)}`,
        "& .MuiChip-icon": {
          color: config.color,
        },
      }}
    />
  );
});

const PriorityChip = memo<{ priority: string }>(({ priority }) => {
  const getPriorityConfig = useCallback((priority: string) => {
    const configs = {
      low: { label: "Низкий", color: "#10b981" },
      medium: { label: "Средний", color: "#f59e0b" },
      high: { label: "Высокий", color: "#ef4444" },
      critical: { label: "Критический", color: "#dc2626" },
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  }, []);

  const config = getPriorityConfig(priority);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.2)}`,
        fontWeight: 600,
      }}
    />
  );
});

const ProjectCard = memo<{
  project: ExtendedProject;
  _onEdit: (project: ExtendedProject) => void;
}>(({ project, _onEdit }) => {
  const theme = useTheme();
  const { t } = i18n;

  const progressColor = useMemo(() => {
    if (!project.progress) return theme.palette.grey[300];
    if (project.progress < 30) return theme.palette.error.main;
    if (project.progress < 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  }, [project.progress, theme]);

  const formatDate = useCallback((date: Date | string) => {
    if (!date) return "—";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if the date is valid
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      return "—";
    }

    try {
      return format(dateObj, "dd MMM yyyy", { locale: ru });
    } catch (error) {
      console.warn("Invalid date format:", date, error);
      return "—";
    }
  }, []);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" noWrap sx={{ flex: 1 }}>
              {project.name}
            </Typography>
            <StatusChip status={project.status} />
          </Box>
        }
        subheader={
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
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
                  sx={{ fontSize: "0.7rem" }}
                />
              ))}
            </Box>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ flex: 1, pt: 0 }}>
        {/* Progress */}
        {project.progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("projects.progress", "Прогресс")}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(progressColor, 0.2),
                "& .MuiLinearProgress-bar": {
                  bgcolor: progressColor,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {project.requirements && (
            <Grid item xs={6}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1,
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" color="primary">
                  {project.requirements.completed}/{project.requirements.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
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
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" color="success.main">
                  {project.testCases.passed}/{project.testCases.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("projects.tests", "Тесты")}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Team */}
        {project.team && project.team.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
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
          <Typography variant="caption" color="text.secondary">
            {t("projects.started", "Начат")}: {formatDate(project.startDate)}
          </Typography>
          {project.endDate && (
            <Typography variant="caption" color="text.secondary">
              {formatDate(project.endDate)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export const ProjectOverviewWidget = memo<ProjectOverviewWidgetProps>(
  ({ className, limit = 6, showFilters = true, showActions = true }) => {
    const { t } = i18n;
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

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
      return projects.slice(0, limit);
    }, [projects, limit]);

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

    if (error) {
      return (
        <Box className={className} sx={{ width: "100%" }}>
          {/* Container with same styling as Key Metrics */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backgroundColor: theme.palette.background.paper,
              width: "100%",
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <FolderOpen
                sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3 }}
              />
              <Typography color="error" variant="body2" textAlign="center">
                {t("projects.error", "Ошибка загрузки проектов")}:{" "}
                {error.message}
              </Typography>
              <Alert
                severity="error"
                sx={{ width: "100%", textAlign: "center" }}
                action={
                  <IconButton size="small" onClick={handleRefresh}>
                    <Refresh />
                  </IconButton>
                }
              >
                {t(
                  "projects.overview.errorMessage",
                  "Project overview temporarily unavailable"
                )}
              </Alert>
            </Stack>
          </Box>
        </Box>
      );
    }

    return (
      <Box className={className} sx={{ width: "100%" }}>
        {/* Container with same styling as Key Metrics */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundColor: theme.palette.background.paper,
            width: "100%",
          }}
        >
          <Stack spacing={3}>
            {/* Header Section - matching Key Metrics pattern */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
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
                      fontSize: "1.5rem",
                    }}
                  >
                    {t("projects.overview.title", "Обзор проектов")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.875rem",
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t(
                    "projects.overview.subtitle",
                    "Активные проекты и их статус"
                  )}
                </Typography>
              </Stack>

              {showActions && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title={t("common.refresh", "Обновить")}>
                    <span>
                      <IconButton
                        onClick={handleRefresh}
                        disabled={isLoading}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1
                          )}`,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.04
                            ),
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t("projects.create", "Создать проект")}>
                    <IconButton
                      size="small"
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.1
                        )}`,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* Content Section */}
            <Box>
              {/* Filters */}
              {showFilters && (
                <Box sx={{ mb: 3 }}>
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
                        >
                          <MenuItem value="all">
                            {t("common.all", "Все")}
                          </MenuItem>
                          <MenuItem value="planning">
                            {t("status.planning", "Планирование")}
                          </MenuItem>
                          <MenuItem value="in_progress">
                            {t("status.in_progress", "В работе")}
                          </MenuItem>
                          <MenuItem value="testing">
                            {t("status.testing", "Тестирование")}
                          </MenuItem>
                          <MenuItem value="completed">
                            {t("status.completed", "Завершен")}
                          </MenuItem>
                          <MenuItem value="on_hold">
                            {t("status.on_hold", "Приостановлен")}
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
                        >
                          <MenuItem value="all">
                            {t("common.all", "Все")}
                          </MenuItem>
                          <MenuItem value="low">
                            {t("priority.low", "Низкий")}
                          </MenuItem>
                          <MenuItem value="medium">
                            {t("priority.medium", "Средний")}
                          </MenuItem>
                          <MenuItem value="high">
                            {t("priority.high", "Высокий")}
                          </MenuItem>
                          <MenuItem value="critical">
                            {t("priority.critical", "Критический")}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Content */}
              {isLoading ? (
                <Grid container spacing={2}>
                  {Array.from({ length: limit }).map((_, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                      <Card>
                        <CardHeader
                          title={<Skeleton variant="text" width="60%" />}
                          subheader={<Skeleton variant="text" width="80%" />}
                        />
                        <CardContent>
                          <Skeleton
                            variant="rectangular"
                            height={60}
                            sx={{ mb: 2 }}
                          />
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Skeleton variant="rectangular" height={40} />
                            </Grid>
                            <Grid item xs={6}>
                              <Skeleton variant="rectangular" height={40} />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : displayProjects.length === 0 ? (
                <EmptyStatePlaceholder />
              ) : (
                <Fade in={!isLoading}>
                  <Grid container spacing={2}>
                    {displayProjects.map((project) => (
                      <Grid item xs={12} md={6} lg={4} key={project.id}>
                        <ProjectCard
                          project={project}
                          _onEdit={handleEditProject}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Fade>
              )}

              {/* Show more link */}
              {projects.length > limit && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("navigate-to", {
                          detail: { path: "/projects" },
                        })
                      );
                    }}
                  >
                    {t("projects.view_all", "Показать все проекты")} (
                    {projects.length})
                  </Button>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }
);

ProjectOverviewWidget.displayName = "ProjectOverviewWidget";
