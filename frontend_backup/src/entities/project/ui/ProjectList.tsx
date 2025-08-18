import { memo, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Alert,
  Fade,
} from "@mui/material";
import {
  Search as SearchIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
} from "@mui/icons-material";
import { ProjectCard } from "./ProjectCard";
import {
  Project,
  ProjectFilters,
  ProjectStatus,
  PROJECT_STATUSES,
} from "../model/types";

export interface ProjectListProps {
  /** Список проектов */
  projects: Project[];
  /** Режим отображения */
  viewMode?: "grid" | "list";
  /** Загрузка */
  loading?: boolean;
  /** Ошибка */
  error?: string | null;
  /** Начальные фильтры */
  initialFilters?: Partial<ProjectFilters>;
  /** Обработчик клика по проекту */
  onProjectClick?: (project: Project) => void;
  /** Обработчик редактирования */
  onProjectEdit?: (project: Project) => void;
  /** Обработчик удаления */
  onProjectDelete?: (project: Project) => void;
  /** Обработчик настроек */
  onProjectSettings?: (project: Project) => void;
  /** Обработчик клика по участникам */
  onMembersClick?: (project: Project) => void;
  /** Обработчик клика по требованиям */
  onRequirementsClick?: (project: Project) => void;
  /** Обработчик изменения фильтров */
  onFiltersChange?: (filters: ProjectFilters) => void;
  /** Обработчик изменения режима отображения */
  onViewModeChange?: (mode: "grid" | "list") => void;
  /** Показывать ли поиск */
  showSearch?: boolean;
  /** Показывать ли фильтры */
  showFilters?: boolean;
  /** Показывать ли переключатель режимов */
  showViewModeToggle?: boolean;
  /** Пустое состояние */
  emptyStateMessage?: string;
  /** Компактный режим */
  compact?: boolean;
}

export type ProjectSortField = "name" | "created_at" | "updated_at" | "status";
export type ProjectSortOrder = "asc" | "desc";

/**
 * Фильтрация проектов
 */
const filterProjects = (
  projects: Project[],
  filters: ProjectFilters
): Project[] => {
  return projects.filter((project) => {
    // Поиск по названию и описанию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = project.name.toLowerCase().includes(searchLower);
      const descMatch = project.description
        ?.toLowerCase()
        .includes(searchLower);
      if (!nameMatch && !descMatch) return false;
    }

    // Фильтр по статусам
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(project.status)) return false;
    }

    // Фильтр по владельцу
    if (filters.owner_id && project.owner_id !== filters.owner_id) {
      return false;
    }

    // Фильтр по дате создания
    if (filters.created_from) {
      const projectDate = new Date(project.created_at);
      const fromDate = new Date(filters.created_from);
      if (projectDate < fromDate) return false;
    }

    if (filters.created_to) {
      const projectDate = new Date(project.created_at);
      const toDate = new Date(filters.created_to);
      if (projectDate > toDate) return false;
    }

    return true;
  });
};

/**
 * Сортировка проектов
 */
