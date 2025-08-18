import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  AlertTitle,
  Chip,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  Shield,
  Home,
  ArrowBack,
  ContactSupport,
  Security,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

const NoPermissionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    // TODO: Добавить логику обращения в поддержку
    navigate('/settings');
  };

  const attemptedPath = location.pathname;
  const userRole = user?.role || 'guest';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        py: 2,
        px: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={600} style={{ transitionDelay: '200ms' }}>
          <Box sx={{ textAlign: 'center' }}>
          {/* Главная иконка */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.3)}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Shield sx={{ fontSize: { xs: 50, sm: 60 }, color: 'white' }} />
            </Box>
          </Box>

          {/* Заголовок */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            403
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Доступ запрещен
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            У вас недостаточно прав для доступа к этой странице. Обратитесь к администратору для получения необходимых разрешений.
          </Typography>

          {/* Карточка с информацией */}
          <Paper
            elevation={20}
            sx={{
              mb: 4,
              maxWidth: 500,
              mx: 'auto',
              borderRadius: 6,
              overflow: 'hidden',
              background: alpha('#ffffff', 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#ffffff', 0.2)}`,
              boxShadow: `
                0 25px 50px -12px ${alpha('#000000', 0.25)},
                0 0 0 1px ${alpha('#ffffff', 0.05)} inset
              `,
            }}
          >
            <Box sx={{ p: 3 }}>
              <Alert
                severity="warning"
                icon={<Security />}
                sx={{
                  mb: 3,
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <AlertTitle sx={{ fontWeight: 600 }}>
                  Ограничение доступа
                </AlertTitle>
                Ваша текущая роль не позволяет просматривать запрашиваемый ресурс
              </Alert>

              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Ваша роль:
                </Typography>
                <Chip
                  label={userRole}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              {attemptedPath && (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  Запрашиваемый путь: {attemptedPath}
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Кнопки действий */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                boxShadow: `0 3px 5px 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              На главную
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Назад
            </Button>

            <Button
              variant="text"
              size="large"
              startIcon={<ContactSupport />}
              onClick={handleContactSupport}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  color: theme.palette.primary.main,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Связаться с поддержкой
            </Button>
          </Stack>

          {/* Дополнительная информация */}
          <Paper
            sx={{
              mt: 6,
              p: 3,
              backgroundColor: alpha('#ffffff', 0.7),
              borderRadius: 2,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#ffffff', 0.3)}`,
              boxShadow: `0 8px 32px ${alpha('#000000', 0.08)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                mb: 1,
                fontWeight: 600,
              }}
            >
              Нужны дополнительные разрешения?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.5,
              }}
            >
              Обратитесь к администратору системы или менеджеру проекта для получения необходимых прав доступа.
              В заявке укажите конкретные страницы или функции, к которым вам нужен доступ.
            </Typography>
          </Paper>
        </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default NoPermissionPage; 