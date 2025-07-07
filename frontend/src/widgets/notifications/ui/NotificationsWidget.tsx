import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  Typography,
  IconButton,
  Button,
  Chip,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Notifications,
  Flag,
  Info,
  Warning,
  Error,
  CheckCircle,
  MarkEmailRead,
  Clear,
  ArrowForward,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LiquidGlassIcon } from '@/shared/ui';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

export const NotificationsWidget: React.FC = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      priority: 'medium',
      title: 'Новое требование добавлено',
      message: 'Требование "Авторизация пользователей" добавлено в проект E-commerce Platform',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      priority: 'high',
      title: 'Приближается дедлайн',
      message: 'До завершения спринта осталось 2 дня',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      id: '3',
      type: 'success',
      priority: 'low',
      title: 'Тест прошел успешно',
      message: 'Модуль аутентификации успешно прошел все тесты',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
    },
    {
      id: '4',
      type: 'error',
      priority: 'high',
      title: 'Ошибка в продакшене',
      message: 'Обнаружена критическая ошибка в модуле платежей',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      read: false,
    },
  ]);

  const getNotificationConfig = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return {
          color: theme.palette.info.main,
          icon: Info,
          background: alpha(theme.palette.info.main, 0.1),
        };
      case 'warning':
        return {
          color: theme.palette.warning.main,
          icon: Warning,
          background: alpha(theme.palette.warning.main, 0.1),
        };
      case 'error':
        return {
          color: theme.palette.error.main,
          icon: Error,
          background: alpha(theme.palette.error.main, 0.1),
        };
      case 'success':
        return {
          color: theme.palette.success.main,
          icon: CheckCircle,
          background: alpha(theme.palette.success.main, 0.1),
        };
      default:
        return {
          color: theme.palette.info.main,
          icon: Info,
          background: alpha(theme.palette.info.main, 0.1),
        };
    }
  };

  const getPriorityConfig = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return {
          label: 'Высокий',
          color: theme.palette.error.main,
          background: alpha(theme.palette.error.main, 0.1),
        };
      case 'medium':
        return {
          label: 'Средний',
          color: theme.palette.warning.main,
          background: alpha(theme.palette.warning.main, 0.1),
        };
      case 'low':
        return {
          label: 'Низкий',
          color: theme.palette.success.main,
          background: alpha(theme.palette.success.main, 0.1),
        };
      default:
        return {
          label: 'Средний',
          color: theme.palette.warning.main,
          background: alpha(theme.palette.warning.main, 0.1),
        };
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
              icon={Notifications}
              color={theme.palette.primary.main}
              gradient={`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`}
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
              Уведомления
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{
                  backgroundColor: theme.palette.error.main,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  minWidth: 20,
                  height: 20,
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
            )}
          </Box>
          <ArrowForward 
            sx={{ 
              color: alpha(theme.palette.text.secondary, 0.6),
              fontSize: '1.2rem',
            }} 
          />
        </Box>

        {unreadCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              startIcon={<MarkEmailRead />}
              onClick={handleMarkAllAsRead}
              sx={{
                color: theme.palette.primary.main,
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                px: 2,
                py: 0.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Отметить все как прочитанные
            </Button>
          </Box>
        )}

        <List sx={{ flex: 1, overflow: 'auto', px: 0 }}>
          {notifications.map((notification, index) => {
            const typeConfig = getNotificationConfig(notification.type);
            const priorityConfig = getPriorityConfig(notification.priority);
            const Icon = typeConfig.icon;

            return (
              <Fade in timeout={800 + index * 200} key={notification.id}>
                <Box>
                  <ListItem
                    sx={{
                      p: 0,
                      mb: 2,
                      borderRadius: 4,
                      border: `1px solid ${alpha(typeConfig.color, 0.1)}`,
                      background: notification.read 
                        ? alpha(theme.palette.grey[50], 0.3)
                        : `linear-gradient(135deg, 
                            ${alpha(typeConfig.color, 0.05)} 0%, 
                            ${alpha(typeConfig.color, 0.02)} 100%
                          )`,
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: alpha(typeConfig.color, 0.2),
                        transform: 'translateX(4px)',
                        boxShadow: `0 8px 24px ${alpha(typeConfig.color, 0.15)}`,
                      },
                      // Light refraction on notification
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: `linear-gradient(180deg, 
                          ${alpha(theme.palette.common.white, 0.08)} 0%, 
                          transparent 100%
                        )`,
                        pointerEvents: 'none',
                      },
                    }}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
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
                        color={typeConfig.color}
                        gradient={`linear-gradient(135deg, ${typeConfig.color}, ${alpha(typeConfig.color, 0.8)})`}
                        size={32}
                        variant="subtle"
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.read ? 500 : 700,
                              color: theme.palette.text.primary,
                              fontSize: '0.9rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                            <Chip
                              label={priorityConfig.label}
                              size="small"
                              icon={<Flag sx={{ fontSize: '0.8rem !important' }} />}
                              sx={{
                                backgroundColor: priorityConfig.background,
                                color: priorityConfig.color,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 20,
                                borderRadius: 2,
                                border: `1px solid ${alpha(priorityConfig.color, 0.2)}`,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveNotification(notification.id);
                              }}
                              sx={{
                                width: 20,
                                height: 20,
                                color: alpha(theme.palette.text.secondary, 0.6),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  color: theme.palette.error.main,
                                },
                              }}
                            >
                              <Clear sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color: alpha(theme.palette.text.secondary, 0.8),
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {notification.message}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha(theme.palette.text.secondary, 0.6),
                            fontSize: '0.75rem',
                          }}
                        >
                          {formatDistanceToNow(notification.timestamp, { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </Box>
              </Fade>
            );
          })}
        </List>

        {notifications.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            color: alpha(theme.palette.text.secondary, 0.6),
          }}>
            <Typography variant="body2">
              Нет уведомлений
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
            Показать все уведомления
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 