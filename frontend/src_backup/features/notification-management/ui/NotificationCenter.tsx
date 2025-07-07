import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Delete,
  DoneAll,
  Settings,
  Circle,
} from '@mui/icons-material';
import { useNotifications } from '../model/notification-management.hooks';

interface NotificationCenterProps {
  compact?: boolean;
  maxItems?: number;
}

export function NotificationCenter({ 
  compact = false, 
  maxItems = 10 
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    total,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <NotificationsActive color="primary" />;
      case 'test_result':
        return <Notifications color="success" />;
      default:
        return <Notifications color="disabled" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'normal':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Loading notifications...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => loadNotifications()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: compact ? 400 : 600 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
            <Typography variant="h6">
              Notifications
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                startIcon={<DoneAll />} 
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>
            )}
            <IconButton size="small">
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* Summary */}
        {!compact && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {total} total • {unreadCount} unread
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Notifications sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <List dense>
            {notifications.slice(0, maxItems).map((notification) => (
              <ListItem 
                key={notification.id} 
                sx={{ 
                  pl: 0,
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {!notification.read && (
                    <Circle 
                      color="primary" 
                      sx={{ fontSize: 12, mr: 1 }} 
                    />
                  )}
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={notification.read ? 'normal' : 'bold'}
                      >
                        {notification.title}
                      </Typography>
                      <Chip 
                        label={notification.priority} 
                        size="small" 
                        color={getPriorityColor(notification.priority) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {!notification.read && (
                    <IconButton 
                      size="small" 
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <DoneAll fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton 
                    size="small" 
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}

        {/* Show More */}
        {notifications.length > maxItems && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="outlined" size="small">
              View All Notifications ({total})
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 