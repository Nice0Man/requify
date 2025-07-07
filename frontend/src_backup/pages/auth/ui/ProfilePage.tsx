import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Business,
  Edit,
  PhotoCamera,
  Security,
  Save,
  Cancel,
  Logout,
  DeleteForever,
  Shield,
  NotificationsActive,
  Info,
  Key,
  Language,
  AccessTime,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

import { useAuth, usePermissions } from "@/features/auth/model";
import {
  UserRole,
  type UserUpdate,
  type UserProfile,
  type NotificationSettings,
} from "@/entities/user/model";

// Validation schema
const profileSchema = yup.object({
  first_name: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .optional(),
  last_name: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  email: yup.string().email("Please enter a valid email address").optional(),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .optional(),
  department: yup
    .string()
    .max(100, "Department must be less than 100 characters")
    .optional(),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional(),
  timezone: yup.string().optional(),
  language: yup.string().optional(),
});

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateProfile, logout, refreshUserData } = useAuth();
  const { hasPermission } = usePermissions();
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

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Settings state for notification preferences
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email_notifications: true,
      push_notifications: false,
      requirement_updates: true,
      test_results: true,
      system_alerts: true,
    });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UserUpdate>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      username: user?.username || "",
      department: user?.department || "",
      phone: user?.phone || "",
      timezone: user?.timezone || "UTC",
      language: user?.language || "en",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
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
    }
  }, [user, reset]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      if (user) {
        reset({
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
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(false);
  };

  const onSubmit = async (data: UserUpdate) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare profile update data
      const profileData: Partial<UserProfile> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.username,
        department: data.department,
        phone: data.phone,
        timezone: data.timezone,
        language: data.language,
        notification_preferences: notificationSettings,
      };

      // For now, handle avatar upload separately if needed
      if (avatarFile) {
        toast.info(
          "Avatar upload will be implemented when backend supports it"
        );
      }

      await updateProfile(profileData);

      setSuccess(true);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Profile updated successfully");

      // Refresh user data
      await refreshUserData();
    } catch (error: any) {
      let errorMessage = "Failed to update profile. Please try again.";

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail
            .map((err: any) => err.msg || err.message || "Validation error")
            .join(", ");
        } else if (typeof detail === "string") {
          errorMessage = detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate("/auth/change-password");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleDeleteAccount = () => {
    toast.info("Account deletion feature coming soon");
    setDeleteDialogOpen(false);
  };

  const handleNotificationChange = (
    setting: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev: NotificationSettings) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

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

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Person sx={{ fontSize: 32, color: theme.palette.primary.main }} />
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
              Profile Settings
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage your account information and preferences
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Information Card */}
          <Grid item xs={12} md={8}>
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
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Person sx={{ mr: 1 }} />
                    Profile Information
                  </Typography>
                  <Button
                    variant={isEditing ? "outlined" : "contained"}
                    onClick={handleEditToggle}
                    startIcon={isEditing ? <Cancel /> : <Edit />}
                    disabled={isLoading}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </Box>

                {/* Success Alert */}
                {success && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    Profile updated successfully!
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                )}

                {/* Avatar Section */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: "2rem",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      }}
                      src={avatarPreview || user?.avatar}
                    >
                      {getInitials(user?.first_name, user?.last_name)}
                    </Avatar>
                    {isEditing && (
                      <IconButton
                        sx={{
                          position: "absolute",
                          bottom: -5,
                          right: -5,
                          backgroundColor: "primary.main",
                          color: "white",
                          "&:hover": { backgroundColor: "primary.dark" },
                        }}
                        size="small"
                        component="label"
                      >
                        <PhotoCamera fontSize="small" />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ ml: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user?.first_name} {user?.last_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      @{user?.username}
                    </Typography>
                    <Chip
                      label={getRoleLabel(user?.role || UserRole.VIEWER)}
                      color={getRoleColor(user?.role || UserRole.VIEWER)}
                      size="small"
                      icon={<Shield />}
                    />
                  </Box>
                </Box>

                {/* Profile Form */}
                <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        disabled={!isEditing}
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                        {...register("first_name")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        disabled={!isEditing}
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                        {...register("last_name")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        disabled={!isEditing}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                        {...register("email")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        disabled={!isEditing}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">@</InputAdornment>
                          ),
                        }}
                        {...register("username")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        disabled={!isEditing}
                        error={!!errors.department}
                        helperText={errors.department?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business />
                            </InputAdornment>
                          ),
                        }}
                        {...register("department")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        disabled={!isEditing}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                        {...register("phone")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!isEditing}>
                        <InputLabel>Timezone</InputLabel>
                        <Controller
                          name="timezone"
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Timezone"
                              startAdornment={
                                <InputAdornment position="start">
                                  <AccessTime />
                                </InputAdornment>
                              }
                              {...field}
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
                          )}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!isEditing}>
                        <InputLabel>Language</InputLabel>
                        <Controller
                          name="language"
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Language"
                              startAdornment={
                                <InputAdornment position="start">
                                  <Language />
                                </InputAdornment>
                              }
                              {...field}
                            >
                              {Object.values(Language).map((language) => (
                                <MenuItem key={language} value={language}>
                                  {language}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>

                  {isEditing && (
                    <CardActions sx={{ px: 0, pt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        startIcon={
                          isLoading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Save />
                          )
                        }
                        sx={{ px: 4 }}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardActions>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            {/* Security Card */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: `0 2px 12px ${alpha(
                  theme.palette.common.black,
                  0.08
                )}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Security sx={{ mr: 1 }} />
                  Security
                </Typography>
                <List dense>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Key />}
                      onClick={handleChangePassword}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Change Password
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Notification Preferences Card */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: `0 2px 12px ${alpha(
                  theme.palette.common.black,
                  0.08
                )}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <NotificationsActive sx={{ mr: 1 }} />
                  Notifications
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText primary="Email Notifications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.email_notifications}
                        onChange={(e) =>
                          handleNotificationChange(
                            "email_notifications",
                            e.target.checked
                          )
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsActive />
                    </ListItemIcon>
                    <ListItemText primary="Push Notifications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.push_notifications}
                        onChange={(e) =>
                          handleNotificationChange(
                            "push_notifications",
                            e.target.checked
                          )
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Requirement Updates" />
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
                  <ListItem>
                    <ListItemText primary="Test Results" />
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
                  <ListItem>
                    <ListItemText primary="System Alerts" />
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

            {/* Account Actions Card */}
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
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Info sx={{ mr: 1 }} />
                  Account Actions
                </Typography>
                <List dense>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Logout />}
                      onClick={() => setLogoutDialogOpen(true)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Sign Out
                    </Button>
                  </ListItem>
                  <ListItem disablePadding>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteForever />}
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Delete Account
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Logout Confirmation Dialog */}
        <Dialog
          open={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
        >
          <DialogTitle>Sign Out</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to sign out of your account?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLogout} variant="contained" color="primary">
              Sign Out
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle color="error.main">Delete Account</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <Typography>
              Are you sure you want to permanently delete your account? All your
              data will be lost.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteAccount}
              variant="contained"
              color="error"
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProfilePage;
