import React from 'react';
import { Card, CardContent, Typography, Box, alpha, useTheme, Fade, Button, Stack, IconButton } from '@mui/material';
import { Add, Assignment, RocketLaunch, BugReport, Settings, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  gradient: string;
}

export const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const actions: QuickAction[] = [
    {
      title: 'Новый проект',
      description: 'Создать новый проект',
      icon: RocketLaunch,
      path: '/projects/new',
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    {
      title: 'Добавить требование',
      description: 'Создать новое требование',
      icon: Assignment,
      path: '/requirements/new',
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
    {
      title: 'Создать тест-кейс',
      description: 'Добавить новый тест-кейс',
      icon: BugReport,
      path: '/testing/new',
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
    },
    {
      title: 'Настройки',
      description: 'Конфигурация проекта',
      icon: Settings,
      path: '/settings',
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
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
          left: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
        },
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
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
              <Add sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              Быстрые действия
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

        {/* Quick Actions Grid */}
        <Stack spacing={2}>
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Fade in timeout={800 + index * 150} key={index}>
                <Button
                  onClick={() => navigate(action.path)}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: `1px solid ${alpha(action.color, 0.1)}`,
                    background: `linear-gradient(135deg, ${alpha(action.color, 0.05)} 0%, ${alpha(action.color, 0.02)} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    width: '100%',
                    minHeight: 80,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      borderColor: alpha(action.color, 0.2),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(action.color, 0.15)}`,
                      background: `linear-gradient(135deg, ${alpha(action.color, 0.08)} 0%, ${alpha(action.color, 0.04)} 100%)`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '30%',
                      height: '100%',
                      background: `radial-gradient(circle at top right, ${alpha(action.color, 0.08)} 0%, transparent 60%)`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%', position: 'relative', zIndex: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: action.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 8px 20px ${alpha(action.color, 0.3)}`,
                      }}
                    >
                      <Icon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          mb: 0.5,
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Box>
                    <ArrowForward 
                      sx={{ 
                        color: action.color,
                        fontSize: 20,
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </Box>
                </Button>
              </Fade>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}; 
