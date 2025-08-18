import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Box,
  Button,
  IconButton,
  Chip,
  useTheme,
  alpha,
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
  const isDark = theme.palette.mode === 'dark';
  
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
        borderRadius: 5,
        // Authentic Liquid Glass background
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 0%, 
            ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.12)} 50%,
            ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 100%
          ),
          linear-gradient(225deg, 
            ${alpha(theme.palette.primary.main, 0.06)} 0%, 
            transparent 60%
          ),
          ${alpha(theme.palette.background.paper, isDark ? 0.5 : 0.85)}
        `,
        // Advanced backdrop filter
        backdropFilter: 'blur(40px) saturate(150%) contrast(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(150%) contrast(120%)',
        // Multi-layer border
        border: `1px solid ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)}`,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        // Enhanced shadow system
        boxShadow: `
          inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.3)},
          inset 0 -1px 0 ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)},
          0 4px 24px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)},
          0 1px 6px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.04)},
          0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}
        `,
        
        // Top light refraction
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `
            linear-gradient(180deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.1)} 40%,
              transparent 100%
            )
          `,
          borderRadius: '20px 20px 0 0',
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LiquidGlassIcon
              icon={Notifications}
              color={theme.palette.primary.main}
              size={32}
              variant="secondary"
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: `0 1px 2px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.1)}`,
              }}
            >
              Уведомления
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{
                  // Liquid Glass chip
                  background: `
                    linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.25)} 0%, 
                      ${alpha(theme.palette.primary.main, isDark ? 0.1 : 0.15)} 100%
                    )
                  `,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                  minWidth: 22,
                  borderRadius: 2.5,
                  boxShadow: `
                    inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)},
                    0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}
                  `,
                }}
              />
            )}
          </Box>
        </Box>

        {unreadCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="text"
              onClick={handleMarkAllAsRead}
              startIcon={<MarkEmailRead />}
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: alpha(theme.palette.text.secondary, 0.8),
                textTransform: 'none',
                // Liquid Glass button
                background: `
                  linear-gradient(135deg, 
                    ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.15)} 0%, 
                    ${alpha(theme.palette.common.white, isDark ? 0.03 : 0.08)} 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.15 : 0.2)}`,
                borderRadius: 3,
                px: 2,
                py: 0.75,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  background: `
                    linear-gradient(135deg, 
                      ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.22)} 0%, 
                      ${alpha(theme.palette.common.white, isDark ? 0.06 : 0.12)} 100%
                    )
                  `,
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transform: 'translateY(-1px)',
                  boxShadow: `
                    inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)},
                    0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}
                  `,
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
                      // Notification Liquid Glass effect
                      background: notification.read 
                        ? `
                          linear-gradient(135deg, 
                            ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.12)} 0%, 
                            ${alpha(theme.palette.common.white, isDark ? 0.02 : 0.06)} 100%
                          ),
                          ${alpha(theme.palette.background.paper, isDark ? 0.3 : 0.6)}
                        `
                        : `
                          linear-gradient(135deg, 
                            ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.18)} 0%, 
                            ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.1)} 50%,
                            ${alpha(theme.palette.common.white, isDark ? 0.06 : 0.14)} 100%
                          ),
                          linear-gradient(225deg, 
                            ${alpha(typeConfig.color, 0.06)} 0%, 
                            transparent 60%
                          ),
                          ${alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7)}
                        `,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(typeConfig.color, notification.read ? 0.05 : 0.12)}`,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: `
                        inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)},
                        0 2px 8px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)}
                      `,
                      '&:hover': {
                        borderColor: alpha(typeConfig.color, 0.2),
                        transform: 'translateX(4px)',
                        background: `
                          linear-gradient(135deg, 
                            ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.25)} 0%, 
                            ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.15)} 50%,
                            ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)} 100%
                          ),
                          linear-gradient(225deg, 
                            ${alpha(typeConfig.color, 0.1)} 0%, 
                            transparent 60%
                          ),
                          ${alpha(theme.palette.background.paper, isDark ? 0.5 : 0.8)}
                        `,
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        boxShadow: `
                          inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.15 : 0.3)},
                          0 8px 24px ${alpha(typeConfig.color, 0.15)}
                        `,
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
                          ${alpha(theme.palette.common.white, isDark ? 0.06 : 0.12)} 0%, 
                          transparent 100%
                        )`,
                        pointerEvents: 'none',
                        borderRadius: '16px 16px 0 0',
                        mixBlendMode: 'overlay',
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
                              textShadow: `0 1px 1px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.05)}`,
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
                                // Liquid Glass priority chip
                                background: `
                                  linear-gradient(135deg, 
                                    ${alpha(priorityConfig.color, isDark ? 0.15 : 0.2)} 0%, 
                                    ${alpha(priorityConfig.color, isDark ? 0.08 : 0.12)} 100%
                                  )
                                `,
                                backdropFilter: 'blur(15px)',
                                WebkitBackdropFilter: 'blur(15px)',
                                color: priorityConfig.color,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 20,
                                borderRadius: 2,
                                border: `1px solid ${alpha(priorityConfig.color, 0.2)}`,
                                boxShadow: `
                                  inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.15)},
                                  0 1px 4px ${alpha(priorityConfig.color, 0.15)}
                                `,
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
                                // Liquid Glass close button
                                background: `
                                  linear-gradient(135deg, 
                                    ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.15)} 0%, 
                                    ${alpha(theme.palette.common.white, isDark ? 0.03 : 0.08)} 100%
                                  )
                                `,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.1 : 0.15)}`,
                                borderRadius: 1.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: `
                                    linear-gradient(135deg, 
                                      ${alpha(theme.palette.error.main, 0.12)} 0%, 
                                      ${alpha(theme.palette.error.main, 0.08)} 100%
                                    )
                                  `,
                                  backdropFilter: 'blur(15px)',
                                  WebkitBackdropFilter: 'blur(15px)',
                                  color: theme.palette.error.main,
                                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                  transform: 'scale(1.1)',
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.2)}`,
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
                            textShadow: `0 1px 1px ${alpha(theme.palette.common.black, isDark ? 0.15 : 0.03)}`,
                          }}
                        >
                          {notification.message}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha(theme.palette.text.secondary, 0.6),
                            fontSize: '0.75rem',
                            textShadow: `0 1px 1px ${alpha(theme.palette.common.black, isDark ? 0.1 : 0.02)}`,
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
              // Liquid Glass footer button
              background: `
                linear-gradient(135deg, 
                  ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.15)} 0%, 
                  ${alpha(theme.palette.common.white, isDark ? 0.03 : 0.08)} 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.1 : 0.15)}`,
              borderRadius: 3,
              px: 2,
              py: 1,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                background: `
                  linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                    ${alpha(theme.palette.primary.main, 0.04)} 100%
                  )
                `,
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                transform: 'translateY(-1px)',
                boxShadow: `
                  inset 0 1px 0 ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)},
                  0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}
                `,
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