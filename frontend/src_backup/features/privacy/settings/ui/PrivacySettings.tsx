import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { useSnackbar } from '@/shared/ui';

interface PrivacySettingsProps {
  onSave?: (settings: any) => Promise<void>;
  loading?: boolean;
}

/**
 * PrivacySettings - компонент для управления настройками приватности
 * Позволяет настроить видимость профиля и сбор данных
 */
export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  onSave,
  loading = false,
}) => {
  const [profileVisible, setProfileVisible] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [collectAnalytics, setCollectAnalytics] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.({
        profileVisible,
        allowDirectMessages,
        showOnlineStatus,
        collectAnalytics,
      });
      showSuccess('Privacy settings saved successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Privacy Settings
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Control your privacy and data sharing preferences
        </Typography>

        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Profile Visibility
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={profileVisible}
                  onChange={(e) => setProfileVisible(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Public Profile</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Allow others to view your profile information
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Communication
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowDirectMessages}
                    onChange={(e) => setAllowDirectMessages(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Direct Messages</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Allow other users to send you direct messages
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlineStatus}
                    onChange={(e) => setShowOnlineStatus(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Online Status</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Show when you're online to other users
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Data Collection
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={collectAnalytics}
                  onChange={(e) => setCollectAnalytics(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Analytics Data</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Help improve the service by sharing usage analytics
                  </Typography>
                </Box>
              }
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              We never share your personal information with third parties. 
              Analytics data is anonymized and used only to improve our service.
            </Alert>
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 