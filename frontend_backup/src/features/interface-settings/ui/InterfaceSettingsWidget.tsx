/**
 * Interface Settings Widget Component
 */

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Switch,
  Button,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  ButtonGroup,
  Card,
  CardContent,
  useTheme,
  alpha,
  Grid,
  Chip,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewKanban as ViewKanbanIcon,
  UnfoldLess as CompressIcon,
  Animation as AnimationIcon,
  Lightbulb as LightbulbIcon,
  Save as SaveIcon,
  Keyboard as KeyboardIcon,
  Settings as SettingsIcon,
  Restore as RestoreIcon,
  LightMode,
  DarkMode,
  SettingsBrightness,
  Dashboard as DashboardIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useInterfaceForm } from "../hooks/useInterfaceForm";
import type { InterfaceSettingsGroup, ThemeOption, LanguageOption } from "../model/types";

// Опции темы
const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Светлая",
    description: "Светлая тема для дневного использования",
    icon: <LightMode />,
  },
  {
    value: "dark",
    label: "Темная",
    description: "Темная тема для работы в условиях низкой освещенности",
    icon: <DarkMode />,
  },
  {
    value: "auto",
    label: "Авто",
    description: "Автоматически переключается в зависимости от системных настроек",
    icon: <SettingsBrightness />,
  },
];

// Опции языков
const languageOptions: LanguageOption[] = [
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
];

// Конфигурация групп настроек интерфейса
const interfaceGroups: InterfaceSettingsGroup[] = [
  {
    id: "appearance",
    title: "Внешний вид",
    description: "Настройки темы, языка и общего оформления",
    settings: [
      {
        key: "language",
        label: "Язык интерфейса",
        description: "Выберите предпочитаемый язык",
        icon: <LanguageIcon />,
        color: "#2196f3",
        type: "select",
        options: languageOptions.map(lang => ({ 
          value: lang.value, 
          label: `${lang.flag} ${lang.label}` 
        })),
      },
      {
        key: "compact_mode",
        label: "Компактный режим",
        description: "Уменьшить отступы и размеры элементов",
        icon: <CompressIcon />,
        color: "#9c27b0",
        type: "switch",
      },
      {
        key: "animations_enabled",
        label: "Анимации",
        description: "Включить анимации и переходы",
        icon: <AnimationIcon />,
        color: "#ff9800",
        type: "switch",
      },
      {
        key: "show_hints",
        label: "Подсказки",
        description: "Показывать подсказки для новых пользователей",
        icon: <LightbulbIcon />,
        color: "#ffc107",
        type: "switch",
      },
    ],
  },
  {
    id: "datetime",
    title: "Дата и время",
    description: "Настройки отображения даты, времени и часового пояса",
    settings: [
      {
        key: "timezone",
        label: "Часовой пояс",
        description: "Ваш текущий часовой пояс",
        icon: <ScheduleIcon />,
        color: "#4caf50",
        type: "select",
        options: [
          { value: "Europe/Moscow", label: "Москва (GMT+3)" },
          { value: "Europe/London", label: "Лондон (GMT+0)" },
          { value: "America/New_York", label: "Нью-Йорк (GMT-5)" },
          { value: "Asia/Tokyo", label: "Токио (GMT+9)" },
        ],
      },
      {
        key: "date_format",
        label: "Формат даты",
        description: "Способ отображения дат",
        icon: <CalendarIcon />,
        color: "#607d8b",
        type: "select",
        options: [
          { value: "DD.MM.YYYY", label: "31.12.2023" },
          { value: "MM/DD/YYYY", label: "12/31/2023" },
          { value: "YYYY-MM-DD", label: "2023-12-31" },
          { value: "DD MMM YYYY", label: "31 дек 2023" },
        ],
      },
      {
        key: "time_format",
        label: "Формат времени",
        description: "12-часовой или 24-часовой формат",
        icon: <ScheduleIcon />,
        color: "#795548",
        type: "select",
        options: [
          { value: "24h", label: "24 часа (15:30)" },
          { value: "12h", label: "12 часов (3:30 PM)" },
        ],
      },
    ],
  },
  {
    id: "behavior",
    title: "Поведение",
    description: "Настройки работы интерфейса и взаимодействия",
    settings: [
      {
        key: "items_per_page",
        label: "Элементов на странице",
        description: "Количество элементов в списках",
        icon: <ViewListIcon />,
        color: "#3f51b5",
        type: "number",
        min: 10,
        max: 100,
      },
      {
        key: "default_view",
        label: "Вид по умолчанию",
        description: "Предпочитаемый способ отображения списков",
        icon: <DashboardIcon />,
        color: "#e91e63",
        type: "select",
        options: [
          { value: "list", label: "Список" },
          { value: "grid", label: "Сетка" },
          { value: "kanban", label: "Канбан" },
        ],
      },
      {
        key: "auto_save",
        label: "Автосохранение",
        description: "Автоматически сохранять изменения",
        icon: <SaveIcon />,
        color: "#4caf50",
        type: "switch",
      },
      {
        key: "keyboard_shortcuts",
        label: "Горячие клавиши",
        description: "Включить поддержку горячих клавиш",
        icon: <KeyboardIcon />,
        color: "#ff5722",
        type: "switch",
      },
    ],
  },
];

