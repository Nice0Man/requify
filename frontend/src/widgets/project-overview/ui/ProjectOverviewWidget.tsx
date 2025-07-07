import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, alpha, Chip, useTheme, Fade, IconButton } from '@mui/material';
import { FolderOpen, Assignment, BugReport, Timeline, ArrowForward } from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed';
  progress: number;
  requirements: number;
  testCases: number;
}

export const ProjectOverviewWidget: React.FC = () => {
  const theme = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planning': 
        return {
          color: theme.palette.info.main,
          label: 'Планирование',
          icon: Assignment,
          gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
        };
      case 'in_progress': 
        return {
          color: theme.palette.primary.main,
          label: 'В работе',
          icon: Timeline,
          gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        };
      case 'testing': 
        return {
          color: theme.palette.warning.main,
          label: 'Тестирование',
          icon: BugReport,
          gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
        };
      case 'completed': 
        return {
          color: theme.palette.success.main,
          label: 'Завершен',
          icon: FolderOpen,
          gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
        };
      default: 
        return {
          color: theme.palette.grey[500],
          label: 'Неизвестно',
          icon: FolderOpen,
          gradient: `linear-gradient(135deg, ${theme.palette.grey[500]}, ${theme.palette.grey[700]})`,
        };
    }
  };

  const projects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      status: 'in_progress',
      progress: 75,
      requirements: 24,
      testCases: 18,
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      status: 'testing',
      progress: 90,
      requirements: 16,
      testCases: 12,
    },
    {
      id: '3',
      name: 'API Integration',
      status: 'planning',
      progress: 25,
      requirements: 8,
      testCases: 3,
    },
  ];

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.default, 0.4)} 100%)`,
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
        },
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderOpen sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              Последние проекты
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                transform: 'translateX(2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowForward fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {projects.map((project, index) => {
            const statusConfig = getStatusConfig(project.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Fade in timeout={1000 + index * 200} key={project.id}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: `1px solid ${alpha(statusConfig.color, 0.1)}`,
                    background: `linear-gradient(135deg, ${alpha(statusConfig.color, 0.05)} 0%, ${alpha(statusConfig.color, 0.02)} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      borderColor: alpha(statusConfig.color, 0.2),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(statusConfig.color, 0.1)}`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '30%',
                      height: '100%',
                      background: `radial-gradient(circle at top right, ${alpha(statusConfig.color, 0.06)} 0%, transparent 60%)`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: statusConfig.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.3)}`,
                        }}
                      >
                        <StatusIcon sx={{ color: 'white', fontSize: 16 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ 
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {project.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusConfig.label}
                      size="small"
                      sx={{
                        backgroundColor: alpha(statusConfig.color, 0.1),
                        color: statusConfig.color,
                        fontWeight: 600,
                        borderRadius: 2,
                        fontSize: '0.8rem',
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Прогресс
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: statusConfig.color,
                          fontWeight: 700,
                        }}
                      >
                        {project.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(statusConfig.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: statusConfig.gradient,
                          borderRadius: 4,
                          boxShadow: `0 2px 8px ${alpha(statusConfig.color, 0.3)}`,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {project.requirements} требований
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BugReport sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {project.testCases} тестов
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}; 
