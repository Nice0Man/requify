/**
 * Security Settings Widget Component
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Switch,
  TextField,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Grid,
} from "@mui/material";
import {
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  DevicesOther as DevicesIcon,
  Timer as TimerIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  Logout as LogoutIcon,
  Warning as WarningIcon,
  Visibility,
  VisibilityOff,
  Delete as DeleteIcon,
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
} from "@mui/icons-material";
import { useSecurityForm } from "../hooks/useSecurityForm";
import type { SecuritySettingsGroup, PasswordChangeFormData } from "../model/types";

// Конфигурация групп настроек безопасности
const securityGroups: SecuritySettingsGroup[] = [
  {
    id: "authentication",
    title: "Аутентификация",
    description: "Настройки входа и многофакторной аутентификации",
    settings: [
      {
        key: "two_factor_auth",
        label: "Двухфакторная аутентификация",
        description: "Дополнительная защита входа с помощью 2FA",
        icon: <ShieldIcon />,
        color: "#4caf50",
        type: "switch",
      },
      {
        key: "login_notifications",
        label: "Уведомления о входе",
        description: "Получать уведомления при входе в аккаунт",
        icon: <VpnKeyIcon />,
        color: "#2196f3",
        type: "switch",
      },
    ],
  },
  {
    id: "session",
    title: "Управление сессиями",
    description: "Настройки активных сессий и времени жизни",
    settings: [
      {
        key: "session_timeout",
        label: "Время жизни сессии (минуты)",
        description: "Автоматический выход через указанное время неактивности",
        icon: <TimerIcon />,
        color: "#ff9800",
        type: "number",
        min: 5,
        max: 480,
      },
      {
        key: "allow_multiple_sessions",
        label: "Множественные сессии",
        description: "Разрешить вход с нескольких устройств одновременно",
        icon: <DevicesIcon />,
        color: "#9c27b0",
        type: "switch",
      },
      {
        key: "auto_logout",
        label: "Автоматический выход",
        description: "Выходить из системы при закрытии браузера",
        icon: <LogoutIcon />,
        color: "#f44336",
        type: "switch",
      },
    ],
  },
  {
    id: "protection",
    title: "Защита аккаунта",
    description: "Дополнительные меры безопасности",
    settings: [
      {
        key: "login_attempts_limit",
        label: "Лимит попыток входа",
        description: "Максимальное количество неудачных попыток входа",
        icon: <WarningIcon />,
        color: "#ff5722",
        type: "number",
        min: 3,
        max: 10,
      },
      {
        key: "account_lockout_duration",
        label: "Время блокировки (минуты)",
        description: "Длительность блокировки после превышения лимита попыток",
        icon: <LockIcon />,
        color: "#795548",
        type: "number",
        min: 5,
        max: 1440,
      },
    ],
  },
];

export const SecuritySettingsWidget: React.FC = () => {
  const theme = useTheme();
  const {
    data,
    sessions,
    isLoading,
    isSaving,
    isChangingPassword,
    isRevokingSessions,
    isDirty,
    updateSetting,
    saveSettings,
    changePassword,
    revokeSessions,
    revokeAllOtherSessions,
  } = useSecurityForm();

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSave = async () => {
    try {
      await saveSettings();
    } catch (error) {
      console.error("Failed to save security settings:", error);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await changePassword(passwordForm);
      setPasswordDialog(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessions([sessionId]);
    } catch (error) {
      console.error("Failed to revoke session:", error);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.toLowerCase().includes("mobile") || deviceInfo.toLowerCase().includes("android") || deviceInfo.toLowerCase().includes("iphone")) {
      return <SmartphoneIcon />;
    }
    return <ComputerIcon />;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Загрузка настроек безопасности...</Typography>
      </Box>
    );
  }

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    description: string;
    value: any;
    onChange: (value: any) => void;
    color: string;
    type: "switch" | "number" | "select";
    options?: Array<{ value: any; label: string }>;
    min?: number;
    max?: number;
  }> = ({ icon, label, description, value, onChange, color, type, options, min, max }) => (
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              startIcon={<KeyIcon />}
              onClick={() => setPasswordDialog(true)}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
              }}
            >
              Сменить пароль
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              startIcon={<DevicesIcon />}
              onClick={() => setSessionDialog(true)}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
              }}
            >
              Управление сессиями
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={revokeAllOtherSessions}
              disabled={isRevokingSessions}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.5,
              }}
            >
              Выйти везде
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Security Groups */}
      <Stack spacing={4}>
        {securityGroups.map((group, groupIndex) => (
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
                />
              ))}
            </Stack>

            {groupIndex < securityGroups.length - 1 && (
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

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialog} 
        onClose={() => setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Смена пароля</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              key="current-password"
              fullWidth
              label="Текущий пароль"
              type={showPasswords.current ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              key="new-password"
              fullWidth
              label="Новый пароль"
              type={showPasswords.new ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              key="confirm-password"
              fullWidth
              label="Подтвердите новый пароль"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>
            Отмена
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
            variant="contained"
          >
            {isChangingPassword ? "Изменение..." : "Изменить пароль"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sessions Management Dialog */}
      <Dialog 
        open={sessionDialog} 
        onClose={() => setSessionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Активные сессии</DialogTitle>
        <DialogContent>
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: session.is_current ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                }}
              >
                <Box sx={{ mr: 2 }}>
                  {getDeviceIcon(session.device_info)}
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle2">
                        {session.device_info}
                      </Typography>
                      {session.is_current && (
                        <Chip label="Текущая" size="small" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography key="ip" variant="body2" color="text.secondary">
                        IP: {session.ip_address}
                      </Typography>
                      <Typography key="last-active" variant="body2" color="text.secondary">
                        Последняя активность: {new Date(session.last_active).toLocaleString()}
                      </Typography>
                    </Stack>
                  }
                />
                {!session.is_current && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={isRevokingSessions}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialog(false)}>
            Закрыть
          </Button>
          <Button
            onClick={revokeAllOtherSessions}
            disabled={isRevokingSessions}
            color="error"
          >
            Отозвать все другие
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 