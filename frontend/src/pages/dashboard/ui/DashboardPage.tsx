import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  alpha,
  useTheme,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Speed,
  FolderOpen,
  BugReport,
  RocketLaunch,
  People,
} from '@mui/icons-material';
import { DashboardLayout } from '@/widgets/layout';
import { useDashboardStats } from '../../../features/dashboard/model/useDashboardQuery';
import { LoadingSpinner } from '../../../shared/ui';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: stats, isPending, error } = useDashboardStats();

  if (isPending) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box p={3} textAlign="center">
          <Typography color="error">{t('errors.loadingError')}</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const metrics = [
    {
      title: 'Активные проекты',
      value: stats?.activeProjects || 12,
      icon: FolderOpen,
      color: theme.palette.primary.main,
      trend: '+8%',
      subtitle: 'проектов в разработке',
    },
    {
      title: 'Требования',
      value: stats?.activeRequirements || 156,
      icon: Assignment,
      color: theme.palette.secondary.main,
      trend: '+12%',
      subtitle: 'активных требований',
    },
    {
      title: 'Завершенность',
      value: `${stats?.completionRate || 78}%`,
      icon: CheckCircle,
      color: theme.palette.success.main,
      trend: '+5%',
      subtitle: 'общая готовность',
    },
    {
      title: 'Команда',
      value: stats?.teamVelocity || 24,
      icon: People,
      color: theme.palette.info.main,
      trend: '+3%',
      subtitle: 'активных участников',
    },
  ];

  const recentActivity = [
    { title: 'Создан новый проект "Mobile App"', time: '2 часа назад', type: 'project' },
    { title: 'Обновлено требование REQ-145', time: '4 часа назад', type: 'requirement' },
    { title: 'Релиз v2.1.0 развернут', time: '6 часов назад', type: 'release' },
    { title: 'Исправлен баг BUG-89', time: '1 день назад', type: 'bug' },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Заголовок */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Панель управления
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Обзор ваших проектов и активности
          </Typography>
        </Box>

        {/* Метрики */}
        <Grid container spacing={3} mb={4}>
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                      ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      border: `1px solid ${alpha(metric.color, 0.2)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Icon sx={{ color: metric.color, fontSize: 28 }} />
                      <Chip 
                        label={metric.trend} 
                        size="small" 
                        sx={{ 
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          fontWeight: 600,
                        }} 
                      />
                    </Box>
                    
                    <Typography variant="h3" fontWeight={700} color={metric.color} sx={{ mb: 0.5 }}>
                      {metric.value}
                    </Typography>
                    
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                      {metric.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={3}>
          {/* Прогресс проектов */}
          <Grid item xs={12} lg={8}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                  ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3}>
                Прогресс проектов
              </Typography>
              
              <Box sx={{ space: 'y', gap: 3 }}>
                {['Alpha Platform', 'Beta Release', 'Mobile App', 'Dashboard v2'].map((project, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {project}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {65 + index * 10}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={65 + index * 10} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        },
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Недавняя активность */}
          <Grid item xs={12} lg={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                  ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3}>
                Недавняя активность
              </Typography>
              
              <Box sx={{ space: 'y', gap: 2 }}>
                {recentActivity.map((activity, index) => {
                  const getIcon = (type: string) => {
                    switch (type) {
                      case 'project': return <FolderOpen sx={{ fontSize: 20 }} />;
                      case 'requirement': return <Assignment sx={{ fontSize: 20 }} />;
                      case 'release': return <RocketLaunch sx={{ fontSize: 20 }} />;
                      case 'bug': return <BugReport sx={{ fontSize: 20 }} />;
                      default: return <CheckCircle sx={{ fontSize: 20 }} />;
                    }
                  };

                  return (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 2, 
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.05),
                        },
                        mb: 1,
                      }}
                    >
                      <Box sx={{ color: theme.palette.primary.main, mt: 0.5 }}>
                        {getIcon(activity.type)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage; 
