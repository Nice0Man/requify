import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  CircularProgress, 
  Alert,
  Chip,
  alpha,
  useTheme,
  IconButton,
  Button,
  Fade,
} from '@mui/material';
import { 
  Assignment, 
  CheckCircle, 
  Person, 
  Code, 
  BugReport,
  Timeline,
  ArrowForward,
  Refresh,
} from '@mui/icons-material';
import { useRecentActivity } from '@/features/dashboard/model/useDashboardQuery';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LiquidGlassIcon } from '@/shared/ui';

export const ActivityFeedWidget: React.FC = () => {
  const theme = useTheme();
  const { data: activities, isLoading, error, isError } = useRecentActivity();

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'requirement':
        return {
          icon: Assignment,
          color: theme.palette.primary.main,
          label: 'Требование',
          background: alpha(theme.palette.primary.main, 0.1),
        };
      case 'project':
        return {
          icon: Code,
          color: theme.palette.secondary.main,
          label: 'Проект',
          background: alpha(theme.palette.secondary.main, 0.1),
        };
      case 'release':
        return {
          icon: Timeline,
          color: theme.palette.info.main,
          label: 'Релиз',
          background: alpha(theme.palette.info.main, 0.1),
        };
      case 'test':
        return {
          icon: BugReport,
          color: theme.palette.warning.main,
          label: 'Тест',
          background: alpha(theme.palette.warning.main, 0.1),
        };
      default:
        return {
          icon: CheckCircle,
          color: theme.palette.success.main,
          label: 'Активность',
          background: alpha(theme.palette.success.main, 0.1),
        };
    }
  };

  const mockActivities = [
    {
      id: '1',
      type: 'requirement',
      title: 'Создано новое требование "Авторизация пользователей"',
      description: 'Добавлено в проект E-commerce Platform',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      user: 'Анна Смирнова',
      userName: 'Анна Смирнова',
    },
    {
      id: '2',
      type: 'project',
      title: 'Обновлен проект "Mobile App"',
      description: 'Изменен статус на "В работе"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: 'Петр Иванов',
      userName: 'Петр Иванов',
    },
    {
      id: '3',
      type: 'test',
      title: 'Прошел тест "Интеграция платежей"',
      description: 'Все проверки выполнены успешно',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      user: 'Мария Коваль',
      userName: 'Мария Коваль',
    },
    {
      id: '4',
      type: 'release',
      title: 'Создан релиз v2.1.0',
      description: 'Релиз готов к тестированию',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      user: 'Алексей Попов',
      userName: 'Алексей Попов',
    },
    {
      id: '5',
      type: 'requirement',
      title: 'Завершено требование "Система уведомлений"',
      description: 'Требование прошло все этапы',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      user: 'Елена Сидорова',
      userName: 'Елена Сидорова',
    },
  ];

  const displayActivities = isError || !activities ? mockActivities : activities;

  const handleRefresh = () => {
    // Trigger refresh logic here
    window.location.reload();
  };

  if (isLoading) {
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
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress 
          size={40} 
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
            filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`,
          }}
        />
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert 
        severity="error"
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.error.main, 0.05)} 0%, 
            ${alpha(theme.palette.error.light, 0.03)} 100%
          )`,
          backdropFilter: 'blur(20px)',
        }}
      >
        Ошибка при загрузке активности: {error?.message || 'Неизвестная ошибка'}
      </Alert>
    );
  }

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
        height: '100%',
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
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LiquidGlassIcon
              icon={Timeline}
              color={theme.palette.info.main}
              gradient={`linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`}
              size={32}
              variant="secondary"
            />
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
              Последняя активность
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleRefresh}
              sx={{
                color: alpha(theme.palette.text.secondary, 0.6),
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Refresh sx={{ fontSize: '1rem' }} />
            </IconButton>
            <ArrowForward 
              sx={{ 
                color: alpha(theme.palette.text.secondary, 0.6),
                fontSize: '1.2rem',
              }} 
            />
          </Box>
        </Box>

        <List sx={{ flex: 1, overflow: 'auto', px: 0 }}>
          {displayActivities.map((activity, index) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;

            return (
              <Fade in timeout={600 + index * 150} key={activity.id}>
                <Box>
                  <ListItem
                    sx={{
                      p: 0,
                      mb: 2,
                      borderRadius: 4,
                      border: `1px solid ${alpha(config.color, 0.1)}`,
                      background: `linear-gradient(135deg, 
                        ${alpha(config.color, 0.03)} 0%, 
                        ${alpha(config.color, 0.01)} 100%
                      )`,
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: alpha(config.color, 0.2),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(config.color, 0.15)}`,
                        background: `linear-gradient(135deg, 
                          ${alpha(config.color, 0.05)} 0%, 
                          ${alpha(config.color, 0.02)} 100%
                        )`,
                      },
                      // Timeline line
                      '&::after': index < displayActivities.length - 1 ? {
                        content: '""',
                        position: 'absolute',
                        left: 24,
                        bottom: -10,
                        width: 2,
                        height: 20,
                        background: alpha(theme.palette.divider, 0.3),
                        zIndex: 0,
                      } : {},
                      // Light refraction on activity
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
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        p: 2,
                        width: '100%',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <LiquidGlassIcon
                        icon={Icon}
                        color={config.color}
                        gradient={`linear-gradient(135deg, ${config.color}, ${alpha(config.color, 0.8)})`}
                        size={36}
                        variant="subtle"
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              fontSize: '0.9rem',
                              lineHeight: 1.3,
                              flex: 1,
                              pr: 1,
                            }}
                          >
                            {activity.title}
                          </Typography>
                          <Chip
                            label={config.label}
                            size="small"
                            sx={{
                              backgroundColor: config.background,
                              color: config.color,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 20,
                              borderRadius: 2,
                              border: `1px solid ${alpha(config.color, 0.2)}`,
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color: alpha(theme.palette.text.secondary, 0.8),
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            mb: 1,
                          }}
                        >
                          {activity.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LiquidGlassIcon
                              icon={Person}
                              color={theme.palette.grey[600]}
                              size={16}
                              variant="subtle"
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: alpha(theme.palette.text.secondary, 0.8),
                                fontWeight: 500,
                                fontSize: '0.75rem',
                              }}
                            >
                              {activity.userName}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: alpha(theme.palette.text.secondary, 0.6),
                              fontSize: '0.7rem',
                            }}
                          >
                            {formatDistanceToNow(new Date(activity.timestamp), { 
                              addSuffix: true, 
                              locale: ru 
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                </Box>
              </Fade>
            );
          })}
        </List>

        {displayActivities.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            color: alpha(theme.palette.text.secondary, 0.6),
          }}>
            <Typography variant="body2">
              Нет активности
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
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
          >
            Вся активность
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 
