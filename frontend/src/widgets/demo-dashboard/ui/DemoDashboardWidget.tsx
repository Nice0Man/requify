import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  alpha,
  Fade,
  CircularProgress,
} from '@mui/material';
import { DemoProjectCard } from '@/entities/demo';
import { useDemoData } from '@/features/demo-platform';

export const DemoDashboardWidget: React.FC = () => {
  const theme = useTheme();
  const { projects, metrics, isLoading } = useDemoData();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, 
            #ffffff 0%, 
            #f8fafc 20%, 
            #e3f2fd 40%, 
            #bbdefb 60%, 
            #90caf9 80%, 
            #64b5f6 100%
          )`,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Загрузка демо-данных...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          #ffffff 0%, 
          #f8fafc 20%, 
          #e3f2fd 40%, 
          #bbdefb 60%, 
          #90caf9 80%, 
          #64b5f6 100%
        )`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(
              '#2196f3',
              0.15
            )} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(
              '#1976d2',
              0.1
            )} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha(
              '#ffffff',
              0.8
            )} 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, ${alpha(
              '#e3f2fd',
              0.6
            )} 0%, transparent 50%)
          `,
          zIndex: 0,
        },
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={600}>
          <Box>
            {/* Заголовок */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Демо-панель управления
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                Обзор проектов, требований и статистики в демо-режиме
              </Typography>
            </Box>

            {/* Статистические карточки */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Всего проектов
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {metrics.totalProjects}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Требований
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {metrics.totalRequirements}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Тестов
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    {metrics.totalTests}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Участников
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {metrics.teamMembers}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Проекты */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 3,
                }}
              >
                Демо-проекты
              </Typography>
              <Grid container spacing={3}>
                {projects.map((project, index) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id}>
                    <Fade
                      in
                      timeout={600}
                      style={{ transitionDelay: `${index * 200}ms` }}
                    >
                      <div>
                        <DemoProjectCard project={project} />
                      </div>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Дополнительная информация */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                background: alpha('#ffffff', 0.8),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#ffffff', 0.3)}`,
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                }}
              >
                🎯 Это демо-режим
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 800, mx: 'auto' }}
              >
                Вы просматриваете демонстрационную версию платформы Requify. 
                Все данные являются примерами и предназначены только для ознакомления с функциональностью системы.
                Для полного доступа ко всем возможностям зарегистрируйтесь или войдите в систему.
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}; 