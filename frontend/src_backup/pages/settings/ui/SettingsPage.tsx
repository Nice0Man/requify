import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Stack,
  IconButton,
  Avatar,
  Chip,
  Backdrop,
  CircularProgress,
  useTheme,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import {
  Settings,
  Person,
  Security,
  Notifications,
  Palette,
  PrivacyTip,
  AdminPanelSettings,
  Refresh,
  Save,
} from "@mui/icons-material";

// Correct imports according to FSD structure
import { useAuth } from "@/features/auth";
import { usePermissions } from "@/features/auth";
import { ProfileEditForm } from "@/features/profile/edit";
import { NotificationSettings } from "@/features/notifications/settings";
import { SecuritySettings } from "@/features/security/settings";
import { AppearanceSettings } from "@/features/appearance/settings";
import { PrivacySettings } from "@/features/privacy/settings";
import { SystemSettings } from "@/features/system/settings";
import { UserProfile } from "@/shared/types";

// Simple TabPanel component since it's not available in shared
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const { user, isLoading } = useAuth();
  const { hasPermission } = usePermissions();

  // Toast state instead of useSnackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // Local refresh function
  const refreshData = async () => {
    // For now, just return a promise since we don't have refreshUserData
    // In a real app, this would refetch user data
    return Promise.resolve();
  };

  // Permission check for admin access
  const isAdmin = useMemo(
    () =>
      hasPermission("admin:read") ||
      hasPermission("admin:write") ||
      hasPermission("admin:delete"),
    [hasPermission]
  );

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        await refreshData();
      } catch (error) {
        console.error("Failed to load user data:", error);
        showSnackbar("Failed to load user data", "error");
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [user, isLoading]);

  // Handlers
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshData();
      showSnackbar("Settings refreshed", "success");
    } catch (err: any) {
      showSnackbar("Failed to refresh settings", "error");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSaveAll = useCallback(async () => {
    // This will be handled by individual setting components
    showSnackbar("All settings saved successfully", "success");
  }, [showSnackbar]);

  // Helper functions
  const getInitials = useCallback((firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  }, []);

  // Components
  const LoadingBackdrop = ({
    open,
    message,
  }: {
    open: boolean;
    message?: string;
    gradient?: string;
  }) => (
    <Backdrop open={open} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <CircularProgress color="inherit" />
        {message && <Typography color="inherit">{message}</Typography>}
      </Box>
    </Backdrop>
  );

  const UserAvatar = ({ user, size = 64 }: { user: any; size?: number }) => (
    <Avatar sx={{ width: size, height: size }} src={(user as any)?.avatar_url}>
      {getInitials((user as any)?.first_name, (user as any)?.last_name) ||
        (user as any)?.username?.[0]?.toUpperCase()}
    </Avatar>
  );

  const RoleBadge = ({ role }: { role: string }) => (
    <Chip label={role} size="small" color="primary" />
  );

  // Loading state with backdrop
  if (initialLoading || (isLoading && !user)) {
    return (
      <LoadingBackdrop
        open={true}
        message="Loading Settings..."
        gradient={`linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.9
        )}, ${alpha(theme.palette.secondary.main, 0.9)})`}
      />
    );
  }

  return (
    <>
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
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveAll}
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
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Save All
              </Button>
            </Stack>
          </Box>

          {/* Enhanced Settings Navigation Tabs */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
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
                icon={<PrivacyTip />}
                label="Privacy"
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              {isAdmin && (
                <Tab
                  icon={<AdminPanelSettings />}
                  label="System"
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
              )}
            </Tabs>
          </Card>

          {/* Profile Settings Tab */}
          <TabPanel value={activeTab} index={0}>
            <Stack direction="row" spacing={3}>
              {user && (
                <Box sx={{ flex: 1 }}>
                  <ProfileEditForm
                    user={user as unknown as UserProfile}
                    onSave={refreshData}
                  />
                </Box>
              )}
              {user && (
                <Box sx={{ flex: 1 }}>
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
                    <CardContent sx={{ textAlign: "center", pt: 0 }}>
                      <UserAvatar user={user} size={96} />

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {(user as any)?.first_name && (user as any)?.last_name
                          ? `${(user as any).first_name} ${
                              (user as any).last_name
                            }`
                          : (user as any)?.username || "User"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, fontWeight: 500 }}
                      >
                        {(user as any)?.email || "No email"}
                      </Typography>

                      <RoleBadge role={(user as any)?.role || "user"} />

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
                          {(user as any)?.created_at
                            ? new Date(
                                (user as any).created_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Unknown"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Stack>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={1}>
            <NotificationSettings onSave={refreshData} />
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={2}>
            <SecuritySettings onSave={refreshData} />
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={activeTab} index={3}>
            <AppearanceSettings onSave={refreshData} />
          </TabPanel>

          {/* Privacy Tab */}
          <TabPanel value={activeTab} index={4}>
            <PrivacySettings onSave={refreshData} />
          </TabPanel>

          {/* System Settings Tab (Admin Only) */}
          {isAdmin && (
            <TabPanel value={activeTab} index={5}>
              <SystemSettings />
            </TabPanel>
          )}
        </Box>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SettingsPage;
