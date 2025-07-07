import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  Button,
  Divider,
  Slider,
  Chip,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness6,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useSnackbar } from '@/shared/ui';

interface AppearanceSettingsProps {
  onSave?: (settings: any) => Promise<void>;
  loading?: boolean;
}

/**
 * AppearanceSettings - компонент для управления внешним видом приложения
 * Позволяет настроить тему, язык, размер шрифта и другие параметры интерфейса
 */
export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  onSave,
  loading = false,
}) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState(14);
  const [compactMode, setCompactMode] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);
  const [accentColor, setAccentColor] = useState('blue');
  const [saving, setSaving] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.({
        theme,
        language,
        fontSize,
        compactMode,
        showAnimations,
        accentColor,
      });
      showSuccess('Appearance settings saved successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to save appearance settings');
    } finally {
      setSaving(false);
    }
  };

  const accentColors = [
    { value: 'blue', label: 'Blue', color: '#1976d2' },
    { value: 'purple', label: 'Purple', color: '#7b1fa2' },
    { value: 'green', label: 'Green', color: '#388e3c' },
    { value: 'orange', label: 'Orange', color: '#f57c00' },
    { value: 'red', label: 'Red', color: '#d32f2f' },
    { value: 'teal', label: 'Teal', color: '#00796b' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Appearance Settings
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Customize the look and feel of your interface
        </Typography>

        <Box>
          {/* Theme Selection */}
          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Theme
                </Typography>
              </FormLabel>
              <RadioGroup
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                row
              >
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <LightMode fontSize="small" />
                      Light
                    </Box>
                  }
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <DarkMode fontSize="small" />
                      Dark
                    </Box>
                  }
                />
                <FormControlLabel
                  value="auto"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Brightness6 fontSize="small" />
                      Auto
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Accent Color */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Accent Color
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {accentColors.map((color) => (
                <Chip
                  key={color.value}
                  label={color.label}
                  variant={accentColor === color.value ? "filled" : "outlined"}
                  clickable
                  onClick={() => setAccentColor(color.value)}
                  sx={{
                    bgcolor: accentColor === color.value ? color.color : 'transparent',
                    color: accentColor === color.value ? 'white' : color.color,
                    borderColor: color.color,
                    '&:hover': {
                      bgcolor: `${color.color}20`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Language */}
          <Box sx={{ mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ru">Русский</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="zh">中文</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Font Size */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Font Size: {fontSize}px
            </Typography>
            <Slider
              value={fontSize}
              onChange={(_, value) => setFontSize(value as number)}
              min={12}
              max={18}
              step={1}
              marks={[
                { value: 12, label: 'Small' },
                { value: 14, label: 'Medium' },
                { value: 16, label: 'Large' },
                { value: 18, label: 'X-Large' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Interface Options */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Interface Options
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Compact Mode</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reduce spacing and padding for more content
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showAnimations}
                    onChange={(e) => setShowAnimations(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Animations</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enable smooth transitions and animations
                    </Typography>
                  </Box>
                }
              />
            </Box>
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