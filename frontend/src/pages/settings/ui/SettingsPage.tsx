import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Stack,
  alpha,
  useTheme,
  Fade,
  Chip,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Badge,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Edit as EditIcon,
  Shield as ShieldIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  Animation as AnimationIcon,
} from "@mui/icons-material";
import { PageLayout } from "@/shared/ui/PageLayout";

// Современная цветовая схема (согласованная с админ панелью)
const SETTINGS_COLORS = {
  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    hover: "#f1f5f9",
    active: "#e2e8f0",
    gradient: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
  },
  border: {
    light: "#e2e8f0",
    medium: "#cbd5e1",
    focus: "#3b82f6",
  },
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    muted: "#94a3b8",
    inverse: "#ffffff",
  },
  accent: {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    purple: "#8b5cf6",
    indigo: "#6366f1",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
} as const;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User settings state
  const [userSettings, setUserSettings] = useState({
    firstName: "Иван",
    lastName: "Иванов",
    email: "ivan.ivanov@example.com",
    phone: "+7 (999) 123-45-67",
    position: "Менеджер проектов",
    avatar: "",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    requirementChanges: true,
    releaseNotifications: true,
    teamInvitations: true,
    systemNotifications: false,
    weeklyDigest: true,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30,
    allowMultipleSessions: true,
  });

  // Interface settings state
  const [interfaceSettings, setInterfaceSettings] = useState({
    theme: "light",
    language: "ru",
    compactMode: false,
    sidebarCollapsed: false,
    showHints: true,
    animationsEnabled: true,
  });

  const tabs = [
    {
      label: "Профиль",
      icon: <PersonIcon />,
      color: SETTINGS_COLORS.accent.primary,
      description: "Персональная информация",
    },
    {
      label: "Уведомления",
      icon: <NotificationsIcon />,
      color: SETTINGS_COLORS.accent.warning,
      description: "Настройки уведомлений",
    },
    {
      label: "Безопасность",
      icon: <SecurityIcon />,
      color: SETTINGS_COLORS.accent.error,
      description: "Защита аккаунта",
    },
    {
      label: "Интерфейс",
      icon: <ThemeIcon />,
      color: SETTINGS_COLORS.accent.purple,
      description: "Персонализация",
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarUpload = () => {
    console.log("Upload avatar");
  };

  const handleLogout = () => {
    console.log("Logout");
  };

  const handleDeleteAccount = () => {
    console.log("Delete account");
  };

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    action: React.ReactNode;
    color?: string;
  }> = ({ icon, title, description, action, color = SETTINGS_COLORS.accent.primary }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${SETTINGS_COLORS.border.light}`,
        background: alpha(SETTINGS_COLORS.background.primary, 0.8),
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
                color: SETTINGS_COLORS.text.primary,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: SETTINGS_COLORS.text.secondary,
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ml: 2 }}>{action}</Box>
      </Box>
    </Paper>
  );

  return (
    <PageLayout title="Настройки">
      <Box
        sx={{
          minHeight: "100vh",
          background: SETTINGS_COLORS.background.gradient,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: "absolute",
            top: -150,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(SETTINGS_COLORS.accent.purple, 0.08)} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -200,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(SETTINGS_COLORS.accent.primary, 0.06)} 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />

        <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Fade in={true} timeout={600}>
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${alpha(SETTINGS_COLORS.background.primary, 0.9)} 0%, ${alpha(SETTINGS_COLORS.background.secondary, 0.8)} 100%)`,
                backdropFilter: "blur(20px)",
                borderRadius: 4,
                border: `1px solid ${SETTINGS_COLORS.border.light}`,
                p: 4,
                mb: 4,
                boxShadow: SETTINGS_COLORS.shadow.lg,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.purple} 0%, ${SETTINGS_COLORS.accent.primary} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 3,
                      boxShadow: `0 8px 24px ${alpha(SETTINGS_COLORS.accent.purple, 0.3)}`,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: -2,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.purple}, ${SETTINGS_COLORS.accent.primary})`,
                        opacity: 0.3,
                        filter: "blur(8px)",
                      },
                    }}
                  >
                    <SettingsIcon sx={{ color: "white", fontSize: 32, position: "relative" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 800,
                        background: `linear-gradient(135deg, ${SETTINGS_COLORS.text.primary} 0%, ${SETTINGS_COLORS.accent.purple} 100%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 0.5,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Настройки
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: SETTINGS_COLORS.text.secondary,
                        fontWeight: 500,
                        fontSize: "1.1rem",
                      }}
                    >
                      Управление учетной записью и предпочтениями
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.success} 0%, ${SETTINGS_COLORS.accent.primary} 100%)`,
                    boxShadow: `0 4px 16px ${alpha(SETTINGS_COLORS.accent.success, 0.3)}`,
                    color: "white",
                    fontSize: "1rem",
                    "&:hover": {
                      background: `linear-gradient(135deg, ${SETTINGS_COLORS.accent.primary} 0%, ${SETTINGS_COLORS.accent.success} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(SETTINGS_COLORS.accent.success, 0.4)}`,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Сохранить изменения
                </Button>
              </Box>

              {saveSuccess && (
                <Fade in={saveSuccess} timeout={300}>
                  <Alert
                    severity="success"
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(SETTINGS_COLORS.accent.success, 0.1),
                      border: `1px solid ${alpha(SETTINGS_COLORS.accent.success, 0.2)}`,
                      "& .MuiAlert-icon": {
                        color: SETTINGS_COLORS.accent.success,
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      Настройки успешно сохранены!
                    </Typography>
                  </Alert>
                </Fade>
              )}
            </Paper>
          </Fade>

          {/* Settings Content */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${SETTINGS_COLORS.border.light}`,
              background: `linear-gradient(135deg, ${alpha(SETTINGS_COLORS.background.primary, 0.9)} 0%, ${alpha(SETTINGS_COLORS.background.secondary, 0.8)} 100%)`,
              backdropFilter: "blur(20px)",
              boxShadow: SETTINGS_COLORS.shadow.lg,
              overflow: "hidden",
            }}
          >
            {/* Custom Tabs */}
            <Box sx={{ borderBottom: `1px solid ${SETTINGS_COLORS.border.light}` }}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: SETTINGS_COLORS.text.primary,
                    mb: 3,
                  }}
                >
                  Категории настроек
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {tabs.map((tab, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Paper
                        elevation={0}
                        onClick={() => handleTabChange({} as any, index)}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          cursor: "pointer",
                          textAlign: "center",
                          border: `2px solid ${tabValue === index ? tab.color : SETTINGS_COLORS.border.light}`,
                          background: tabValue === index 
                            ? alpha(tab.color, 0.1) 
                            : alpha(SETTINGS_COLORS.background.primary, 0.5),
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: tab.color,
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 20px ${alpha(tab.color, 0.15)}`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: alpha(tab.color, tabValue === index ? 0.2 : 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                            transition: "all 0.3s ease",
                          }}
                        >
                          {React.cloneElement(tab.icon, {
                            sx: { 
                              color: tab.color, 
                              fontSize: 24,
                              transform: tabValue === index ? "scale(1.1)" : "scale(1)",
                              transition: "all 0.3s ease",
                            },
                          })}
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: tabValue === index ? tab.color : SETTINGS_COLORS.text.primary,
                            mb: 0.5,
                          }}
                        >
                          {tab.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: SETTINGS_COLORS.text.secondary,
                            fontSize: "0.75rem",
                          }}
                        >
                          {tab.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>

            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Profile Card */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 3,
                        border: `1px solid ${SETTINGS_COLORS.border.light}`,
                        background: alpha(SETTINGS_COLORS.background.primary, 0.8),
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: `linear-gradient(90deg, ${SETTINGS_COLORS.accent.primary} 0%, ${SETTINGS_COLORS.accent.purple} 100%)`,
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          badgeContent={
                            <IconButton
                              size="small"
                              onClick={handleAvatarUpload}
                              sx={{
                                backgroundColor: SETTINGS_COLORS.accent.primary,
                                color: "white",
                                width: 32,
                                height: 32,
                                "&:hover": {
                                  backgroundColor: SETTINGS_COLORS.accent.indigo,
                                },
                              }}
                            >
                              <PhotoCameraIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          }
                        >
                          <Avatar
                            sx={{
                              width: 120,
                              height: 120,
                              backgroundColor: SETTINGS_COLORS.accent.primary,
                              fontSize: "3rem",
                              fontWeight: 700,
                              border: `4px solid ${alpha(SETTINGS_COLORS.accent.primary, 0.2)}`,
                              boxShadow: `0 8px 24px ${alpha(SETTINGS_COLORS.accent.primary, 0.3)}`,
                            }}
                          >
                            {userSettings.firstName[0]}{userSettings.lastName[0]}
                          </Avatar>
                        </Badge>
                      </Box>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: SETTINGS_COLORS.text.primary,
                          mb: 1,
                        }}
                      >
                        {userSettings.firstName} {userSettings.lastName}
                      </Typography>
                      
                      <Chip
                        label={userSettings.position}
                        sx={{
                          backgroundColor: alpha(SETTINGS_COLORS.accent.primary, 0.1),
                          color: SETTINGS_COLORS.accent.primary,
                          fontWeight: 600,
                          mb: 3,
                        }}
                      />

                      <Stack spacing={2}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <EmailIcon sx={{ color: SETTINGS_COLORS.text.muted, fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary">
                            {userSettings.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <PhoneIcon sx={{ color: SETTINGS_COLORS.text.muted, fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary">
                            {userSettings.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Profile Settings */}
                  <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: SETTINGS_COLORS.text.primary,
                          mb: 2,
                        }}
                      >
                        Персональная информация
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Имя"
                            value={userSettings.firstName}
                            onChange={(e) => setUserSettings({ ...userSettings, firstName: e.target.value })}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Фамилия"
                            value={userSettings.lastName}
                            onChange={(e) => setUserSettings({ ...userSettings, lastName: e.target.value })}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={userSettings.email}
                            onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Телефон"
                            value={userSettings.phone}
                            onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Должность"
                            value={userSettings.position}
                            onChange={(e) => setUserSettings({ ...userSettings, position: e.target.value })}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: SETTINGS_COLORS.accent.primary,
                                },
                              },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: SETTINGS_COLORS.text.primary,
                          mb: 2,
                        }}
                      >
                        Действия с аккаунтом
                      </Typography>

                      <Stack spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<LogoutIcon />}
                          onClick={handleLogout}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            borderColor: SETTINGS_COLORS.accent.warning,
                            color: SETTINGS_COLORS.accent.warning,
                            "&:hover": {
                              borderColor: SETTINGS_COLORS.accent.warning,
                              backgroundColor: alpha(SETTINGS_COLORS.accent.warning, 0.1),
                            },
                          }}
                        >
                          Выйти из аккаунта
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          onClick={handleDeleteAccount}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            borderColor: SETTINGS_COLORS.accent.error,
                            color: SETTINGS_COLORS.accent.error,
                            "&:hover": {
                              borderColor: SETTINGS_COLORS.accent.error,
                              backgroundColor: alpha(SETTINGS_COLORS.accent.error, 0.1),
                            },
                          }}
                        >
                          Удалить аккаунт
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: SETTINGS_COLORS.text.primary,
                    mb: 3,
                  }}
                >
                  Настройки уведомлений
                </Typography>

                <Stack spacing={3}>
                  <SettingItem
                    icon={<EmailIcon />}
                    title="Email уведомления"
                    description="Получать уведомления на электронную почту"
                    color={SETTINGS_COLORS.accent.primary}
                    action={
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked
                        })}
                      />
                    }
                  />

                  <SettingItem
                    icon={<NotificationsIcon />}
                    title="Push уведомления"
                    description="Получать push-уведомления в браузере"
                    color={SETTINGS_COLORS.accent.warning}
                    action={
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: e.target.checked
                        })}
                      />
                    }
                  />

                  <SettingItem
                    icon={<WorkIcon />}
                    title="Обновления проектов"
                    description="Уведомления о изменениях в проектах"
                    color={SETTINGS_COLORS.accent.success}
                    action={
                      <Switch
                        checked={notificationSettings.projectUpdates}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          projectUpdates: e.target.checked
                        })}
                      />
                    }
                  />
                </Stack>
              </Box>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: SETTINGS_COLORS.text.primary,
                    mb: 3,
                  }}
                >
                  Настройки безопасности
                </Typography>

                <Stack spacing={3}>
                  <SettingItem
                    icon={<ShieldIcon />}
                    title="Двухфакторная аутентификация"
                    description="Дополнительная защита вашего аккаунта"
                    color={SETTINGS_COLORS.accent.error}
                    action={
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuth: e.target.checked
                        })}
                      />
                    }
                  />

                  <SettingItem
                    icon={<NotificationsIcon />}
                    title="Уведомления о входе"
                    description="Получать уведомления о новых входах в систему"
                    color={SETTINGS_COLORS.accent.warning}
                    action={
                      <Switch
                        checked={securitySettings.loginNotifications}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          loginNotifications: e.target.checked
                        })}
                      />
                    }
                  />
                </Stack>
              </Box>
            </TabPanel>

            {/* Interface Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: SETTINGS_COLORS.text.primary,
                    mb: 3,
                  }}
                >
                  Настройки интерфейса
                </Typography>

                <Stack spacing={3}>
                  <SettingItem
                    icon={<DarkModeIcon />}
                    title="Темная тема"
                    description="Переключить на темную тему интерфейса"
                    color={SETTINGS_COLORS.accent.indigo}
                    action={
                      <Switch
                        checked={interfaceSettings.theme === "dark"}
                        onChange={(e) => setInterfaceSettings({
                          ...interfaceSettings,
                          theme: e.target.checked ? "dark" : "light"
                        })}
                      />
                    }
                  />

                  <SettingItem
                    icon={<LanguageIcon />}
                    title="Язык интерфейса"
                    description="Выберите предпочитаемый язык"
                    color={SETTINGS_COLORS.accent.primary}
                    action={
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={interfaceSettings.language}
                          onChange={(e) => setInterfaceSettings({
                            ...interfaceSettings,
                            language: e.target.value
                          })}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="ru">Русский</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                        </Select>
                      </FormControl>
                    }
                  />

                  <SettingItem
                    icon={<AnimationIcon />}
                    title="Анимации"
                    description="Включить анимации интерфейса"
                    color={SETTINGS_COLORS.accent.purple}
                    action={
                      <Switch
                        checked={interfaceSettings.animationsEnabled}
                        onChange={(e) => setInterfaceSettings({
                          ...interfaceSettings,
                          animationsEnabled: e.target.checked
                        })}
                      />
                    }
                  />
                </Stack>
              </Box>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </PageLayout>
  );
};

export default SettingsPage;