export const InterfaceSettingsWidget: React.FC = () => {
  const theme = useTheme();
  const {
    data,
    isLoading,
    isSaving,
    isDirty,
    updateSetting,
    saveSettings,
    resetToDefaults,
    toggleTheme,
    toggleCompactMode,
  } = useInterfaceForm();

  const handleSave = async () => {
    try {
      await saveSettings();
    } catch (error) {
      console.error("Failed to save interface settings:", error);
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefaults();
    } catch (error) {
      console.error("Failed to reset interface settings:", error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Загрузка настроек интерфейса...</Typography>
      </Box>
    );
  }

  const ThemeSelector = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.8),
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: alpha("#8b5cf6", 0.1),
            border: `1px solid ${alpha("#8b5cf6", 0.2)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 3,
          }}
        >
          <PaletteIcon sx={{ color: "#8b5cf6", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Тема оформления
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Выберите предпочитаемую цветовую схему
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {themeOptions.map((option) => (
          <Grid item xs={12} sm={4} key={option.value}>
            <Card
              sx={{
                cursor: "pointer",
                border: `2px solid ${
                  data.theme === option.value 
                    ? theme.palette.primary.main 
                    : "transparent"
                }`,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => updateSetting("theme", option.value)}
            >
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Box sx={{ mb: 1 }}>
                  {React.cloneElement(option.icon as React.ReactElement, {
                    sx: { fontSize: 32, color: theme.palette.primary.main },
                  })}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {option.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    description: string;
    value: any;
    onChange: (value: any) => void;
    color: string;
    type: "switch" | "select" | "number" | "slider";
    options?: Array<{ value: any; label: string; description?: string }>;
    min?: number;
    max?: number;
    step?: number;
  }> = ({ icon, label, description, value, onChange, color, type, options, min, max, step }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.8),
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: alpha(color, 0.3),
          boxShadow: `0 4px 12px ${alpha(color, 0.1)}`,
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.1),
              border: `1px solid ${alpha(color, 0.2)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 3,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { color, fontSize: 24 },
            })}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ml: 2, minWidth: 120 }}>
          {type === "switch" && (
            <Switch
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: color,
                  "&:hover": {
                    backgroundColor: alpha(color, 0.04),
                  },
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: color,
                },
              }}
            />
          )}
          {type === "number" && (
            <TextField
              type="number"
              value={value || ""}
              onChange={(e) => onChange(Number(e.target.value))}
              inputProps={{ min, max }}
              sx={{ width: 120 }}
              size="small"
            />
          )}
          {type === "select" && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
              >
                {options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {type === "slider" && (
            <Box sx={{ width: 120, px: 1 }}>
              <Slider
                value={value || min || 0}
                onChange={(_, newValue) => onChange(newValue)}
                min={min}
                max={max}
                step={step}
                marks
                valueLabelDisplay="auto"
                sx={{
                  color: color,
                  "& .MuiSlider-thumb": {
                    backgroundColor: color,
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: color,
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<PaletteIcon />}
              onClick={toggleTheme}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
              }}
            >
              Переключить тему
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<CompressIcon />}
              onClick={toggleCompactMode}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
              }}
            >
              Компактный режим
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleReset}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
              }}
            >
              Сбросить
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<SpeedIcon />}
              onClick={() => updateSetting("animations_enabled", !data.animations_enabled)}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
              }}
            >
              {data.animations_enabled ? "Отключить" : "Включить"} анимации
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Interface Groups */}
      <Stack spacing={4}>
        {interfaceGroups.map((group, groupIndex) => (
          <Box key={group.id}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              {group.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 3,
              }}
            >
              {group.description}
            </Typography>

            <Stack spacing={2}>
              {group.settings.map((setting) => (
                <SettingItem
                  key={setting.key}
                  icon={setting.icon}
                  label={setting.label}
                  description={setting.description}
                  value={data[setting.key]}
                  onChange={(value) => updateSetting(setting.key, value)}
                  color={setting.color}
                  type={setting.type}
                  options={setting.options}
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                />
              ))}
            </Stack>

            {groupIndex < interfaceGroups.length - 1 && (
              <Divider sx={{ mt: 4 }} />
            )}
          </Box>
        ))}
      </Stack>

      {/* Save Button */}
      {isDirty && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
            }}
          >
            {isSaving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </Box>
      )}

      {/* Status Info */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
          <Chip
            label={`Тема: ${themeOptions.find(t => t.value === data.theme)?.label || "Авто"}`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={`Язык: ${languageOptions.find(l => l.value === data.language)?.label || "Русский"}`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={data.compact_mode ? "Компактный режим" : "Обычный режим"}
            variant="outlined"
            size="small"
          />
          {data.animations_enabled && (
            <Chip
              label="Анимации включены"
              variant="outlined"
              size="small"
              color="primary"
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
}; 