import React from 'react';
import { Add, Assignment, RocketLaunch, BugReport, Settings, ArrowForward } from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  alpha, 
  Card, 
  CardContent,
  Grid,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LiquidGlassIcon } from '@/shared/ui';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  gradient: string;
}

export const QuickActionsWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'create-project',
      title: 'Создать проект',
      description: 'Новый проект с настройкой команды',
      icon: Add,
      path: '/projects/new',
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    {
      id: 'add-requirement',
      title: 'Добавить требование',
      description: 'Создать новое требование',
      icon: Assignment,
      path: '/requirements/new',
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
    {
      id: 'create-release',
      title: 'Планировать релиз',
      description: 'Создать план релиза',
      icon: RocketLaunch,
      path: '/releases/new',
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
    },
    {
      id: 'report-issue',
      title: 'Сообщить о проблеме',
      description: 'Создать отчет об ошибке',
      icon: BugReport,
      path: '/testing/new',
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
    },
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Управление системой',
      icon: Settings,
      path: '/settings',
      color: theme.palette.grey[600],
      gradient: `linear-gradient(135deg, ${theme.palette.grey[600]}, ${theme.palette.grey[700]})`,
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    navigate(action.path);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.8)} 0%, 
          ${alpha(theme.palette.background.default, 0.4)} 100%
        )`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        // Light refraction effect
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, 
            ${alpha(theme.palette.common.white, 0.05)} 0%, 
            transparent 100%
          )`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Быстрые действия
          </Typography>
          <ArrowForward 
            sx={{ 
              color: alpha(theme.palette.text.secondary, 0.6),
              fontSize: '1.2rem',
            }} 
          />
        </Box>

        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={action.id}>
              <Fade in timeout={800 + index * 150}>
                <Box>
                  <Button
                    onClick={() => handleActionClick(action)}
                    sx={{
                      width: '100%',
                      p: 2.5,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.6)} 0%, 
                        ${alpha(theme.palette.background.default, 0.3)} 100%
                      )`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                      flexDirection: 'column',
                      gap: 1.5,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      textTransform: 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        background: `linear-gradient(135deg, 
                          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                          ${alpha(theme.palette.background.default, 0.6)} 100%
                        )`,
                        border: `1px solid ${alpha(action.color, 0.2)}`,
                        boxShadow: `
                          0 12px 32px ${alpha(action.color, 0.15)},
                          inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                        `,
                      },
                      // Light refraction on button
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: `linear-gradient(180deg, 
                          ${alpha(theme.palette.common.white, 0.08)} 0%, 
                          transparent 100%
                        )`,
                        pointerEvents: 'none',
                      },
                      // Subtle glow
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '60%',
                        height: '100%',
                        background: `radial-gradient(circle at top right, 
                          ${alpha(action.color, 0.03)} 0%, 
                          transparent 70%
                        )`,
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <LiquidGlassIcon
                      icon={action.icon}
                      color={action.color}
                      gradient={action.gradient}
                      size={48}
                      variant="secondary"
                    />
                    
                    <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 0.5,
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: alpha(theme.palette.text.secondary, 0.8),
                          fontSize: '0.8rem',
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Box>
                  </Button>
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="text"
            sx={{
              color: alpha(theme.palette.text.secondary, 0.7),
              fontSize: '0.9rem',
              fontWeight: 500,
              textTransform: 'none',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.primary.main,
              },
            }}
            endIcon={<ArrowForward sx={{ fontSize: '1rem' }} />}
            onClick={() => navigate('/dashboard')}
          >
            Посмотреть все возможности
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 
