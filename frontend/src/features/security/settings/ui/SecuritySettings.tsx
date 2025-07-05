import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Smartphone as PhoneIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { useSnackbar } from '@/shared/ui';

interface SecuritySettingsProps {
  onSave?: (settings: any) => Promise<void>;
  loading?: boolean;
}

/**
 * SecuritySettings - компонент для управления настройками безопасности
 * Позволяет изменить пароль, настроить 2FA и управлять активными сессиями
 */
export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onSave,
  loading = false,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showSuccess, showError } = useSnackbar();

  // Mock активные сессии
  const [activeSessions] = useState([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, US',
      lastActive: '2024-01-15 14:30',
      current: true,
      icon: <ComputerIcon />,
    },
    {
      id: '2', 
      device: 'Mobile Safari',
      location: 'New York, US',
      lastActive: '2024-01-15 12:15',
      current: false,
      icon: <PhoneIcon />,
    },
    {
      id: '3',
      device: 'Firefox on MacOS',
      location: 'San Francisco, US',
      lastActive: '2024-01-14 18:45',
      current: false,
      icon: <ComputerIcon />,
    },
  ]);

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave?.({
        action: 'change_password',
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password changed successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setSaving(true);
    try {
      await onSave?.({
        action: 'toggle_2fa',
        enabled: !twoFactorEnabled,
      });

      setTwoFactorEnabled(!twoFactorEnabled);
      showSuccess(
        !twoFactorEnabled 
          ? 'Two-factor authentication enabled' 
          : 'Two-factor authentication disabled'
      );
    } catch (error: any) {
      showError(error.message || 'Failed to update two-factor authentication');
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await onSave?.({
        action: 'terminate_session',
        sessionId,
      });
      showSuccess('Session terminated successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to terminate session');
    }
  };

  return (
    <Box>
      {/* Change Password */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          
          <Box component="form" onSubmit={handlePasswordChange}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              required
            />

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || loading}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security to your account
              </Typography>
            </Box>
            <Switch
              checked={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              disabled={saving || loading}
            />
          </Box>

          {twoFactorEnabled && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Two-factor authentication is enabled. You will need to enter a code from your authenticator app when signing in.
            </Alert>
          )}

          {!twoFactorEnabled && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Enable two-factor authentication to protect your account with an additional security step.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Sessions
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage devices that are currently signed in to your account
          </Typography>

          <List>
            {activeSessions.map((session, index) => (
              <Box key={session.id}>
                <ListItem
                  sx={{
                    bgcolor: session.current ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ mr: 2, color: 'action.active' }}>
                    {session.icon}
                  </Box>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {session.device}
                        </Typography>
                        {session.current && (
                          <Chip
                            label="Current"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {session.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last active: {session.lastActive}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {!session.current && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleTerminateSession(session.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                
                {index < activeSessions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            If you see any suspicious activity, terminate those sessions immediately and change your password.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}; 