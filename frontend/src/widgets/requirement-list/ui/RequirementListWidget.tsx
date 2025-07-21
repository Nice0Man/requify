import React, { memo, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  LinearProgress,
  alpha,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Skeleton,
  Alert,
  useTheme,
  Fade,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Search,
  Refresh,
  Assignment,
  ExpandMore,
  ExpandLess,
  Add,
  FolderOpen,
  ListAlt,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Requirement,
  RequirementFilters,
} from "@/entities/requirement/api/requirementApi";
import { requirementApi } from "@/entities/requirement/api/requirementApi";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface RequirementListWidgetProps {
  className?: string;
  variant?: "default" | "minimal" | "detailed";
  limit?: number;
  showFilters?: boolean;
  showActions?: boolean;
  showGrouping?: boolean;
  projectId?: string;
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
        {t("requirements.empty.title", "Нет требований")}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
        {t(
          "requirements.empty.description",
          "Добавьте первое требование для начала работы"
        )}
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("create-requirement", { detail: {} })
          );
        }}
      >
        {t("requirements.empty.action", "Создать требование")}
      </Button>
    </Paper>
  );
});
// Hook for fetching requirements with real API
const useRequirements = (filters: RequirementFilters) => {
  return useQuery({
    queryKey: ["requirements", "list", filters],
    queryFn: () => requirementApi.getRequirements(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Memoized components
const StatusChip = memo<{ status: string }>(({ status }) => {
  const getStatusConfig = useCallback((status: string) => {
    const configs = {
      draft: {
        label: "Черновик",
        color: "#94a3b8",
        icon: <Assignment fontSize="small" />,
      },
      approved: {
        label: "Утвержден",
        color: "#10b981",
        icon: <Assignment fontSize="small" />,
      },
      in_progress: {
        label: "В работе",
        color: "#3b82f6",
        icon: <Assignment fontSize="small" />,
      },
      completed: {
        label: "Завершен",
        color: "#059669",
        icon: <Assignment fontSize="small" />,
      },
      rejected: {
        label: "Отклонен",
        color: "#ef4444",
        icon: <Assignment fontSize="small" />,
      },
    };
    return configs[status as keyof typeof configs] || configs.draft;
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

const PriorityChip = memo<{ priority?: string }>(({ priority }) => {
  const getPriorityConfig = useCallback((priority?: string) => {
    if (!priority) return { label: "Не указан", color: "#6b7280" };
    
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

const TypeChip = memo<{ type: string }>(({ type }) => {
  const getTypeConfig = useCallback((type: string) => {
    const configs = {
      functional: { label: "Функциональное", color: "#3b82f6" },
      "non-functional": { label: "Нефункциональное", color: "#8b5cf6" },
      business: { label: "Бизнес", color: "#f59e0b" },
      technical: { label: "Техническое", color: "#6b7280" },
    };
    return configs[type as keyof typeof configs] || configs.functional;
  }, []);

  const config = getTypeConfig(type);

  return (
    <Chip
      label={config.label}
      size="small"
      variant="outlined"
      sx={{
        borderColor: config.color,
        color: config.color,
      }}
    />
  );
});

const RequirementItem = memo<{
  requirement: Requirement;
  onClick?: (requirement: Requirement) => void;
}>(({ requirement, onClick }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const formatDate = useCallback((dateStr: string) => {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: ru });
  }, []);

  const progressColor = useMemo(() => {
    const progress = requirement.progress || 0;
    if (progress < 30) return theme.palette.error.main;
    if (progress < 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  }, [requirement.progress, theme]);

  return (
    <ListItem
      button
      onClick={() => onClick?.(requirement)}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        mb: 1,
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flex: 1 }}>
              {requirement.title}
            </Typography>
            <StatusChip status={requirement.status} />
          </Box>
        }
        secondary={
          <Box>
            {requirement.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  mb: 1,
                }}
              >
                {requirement.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PriorityChip priority={requirement.priority} />
              <TypeChip type={requirement.type} />
              {requirement.tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              ))}
            </Box>

            {requirement.progress !== undefined && (
              <Box sx={{ mb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("requirements.progress", "Прогресс")}
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {requirement.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={requirement.progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(progressColor, 0.2),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: progressColor,
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              {t("requirements.updated", "Обновлено")}:{" "}
              {formatDate(requirement.updatedAt)}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
});

const RequirementGroup = memo<{
  title: string;
  requirements: Requirement[];
  onRequirementClick?: (requirement: Requirement) => void;
}>(({ title, requirements, onRequirementClick }) => {
  const [expanded, setExpanded] = useState(true);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          p: 1,
          bgcolor: "background.default",
          borderRadius: 1,
          mb: 1,
        }}
        onClick={handleToggle}
      >
        <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
          {title} ({requirements.length})
        </Typography>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>
      <Collapse in={expanded}>
        <List disablePadding>
          {requirements.map((requirement) => (
            <RequirementItem
              key={requirement.id}
              requirement={requirement}
              onClick={onRequirementClick}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  );
});

export const RequirementListWidget = memo<RequirementListWidgetProps>(
  ({
    className,
    limit = 20,
    showFilters = true,
    showActions = true,
    showGrouping = true,
    projectId,
  }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [groupBy, setGroupBy] = useState<string>("status");

    // Build filters object
    const filters = useMemo(
      (): RequirementFilters => ({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        projectId: projectId,
      }),
      [searchQuery, statusFilter, priorityFilter, typeFilter, projectId]
    );

    // Fetch requirements using real API
    const {
      data: requirements = [],
      isLoading,
      error,
      refetch,
    } = useRequirements(filters);

    // Apply limit and grouping
    const processedRequirements = useMemo(() => {
      const limitedRequirements = requirements.slice(0, limit);

      if (!showGrouping || groupBy === "none") {
        return { ungrouped: limitedRequirements };
      }

      // Group requirements
      const grouped = limitedRequirements.reduce((acc, requirement) => {
        let key: string;

        switch (groupBy) {
          case "status":
            key = requirement.status;
            break;
          case "priority":
            key = requirement.priority;
            break;
          case "type":
            key = requirement.type;
            break;
          case "project":
            key = requirement.projectId || "Без проекта";
            break;
          default:
            key = "Все";
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(requirement);
        return acc;
      }, {} as Record<string, Requirement[]>);

      return grouped;
    }, [requirements, limit, showGrouping, groupBy]);

    const handleRefresh = useCallback(() => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["requirements"] });
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

    const handleTypeChange = useCallback((event: SelectChangeEvent<string>) => {
      setTypeFilter(event.target.value);
    }, []);

    const handleGroupByChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        setGroupBy(event.target.value);
      },
      []
    );

    const handleRequirementClick = useCallback((requirement: Requirement) => {
      window.dispatchEvent(
        new CustomEvent("open-requirement", { detail: { requirement } })
      );
    }, []);

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
              {t("requirements.error", "Ошибка загрузки требований")}:{" "}
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
              <ListAlt color="primary" />
              <Typography variant="h6">
                {t("requirements.list.title", "Список требований")}
              </Typography>
            </Box>
          }
          action={
            showActions && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title={t("common.refresh", "Обновить")}>
                  <span>
                    <IconButton onClick={handleRefresh} disabled={isLoading}>
                      <Refresh />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t("requirements.create", "Создать требование")}>
                  <IconButton>
                    <Add />
                  </IconButton>
                </Tooltip>
              </Box>
            )
          }
        />

        <CardContent>
          {/* Filters */}
          {showFilters && (
            <Box sx={{ mb: 3 }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t(
                    "requirements.search.placeholder",
                    "Поиск требований..."
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

                <Stack direction="row" spacing={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>
                      {t("requirements.filters.status", "Статус")}
                    </InputLabel>
                    <Select value={statusFilter} onChange={handleStatusChange}>
                      <MenuItem value="all">{t("common.all", "Все")}</MenuItem>
                      <MenuItem value="draft">
                        {t("status.draft", "Черновик")}
                      </MenuItem>
                      <MenuItem value="approved">
                        {t("status.approved", "Утвержден")}
                      </MenuItem>
                      <MenuItem value="in_progress">
                        {t("status.in_progress", "В работе")}
                      </MenuItem>
                      <MenuItem value="completed">
                        {t("status.completed", "Завершен")}
                      </MenuItem>
                      <MenuItem value="rejected">
                        {t("status.rejected", "Отклонен")}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>
                      {t("requirements.filters.priority", "Приоритет")}
                    </InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={handlePriorityChange}
                    >
                      <MenuItem value="all">{t("common.all", "Все")}</MenuItem>
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

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>
                      {t("requirements.filters.type", "Тип")}
                    </InputLabel>
                    <Select value={typeFilter} onChange={handleTypeChange}>
                      <MenuItem value="all">{t("common.all", "Все")}</MenuItem>
                      <MenuItem value="functional">
                        {t("type.functional", "Функциональное")}
                      </MenuItem>
                      <MenuItem value="non-functional">
                        {t("type.non_functional", "Нефункциональное")}
                      </MenuItem>
                      <MenuItem value="business">
                        {t("type.business", "Бизнес")}
                      </MenuItem>
                      <MenuItem value="technical">
                        {t("type.technical", "Техническое")}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {showGrouping && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>
                        {t("requirements.group_by", "Группировать")}
                      </InputLabel>
                      <Select value={groupBy} onChange={handleGroupByChange}>
                        <MenuItem value="none">
                          {t("common.none", "Не группировать")}
                        </MenuItem>
                        <MenuItem value="status">
                          {t("group.status", "По статусу")}
                        </MenuItem>
                        <MenuItem value="priority">
                          {t("group.priority", "По приоритету")}
                        </MenuItem>
                        <MenuItem value="type">
                          {t("group.type", "По типу")}
                        </MenuItem>
                        <MenuItem value="project">
                          {t("group.project", "По проекту")}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Content */}
          {isLoading ? (
            <Stack spacing={1}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={16}
                    sx={{ my: 1 }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={100} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : requirements.length === 0 ? (
            <EmptyStatePlaceholder />
          ) : (
            <Fade in={!isLoading}>
              <Box>
                {Object.keys(processedRequirements).length === 1 &&
                processedRequirements.ungrouped ? (
                  // Ungrouped list
                  <List disablePadding>
                    {processedRequirements.ungrouped.map((requirement) => (
                      <RequirementItem
                        key={requirement.id}
                        requirement={requirement}
                        onClick={handleRequirementClick}
                      />
                    ))}
                  </List>
                ) : (
                  // Grouped list
                  <Box>
                    {Object.entries(processedRequirements).map(
                      ([groupName, groupRequirements]) => (
                        <RequirementGroup
                          key={groupName}
                          title={groupName}
                          requirements={groupRequirements}
                          onRequirementClick={handleRequirementClick}
                        />
                      )
                    )}
                  </Box>
                )}
              </Box>
            </Fade>
          )}

          {/* Show more link */}
          {requirements.length > limit && (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("navigate-to", {
                      detail: { path: "/requirements" },
                    })
                  );
                }}
              >
                {t("requirements.view_all", "Показать все требования")} (
                {requirements.length})
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }
);

RequirementListWidget.displayName = "RequirementListWidget";
