<<<<<<< HEAD
import React from 'react';
import { FolderOpen, Assignment, BugReport, Timeline, ArrowForward } from '@mui/icons-material';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  alpha, 
  useTheme, 
  Button,
  LinearProgress,
  Chip,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LiquidGlassIcon } from '@/shared/ui';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'completed';
  progress: number;
  tasksCount: number;
  completedTasks: number;
  color: string;
  icon: React.ElementType;
}

export const ProjectOverviewWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock data - replace with actual data from API
  const projects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Разработка интернет-магазина с интеграцией платежных систем',
      status: 'active',
      progress: 75,
      tasksCount: 24,
      completedTasks: 18,
      color: theme.palette.primary.main,
      icon: FolderOpen,
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'Мобильное приложение для управления задачами',
      status: 'active',
      progress: 45,
      tasksCount: 16,
      completedTasks: 7,
      color: theme.palette.secondary.main,
      icon: Assignment,
    },
    {
      id: '3',
      name: 'Analytics Dashboard',
      description: 'Система аналитики и отчетности для бизнеса',
      status: 'pending',
      progress: 20,
      tasksCount: 12,
      completedTasks: 2,
      color: theme.palette.info.main,
      icon: Timeline,
    },
  ];

  const getStatusConfig = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return {
          label: 'Активный',
          color: theme.palette.success.main,
          background: alpha(theme.palette.success.main, 0.1),
        };
      case 'pending':
        return {
          label: 'В ожидании',
          color: theme.palette.warning.main,
          background: alpha(theme.palette.warning.main, 0.1),
        };
      case 'completed':
        return {
          label: 'Завершен',
          color: theme.palette.info.main,
          background: alpha(theme.palette.info.main, 0.1),
        };
      default:
        return {
          label: 'Неизвестно',
          color: theme.palette.grey[500],
          background: alpha(theme.palette.grey[500], 0.1),
        };
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.8)} 0%, 
          ${alpha(theme.palette.background.default, 0.4)} 100%
        )`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        // Light refraction effect
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, 
            ${alpha(theme.palette.common.white, 0.05)} 0%, 
            transparent 100%
          )`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Обзор проектов
          </Typography>
          <ArrowForward 
            sx={{ 
              color: alpha(theme.palette.text.secondary, 0.6),
              fontSize: '1.2rem',
            }} 
          />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {projects.map((project, index) => {
            const statusConfig = getStatusConfig(project.status);
            const Icon = project.icon;

            return (
              <Fade in timeout={1000 + index * 200} key={project.id}>
                <Box>
                  <Box
                    onClick={() => handleProjectClick(project.id)}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.6)} 0%, 
                        ${alpha(theme.palette.background.default, 0.3)} 100%
                      )`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        background: `linear-gradient(135deg, 
                          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                          ${alpha(theme.palette.background.default, 0.6)} 100%
                        )`,
                        border: `1px solid ${alpha(project.color, 0.2)}`,
                        boxShadow: `
                          0 12px 32px ${alpha(project.color, 0.15)},
                          inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                        `,
                      },
                      // Light refraction on project card
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: `linear-gradient(180deg, 
                          ${alpha(theme.palette.common.white, 0.08)} 0%, 
                          transparent 100%
                        )`,
                        pointerEvents: 'none',
                      },
                      // Project color accent
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '60%',
                        height: '100%',
                        background: `radial-gradient(circle at top right, 
                          ${alpha(project.color, 0.03)} 0%, 
                          transparent 70%
                        )`,
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2, position: 'relative', zIndex: 1 }}>
                      <LiquidGlassIcon
                        icon={Icon}
                        color={project.color}
                        gradient={`linear-gradient(135deg, ${project.color}, ${alpha(project.color, 0.8)})`}
                        size={48}
                        variant="secondary"
                        clickable={true}
                        onClick={() => handleProjectClick(project.id)}
                      />
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              fontSize: '1.1rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {project.name}
                          </Typography>
                          <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              backgroundColor: statusConfig.background,
                              color: statusConfig.color,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              borderRadius: 2,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alpha(theme.palette.text.secondary, 0.8),
                            mb: 2,
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {project.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: alpha(theme.palette.text.secondary, 0.8),
                            fontWeight: 500,
                          }}
                        >
                          Прогресс: {project.completedTasks}/{project.tasksCount} задач
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: project.color,
                            fontWeight: 600,
                          }}
                        >
                          {project.progress}%
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(project.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${project.color}, ${alpha(project.color, 0.8)})`,
                            boxShadow: `0 2px 8px ${alpha(project.color, 0.3)}`,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Fade>
            );
          })}
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="text"
            sx={{
              color: alpha(theme.palette.text.secondary, 0.7),
              fontSize: '0.9rem',
              fontWeight: 500,
              textTransform: 'none',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.primary.main,
              },
            }}
            endIcon={<ArrowForward sx={{ fontSize: '1rem' }} />}
            onClick={() => navigate('/projects')}
          >
            Все проекты
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 
=======
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
>>>>>>> 561cfbf79a41517e070303e2a3e30da6de4d02f6
