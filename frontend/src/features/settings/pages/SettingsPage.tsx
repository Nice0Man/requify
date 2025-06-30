import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Skeleton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  InputAdornment,
  Stack,
  Tooltip,
  Fade,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  Save,
  Cancel,
  Refresh,
  Edit,
  PhotoCamera,
  Shield,
  Email,
  NotificationsActive,
  DarkMode,
  LightMode,
  VolumeUp,
  Storage,
  AccessTime,
  Key,
  Fingerprint,
  Lock,
  Warning,
  CheckCircle,
  Visibility,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, usePermissions } from "../../auth/context/auth.context";
import {
  UserProfile,
  NotificationPreferences,
  UserRole,
} from "../../auth/types/auth.types";
import { usersApi } from "../../auth/api/users.api";
import { adminApi } from "../../admin/api/admin.api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface SystemSettings {
  app_name: string;
  max_file_size: number;
  session_timeout: number;
  email_notifications: boolean;
  maintenance_mode: boolean;
}

interface AppearanceSettings {
  theme: "light" | "dark" | "auto";
  density: "compact" | "comfortable" | "spacious";
  sidebar_collapsed: boolean;
  animations_enabled: boolean;
  sound_enabled: boolean;
  language: string;
  timezone: string;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  login_notifications: boolean;
  password_expiry: number;
}

