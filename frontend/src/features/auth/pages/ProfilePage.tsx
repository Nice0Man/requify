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
  FormHelperText,
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
  Skeleton,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Business,
  Edit,
  PhotoCamera,
  Security,
  Settings,
  Save,
  Cancel,
  Logout,
  DeleteForever,
  Shield,
  NotificationsActive,
  Schedule,
  Info,
  Key,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../context/auth.context";
import { UserUpdate, UserRole, UserProfile } from "../types/auth.types";
import { usersApi } from "../api/users.api";

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
  role: yup
    .string()
    .oneOf(Object.values(UserRole), "Please select a valid role")
    .optional(),
});

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    darkMode: false,
    language: "en",
    timezone: "UTC",
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
      first_name: userProfile?.first_name || "",
      last_name: userProfile?.last_name || "",
      email: userProfile?.email || "",
      username: userProfile?.username || "",
      department: userProfile?.department || "",
      phone: userProfile?.phone || "",
      role: userProfile?.role || UserRole.GUEST,
    },
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        setError(null);

        const response = await usersApi.getCurrentUser();
        setUserProfile(response.data);

        // Update form with fetched data
        reset({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          email: response.data.email || "",
          username: response.data.username || "",
          department: response.data.department || "",
          phone: response.data.phone || "",
          role: response.data.role || UserRole.GUEST,
        });
      } catch (error: any) {
        console.error("Failed to fetch user profile:", error);
        setError("Failed to load profile data. Please try again.");
        toast.error("Failed to load profile data");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [reset]);

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
      reset({
        first_name: userProfile?.first_name || "",
        last_name: userProfile?.last_name || "",
        email: userProfile?.email || "",
        username: userProfile?.username || "",
        department: userProfile?.department || "",
        phone: userProfile?.phone || "",
        role: userProfile?.role || UserRole.GUEST,
      });
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

      // Convert UserUpdate to Partial<UserProfile> format
      const profileData: Partial<UserProfile> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.username,
        department: data.department,
        phone: data.phone,
        role: data.role,
        timezone: data.timezone,
        language: data.language,
      };

      // For now, handle avatar upload separately if needed
      // TODO: Implement avatar upload logic when backend supports it
      if (avatarFile) {
        // This would typically be handled by a separate avatar upload endpoint
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
    } catch (error: any) {
      let errorMessage = "Failed to update profile. Please try again.";

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        // Handle validation errors (array of error objects)
        if (Array.isArray(detail)) {
          errorMessage = detail
            .map((err: any) => {
              if (typeof err === "string") return err;
              if (err.msg) return err.msg;
              if (err.message) return err.message;
              return "Validation error";
            })
            .join(", ");
        }
        // Handle single validation error object
        else if (typeof detail === "object" && detail.msg) {
          errorMessage = detail.msg;
        }
        // Handle string detail
        else if (typeof detail === "string") {
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
    // Implement account deletion logic
    toast.info("Account deletion feature coming soon");
    setDeleteDialogOpen(false);
  };

  const handleSettingChange = (setting: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
    // Here you would typically save to backend
    toast.success("Setting updated");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.DEVELOPER:
        return "primary";
      case UserRole.ANALYST:
        return "info";
      case UserRole.TESTER:
        return "success";
      case UserRole.VIEWER:
        return "warning";
      case UserRole.GUEST:
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Admin";
      case UserRole.MANAGER:
        return "Manager";
      case UserRole.DEVELOPER:
        return "Developer";
      case UserRole.ANALYST:
        return "Analyst";
      case UserRole.TESTER:
        return "Tester";
      case UserRole.VIEWER:
        return "Viewer";
      case UserRole.GUEST:
        return "Guest";
      default:
        return "Guest";
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            Profile Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account information and preferences
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Information Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h5"
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
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                      }}
                      src={avatarPreview || userProfile?.avatar}
                    >
                      {getInitials(
                        userProfile?.first_name,
                        userProfile?.last_name
                      )}
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
                    {profileLoading ? (
                      <>
                        <Skeleton variant="text" width={200} height={32} />
                        <Skeleton
                          variant="text"
                          width={120}
                          height={20}
                          sx={{ mb: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={24}
                          sx={{ borderRadius: 3 }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {userProfile?.first_name} {userProfile?.last_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          @{userProfile?.username}
                        </Typography>
                        <Chip
                          label={getRoleLabel(
                            userProfile?.role || UserRole.GUEST
                          )}
                          color={getRoleColor(
                            userProfile?.role || UserRole.GUEST
                          )}
                          size="small"
                          icon={<Shield />}
                        />
                      </>
                    )}
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
                        required
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
                        required
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
                        required
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
                        required
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
                    {userProfile?.role === UserRole.ADMIN && (
                      <Grid item xs={12}>
                        <FormControl
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.role}
                        >
                          <InputLabel>Role</InputLabel>
                          <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                              <Select label="Role" {...field}>
                                <MenuItem value={UserRole.GUEST}>
                                  Guest
                                </MenuItem>
                                <MenuItem value={UserRole.VIEWER}>
                                  Viewer
                                </MenuItem>
                                <MenuItem value={UserRole.ANALYST}>
                                  Analyst
                                </MenuItem>
                                <MenuItem value={UserRole.TESTER}>
                                  Tester
                                </MenuItem>
                                <MenuItem value={UserRole.DEVELOPER}>
                                  Developer
                                </MenuItem>
                              </Select>
                            )}
                          />
                          {errors.role && (
                            <FormHelperText>
                              {errors.role.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    )}
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
            <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
              <CardContent>
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

            {/* Account Settings Card */}
            <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Settings sx={{ mr: 1 }} />
                  Preferences
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsActive />
                    </ListItemIcon>
                    <ListItemText primary="Email Notifications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          handleSettingChange(
                            "emailNotifications",
                            e.target.checked
                          )
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText primary="Weekly Reports" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.weeklyReports}
                        onChange={(e) =>
                          handleSettingChange("weeklyReports", e.target.checked)
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Account Actions Card */}
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
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
