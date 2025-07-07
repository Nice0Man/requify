import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  alpha, 
  useTheme, 
  Fade, 
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Stack,
  Badge,
} from '@mui/material';
import { 
  Notifications, 
  CheckCircle, 
  Warning, 
  Error,
  Info,
  Close,
  Settings,
  MarkEmailRead,
  NotificationsActive,
} from '@mui/icons-material';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const NotificationsWidget: React.FC = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Релиз готов к развертыванию',
      message: 'Версия 2.1.0 прошла все тесты и готова к публикации',
      time: '5 мин назад',
      type: 'success',
      read: false,
      priority: 'high',
    },
    {
      id: '2',
      title: 'Внимание: просроченное требование',
      message: 'REQ-145 требует обновления до конца недели',
      time: '1 час назад',
      type: 'warning',
      read: false,
      priority: 'high',
    },
    {
      id: '3',
      title: 'Новый участник команды',
      message: 'Анна Иванова присоединилась к проекту Mobile App',
      time: '2 часа назад',
      type: 'info',
      read: true,
      priority: 'medium',
    },
    {
      id: '4',
      title: 'Критическая ошибка',
      message: 'Обнаружена проблема в системе авторизации',
      time: '3 часа назад',
      type: 'error',
      read: false,
      priority: 'high',
    },
    {
      id: '5',
      title: 'Отчет готов',
      message: 'Еженедельный отчет по проекту сформирован',
      time: '1 день назад',
      type: 'info',
      read: true,
      priority: 'low',
    },
  ]);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1),
        };
      case 'warning':
        return {
          icon: Warning,
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
        };
      case 'error':
        return {
          icon: Error,
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
        };
      default:
        return {
          icon: Info,
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.1),
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 4);

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
          top: -40,
          left: -40,
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
            <Badge badgeContent={unreadCount} color="error" max={99}>
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
                <NotificationsActive sx={{ color: 'white', fontSize: 20 }} />
              </Box>
            </Badge>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              Уведомления
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.success.main, 0.2),
                },
              }}
            >
              <MarkEmailRead fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                color: theme.palette.grey[600],
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[500], 0.2),
                },
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Notifications List */}
        {recentNotifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {recentNotifications.map((notification, index) => {
              const typeConfig = getTypeConfig(notification.type);
              const Icon = typeConfig.icon;
              
              return (
                <Fade in timeout={800 + index * 200} key={notification.id}>
                  <Box>
                    <ListItem
                      sx={{
                        p: 0,
                        mb: 2,
                        borderRadius: 3,
                        border: `1px solid ${alpha(typeConfig.color, 0.1)}`,
                        background: notification.read 
                          ? alpha(theme.palette.grey[50], 0.3)
                          : `linear-gradient(135deg, ${alpha(typeConfig.color, 0.05)} 0%, ${alpha(typeConfig.color, 0.02)} 100%)`,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: alpha(typeConfig.color, 0.2),
                          transform: 'translateX(4px)',
                          boxShadow: `0 8px 16px ${alpha(typeConfig.color, 0.1)}`,
                        },
                        '&::before': notification.read ? {} : {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: 4,
                          height: '100%',
                          background: typeConfig.color,
                        },
                      }}
                    >
                    <Box sx={{ p: 2, width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: typeConfig.bgColor,
                            mt: 0.5,
                          }}
                        >
                          <Icon sx={{ fontSize: 20, color: typeConfig.color }} />
                        </Avatar>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: notification.read ? 500 : 700,
                                color: notification.read ? theme.palette.text.secondary : theme.palette.text.primary,
                                flex: 1,
                                pr: 1,
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              sx={{
                                opacity: 0.5,
                                '&:hover': { opacity: 1 },
                                width: 20,
                                height: 20,
                              }}
                            >
                              <Close sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {notification.time}
                              </Typography>
                              <Chip
                                label={notification.priority}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.65rem',
                                  backgroundColor: alpha(getPriorityColor(notification.priority), 0.1),
                                  color: getPriorityColor(notification.priority),
                                  '& .MuiChip-label': { px: 1 },
                                }}
                              />
                            </Box>
                            {!notification.read && (
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                sx={{
                                  minWidth: 'auto',
                                  fontSize: '0.7rem',
                                  px: 1.5,
                                  py: 0.25,
                                  color: typeConfig.color,
                                  '&:hover': {
                                    backgroundColor: alpha(typeConfig.color, 0.1),
                                  },
                                }}
                              >
                                Прочитано
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                </Box>
                </Fade>
              );
            })}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Notifications sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Нет новых уведомлений
            </Typography>
          </Box>
        )}

        {/* View All Button */}
        {notifications.length > 4 && (
          <Button
            fullWidth
            variant="outlined"
            sx={{
              mt: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            Показать все уведомления ({notifications.length - 4} еще)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 