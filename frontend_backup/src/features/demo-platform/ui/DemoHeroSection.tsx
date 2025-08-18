import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  PlayArrow,
  Visibility,
  TrendingUp,
} from '@mui/icons-material';

interface DemoHeroSectionProps {
  onStartDemo: () => void;
}

export const DemoHeroSection: React.FC<DemoHeroSectionProps> = ({
  onStartDemo,
}) => {
  const theme = useTheme();

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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            {/* Брендовая иконка */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  fontWeight: 700,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                R
              </Box>
            </Box>

            {/* Заголовок */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Requify Demo
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
              }}
            >
              Исследуйте возможности платформы
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
              Погрузитесь в интерактивное демо и узнайте, как Requify помогает командам 
              эффективно управлять требованиями, проектами и тестированием
            </Typography>

            {/* Статистика */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={4}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 6 }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <TrendingUp sx={{ color: theme.palette.success.main }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    3
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Демо-проекта
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Visibility sx={{ color: theme.palette.info.main }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    105
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Требований
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <PlayArrow sx={{ color: theme.palette.warning.main }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    300
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Тестов
                </Typography>
              </Box>
            </Stack>

            {/* Кнопка действия */}
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={onStartDemo}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Начать демо-тур
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}; 