const sortProjects = (
  projects: Project[],
  sortBy: ProjectSortField,
  sortOrder: ProjectSortOrder
): Project[] => {
  return [...projects].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "created_at":
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case "updated_at":
        aValue = new Date(a.updated_at);
        bValue = new Date(b.updated_at);
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Компонент списка проектов
 */
export const ProjectList = memo<ProjectListProps>(
  ({
    projects,
    viewMode = "grid",
    loading = false,
    error = null,
    initialFilters = {},
    onProjectClick,
    onProjectEdit,
    onProjectDelete,
    onProjectSettings,
    onMembersClick,
    onRequirementsClick,
    onFiltersChange,
    onViewModeChange,
    showSearch = true,
    showFilters = true,
    showViewModeToggle = true,
    emptyStateMessage = "Проекты не найдены",
    compact = false,
  }) => {
    // Состояние фильтров
    const [filters, setFilters] = useState<ProjectFilters>(initialFilters);
    const [currentViewMode, setCurrentViewMode] = useState(viewMode);
    const [sortBy, setSortBy] = useState<ProjectSortField>("created_at");
    const [sortOrder, setSortOrder] = useState<ProjectSortOrder>("desc");

    // Отфильтрованные и отсортированные проекты
    const processedProjects = useMemo(() => {
      let result = projects;

      // Фильтрация
      result = filterProjects(result, filters);

      // Сортировка
      result = sortProjects(result, sortBy, sortOrder);

      return result;
    }, [projects, filters, sortBy, sortOrder]);

    // Обработчики
    const handleFiltersChange = (newFilters: Partial<ProjectFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange?.(updatedFilters);
    };

    const handleViewModeChange = (mode: "grid" | "list") => {
      setCurrentViewMode(mode);
      onViewModeChange?.(mode);
    };

    const handleSortChange = (field: ProjectSortField) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    };

    // Рендер ошибки
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    return (
      <Box>
        {/* Панель управления */}
        {(showSearch || showFilters || showViewModeToggle) && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack spacing={2}>
              {/* Поиск и переключатель режимов */}
              <Stack direction="row" spacing={2} alignItems="center">
                {showSearch && (
                  <TextField
                    placeholder="Поиск проектов..."
                    value={filters.search || ""}
                    onChange={(e) =>
                      handleFiltersChange({ search: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                )}

                {showViewModeToggle && (
                  <ToggleButtonGroup
                    value={currentViewMode}
                    exclusive
                    onChange={(_, value) =>
                      value && handleViewModeChange(value)
                    }
                    size="small"
                  >
                    <ToggleButton value="grid">
                      <GridIcon />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <ListIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              </Stack>

              {/* Фильтры */}
              {showFilters && (
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  {/* Фильтр по статусу */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Статус</InputLabel>
                    <Select
                      value={filters.statuses?.[0] || ""}
                      onChange={(e) =>
                        handleFiltersChange({
                          statuses: e.target.value
                            ? [e.target.value as ProjectStatus]
                            : undefined,
                        })
                      }
                      label="Статус"
                    >
                      <MenuItem value="">Все статусы</MenuItem>
                      {PROJECT_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Сортировка */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Сортировка</InputLabel>
                    <Select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split("-") as [
                          ProjectSortField,
                          ProjectSortOrder
                        ];
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                      label="Сортировка"
                    >
                      <MenuItem value="name-asc">Название (А-Я)</MenuItem>
                      <MenuItem value="name-desc">Название (Я-А)</MenuItem>
                      <MenuItem value="created_at-desc">Новые первыми</MenuItem>
                      <MenuItem value="created_at-asc">Старые первыми</MenuItem>
                      <MenuItem value="updated_at-desc">
                        Недавно обновленные
                      </MenuItem>
                      <MenuItem value="status-asc">По статусу</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Активные фильтры */}
                  {(filters.search || filters.statuses?.length) && (
                    <Box>
                      {filters.search && (
                        <Chip
                          label={`Поиск: ${filters.search}`}
                          onDelete={() =>
                            handleFiltersChange({ search: undefined })
                          }
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                      {filters.statuses?.map((status) => (
                        <Chip
                          key={status}
                          label={`Статус: ${status}`}
                          onDelete={() =>
                            handleFiltersChange({ statuses: undefined })
                          }
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Stack>
              )}
            </Stack>
          </Paper>
        )}

        {/* Список проектов */}
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        ) : processedProjects.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              {emptyStateMessage}
            </Typography>
          </Paper>
        ) : (
          <Fade in>
            <Grid container spacing={currentViewMode === "grid" ? 2 : 1}>
              {processedProjects.map((project) => (
                <Grid
                  item
                  xs={12}
                  sm={currentViewMode === "grid" ? 6 : 12}
                  md={currentViewMode === "grid" ? 4 : 12}
                  key={project.id}
                >
                  <ProjectCard
                    project={project}
                    viewMode={currentViewMode}
                    compact={compact}
                    onClick={() => onProjectClick?.(project)}
                    onEdit={() => onProjectEdit?.(project)}
                    onDelete={() => onProjectDelete?.(project)}
                    onSettings={() => onProjectSettings?.(project)}
                    onMembersClick={() => onMembersClick?.(project)}
                    onRequirementsClick={() => onRequirementsClick?.(project)}
                  />
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}

        {/* Информация о результатах */}
        {!loading && processedProjects.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Показано {processedProjects.length} из {projects.length} проектов
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
);

ProjectList.displayName = "ProjectList";
