import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Speed,
  Add,
  ViewKanban,
  PostAdd,
  Assessment,
} from '@mui/icons-material';
import { useDashboardStats } from '../../../features/dashboard/model/useDashboardQuery';
import { LoadingSpinner } from '../../../shared/ui';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: stats, isPending, error } = useDashboardStats();

  const quickActions = [
    {
      title: t('dashboard.quickActions.newProject'),
      description: t('dashboard.quickActions.newProjectDesc'),
      icon: Add,
      color: theme.palette.primary.main,
      action: () => console.log('New project'),
    },
    {
      title: t('dashboard.quickActions.kanbanBoard'),
      description: t('dashboard.quickActions.kanbanBoardDesc'),
      icon: ViewKanban,
      color: theme.palette.secondary.main,
      action: () => console.log('Kanban board'),
    },
    {
      title: t('dashboard.quickActions.addRequirement'),
      description: t('dashboard.quickActions.addRequirementDesc'),
      icon: PostAdd,
      color: theme.palette.success.main,
      action: () => console.log('Add requirement'),
    },
    {
      title: t('dashboard.quickActions.viewReports'),
      description: t('dashboard.quickActions.viewReportsDesc'),
      icon: Assessment,
      color: theme.palette.warning.main,
      action: () => console.log('View reports'),
    },
  ];

  if (isPending) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error">{t('errors.loadingError')}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Заголовок */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('dashboard.subtitle')}
        </Typography>
      </Box>

      {/* Метрики */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('dashboard.metrics.activeProjects')}
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="primary">
                {stats?.activeProjects || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.metrics.projectsInDevelopment')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('dashboard.metrics.requirements')}
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="secondary">
                {stats?.activeRequirements || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.metrics.totalRequirementsTracked')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('dashboard.metrics.completionRate')}
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {stats?.completionRate || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.metrics.overallProjectCompletion')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Speed sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('dashboard.metrics.teamVelocity')}
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {stats?.teamVelocity || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.metrics.storyPointsPerSprint')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Быстрые действия */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          {t('dashboard.quickActions.title')}
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={action.action}
                  sx={{
                    p: 2,
                    height: 'auto',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    border: `1px solid ${alpha(action.color, 0.3)}`,
                    color: action.color,
                    '&:hover': {
                      backgroundColor: alpha(action.color, 0.05),
                      border: `1px solid ${alpha(action.color, 0.5)}`,
                    },
                  }}
                >
                  <Icon sx={{ mb: 1, color: action.color }} />
                  <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Недавняя активность */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          {t('dashboard.recentActivity')}
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.noActivity')}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardPage; 
