import React, { useState, useEffect } from "react";
import {
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
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  Person,
  PhotoCamera,
  Refresh,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/context/auth.context";
import { UserProfile } from "@/features/auth/types/auth.types";

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const { user, updateProfile, refreshUserData, isLoading } = useAuth();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch fresh user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setRefreshing(true);
        await refreshUserData();
      } catch (err) {
        console.error("Failed to refresh user data:", err);
      } finally {
        setRefreshing(false);
      }
    };

    fetchUserData();
  }, [refreshUserData]);

  // Initialize form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
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
  }, [user]);

  // Handle form field changes
  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      setError(null);
      await updateProfile(formData);
      setIsEditing(false);
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    if (user) {
      setFormData({
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
    setIsEditing(false);
    setError(null);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUserData();
    } catch (err: any) {
      setError("Failed to refresh user data");
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (isLoading && !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={24} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Skeleton
                  variant="circular"
                  width={80}
                  height={80}
                  sx={{ mx: "auto", mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{ mx: "auto", mb: 1 }}
                />
                <Skeleton variant="text" width="40%" sx={{ mx: "auto" }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Settings
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: "1.1rem" }}
            >
              Manage your account preferences and profile information
            </Typography>
          </Box>

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
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
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
                  <Person color="primary" fontSize="small" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Profile
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
                    backgroundColor: theme.palette.primary.main,
                    mb: 1,
                  }}
                  src={user?.avatar}
                >
                  {user?.first_name?.[0] || user?.username?.[0] || "U"}
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

              <Typography variant="caption" color="text.secondary">
                {user?.role?.toUpperCase()} •{" "}
                {user?.department || "No department"}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Last login:{" "}
                  {user?.last_login
                    ? new Date(user.last_login).toLocaleDateString()
                    : "Never"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Information */}
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
            <CardHeader
              title="Personal Information"
              action={
                <Box display="flex" gap={1}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        size="small"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
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
                      onClick={() => setIsEditing(true)}
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
                    value={formData.first_name || ""}
                    onChange={(e) =>
                      handleFieldChange("first_name", e.target.value)
                    }
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.last_name || ""}
                    onChange={(e) =>
                      handleFieldChange("last_name", e.target.value)
                    }
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username || ""}
                    onChange={(e) =>
                      handleFieldChange("username", e.target.value)
                    }
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.department || ""}
                    onChange={(e) =>
                      handleFieldChange("department", e.target.value)
                    }
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={formData.timezone || "UTC"}
                      onChange={(e) =>
                        handleFieldChange("timezone", e.target.value)
                      }
                      label="Timezone"
                      variant={isEditing ? "outlined" : "filled"}
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">
                        Pacific Time
                      </MenuItem>
                      <MenuItem value="Europe/London">London</MenuItem>
                      <MenuItem value="Europe/Paris">Paris</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={formData.language || "en"}
                      onChange={(e) =>
                        handleFieldChange("language", e.target.value)
                      }
                      label="Language"
                      variant={isEditing ? "outlined" : "filled"}
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
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
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
    </Box>
  );
};

export default SettingsPage;