interface PrivacySettings {
  profile_visibility: "public" | "team" | "private";
  activity_visibility: "public" | "team" | "private";
  email_visibility: "public" | "team" | "private";
  analytics_consent: boolean;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, updateProfile, refreshUserData, isLoading } = useAuth();
  const { hasPermission } = usePermissions();

  // Permission checks similar to ProfilePage
  const isAdmin =
    hasPermission("admin:read") ||
    hasPermission("admin:write") ||
    hasPermission("admin:delete");
  const isManager =
    hasPermission("manager:read") ||
    hasPermission("manager:write") ||
    hasPermission("manager:delete") ||
    user?.role === UserRole.MANAGER;
  const isDeveloper =
    hasPermission("developer:read") ||
    hasPermission("developer:write") ||
    hasPermission("developer:delete") ||
    user?.role === UserRole.DEVELOPER;
  const isTester =
    hasPermission("tester:read") ||
    hasPermission("tester:write") ||
    hasPermission("tester:delete") ||
    user?.role === UserRole.TESTER;
  const isViewer =
    hasPermission("viewer:read") ||
    hasPermission("viewer:write") ||
    hasPermission("viewer:delete") ||
    user?.role === UserRole.VIEWER;

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<Partial<UserProfile>>(
    {}
  );

  // Settings state
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationPreferences>({
      email_notifications: true,
      push_notifications: false,
      requirement_updates: true,
      test_results: true,
      system_alerts: true,
    });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    session_timeout: 30,
    login_notifications: true,
    password_expiry: 90,
  });

  const [appearanceSettings, setAppearanceSettings] =
    useState<AppearanceSettings>({
      theme: "auto",
      density: "comfortable",
      sidebar_collapsed: false,
      animations_enabled: true,
      sound_enabled: true,
      language: "en",
      timezone: "UTC",
    });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visibility: "team",
    activity_visibility: "private",
    email_visibility: "private",
    analytics_consent: true,
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    app_name: "Requify",
    max_file_size: 10,
    session_timeout: 30,
    email_notifications: true,
    maintenance_mode: false,
  });

  // UI State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize loading state - only fetch user data if truly missing
  useEffect(() => {
    // If user data is already available, don't make unnecessary requests
    if (user) {
      setInitialLoading(false);
      return;
    }

    // If currently loading auth data, wait for it to complete
    if (isLoading) {
      return;
    }

    // Only fetch user data if we don't have it and auth isn't loading
    const loadUserData = async () => {
      try {
        setInitialLoading(true);
        await refreshUserData();
      } catch (error) {
        console.error("Failed to load user data:", error);
        showSnackbar("Failed to load user data", "error");
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
    // Note: Removed refreshUserData from dependencies to prevent unnecessary re-runs
    // when refreshUserData function reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  // Initialize form data when user data becomes available
  useEffect(() => {
    if (user) {
      setProfileFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || "",
        department: user.department || "",
        phone: user.phone || "",
        timezone: user.timezone || "UTC",
        language: user.language || "en",
      });

      // Update notification settings from user data
      if (user.notification_preferences) {
        setNotificationSettings(user.notification_preferences);
      }

      // Update appearance settings from user data
      setAppearanceSettings((prev) => ({
        ...prev,
        language: user.language || "en",
        timezone: user.timezone || "UTC",
      }));
    }
  }, [user]);

  // Handlers
  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  const handleProfileFieldChange = useCallback(
    (field: keyof UserProfile, value: any) => {
      setProfileFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNotificationChange = useCallback(
    (setting: keyof NotificationPreferences, value: boolean) => {
      setNotificationSettings((prev) => ({ ...prev, [setting]: value }));
    },
    []
  );

  const handleSecurityChange = useCallback((setting: string, value: any) => {
    setSecuritySettings((prev) => ({ ...prev, [setting]: value }));
  }, []);

  const handleAppearanceChange = useCallback((setting: string, value: any) => {
    setAppearanceSettings((prev) => ({ ...prev, [setting]: value }));
  }, []);

  const handlePrivacyChange = useCallback((setting: string, value: any) => {
    setPrivacySettings((prev) => ({ ...prev, [setting]: value }));
  }, []);

  const handleSystemSettingsChange = useCallback(
    (setting: string, value: any) => {
      setSystemSettings((prev) => ({ ...prev, [setting]: value }));
    },
    []
  );

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    []
  );

  const handleSaveProfile = useCallback(async () => {
    try {
      setSaving(true);
      await usersApi.updateCurrentUser(profileFormData);
      // Only refresh user data after successful update to get latest server state
      await refreshUserData();
      setIsEditingProfile(false);
      showSnackbar("Profile updated successfully", "success");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const message =
        error?.response?.data?.detail || "Failed to update profile";
      showSnackbar(message, "error");
    } finally {
      setSaving(false);
    }
  }, [profileFormData, showSnackbar]);

  const handleSaveNotifications = useCallback(async () => {
    try {
      setSaving(true);
      const updateData = {
        notification_preferences: notificationSettings,
      };
      await usersApi.updateCurrentUser(updateData);
      // Only refresh user data after successful update to get latest server state
      await refreshUserData();
      showSnackbar("Notification preferences updated", "success");
    } catch (error: any) {
      console.error("Failed to update notifications:", error);
      const message =
        error?.response?.data?.detail || "Failed to update notifications";
      showSnackbar(message, "error");
    } finally {
      setSaving(false);
    }
  }, [notificationSettings, showSnackbar]);

  const handleSaveSystemSettings = useCallback(async () => {
    if (!isAdmin) {
      showSnackbar(
        "You don't have permission to update system settings",
        "error"
      );
      return;
    }

    try {
      setSaving(true);
      await adminApi.updateSystemSettings(systemSettings);
      showSnackbar("System settings updated successfully", "success");
    } catch (error: any) {
      console.error("Failed to update system settings:", error);
      const message =
        error?.response?.data?.detail || "Failed to update system settings";
      showSnackbar(message, "error");
    } finally {
      setSaving(false);
    }
  }, [systemSettings, isAdmin, showSnackbar]);

  const handleSaveAllSettings = useCallback(async () => {
    try {
      setSaving(true);

      // Save profile if editing
      if (isEditingProfile) {
        await usersApi.updateCurrentUser(profileFormData);
      }

      // Save notification preferences and appearance settings
      const updateData = {
        notification_preferences: notificationSettings,
        language: appearanceSettings.language,
        timezone: appearanceSettings.timezone,
      };
      await usersApi.updateCurrentUser(updateData);

      // Save system settings if admin
      if (isAdmin) {
        await adminApi.updateSystemSettings(systemSettings);
      }

      // Only refresh user data after all successful updates
      await refreshUserData();
      setIsEditingProfile(false);
      showSnackbar("All settings saved successfully", "success");
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      const message =
        error?.response?.data?.detail || "Failed to save settings";
      showSnackbar(message, "error");
    } finally {
      setSaving(false);
    }
  }, [
    isEditingProfile,
    profileFormData,
    notificationSettings,
    appearanceSettings,
    systemSettings,
    isAdmin,
    showSnackbar,
  ]);

  const handleCancelProfileEdit = useCallback(() => {
    if (user) {
      setProfileFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || "",
        department: user.department || "",
        phone: user.phone || "",
        timezone: user.timezone || "UTC",
        language: user.language || "en",
      });
    }
    setIsEditingProfile(false);
    setError(null);
  }, [user]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshUserData();
      showSnackbar("Settings refreshed", "success");
    } catch (err: any) {
      showSnackbar("Failed to refresh settings", "error");
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData, showSnackbar]);

  // Helper functions
  const getInitials = useCallback((firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  }, []);

  const getRoleColor = useCallback((role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "error";
      case UserRole.PRODUCT_MANAGER:
        return "secondary";
      case UserRole.MANAGER:
        return "primary";
      case UserRole.SENIOR_DEVELOPER:
        return "info";
      case UserRole.DEVELOPER:
        return "success";
      case UserRole.ANALYST:
        return "warning";
      case UserRole.TESTER:
        return "info";
      case UserRole.VIEWER:
        return "default";
      default:
        return "default";
    }
  }, []);

  const getRoleLabel = useCallback((role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.PRODUCT_MANAGER:
        return "Product Manager";
      case UserRole.MANAGER:
        return "Manager";
      case UserRole.SENIOR_DEVELOPER:
        return "Senior Developer";
      case UserRole.DEVELOPER:
        return "Developer";
      case UserRole.ANALYST:
        return "Business Analyst";
      case UserRole.TESTER:
        return "QA Tester";
      case UserRole.VIEWER:
        return "Viewer";
      default:
        return "Unknown";
    }
  }, []);

  // Loading state with backdrop
  if (initialLoading || (isLoading && !user)) {
    return (
      <>
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.9
            )}, ${alpha(theme.palette.secondary.main, 0.9)})`,
          }}
          open={true}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
              Loading Settings...
            </Typography>
          </Stack>
        </Backdrop>
        <Container component="main" maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" width="30%" height={48} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="50%" height={24} />
            </Box>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 3, mb: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={600}
              sx={{ borderRadius: 3 }}
            />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header with improved spacing and typography */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 2 },
            mb: { xs: 3, md: 4 },
          }}
        >
          <Stack spacing={1} flex={1}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "3rem" },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                lineHeight: 1.2,
              }}
            >
              Settings
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                maxWidth: { xs: "100%", md: "600px" },
              }}
            >
              Manage your account preferences and system configuration with
              ease.
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "row", md: "row" }}
            spacing={2}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Tooltip title="Refresh Settings" arrow>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: refreshing ? "none" : "rotate(180deg)",
                    borderColor: theme.palette.primary.main,
                  },
                  "&:disabled": {
                    backgroundColor: alpha(theme.palette.action.disabled, 0.1),
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {refreshing ? <CircularProgress size={24} /> : <Refresh />}
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={handleSaveAllSettings}
              disabled={saving}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: { xs: 2, md: 3 },
                py: 1,
                minWidth: { xs: "auto", md: 120 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 2px 8px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: `0 4px 16px ${alpha(
                    theme.palette.primary.main,
                    0.4
                  )}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                },
                "&:disabled": {
                  transform: "none",
                  background: alpha(theme.palette.action.disabled, 0.2),
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {saving ? "Saving..." : "Save All"}
            </Button>
          </Stack>
        </Box>

        {/* Enhanced Settings Navigation Tabs */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            mb: 3,
            overflow: "hidden",
            background: theme.palette.background.paper,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              "& .MuiTab-root": {
                minHeight: 64,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: theme.palette.text.secondary,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                "&.Mui-selected": {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            <Tab
              icon={<Person />}
              label="Profile"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Notifications />}
              label="Notifications"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Security />}
              label="Security"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Palette />}
              label="Appearance"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Shield />}
              label="Privacy"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            {isAdmin && (
              <Tab
                icon={<SettingsIcon />}
                label="System"
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            )}
          </Tabs>
        </Card>

        {/* Profile Settings Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(
                    theme.palette.common.black,
                    0.06
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  background: theme.palette.background.paper,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 32px ${alpha(
                      theme.palette.common.black,
                      0.12
                    )}`,
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Person sx={{ color: "white", fontSize: 18 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                      >
                        Profile Summary
                      </Typography>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ textAlign: "center", pt: 0 }}>
                  <Box position="relative" display="inline-block" mb={3}>
                    <Avatar
                      sx={{
                        width: 96,
                        height: 96,
                        fontSize: "2.5rem",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        mb: 1,
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 4px 16px ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                      src={user?.avatar}
                    >
                      {getInitials(user?.first_name, user?.last_name) ||
                        user?.username?.[0] ||
                        "U"}
                    </Avatar>
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: -4,
                        backgroundColor: theme.palette.background.paper,
                        border: `2px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 2px 8px ${alpha(
                          theme.palette.common.black,
                          0.15
                        )}`,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <PhotoCamera fontSize="small" color="primary" />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    {user?.email}
                  </Typography>

                  <Chip
                    label={user?.role ? getRoleLabel(user.role) : "Unknown"}
                    color={user?.role ? getRoleColor(user.role) : "default"}
                    size="medium"
                    icon={<Shield />}
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      px: 1,
                      "& .MuiChip-icon": {
                        fontSize: 16,
                      },
                    }}
                  />

                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      Member since{" "}
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Unknown"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(
                    theme.palette.common.black,
                    0.06
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  background: theme.palette.background.paper,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: `0 8px 32px ${alpha(
                      theme.palette.common.black,
                      0.12
                    )}`,
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Personal Information
                      </Typography>
                    </Box>
                  }
                  action={
                    <Box display="flex" gap={1}>
                      {isEditingProfile ? (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancelProfileEdit}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 500,
                              color: theme.palette.text.secondary,
                              borderColor: alpha(
                                theme.palette.text.secondary,
                                0.3
                              ),
                              "&:hover": {
                                borderColor: theme.palette.text.secondary,
                                backgroundColor: alpha(
                                  theme.palette.text.secondary,
                                  0.04
                                ),
                              },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={
                              saving ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <Save />
                              )
                            }
                            onClick={handleSaveProfile}
                            size="small"
                            disabled={saving}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                              "&:hover": {
                                transform: "translateY(-1px)",
                                boxShadow: theme.shadows[4],
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            {saving ? "Saving..." : "Save"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => setIsEditingProfile(true)}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 500,
                            color: theme.palette.primary.main,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            "&:hover": {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.04
                              ),
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={profileFormData.first_name || ""}
                        onChange={(e) =>
                          handleProfileFieldChange("first_name", e.target.value)
                        }
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                        sx={{
                          "& .MuiFilledInput-root": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.3
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.4
                              ),
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: isEditingProfile ? (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ) : undefined,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={profileFormData.last_name || ""}
                        onChange={(e) =>
                          handleProfileFieldChange("last_name", e.target.value)
                        }
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                        sx={{
                          "& .MuiFilledInput-root": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.3
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.4
                              ),
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: isEditingProfile ? (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ) : undefined,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileFormData.email || ""}
                        onChange={(e) =>
                          handleProfileFieldChange("email", e.target.value)
                        }
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                        sx={{
                          "& .MuiFilledInput-root": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.3
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.4
                              ),
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={profileFormData.username || ""}
                        onChange={(e) =>
                          handleProfileFieldChange("username", e.target.value)
                        }
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                        sx={{
                          "& .MuiFilledInput-root": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.3
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.4
                              ),
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">@</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={profileFormData.department || ""}
                        onChange={(e) =>
                          handleProfileFieldChange("department", e.target.value)
                        }
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                        sx={{
                          "& .MuiFilledInput-root": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.3
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.4
                              ),
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profileFormData.phone || ""}
                        onChange={(e) =>
                          handleProfileFieldChange("phone", e.target.value)
                        }
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                        sx={{
                          "& .MuiFilledInput-root": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.3
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.4
                              ),
                            },
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                      >
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          value={profileFormData.timezone || "UTC"}
                          onChange={(e) =>
                            handleProfileFieldChange("timezone", e.target.value)
                          }
                          label="Timezone"
                          sx={{
                            borderRadius: 2,
                            "& .MuiFilledInput-root": {
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.3
                              ),
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.action.hover,
                                  0.4
                                ),
                              },
                            },
                          }}
                        >
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">
                            Eastern Time
                          </MenuItem>
                          <MenuItem value="America/Chicago">
                            Central Time
                          </MenuItem>
                          <MenuItem value="America/Denver">
                            Mountain Time
                          </MenuItem>
                          <MenuItem value="America/Los_Angeles">
                            Pacific Time
                          </MenuItem>
                          <MenuItem value="Europe/London">London</MenuItem>
                          <MenuItem value="Europe/Paris">Paris</MenuItem>
                          <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${alpha(
                    theme.palette.common.black,
                    0.06
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  background: theme.palette.background.paper,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 32px ${alpha(
                      theme.palette.common.black,
                      0.12
                    )}`,
                  },
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Email sx={{ color: "white", fontSize: 18 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Email Notifications
                      </Typography>
                    </Box>
                  }
                  action={
                    <Button
                      variant="outlined"
                      startIcon={
                        saving ? <CircularProgress size={16} /> : <Save />
                      }
                      onClick={handleSaveNotifications}
                      size="small"
                      disabled={saving}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                        "&:hover": {
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <List sx={{ py: 0 }}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.action.hover,
                            0.5
                          ),
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <ListItemIcon>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive notifications via email"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={notificationSettings.email_notifications}
                          onChange={(e) =>
                            handleNotificationChange(
                              "email_notifications",
                              e.target.checked
                            )
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider sx={{ my: 1, opacity: 0.6 }} />
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.action.hover,
                            0.5
                          ),
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <ListItemIcon>
                        <NotificationsActive color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Push Notifications"
                        secondary="Receive browser push notifications"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={notificationSettings.push_notifications}
                          onChange={(e) =>
                            handleNotificationChange(
                              "push_notifications",
                              e.target.checked
                            )
                          }
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <NotificationsActive color="primary" fontSize="small" />
                      Activity Notifications
                    </Box>
                  }
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Requirement Updates"
                        secondary="Get notified when requirements change"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.requirement_updates}
                          onChange={(e) =>
                            handleNotificationChange(
                              "requirement_updates",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Test Results"
                        secondary="Notifications for test completions"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.test_results}
                          onChange={(e) =>
                            handleNotificationChange(
                              "test_results",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="System Alerts"
                        secondary="Important system notifications"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.system_alerts}
                          onChange={(e) =>
                            handleNotificationChange(
                              "system_alerts",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Lock color="primary" fontSize="small" />
                      Password & Authentication
                    </Box>
                  }
                />
                <CardContent>
                  <List>
                    <ListItem disablePadding>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Key />}
                        onClick={() => setChangePasswordDialog(true)}
                        sx={{ justifyContent: "flex-start", mb: 2 }}
                      >
                        Change Password
                      </Button>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Fingerprint />
                      </ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary="Add an extra layer of security"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={securitySettings.two_factor_enabled}
                          onChange={(e) =>
                            handleSecurityChange(
                              "two_factor_enabled",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Login Notifications"
                        secondary="Get notified of new logins"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={securitySettings.login_notifications}
                          onChange={(e) =>
                            handleSecurityChange(
                              "login_notifications",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime color="primary" fontSize="small" />
                      Session Settings
                    </Box>
                  }
                />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Session Timeout (minutes)
                    </Typography>
                    <Slider
                      value={securitySettings.session_timeout}
                      onChange={(e, value) =>
                        handleSecurityChange("session_timeout", value)
                      }
                      min={15}
                      max={120}
                      step={15}
                      marks={[
                        { value: 15, label: "15" },
                        { value: 30, label: "30" },
                        { value: 60, label: "60" },
                        { value: 120, label: "120" },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Password Expiry (days)
                    </Typography>
                    <Slider
                      value={securitySettings.password_expiry}
                      onChange={(e, value) =>
                        handleSecurityChange("password_expiry", value)
                      }
                      min={30}
                      max={365}
                      step={30}
                      marks={[
                        { value: 30, label: "30" },
                        { value: 90, label: "90" },
                        { value: 180, label: "180" },
                        { value: 365, label: "365" },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Palette color="primary" fontSize="small" />
                      Theme & Display
                    </Box>
                  }
                />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Theme Preference
                    </Typography>
                    <RadioGroup
                      value={appearanceSettings.theme}
                      onChange={(e) =>
                        handleAppearanceChange("theme", e.target.value)
                      }
                      row
                    >
                      <FormControlLabel
                        value="light"
                        control={<Radio />}
                        label={<LightMode />}
                      />
                      <FormControlLabel
                        value="dark"
                        control={<Radio />}
                        label={<DarkMode />}
                      />
                      <FormControlLabel
                        value="auto"
                        control={<Radio />}
                        label="Auto"
                      />
                    </RadioGroup>
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemText primary="Enable Animations" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appearanceSettings.animations_enabled}
                          onChange={(e) =>
                            handleAppearanceChange(
                              "animations_enabled",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VolumeUp />
                      </ListItemIcon>
                      <ListItemText primary="Sound Effects" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appearanceSettings.sound_enabled}
                          onChange={(e) =>
                            handleAppearanceChange(
                              "sound_enabled",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Language color="primary" fontSize="small" />
                      Localization
                    </Box>
                  }
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={appearanceSettings.language}
                          onChange={(e) =>
                            handleAppearanceChange("language", e.target.value)
                          }
                          label="Language"
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Spanish</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                          <MenuItem value="de">German</MenuItem>
                          <MenuItem value="zh">Chinese</MenuItem>
                          <MenuItem value="ja">Japanese</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          value={appearanceSettings.timezone}
                          onChange={(e) =>
                            handleAppearanceChange("timezone", e.target.value)
                          }
                          label="Timezone"
                        >
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">
                            Eastern Time
                          </MenuItem>
                          <MenuItem value="America/Chicago">
                            Central Time
                          </MenuItem>
                          <MenuItem value="America/Denver">
                            Mountain Time
                          </MenuItem>
                          <MenuItem value="America/Los_Angeles">
                            Pacific Time
                          </MenuItem>
                          <MenuItem value="Europe/London">London</MenuItem>
                          <MenuItem value="Europe/Paris">Paris</MenuItem>
                          <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Privacy Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Visibility color="primary" fontSize="small" />
                      Profile Visibility
                    </Box>
                  }
                />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Who can see your profile?
                    </Typography>
                    <RadioGroup
                      value={privacySettings.profile_visibility}
                      onChange={(e) =>
                        handlePrivacyChange(
                          "profile_visibility",
                          e.target.value
                        )
                      }
                    >
                      <FormControlLabel
                        value="public"
                        control={<Radio />}
                        label="Everyone"
                      />
                      <FormControlLabel
                        value="team"
                        control={<Radio />}
                        label="Team Members"
                      />
                      <FormControlLabel
                        value="private"
                        control={<Radio />}
                        label="Only Me"
                      />
                    </RadioGroup>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Storage color="primary" fontSize="small" />
                      Data & Analytics
                    </Box>
                  }
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Email Visibility"
                        secondary="Who can see your email address"
                      />
                      <ListItemSecondaryAction>
                        <FormControl size="small">
                          <Select
                            value={privacySettings.email_visibility}
                            onChange={(e) =>
                              handlePrivacyChange(
                                "email_visibility",
                                e.target.value
                              )
                            }
                          >
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="team">Team</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Analytics Consent"
                        secondary="Help improve the system with usage analytics"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={privacySettings.analytics_consent}
                          onChange={(e) =>
                            handlePrivacyChange(
                              "analytics_consent",
                              e.target.checked
                            )
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Settings Tab (Admin Only) */}
        {isAdmin && (
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: `0 2px 12px ${alpha(
                      theme.palette.common.black,
                      0.08
                    )}`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  }}
                >
                  <CardHeader
                    title={
                      <Box display="flex" alignItems="center" gap={1}>
                        <SettingsIcon color="primary" fontSize="small" />
                        Application Settings
                      </Box>
                    }
                    action={
                      <Button
                        variant="outlined"
                        startIcon={<Save />}
                        onClick={handleSaveSystemSettings}
                        size="small"
                        disabled={saving}
                      >
                        Save
                      </Button>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Application Name"
                          value={systemSettings.app_name}
                          onChange={(e) =>
                            handleSystemSettingsChange(
                              "app_name",
                              e.target.value
                            )
                          }
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Maximum File Size (MB)"
                          type="number"
                          value={systemSettings.max_file_size}
                          onChange={(e) =>
                            handleSystemSettingsChange(
                              "max_file_size",
                              parseInt(e.target.value)
                            )
                          }
                          variant="outlined"
                          inputProps={{ min: 1, max: 100 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" gutterBottom>
                            Default Session Timeout (minutes)
                          </Typography>
                          <Slider
                            value={systemSettings.session_timeout}
                            onChange={(e, value) =>
                              handleSystemSettingsChange(
                                "session_timeout",
                                value
                              )
                            }
                            min={15}
                            max={120}
                            step={15}
                            marks={[
                              { value: 15, label: "15" },
                              { value: 30, label: "30" },
                              { value: 60, label: "60" },
                              { value: 120, label: "120" },
                            ]}
                            valueLabelDisplay="auto"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: `0 2px 12px ${alpha(
                      theme.palette.common.black,
                      0.08
                    )}`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  }}
                >
                  <CardHeader
                    title={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Shield color="primary" fontSize="small" />
                        System Controls
                      </Box>
                    }
                  />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email Notifications"
                          secondary="Enable system-wide email notifications"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={systemSettings.email_notifications}
                            onChange={(e) =>
                              handleSystemSettingsChange(
                                "email_notifications",
                                e.target.checked
                              )
                            }
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Warning />
                        </ListItemIcon>
                        <ListItemText
                          primary="Maintenance Mode"
                          secondary="Put the system in maintenance mode"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={systemSettings.maintenance_mode}
                            onChange={(e) =>
                              handleSystemSettingsChange(
                                "maintenance_mode",
                                e.target.checked
                              )
                            }
                            color="warning"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                    {systemSettings.maintenance_mode && (
                      <Alert
                        severity="warning"
                        sx={{ mt: 2, borderRadius: 2 }}
                        icon={<Warning />}
                      >
                        Maintenance mode will prevent regular users from
                        accessing the system.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        )}

        {/* Success/Error Messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            icon={snackbarSeverity === "success" ? <CheckCircle /> : undefined}
            sx={{ borderRadius: 2 }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Legacy error/success states for backwards compatibility */}
        {error && (
          <Fade in={!!error}>
            <Box sx={{ mb: 2 }}>
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ borderRadius: 2 }}
              >
                {error}
              </Alert>
            </Box>
          </Fade>
        )}

        {success && (
          <Fade in={!!success}>
            <Box sx={{ mb: 2 }}>
              <Alert
                severity="success"
                onClose={() => setSuccess(null)}
                sx={{ borderRadius: 2 }}
              >
                {success}
              </Alert>
            </Box>
          </Fade>
        )}

        {/* Change Password Dialog */}
        <Dialog
          open={changePasswordDialog}
          onClose={() => setChangePasswordDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You will be redirected to the password change page.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setChangePasswordDialog(false);
                window.location.href = "/auth/change-password";
              }}
              variant="contained"
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default SettingsPage;
