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
} from '@mui/material';
import {
  RocketLaunch,
  People,
  Assignment,
  CheckCircle,
  Schedule,
  Refresh,
  ArrowForward,
} from '@mui/icons-material';

// Using entities according to FSD
import { projectsApi } from '@/entities/project';
import type { ProjectWithStats } from '@/entities/project/model/types';

// Using shared utilities
import { formatDate } from '@/shared/utils';

// Widget props from types
import type { ProjectOverviewProps } from '../../types';

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projectId,
  showDetails = true,
  showProgress = true,
  className,
  onProjectClick,
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'planning':
        return 'info';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'primary';
    }
  };

  if (!projectId) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography color="text.secondary">
            No project selected
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
          <IconButton onClick={handleRefresh} size="small">
            <Refresh />
          </IconButton>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="60%" />}
          action={<Skeleton variant="circular" width={24} height={24} />}
        />
        <CardContent>
          <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" />
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography color="text.secondary">
            Project not found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = project.total_requirements > 0 
    ? Math.round((project.requirements_completed / project.total_requirements) * 100)
    : 0;

  return (
    <Card 
      className={className}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
        cursor: onProjectClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onProjectClick ? {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
        } : {},
      }}
      onClick={handleProjectClick}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            <RocketLaunch />
          </Avatar>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {project.name}
          </Typography>
        }
        subheader={project.code}
        action={
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={project.status}
              color={getStatusColor(project.status) as any}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <IconButton size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
            {onProjectClick && (
              <IconButton size="small">
                <ArrowForward />
              </IconButton>
            )}
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ pt: 0 }}>
        {project.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2, lineHeight: 1.5 }}
          >
            {project.description}
          </Typography>
        )}

        {showProgress && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {completionPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                },
              }}
            />
          </Box>
        )}

        {showDetails && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Requirements
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {project.requirements_completed}/{project.total_requirements}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Releases
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {project.active_releases}
              </Typography>
            </Grid>

            {project.specs_count !== undefined && (
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Specs
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {project.specs_count}
                </Typography>
              </Grid>
            )}

            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDate(project.created_at)}
              </Typography>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}; 