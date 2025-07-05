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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Update as UpdateIcon,
  Backup as BackupIcon,
  DeleteSweep as ClearCacheIcon,
} from '@mui/icons-material';
import { useSnackbar } from '@/shared/ui';

interface SystemSettingsProps {
  onSave?: (settings: any) => Promise<void>;
  loading?: boolean;
}

/**
 * SystemSettings - компонент для системных настроек
 * Позволяет управлять кэшем, обновлениями и системными параметрами
 */
export const SystemSettings: React.FC<SystemSettingsProps> = ({
  onSave,
  loading = false,
}) => {
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [preloadData, setPreloadData] = useState(true);
  const [enableDebugMode, setEnableDebugMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  // Mock system info
  const systemInfo = {
    version: '1.0.0',
    buildDate: '2024-01-15',
    cacheSize: '45.2 MB',
    storageUsed: '128.5 MB',
    lastUpdate: '2024-01-10',
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.({
        autoUpdates,
        preloadData,
        enableDebugMode,
      });
      showSuccess('System settings saved successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await onSave?.({ action: 'clear_cache' });
      showSuccess('Cache cleared successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to clear cache');
    }
  };

  const handleCheckUpdates = async () => {
    try {
      await onSave?.({ action: 'check_updates' });
      showSuccess('No updates available');
    } catch (error: any) {
      showError(error.message || 'Failed to check for updates');
    }
  };

  const handleExportData = async () => {
    try {
      await onSave?.({ action: 'export_data' });
      showSuccess('Data export started');
    } catch (error: any) {
      showError(error.message || 'Failed to export data');
    }
  };

  return (
    <Box>
      {/* System Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <UpdateIcon />
              </ListItemIcon>
              <ListItemText
                primary="Version"
                secondary={systemInfo.version}
              />
              <Chip label="Current" size="small" color="success" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <StorageIcon />
              </ListItemIcon>
              <ListItemText
                primary="Storage Used"
                secondary={systemInfo.storageUsed}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <MemoryIcon />
              </ListItemIcon>
              <ListItemText
                primary="Cache Size"
                secondary={systemInfo.cacheSize}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Preferences
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoUpdates}
                  onChange={(e) => setAutoUpdates(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Automatic Updates</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatically download and install updates
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preloadData}
                  onChange={(e) => setPreloadData(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Preload Data</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Load data in advance for faster navigation
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={enableDebugMode}
                  onChange={(e) => setEnableDebugMode(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Debug Mode</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enable detailed logging for troubleshooting
                  </Typography>
                </Box>
              }
            />
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

      {/* System Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Actions
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Clear Cache
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Free up space by clearing temporary files
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ClearCacheIcon />}
                onClick={handleClearCache}
                size="small"
              >
                Clear
              </Button>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Check for Updates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manually check for system updates
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<UpdateIcon />}
                onClick={handleCheckUpdates}
                size="small"
              >
                Check
              </Button>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Export Data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Download a backup of your data
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                onClick={handleExportData}
                size="small"
              >
                Export
              </Button>
            </Box>
          </Box>

          <Alert severity="warning" sx={{ mt: 3 }}>
            Some actions may require application restart to take effect.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}; 