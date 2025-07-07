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
  Grow,
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
          gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        };
      case 'task':
        return {
          icon: CheckCircle,
          color: theme.palette.success.main,
          label: 'Задача',
          gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
        };
      case 'user':
        return {
          icon: Person,
          color: theme.palette.info.main,
          label: 'Пользователь',
          gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
        };
      case 'code':
        return {
          icon: Code,
          color: theme.palette.warning.main,
          label: 'Код',
          gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
        };
      case 'bug':
        return {
          icon: BugReport,
          color: theme.palette.error.main,
          label: 'Баг',
          gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
        };
      default:
        return {
          icon: Assignment,
          color: theme.palette.primary.main,
          label: 'Событие',
          gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        };
    }
  };

  // Мок данные для демонстрации
  const mockActivities = activities || [
    {
      id: '1',
      title: 'Создано новое требование REQ-145',
      description: 'Добавлена функция авторизации через OAuth',
      type: 'requirement',
      user: 'Иван Петров',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
    },
    {
      id: '2',
      title: 'Задача выполнена',
      description: 'Реализована валидация форм на фронтенде',
      type: 'task',
      user: 'Мария Сидорова',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 часа назад
    },
    {
      id: '3',
      title: 'Исправлен критический баг',
      description: 'Устранена проблема с утечкой памяти в модуле кэширования',
      type: 'bug',
      user: 'Алексей Козлов',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 часа назад
    },
    {
      id: '4',
      title: 'Обновлен код компонента',
      description: 'Оптимизированы запросы к базе данных',
      type: 'code',
      user: 'Елена Васильева',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 часов назад
    },
  ];

  if (isLoading) {
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
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="200px"
          >
            <CircularProgress size={40} thickness={4} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          height: '100%',
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.light, 0.03)} 100%)`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Alert 
            severity="error"
            sx={{
              borderRadius: 4,
              backgroundColor: 'transparent',
              border: 'none',
            }}
          >
            Ошибка при загрузке активности: {error?.message || 'Неизвестная ошибка'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`,
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
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Timeline sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              Активность
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={`${mockActivities.length} событий`} 
              size="small" 
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                fontWeight: 600,
                borderRadius: 2,
              }}
            />
            <IconButton
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                  transform: 'rotate(180deg)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Activity List */}
        <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
          {mockActivities.length === 0 ? (
            <ListItem sx={{ p: 4, textAlign: 'center' }}>
              <ListItemText 
                primary="Нет активности"
                secondary="Активность появится здесь по мере работы с проектом"
                primaryTypographyProps={{
                  variant: 'h6',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.secondary',
                }}
              />
            </ListItem>
          ) : (
            mockActivities.map((activity, index) => {
              const activityConfig = getActivityConfig(activity.type);
              const ActivityIcon = activityConfig.icon;
              
              return (
                <Grow 
                  in 
                  timeout={800 + index * 200} 
                  key={activity.id}
                  style={{ transformOrigin: '0 0 0' }}
                >
                  <Box>
                    <ListItem 
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        mb: 2,
                        border: `1px solid ${alpha(activityConfig.color, 0.1)}`,
                        background: `linear-gradient(135deg, ${alpha(activityConfig.color, 0.03)} 0%, ${alpha(activityConfig.color, 0.01)} 100%)`,
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                          borderColor: alpha(activityConfig.color, 0.2),
                          transform: 'translateX(4px)',
                          backgroundColor: alpha(activityConfig.color, 0.06),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: activityConfig.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: `0 4px 12px ${alpha(activityConfig.color, 0.3)}`,
                          }}
                        >
                          <ActivityIcon sx={{ fontSize: 16, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {activity.title}
                            </Typography>
                            <Chip 
                              label={activityConfig.label} 
                              size="small" 
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: alpha(activityConfig.color, 0.1),
                                color: activityConfig.color,
                                fontWeight: 600,
                                borderRadius: 1.5,
                              }}
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {activity.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: activityConfig.color }}>
                              {activity.user}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
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
                </Grow>
              );
            })
          )}
        </List>

        {/* Footer */}
        <Button
          fullWidth
          endIcon={<ArrowForward />}
          sx={{
            mt: 3,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 3,
            py: 1.5,
            backgroundColor: alpha(theme.palette.secondary.main, 0.05),
            color: theme.palette.secondary.main,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 20px ${alpha(theme.palette.secondary.main, 0.15)}`,
            },
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          Вся активность
        </Button>
      </CardContent>
    </Card>
  );
}; 
