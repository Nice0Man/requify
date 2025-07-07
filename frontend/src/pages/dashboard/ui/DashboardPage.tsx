import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  alpha,
  useTheme,
  Fade,
  Container,
} from '@mui/material';
import { DashboardLayout } from '@/widgets/layout';
import { DashboardStatsWidget } from '@/widgets/dashboard-stats';
import { ProjectOverviewWidget } from '@/widgets/project-overview';
import { ProjectStatsWidget } from '@/widgets/project-stats';
import { ActivityFeedWidget } from '@/widgets/activity-feed';
import { QuickActionsWidget } from '@/widgets/quick-actions';
import { NotificationsWidget } from '@/widgets/notifications';
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

  return (
    <DashboardLayout>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.grey[50], 0.5)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.02,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main} 0%, transparent 50%), 
                             radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ py: 4 }}>
            {/* Заголовок страницы */}
            <Fade in timeout={600}>
              <Box sx={{ mb: 6 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom 
                  fontWeight={700}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    letterSpacing: '-0.02em',
                    mb: 1,
                  }}
                >
                  Панель управления
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 400,
                  }}
                >
                  Добро пожаловать! Вот обзор ваших проектов и активности
                </Typography>
              </Box>
            </Fade>

            {/* Статистика */}
            <Fade in timeout={800}>
              <Box>
                <Box sx={{ mb: 4 }}>
                  <DashboardStatsWidget />
                </Box>
              </Box>
            </Fade>

            {/* Основной контент */}
            <Grid container spacing={4}>
              {/* Левая колонка */}
              <Grid item xs={12} xl={8}>
                <Grid container spacing={4}>
                  {/* Обзор проектов */}
                  <Grid item xs={12} lg={6}>
                    <Fade in timeout={1000}>
                      <Box>
                        <ProjectOverviewWidget />
                      </Box>
                    </Fade>
                  </Grid>

                  {/* Статистика проекта */}
                  <Grid item xs={12} lg={6}>
                    <Fade in timeout={1100}>
                      <Box>
                        <ProjectStatsWidget />
                      </Box>
                    </Fade>
                  </Grid>

                  {/* Быстрые действия */}
                  <Grid item xs={12}>
                    <Fade in timeout={1200}>
                      <Box>
                        <QuickActionsWidget />
                      </Box>
                    </Fade>
                  </Grid>
                </Grid>
              </Grid>

              {/* Правая колонка */}
              <Grid item xs={12} xl={4}>
                <Grid container spacing={4}>
                  {/* Уведомления */}
                  <Grid item xs={12}>
                    <Fade in timeout={1300}>
                      <Box>
                        <NotificationsWidget />
                      </Box>
                    </Fade>
                  </Grid>

                  {/* Активность */}
                  <Grid item xs={12}>
                    <Fade in timeout={1400}>
                      <Box>
                        <ActivityFeedWidget />
                      </Box>
                    </Fade>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage; 
