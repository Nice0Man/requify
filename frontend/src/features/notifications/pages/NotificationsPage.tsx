import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Chip,
  Button,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  CheckCircle as CheckCircleIcon,
  Info,
  Warning,
  Error,
  Delete,
  MoreVert,
  Settings,
  MarkEmailRead,
  MarkEmailUnread,
  Clear,
} from '@mui/icons-material';
import { formatTimeAgo } from '../../../shared/utils/formatters';
import { useApi } from '../../../shared/hooks/useApi';
import LoadingSpinner from '../../../shared/components/LoadingSpinner/LoadingSpinner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'text' | 'outlined' | 'contained';
  }>;
  relatedEntity?: {
    type: 'project' | 'requirement' | 'test' | 'release';
    id: string;
    name: string;
  };
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  projectUpdates: boolean;
  requirementChanges: boolean;
  testResults: boolean;
  releaseAnnouncements: boolean;
  mentions: boolean;
  systemAlerts: boolean;
}

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    requirementChanges: true,
    testResults: true,
    releaseAnnouncements: true,
    mentions: true,
    systemAlerts: true,
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const { loading, execute: loadNotifications } = useApi();
  const { execute: markAsRead } = useApi();
  const { execute: deleteNotification } = useApi();
  const { execute: updateSettings } = useApi();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await loadNotifications(() => 
      Promise.resolve([
        {
          id: '1',
          type: 'info' as const,
          title: 'Project Alpha Updated',
          message: 'New requirements have been added to Project Alpha. Please review the changes.',
          isRead: false,
          createdAt: '2024-01-15T10:30:00Z',
          relatedEntity: {
            type: 'project' as const,
            id: '1',
            name: 'Project Alpha',
          },
          sender: {
            id: '2',
            name: 'John Doe',
            avatar: '/api/avatars/john-doe.jpg',
          },
        },
        {
          id: '2',
          type: 'success' as const,
          title: 'Test Suite Passed',
          message: 'All tests in the regression suite have passed successfully.',
          isRead: false,
          createdAt: '2024-01-15T09:15:00Z',
          relatedEntity: {
            type: 'test' as const,
            id: '1',
            name: 'Regression Suite',
          },
        },
        {
          id: '3',
          type: 'warning' as const,
          title: 'Release Deadline Approaching',
          message: 'Release v2.1.0 is scheduled for tomorrow. Please ensure all tasks are completed.',
          isRead: true,
          createdAt: '2024-01-14T16:45:00Z',
          relatedEntity: {
            type: 'release' as const,
            id: '1',
            name: 'v2.1.0',
          },
          actions: [
            { label: 'View Release', action: 'view-release', variant: 'outlined' },
            { label: 'Mark Complete', action: 'mark-complete', variant: 'contained' },
          ],
        },
      ])
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(() => Promise.resolve({ success: true }));
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(() => Promise.resolve({ success: true }));
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await markAsRead(() => Promise.resolve({ success: true }));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAll = async () => {
    await deleteNotification(() => Promise.resolve({ success: true }));
    setNotifications([]);
  };

  const handleSettingChange = (setting: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSaveSettings = async () => {
    await updateSettings(() => Promise.resolve({ success: true }), {
      showSuccessToast: true,
      successMessage: 'Notification settings updated successfully',
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return !notification.isRead; // Unread
    if (activeTab === 2) return notification.isRead; // Read
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
              <Box component="span" ml={2}>
                Notifications
              </Box>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with the latest project activities and system alerts.
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              startIcon={<MarkEmailRead />}
              sx={{ mr: 1 }}
            >
              Mark All Read
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              startIcon={<Clear />}
            >
              Clear All
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={notifications.length} color="primary">
                  All
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={unreadCount} color="error">
                  Unread
                </Badge>
              } 
            />
            <Tab label="Read" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {activeTab === 3 ? (
          // Settings Tab
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose what notifications you want to receive and how you want to receive them.
              </Typography>

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Methods
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingChange('emailNotifications')}
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={() => handleSettingChange('pushNotifications')}
                    />
                  }
                  label="Push notifications (browser)"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Notification Types
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.projectUpdates}
                      onChange={() => handleSettingChange('projectUpdates')}
                    />
                  }
                  label="Project updates and milestones"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.requirementChanges}
                      onChange={() => handleSettingChange('requirementChanges')}
                    />
                  }
                  label="Requirement changes and approvals"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.testResults}
                      onChange={() => handleSettingChange('testResults')}
                    />
                  }
                  label="Test execution results"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.releaseAnnouncements}
                      onChange={() => handleSettingChange('releaseAnnouncements')}
                    />
                  }
                  label="Release announcements"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.mentions}
                      onChange={() => handleSettingChange('mentions')}
                    />
                  }
                  label="Mentions and assignments"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemAlerts}
                      onChange={() => handleSettingChange('systemAlerts')}
                    />
                  }
                  label="System alerts and maintenance"
                />
              </Box>

              <Box mt={3}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  startIcon={<Settings />}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          // Notifications List
          <Card>
            <CardContent>
              {loading ? (
                <LoadingSpinner message="Loading notifications..." />
              ) : filteredNotifications.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <NotificationsOff color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No notifications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeTab === 1 ? 'All caught up! No unread notifications.' : 'You have no notifications yet.'}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {filteredNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: notification.isRead ? 'inherit' : 'action.hover',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          {notification.sender ? (
                            <Avatar src={notification.sender.avatar} sx={{ width: 32, height: 32 }}>
                              {notification.sender.name.charAt(0)}
                            </Avatar>
                          ) : (
                            getNotificationIcon(notification.type)
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                              >
                                {notification.title}
                              </Typography>
                              <Chip
                                label={notification.type}
                                size="small"
                                color={getNotificationColor(notification.type) as any}
                              />
                              {!notification.isRead && (
                                <Chip label="New" size="small" color="primary" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(notification.createdAt)}
                                {notification.sender && ` • by ${notification.sender.name}`}
                                {notification.relatedEntity && ` • ${notification.relatedEntity.name}`}
                              </Typography>
                              {notification.actions && (
                                <Box mt={1} display="flex" gap={1}>
                                  {notification.actions.map((action, actionIndex) => (
                                    <Button
                                      key={actionIndex}
                                      size="small"
                                      variant={action.variant || 'text'}
                                      onClick={() => console.log(`Action: ${action.action}`)}
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              setMenuAnchorEl(e.currentTarget);
                              setSelectedNotification(notification.id);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredNotifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => {
            setMenuAnchorEl(null);
            setSelectedNotification(null);
          }}
        >
          <MenuItem
            onClick={() => {
              if (selectedNotification) {
                const notification = notifications.find(n => n.id === selectedNotification);
                if (notification) {
                  if (notification.isRead) {
                    // Mark as unread logic would go here
                  } else {
                    handleMarkAsRead(selectedNotification);
                  }
                }
              }
              setMenuAnchorEl(null);
              setSelectedNotification(null);
            }}
          >
            {selectedNotification && notifications.find(n => n.id === selectedNotification)?.isRead ? (
              <>
                <MarkEmailUnread sx={{ mr: 1 }} />
                Mark as Unread
              </>
            ) : (
              <>
                <MarkEmailRead sx={{ mr: 1 }} />
                Mark as Read
              </>
            )}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedNotification) {
                handleDeleteNotification(selectedNotification);
              }
              setMenuAnchorEl(null);
              setSelectedNotification(null);
            }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default NotificationsPage; 