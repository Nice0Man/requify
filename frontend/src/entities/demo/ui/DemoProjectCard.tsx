import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  AvatarGroup,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FolderOpen,
  Assignment,
  BugReport,
  Group,
} from '@mui/icons-material';
import { DemoProject } from '../model/types';

interface DemoProjectCardProps {
  project: DemoProject;
  onClick?: () => void;
}

export const DemoProjectCard: React.FC<DemoProjectCardProps> = ({
  project,
  onClick,
}) => {
  const theme = useTheme();

  const getStatusColor = (status: DemoProject['status']) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.info.main;
      case 'planning':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusText = (status: DemoProject['status']) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершен';
      case 'planning':
        return 'Планирование';
      default:
        return status;
    }
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
        background: alpha('#ffffff', 0.95),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha('#ffffff', 0.2)}`,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Заголовок и статус */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {project.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {project.description}
            </Typography>
          </Box>
          <Chip
            label={getStatusText(project.status)}
            size="small"
            sx={{
              backgroundColor: alpha(getStatusColor(project.status), 0.1),
              color: getStatusColor(project.status),
              fontWeight: 600,
              ml: 2,
            }}
          />
        </Box>

        {/* Прогресс */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Прогресс
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(project.status),
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Статистика */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {project.requirementsCount}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {project.testsCount}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {project.team.length}
            </Typography>
          </Box>
        </Box>

        {/* Команда */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Команда
          </Typography>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
            {project.team.map((user) => (
              <Avatar
                key={user.id}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.8rem',
                  backgroundColor: theme.palette.primary.main,
                }}
              >
                {user.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>
    </Card>
  );
}; 