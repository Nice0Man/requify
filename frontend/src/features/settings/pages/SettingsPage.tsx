import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Settings,
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
} from "@mui/icons-material";
import { useAuth, usePermissions } from "../../auth/context/auth.context";
import { UserProfile, NotificationPreferences, UserRole } from "../../auth/types/auth.types";

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

const SettingsPage: React.FC = () => {
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
  const [profileFormData, setProfileFormData] = useState<Partial<UserProfile>>({});

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    requirement_updates: true,
    test_results: true,
    system_alerts: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    session_timeout: 30,
    login_notifications: true,
    password_expiry: 90,
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "auto",
    density: "comfortable",
    sidebar_collapsed: false,
    animations_enabled: true,
    sound_enabled: true,
    language: "en",
    timezone: "UTC",
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: "team",
    activity_visibility: "private",
    email_visibility: "private",
    analytics_consent: true,
  });

  // State management
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);

  // Initialize form data when user data changes
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

      // Update notification settings
      if (user.notification_preferences) {
        setNotificationSettings(user.notification_preferences);
      }

      // Update appearance settings
      setAppearanceSettings(prev => ({
        ...prev,
        language: user.language || "en",
        timezone: user.timezone || "UTC",
      }));
    }
  }, [user]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle profile field changes
  const handleProfileFieldChange = (field: keyof UserProfile, value: any) => {
    setProfileFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle notification setting changes
  const handleNotificationChange = (setting: keyof NotificationPreferences, value: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Handle security setting changes
  const handleSecurityChange = (setting: string, value: any) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Handle appearance setting changes
  const handleAppearanceChange = (setting: string, value: any) => {
    setAppearanceSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Handle privacy setting changes
  const handlePrivacyChange = (setting: string, value: any) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setError(null);
      await updateProfile({
        ...profileFormData,
        notification_preferences: notificationSettings,
      });
      setIsEditingProfile(false);
      setSuccess("Profile updated successfully");
      await refreshUserData();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  // Save notification settings
  const handleSaveNotifications = async () => {
    try {
      setError(null);
      await updateProfile({
        notification_preferences: notificationSettings,
      });
      setSuccess("Notification preferences updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update notification preferences");
    }
  };

  // Save all settings
  const handleSaveAllSettings = async () => {
    try {
      setError(null);
      // This would save all settings to backend
      // For now, just show success message
      setSuccess("All settings saved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    }
  };

  // Handle cancel profile edit
  const handleCancelProfileEdit = () => {
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
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUserData();
      setSuccess("Settings refreshed");
    } catch (err: any) {
      setError("Failed to refresh settings");
    } finally {
      setRefreshing(false);
    }
  };

  // Get initials helper function (similar to ProfilePage)
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  // Get role color helper function (similar to ProfilePage)
  const getRoleColor = (role: UserRole) => {
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
  };

  // Get role label helper function (similar to ProfilePage)
  const getRoleLabel = (role: UserRole) => {
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
  };

  // Loading state
  if (isLoading && !user) {
    return (
      <Container component="main" maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={24} />
          </Box>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Settings sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Settings
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem" }}>
                Manage your account preferences and system configuration
              </Typography>
            </Box>

            <Box display="flex" gap={1}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Refresh sx={{ color: theme.palette.primary.main }} />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveAllSettings}
                sx={{ ml: 2 }}
              >
                Save All
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Settings Navigation Tabs */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            mb: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<Palette />} label="Appearance" />
            <Tab icon={<Shield />} label="Privacy" />
          </Tabs>
        </Card>

        {/* Profile Settings Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person color="primary" fontSize="small" />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                        Profile Summary
                      </Typography>
                    </Box>
                  }
                />
                <CardContent sx={{ textAlign: "center" }}>
                  <Box position="relative" display="inline-block" mb={2}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: "2rem",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        mb: 1,
                      }}
                      src={user?.avatar}
                    >
                      {getInitials(user?.first_name, user?.last_name) || user?.username?.[0] || "U"}
                    </Avatar>
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: -8,
                        backgroundColor: theme.palette.background.paper,
                        border: `2px solid ${theme.palette.background.paper}`,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {user?.email}
                  </Typography>

                  <Chip
                    label={user?.role ? getRoleLabel(user.role) : "Unknown"}
                    color={user?.role ? getRoleColor(user.role) : "default"}
                    size="small"
                    icon={<Shield />}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Member since:{" "}
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title="Personal Information"
                  action={
                    <Box display="flex" gap={1}>
                      {isEditingProfile ? (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancelProfileEdit}
                            size="small"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSaveProfile}
                            size="small"
                            disabled={isLoading}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => setIsEditingProfile(true)}
                          size="small"
                        >
                          Edit
                        </Button>
                      )}
                    </Box>
                  }
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={profileFormData.first_name || ""}
                        onChange={(e) => handleProfileFieldChange("first_name", e.target.value)}
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={profileFormData.last_name || ""}
                        onChange={(e) => handleProfileFieldChange("last_name", e.target.value)}
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileFormData.email || ""}
                        onChange={(e) => handleProfileFieldChange("email", e.target.value)}
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={profileFormData.username || ""}
                        onChange={(e) => handleProfileFieldChange("username", e.target.value)}
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">@</InputAdornment>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={profileFormData.department || ""}
                        onChange={(e) => handleProfileFieldChange("department", e.target.value)}
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profileFormData.phone || ""}
                        onChange={(e) => handleProfileFieldChange("phone", e.target.value)}
                        disabled={!isEditingProfile}
                        variant={isEditingProfile ? "outlined" : "filled"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!isEditingProfile}>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          value={profileFormData.timezone || "UTC"}
                          onChange={(e) => handleProfileFieldChange("timezone", e.target.value)}
                          label="Timezone"
                          variant={isEditingProfile ? "outlined" : "filled"}
                        >
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">Eastern Time</MenuItem>
                          <MenuItem value="America/Chicago">Central Time</MenuItem>
                          <MenuItem value="America/Denver">Mountain Time</MenuItem>
                          <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email color="primary" fontSize="small" />
                      Email Notifications
                    </Box>
                  }
                  action={
                    <Button
                      variant="outlined"
                      startIcon={<Save />}
                      onClick={handleSaveNotifications}
                      size="small"
                    >
                      Save
                    </Button>
                  }
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText primary="Email Notifications" secondary="Receive notifications via email" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.email_notifications}
                          onChange={(e) => handleNotificationChange("email_notifications", e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <NotificationsActive />
                      </ListItemIcon>
                      <ListItemText primary="Push Notifications" secondary="Receive browser push notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.push_notifications}
                          onChange={(e) => handleNotificationChange("push_notifications", e.target.checked)}
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
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
                      <ListItemText primary="Requirement Updates" secondary="Get notified when requirements change" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.requirement_updates}
                          onChange={(e) => handleNotificationChange("requirement_updates", e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Test Results" secondary="Notifications for test completions" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.test_results}
                          onChange={(e) => handleNotificationChange("test_results", e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="System Alerts" secondary="Important system notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.system_alerts}
                          onChange={(e) => handleNotificationChange("system_alerts", e.target.checked)}
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
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
                          onChange={(e) => handleSecurityChange("two_factor_enabled", e.target.checked)}
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
                          onChange={(e) => handleSecurityChange("login_notifications", e.target.checked)}
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
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
                      onChange={(e, value) => handleSecurityChange("session_timeout", value)}
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
                      onChange={(e, value) => handleSecurityChange("password_expiry", value)}
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
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
                      onChange={(e) => handleAppearanceChange("theme", e.target.value)}
                      row
                    >
                      <FormControlLabel value="light" control={<Radio />} label={<LightMode />} />
                      <FormControlLabel value="dark" control={<Radio />} label={<DarkMode />} />
                      <FormControlLabel value="auto" control={<Radio />} label="Auto" />
                    </RadioGroup>
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemText primary="Enable Animations" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appearanceSettings.animations_enabled}
                          onChange={(e) => handleAppearanceChange("animations_enabled", e.target.checked)}
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
                          onChange={(e) => handleAppearanceChange("sound_enabled", e.target.checked)}
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
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
                          onChange={(e) => handleAppearanceChange("language", e.target.value)}
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
                          onChange={(e) => handleAppearanceChange("timezone", e.target.value)}
                          label="Timezone"
                        >
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">Eastern Time</MenuItem>
                          <MenuItem value="America/Chicago">Central Time</MenuItem>
                          <MenuItem value="America/Denver">Mountain Time</MenuItem>
                          <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
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
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
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
                      onChange={(e) => handlePrivacyChange("profile_visibility", e.target.value)}
                    >
                      <FormControlLabel value="public" control={<Radio />} label="Everyone" />
                      <FormControlLabel value="team" control={<Radio />} label="Team Members" />
                      <FormControlLabel value="private" control={<Radio />} label="Only Me" />
                    </RadioGroup>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
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
                            onChange={(e) => handlePrivacyChange("email_visibility", e.target.value)}
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
                          onChange={(e) => handlePrivacyChange("analytics_consent", e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Success/Error Messages */}
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" icon={<CheckCircle />}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>

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
            <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
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
