import React from 'react';
import { Grid } from '@mui/material';
import {
  FolderOpen as ProjectIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { StatsCard } from '@/shared/ui';
import { Project, ProjectStatus } from '@/shared/types';

interface ProjectStatsProps {
  projects: Project[];
  loading?: boolean;
  onCardClick?: (status?: ProjectStatus) => void;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({
  projects,
  loading = false,
  onCardClick,
}) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
  const planningProjects = projects.filter(p => p.status === ProjectStatus.PLANNING).length;

  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: <ProjectIcon />,
      color: 'primary',
      onClick: () => onCardClick?.(),
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: <CheckCircleIcon />,
      color: 'success',
      onClick: () => onCardClick?.(ProjectStatus.ACTIVE),
    },
    {
      title: 'Completed',
      value: completedProjects,
      icon: <CheckCircleIcon />,
      color: 'info',
      onClick: () => onCardClick?.(ProjectStatus.COMPLETED),
    },
    {
      title: 'Planning',
      value: planningProjects,
      icon: <ScheduleIcon />,
      color: 'warning',
      onClick: () => onCardClick?.(ProjectStatus.PLANNING),
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            loading={loading}
            onClick={stat.onClick}
          />
        </Grid>
      ))}
    </Grid>
  );
}; 