/**
 * Notification Settings Widget Component
 */

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Switch,
  Button,
  Alert,
  Paper,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  NewReleases as ReleaseIcon,
  Group as TeamIcon,
  Settings as SystemIcon,
  Schedule as WeeklyIcon,
  AlternateEmail as MentionIcon,
  NotificationsActive as EnableAllIcon,
  NotificationsOff as DisableAllIcon,
} from "@mui/icons-material";
import { useNotificationForm } from "../hooks/useNotificationForm";
import type { NotificationGroup } from "../model/types";

const notificationGroups: NotificationGroup[] = [
  {
    id: "general",
    title: "Общие уведомления",
    description: "Основные способы получения уведомлений",
    settings: [
      {
        key: "email_notifications",
        label: "Email уведомления",
        description: "Получать уведомления на электронную почту",
        icon: <EmailIcon />,
        color: "#1976d2",
      },
      {
        key: "push_notifications",
        label: "Push уведомления",
        description: "Получать push-уведомления в браузере",
        icon: <NotificationsIcon />,
        color: "#ff9800",
      },
    ],
  },
  {
    id: "project",
    title: "Проектная деятельность",
    description: "Уведомления о работе с проектами и требованиями",
    settings: [
      {
        key: "project_updates",
        label: "Обновления проектов",
        description: "Уведомления о изменениях в проектах",
        icon: <WorkIcon />,
        color: "#4caf50",
      },
      {
        key: "requirement_changes",
        label: "Изменения требований",
        description: "Уведомления о изменениях в требованиях",
        icon: <AssignmentIcon />,
        color: "#9c27b0",
      },
      {
        key: "release_notifications",
        label: "Уведомления о релизах",
        description: "Уведомления о новых релизах",
        icon: <ReleaseIcon />,
        color: "#f44336",
      },
    ],
  },
  {
    id: "social",
    title: "Социальные уведомления",
    description: "Уведомления о командной работе и взаимодействии",
    settings: [
      {
        key: "team_invitations",
        label: "Приглашения в команду",
        description: "Уведомления о приглашениях в команды",
        icon: <TeamIcon />,
        color: "#00bcd4",
      },
      {
        key: "mention_notifications",
        label: "Упоминания",
        description: "Уведомления когда вас упоминают",
        icon: <MentionIcon />,
        color: "#ff5722",
      },
    ],
  },
  {
    id: "system",
    title: "Системные уведомления",
    description: "Уведомления от системы и сводки",
    settings: [
      {
        key: "system_notifications",
        label: "Системные уведомления",
        description: "Технические уведомления от системы",
        icon: <SystemIcon />,
        color: "#607d8b",
      },
      {
        key: "weekly_digest",
        label: "Еженедельная сводка",
        description: "Получать еженедельные отчеты о деятельности",
        icon: <WeeklyIcon />,
        color: "#795548",
      },
    ],
  },
];

export const NotificationSettingsWidget: React.FC = () => {
  const theme = useTheme();
  const {
    data,
    isLoading,
    isSaving,
    error,
    isDirty,
    updateSetting,
    saveSettings,
    enableAll,
    disableAll,
  } = useNotificationForm();

  const handleSave = async () => {
    await saveSettings();
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Загрузка настроек уведомлений...</Typography>
      </Box>
    );
  }

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    color: string;
  }> = ({ icon, label, description, checked, onChange, color }) => (
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
        <Box sx={{ ml: 2 }}>
          <Switch
            checked={checked}
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
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Actions */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<EnableAllIcon />}
          onClick={enableAll}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Включить все
        </Button>
        <Button
          variant="outlined"
          startIcon={<DisableAllIcon />}
          onClick={disableAll}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Отключить все
        </Button>
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Notification Groups */}
      <Stack spacing={4}>
        {notificationGroups.map((group, groupIndex) => (
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
                  checked={data[setting.key]}
                  onChange={(checked) => updateSetting(setting.key, checked)}
                  color={setting.color}
                />
              ))}
            </Stack>

            {groupIndex < notificationGroups.length - 1 && (
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
    </Box>
  );
}; 