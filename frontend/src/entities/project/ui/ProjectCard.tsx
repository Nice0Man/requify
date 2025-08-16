import React, { memo } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Stack,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Assignment as RequirementsIcon,
} from "@mui/icons-material";
import type { Project, ProjectWithStats } from "../model/types";

export interface ProjectCardProps {
  /** Данные проекта */
  project: ProjectWithStats;
  /** Обработчик клика по карточке */
  onClick?: (project: Project) => void;
  /** Обработчик редактирования */
  onEdit?: (project: Project) => void;
  /** Обработчик удаления */
  onDelete?: (project: Project) => void;
  /** Обработчик настроек */
  onSettings?: (project: Project) => void;
  /** Обработчик клика по участникам */
  onMembersClick?: (project: Project) => void;
  /** Обработчик клика по требованиям */
  onRequirementsClick?: (project: Project) => void;
  /** Показывать ли действия */
  showActions?: boolean;
  /** Компактный режим */
  compact?: boolean;
  /** Выбрана ли карточка */
  selected?: boolean;
}

/**
 * Получить цвет для статуса проекта
 */
const getStatusColor = (
  status: Project["status"]
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  const colorMap: Record<
    Project["status"],
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
  > = {
    active: "primary",
    inactive: "default",
    archived: "secondary",
    planning: "info",
    development: "primary",
    testing: "warning",
    completed: "success",
    cancelled: "error",
  };
  return colorMap[status] || "default";
};

/**
 * Получить текст статуса на русском
 */
const getStatusText = (status: Project["status"]): string => {
  const statusMap: Record<Project["status"], string> = {
    active: "Активный",
    inactive: "Неактивный",
    completed: "Завершен",
    archived: "Архивирован",
    planning: "Планирование",
    development: "В разработке",
    testing: "Тестирование",
    cancelled: "Отменено",
  };
  return statusMap[status] || status;
};

/**
 * Рассчитать прогресс проекта
 */
const calculateProgress = (project: ProjectWithStats): number => {
  if (!project.total_requirements) return 0;
  const { total_requirements, requirements_completed } = project;
  if (total_requirements === 0) return 0;
  return Math.round((requirements_completed / total_requirements) * 100);
};

/**
 * Компонент карточки проекта
 */
export const ProjectCard = memo<ProjectCardProps>(
  ({
    project,
    onClick,
    onEdit,
    onDelete,
    onSettings,
    onMembersClick,
    onRequirementsClick,
    showActions = true,
    compact = false,
    selected = false,
  }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleCardClick = () => {
      onClick?.(project);
    };

    const handleEdit = () => {
      handleMenuClose();
      onEdit?.(project);
    };

    const handleDelete = () => {
      handleMenuClose();
      onDelete?.(project);
    };

    const handleSettings = () => {
      handleMenuClose();
      onSettings?.(project);
    };

    const progress = calculateProgress(project);

    return (
      <Card
        onClick={handleCardClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          transition: "all 0.2s ease",
          border: selected ? 2 : 1,
          borderColor: selected ? "primary.main" : "divider",
          "&:hover": onClick
            ? {
                boxShadow: 4,
                transform: "translateY(-2px)",
              }
            : {},
          height: compact ? "auto" : 280,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: compact ? 1 : 2 }}>
          {/* Заголовок и меню действий */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
          >
            <Typography
              variant={compact ? "subtitle1" : "h6"}
              component="h3"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                flex: 1,
                mr: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {project.name}
            </Typography>

            {showActions && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  sx={{ mt: -0.5 }}
                >
                  <MoreIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  {onEdit && (
                    <MenuItem onClick={handleEdit}>
                      <EditIcon sx={{ mr: 1 }} fontSize="small" />
                      Редактировать
                    </MenuItem>
                  )}
                  {onSettings && (
                    <MenuItem onClick={handleSettings}>
                      <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                      Настройки
                    </MenuItem>
                  )}
                  {(onEdit || onSettings) && onDelete && <Divider />}
                  {onDelete && (
                    <MenuItem
                      onClick={handleDelete}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                      Удалить
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>

          {/* Статус проекта */}
          <Box mb={compact ? 1 : 2}>
            <Chip
              label={getStatusText(project.status)}
              color={getStatusColor(project.status)}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Описание (только в полном режиме) */}
          {!compact && project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {project.description}
            </Typography>
          )}

          {/* Статистика проекта */}
          {project.total_requirements && (
            <Stack spacing={compact ? 1 : 1.5}>
              {/* Прогресс */}
              <Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.5}
                >
                  <Typography variant="caption" color="text.secondary">
                    Прогресс
                  </Typography>
                  <Typography variant="caption" fontWeight="medium">
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              {/* Метрики */}
              {!compact && (
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Tooltip title="Требования">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <RequirementsIcon fontSize="small" color="action" />
                      <Typography variant="caption">
                        {project.requirements_completed}/
                        {project.total_requirements}
                      </Typography>
                    </Box>
                  </Tooltip>

                  <Tooltip title="Участники">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="caption">
                        {project.members.length}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              )}
            </Stack>
          )}

          {/* Участники (аватары) */}
          {project.members && project.members.length > 0 && (
            <Box mt={compact ? 1 : 2}>
              <AvatarGroup
                max={compact ? 3 : 5}
                onClick={
                  onMembersClick ? () => onMembersClick(project) : undefined
                }
                sx={{
                  cursor: onMembersClick ? "pointer" : "default",
                  "& .MuiAvatar-root": {
                    width: compact ? 24 : 32,
                    height: compact ? 24 : 32,
                    fontSize: compact ? "0.75rem" : "0.875rem",
                  },
                }}
              >
                {project.members.map((member) => (
                  <Avatar
                    key={member.id}
                    alt={member.user.username}
                    src={member.user.avatar_url}
                    title={member.user.username}
                  >
                    {member.user.username.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </AvatarGroup>
            </Box>
          )}

          {/* Даты */}
          {!compact && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                Создан:{" "}
                {new Date(project.created_at).toLocaleDateString("ru-RU")}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Действия в нижней части */}
        {showActions && !compact && (
          <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
            <Stack direction="row" spacing={1} width="100%">
              {onRequirementsClick && (
                <Tooltip title="Требования">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequirementsClick(project);
                    }}
                  >
                    <RequirementsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onMembersClick && (
                <Tooltip title="Участники">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMembersClick(project);
                    }}
                  >
                    <PeopleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Box flexGrow={1} />

              <Typography variant="caption" color="text.secondary">
                ID: {project.id}
              </Typography>
            </Stack>
          </CardActions>
        )}
      </Card>
    );
  }
);

ProjectCard.displayName = "ProjectCard";
