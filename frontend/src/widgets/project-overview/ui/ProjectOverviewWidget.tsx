import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { Folder as FolderIcon } from "@mui/icons-material";
import { useDashboardStyleSystem, DASHBOARD_TOKENS } from "@/shared/styles";
import { ErrorBoundary } from "@/shared/ui";
import type { ProjectOverviewWidgetProps, ProjectStatus } from "../model";

/**
 * Получить цвет для статуса проекта
 */
const getStatusColor = (status: ProjectStatus): string => {
  const colorMap: Record<ProjectStatus, string> = {
    draft: DASHBOARD_TOKENS.colors.dashboard.secondary,
    planning: DASHBOARD_TOKENS.colors.dashboard.info,
    in_progress: DASHBOARD_TOKENS.colors.dashboard.primary,
    on_hold: DASHBOARD_TOKENS.colors.dashboard.warning,
    completed: DASHBOARD_TOKENS.colors.dashboard.success,
    cancelled: DASHBOARD_TOKENS.colors.dashboard.error,
  };

  return colorMap[status];
};

/**
 * ProjectOverviewWidget - виджет обзора проектов
 */
export const ProjectOverviewWidget = memo<ProjectOverviewWidgetProps>(
  ({
    mode = "detailed",
    layout = "grid",
    density = "comfortable",
    projects = [],
    isDataLoading = false,
    dataError = null,
    onProjectClick,
    onRefresh,
    maxProjects = 5,
    showTeam = true,
    showProgress = true,
    customTitle,
    className,
    sx,
    ...props
  }) => {
    const theme = useTheme();
    const styleSystem = useDashboardStyleSystem(mode, layout, density);

    const isCompact = mode === "minimal" || mode === "compact";
    const displayProjects = projects.slice(0, maxProjects);

    if (dataError) {
      return (
        <Card
          className={className}
          sx={{ ...styleSystem.widgetStyles, ...(sx as object) }}
        >
          <CardContent>
            <Typography color="error" align="center">
              Ошибка загрузки проектов
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <ErrorBoundary>
        <Card
          className={className}
          sx={{
            ...styleSystem.widgetStyles,
            ...(sx as object),
            minHeight: isCompact ? 200 : 300,
          }}
        >
          <CardHeader
            avatar={
              <Avatar
                sx={{
                  bgcolor: DASHBOARD_TOKENS.colors.dashboard.secondary,
                  width: isCompact ? 32 : 40,
                  height: isCompact ? 32 : 40,
                }}
              >
                <FolderIcon fontSize={isCompact ? "small" : "medium"} />
              </Avatar>
            }
            title={
              <Typography
                variant={isCompact ? "subtitle2" : "h6"}
                fontWeight={600}
              >
                {customTitle || "Обзор проектов"}
              </Typography>
            }
            subheader={
              !isCompact && (
                <Typography variant="body2" color="text.secondary">
                  {displayProjects.length} активных проектов
                </Typography>
              )
            }
            sx={{ pb: isCompact ? 1 : 2 }}
          />

          <CardContent sx={{ pt: 0 }}>
            {displayProjects.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={4}
              >
                <FolderIcon
                  sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Нет проектов
                </Typography>
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                gap={isCompact ? 1 : 1.5}
              >
                {displayProjects.map((project) => (
                  <Card
                    key={project.id}
                    onClick={() => onProjectClick?.(project)}
                    sx={{
                      cursor: onProjectClick ? "pointer" : "default",
                      border: `1px solid ${alpha(
                        getStatusColor(project.status),
                        0.2
                      )}`,
                      bgcolor: alpha(getStatusColor(project.status), 0.02),
                      transition: `all ${DASHBOARD_TOKENS.animation.duration.shorter}ms`,

                      "&:hover": onProjectClick
                        ? {
                            borderColor: alpha(
                              getStatusColor(project.status),
                              0.4
                            ),
                            transform: "translateY(-1px)",
                          }
                        : {},
                    }}
                  >
                    <CardContent
                      sx={{
                        p: isCompact ? 1.5 : 2,
                        "&:last-child": { pb: isCompact ? 1.5 : 2 },
                      }}
                    >
                      {/* Заголовок и статус */}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography
                          variant={isCompact ? "body2" : "subtitle2"}
                          fontWeight={600}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {project.name}
                        </Typography>

                        <Chip
                          size="small"
                          label={
                            project.status === "in_progress"
                              ? "В работе"
                              : "Планирование"
                          }
                          sx={{
                            bgcolor: alpha(getStatusColor(project.status), 0.1),
                            color: getStatusColor(project.status),
                            border: `1px solid ${alpha(
                              getStatusColor(project.status),
                              0.2
                            )}`,
                          }}
                        />
                      </Box>

                      {/* Прогресс */}
                      {showProgress && (
                        <Box mb={1}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={0.5}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Прогресс
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {project.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: alpha(
                                getStatusColor(project.status),
                                0.1
                              ),
                              "& .MuiLinearProgress-bar": {
                                bgcolor: getStatusColor(project.status),
                              },
                            }}
                          />
                        </Box>
                      )}

                      {/* Команда и статистика */}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        {showTeam && project.team.length > 0 && (
                          <AvatarGroup
                            max={3}
                            sx={{
                              "& .MuiAvatar-root": {
                                width: 24,
                                height: 24,
                                fontSize: "0.75rem",
                              },
                            }}
                          >
                            {project.team.map((member) => (
                              <Avatar key={member.id} src={member.avatar}>
                                {member.name.charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        )}

                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="text.secondary">
                            {project.stats.completedRequirements}/
                            {project.stats.totalRequirements} треб.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    );
  }
);

ProjectOverviewWidget.displayName = "ProjectOverviewWidget";
