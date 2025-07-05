import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as NotificationIcon,
  Phone as PhoneIcon,
  Desktop as DesktopIcon,
} from '@mui/icons-material';
import { useSnackbar } from '@/shared/ui';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
}

interface NotificationSettingsProps {
  onSave?: (settings: NotificationSetting[]) => Promise<void>;
  loading?: boolean;
}

/**
 * NotificationSettings - компонент для управления настройками уведомлений
 * Позволяет настроить различные типы уведомлений и каналы доставки
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSave,
  loading = false,
}) => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new_requirements',
      label: 'New Requirements',
      description: 'Notifications when new requirements are created',
      icon: <NotificationIcon />,
      enabled: true,
      channels: {
        email: true,
        push: true,
        sms: false,
        desktop: true,
      },
    },
    {
      id: 'requirement_updates',
      label: 'Requirement Updates',
      description: 'Notifications when requirements are updated or commented',
      icon: <NotificationIcon />,
      enabled: true,
      channels: {
        email: true,
        push: true,
        sms: false,
        desktop: false,
      },
    },
    {
      id: 'project_invitations',
      label: 'Project Invitations',
      description: 'Notifications when you are invited to projects',
      icon: <NotificationIcon />,
      enabled: true,
      channels: {
        email: true,
        push: true,
        sms: true,
        desktop: true,
      },
    },
    {
      id: 'release_notifications',
      label: 'Release Notifications',
      description: 'Notifications about release updates and deployments',
      icon: <NotificationIcon />,
      enabled: true,
      channels: {
        email: true,
        push: false,
        sms: false,
        desktop: true,
      },
    },
    {
      id: 'test_results',
      label: 'Test Results',
      description: 'Notifications about test execution results',
      icon: <NotificationIcon />,
      enabled: false,
      channels: {
        email: false,
        push: false,
        sms: false,
        desktop: false,
      },
    },
    {
      id: 'system_maintenance',
      label: 'System Maintenance',
      description: 'Important system updates and maintenance notices',
      icon: <NotificationIcon />,
      enabled: true,
      channels: {
        email: true,
        push: true,
        sms: false,
        desktop: true,
      },
    },
  ]);

  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  const handleSettingToggle = (settingId: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { 
            ...setting, 
            enabled: !setting.enabled,
            // Если отключаем уведомление, отключаем все каналы
            channels: !setting.enabled ? setting.channels : {
              email: false,
              push: false,
              sms: false,
              desktop: false,
            }
          }
        : setting
    ));
  };

  const handleChannelToggle = (settingId: string, channel: keyof NotificationSetting['channels']) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { 
            ...setting, 
            channels: {
              ...setting.channels,
              [channel]: !setting.channels[channel],
            }
          }
        : setting
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(settings);
      showSuccess('Notification settings saved successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EmailIcon fontSize="small" />;
      case 'push': return <NotificationIcon fontSize="small" />;
      case 'sms': return <PhoneIcon fontSize="small" />;
      case 'desktop': return <DesktopIcon fontSize="small" />;
      default: return <NotificationIcon fontSize="small" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'email': return 'Email';
      case 'push': return 'Push';
      case 'sms': return 'SMS';
      case 'desktop': return 'Desktop';
      default: return channel;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your notification preferences and delivery channels
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Changes will take effect immediately after saving
        </Alert>

        <Box>
          {settings.map((setting, index) => (
            <Box key={setting.id}>
              <Box sx={{ py: 2 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={2} flex={1}>
                    <Box color="action.active">
                      {setting.icon}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {setting.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {setting.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={setting.enabled}
                    onChange={() => handleSettingToggle(setting.id)}
                    color="primary"
                  />
                </Box>

                {setting.enabled && (
                  <Box ml={5} mt={2}>
                    <Typography variant="body2" fontWeight={500} gutterBottom>
                      Delivery Channels:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {Object.entries(setting.channels).map(([channel, enabled]) => (
                        <Chip
                          key={channel}
                          icon={getChannelIcon(channel)}
                          label={getChannelLabel(channel)}
                          variant={enabled ? "filled" : "outlined"}
                          color={enabled ? "primary" : "default"}
                          size="small"
                          clickable
                          onClick={() => handleChannelToggle(setting.id, channel as keyof NotificationSetting['channels'])}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
              
              {index < settings.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 