import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Avatar,
  useTheme,
  alpha,
  Skeleton,
  Stack,
  Tooltip,
  Fade,
  Grow,
  Divider,
} from '@mui/material';
import {
  RocketLaunch,
  People,
  Assignment,
  CheckCircle,
  Schedule,
  Refresh,
  ArrowForward,
  TrendingUp,
  Visibility,
  WarningAmber,
  CheckCircleOutline,
} from '@mui/icons-material';

// Using entities according to FSD
import { projectsApi } from '@/entities/project';
import type { ProjectWithStats } from '@/entities/project/model/types';

// Using shared utilities
import { formatDate } from '@/shared/utils';

interface ProjectOverviewProps {
  projectId?: number;
  showDetails?: boolean;
  showProgress?: boolean;
  className?: string;
  onProjectClick?: (projectId: number) => void;
  variant?: 'compact' | 'detailed' | 'dashboard';
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projectId,
  showDetails = true,
  showProgress = true,
  className,
  onProjectClick,
  variant = 'detailed',
}) => {
  const theme = useTheme();
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsApi.getProject(projectId);
      setProject(data as ProjectWithStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleProjectClick = () => {
    if (onProjectClick && projectId) {
      onProjectClick(projectId);
    }
  };

  const handleRefresh = () => {
    loadProject();
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'planning':
        return 'info';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'error';
      case 'on_hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircleOutline sx={{ fontSize: 16 }} />;
      case 'planning':
        return <Schedule sx={{ fontSize: 16 }} />;
      case 'completed':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'cancelled':
        return <WarningAmber sx={{ fontSize: 16 }} />;
      default:
        return <Visibility sx={{ fontSize: 16 }} />;
    }
  };

  const getHealthScore = () => {
    if (!project) return 0;
    const completion = project.total_requirements > 0 
      ? (project.requirements_completed / project.total_requirements) * 100
      : 0;
    
    // Simplified health calculation
    let score = completion * 0.6;
    if (project.status === 'active') score += 20;
    if (project.active_releases > 0) score += 20;
    
    return Math.min(Math.round(score), 100);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (!projectId) {
    return (
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <RocketLaunch sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary" variant="body1">
            Select a project to view details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          background: alpha(theme.palette.error.main, 0.02),
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <WarningAmber sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography color="error" variant="body1" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <IconButton 
            onClick={handleRefresh} 
            color="error"
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <Refresh />
          </IconButton>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
        }}
      >
        <CardHeader
          avatar={<Skeleton variant="circular" width={48} height={48} />}
          title={<Skeleton variant="text" width="60%" height={28} />}
          subheader={<Skeleton variant="text" width="40%" height={20} />}
          action={<Skeleton variant="circular" width={32} height={32} />}
        />
        <CardContent>
          <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rectangular" width="48%" height={60} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="48%" height={60} sx={{ borderRadius: 2 }} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <RocketLaunch sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary" variant="body1">
            Project not found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = project.total_requirements > 0 
    ? Math.round((project.requirements_completed / project.total_requirements) * 100)
    : 0;

  const healthScore = getHealthScore();

  return (
    <Grow in timeout={600}>
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}`,
          background: theme.palette.background.paper,
          cursor: onProjectClick ? 'pointer' : 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': onProjectClick ? {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            '& .project-header': {
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
            },
          } : {},
        }}
        onClick={handleProjectClick}
      >
        <CardHeader
          className="project-header"
          avatar={
            <Box position="relative">
              <Avatar
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  width: 48,
                  height: 48,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <RocketLaunch />
              </Avatar>
              {healthScore >= 80 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${theme.palette.background.paper}`,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              )}
            </Box>
          }
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {project.name}
              </Typography>
              <Tooltip title={`Health Score: ${healthScore}%`}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getHealthColor(healthScore),
                    boxShadow: `0 0 8px ${alpha(getHealthColor(healthScore), 0.6)}`,
                  }}
                />
              </Tooltip>
            </Stack>
          }
          subheader={
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {project.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(project.created_at)}
              </Typography>
            </Stack>
          }
          action={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                icon={getStatusIcon(project.status)}
                label={project.status}
                color={getStatusColor(project.status)}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    marginLeft: 1,
                  },
                }}
              />
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Refresh />
              </IconButton>
              {onProjectClick && (
                <IconButton 
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <ArrowForward />
                </IconButton>
              )}
            </Stack>
          }
          sx={{ pb: 1 }}
        />

        <CardContent sx={{ pt: 0 }}>
          {project.description && (
            <Fade in timeout={800}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: variant === 'compact' ? 2 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.description}
              </Typography>
            </Fade>
          )}

          {showProgress && (
            <Fade in timeout={1000}>
              <Box mb={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Project Progress
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {completionPercentage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                />
              </Box>
            </Fade>
          )}

          {showDetails && (
            <Fade in timeout={1200}>
              <Box>
                <Divider sx={{ mb: 2, opacity: 0.6 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      spacing={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.info.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          background: alpha(theme.palette.info.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.palette.info.main,
                        }}
                      >
                        <Assignment sx={{ fontSize: 16 }} />
                      </Box>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Requirements
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {project.requirements_completed}/{project.total_requirements}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>

                  <Grid item xs={6}>
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      spacing={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.success.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          background: alpha(theme.palette.success.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.palette.success.main,
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 16 }} />
                      </Box>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Releases
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {project.active_releases}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>

                  {project.specs_count !== undefined && (
                    <Grid item xs={6}>
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={1}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: alpha(theme.palette.warning.main, 0.04),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            background: alpha(theme.palette.warning.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.palette.warning.main,
                          }}
                        >
                          <People sx={{ fontSize: 16 }} />
                        </Box>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Specifications
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {project.specs_count}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                  )}

                  <Grid item xs={6}>
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      spacing={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.secondary.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          background: alpha(theme.palette.secondary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.palette.secondary.main,
                        }}
                      >
                        <Schedule sx={{ fontSize: 16 }} />
                      </Box>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Health Score
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: getHealthColor(healthScore),
                          }}
                        >
                          {healthScore}%
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}; 