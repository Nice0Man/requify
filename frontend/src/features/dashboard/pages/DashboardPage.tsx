import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Chip,
  Divider,
  Button,
  LinearProgress,
  Container,
  Stack,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Assignment,
  FolderOpen,
  Group,
  TrendingUp,
  RocketLaunch,
  Refresh,
  Settings,
  CheckCircle,
  AdminPanelSettings,
  Security,
  Backup,
  Timeline,
  Launch,
  Schedule,
  BugReport,
  Speed,
  Dashboard as DashboardIcon,
  Analytics,
  Groups,
  ArrowForward,
  Add,
  Notifications,
  Storage,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth, usePermissions } from "@/features/auth/context/auth.context";
import { UserRole } from "@/features/auth/types/auth.types";
import { dashboardApi, DashboardStats } from "../api/dashboard.api";
import { adminApi } from "@/features/admin/api/admin.api";
import { releasesApi } from "@/features/releases/api/releases.api";
import { StatCard } from "@/shared/components/StatCard/StatCard";
import { ActivityFeed } from "@/shared/components/ActivityFeed/ActivityFeed";
import { QuickAccess } from "@/shared/components/QuickAccess/QuickAccessCard";

// Dashboard panels component interfaces
interface ReleasePanelData {
  upcoming_releases: number;
  active_releases: number;
  completed_releases: number;
  overdue_releases: number;
  recent_releases: Array<{
    id: number;
    name: string;
    version: string;
    status: string;
    planned_date: string;
  }>;
}

interface AdminPanelData {
  system_health: {
    overall_status: "healthy" | "warning" | "critical";
    database: "up" | "down" | "degraded";
    api: "up" | "down" | "degraded";
    storage: "up" | "down" | "degraded";
  };
  security_alerts: number;
  active_users_today: number;
  failed_logins_today: number;
  backup_status: {
    last_backup: string;
    status: "completed" | "failed" | "running";
  };
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Check if user has admin access
  const isAdmin = user?.role === UserRole.ADMIN || user?.is_superuser || hasAnyPermission(['admin:read', 'admin:write']);

  // State management
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [releasesData, setReleasesData] = useState<ReleasePanelData | null>(null);
  const [adminData, setAdminData] = useState<AdminPanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Load dashboard data
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Prepare parallel requests
      const requests = [
        dashboardApi.getDashboardData(),
        dashboardApi.getMyDashboard(),
      ];

      // Add releases data request
      requests.push(
        releasesApi.getReleases({ limit: 5, sort_by: 'planned_date', sort_order: 'desc' })
      );

      // Add admin data request if user is admin
      if (isAdmin) {
        requests.push(
          adminApi.getSystemInfo(),
          adminApi.getHealth()
        );
      }

      const responses = await Promise.all(requests);

      // Process dashboard data
      const [dashboardResponse, myDashboardResponse, releasesResponse] = responses;
      
      // Combine main dashboard data
      const combinedData: DashboardStats = {
        ...dashboardResponse.data,
        quick_access: {
          my_projects: myDashboardResponse.data.my_projects,
          my_requirements: myDashboardResponse.data.my_requirements,
          pending_approvals: myDashboardResponse.data.notifications
            .filter((n) => n.type === "warning" && !n.read)
            .map((n) => ({
              id: parseInt(n.id),
              type: "requirement" as const,
              title: n.title,
              requested_by: "System",
              requested_at: n.timestamp,
              urgency: n.priority as "low" | "medium" | "high",
            })),
        },
      };

      setDashboardData(combinedData);

      // Process releases data
      const releases = releasesResponse.data.items || [];
      const releasesStats: ReleasePanelData = {
        upcoming_releases: releases.filter(r => r.status === 'planning' || r.status === 'in_progress').length,
        active_releases: releases.filter(r => r.status === 'testing' || r.status === 'ready').length,
        completed_releases: releases.filter(r => r.status === 'released').length,
        overdue_releases: releases.filter(r => {
          const plannedDate = new Date(r.planned_date || '');
          return plannedDate < new Date() && r.status !== 'released';
        }).length,
        recent_releases: releases.slice(0, 5).map(r => ({
          id: r.id,
          name: r.name,
          version: r.version,
          status: r.status,
          planned_date: r.planned_date || '',
        })),
      };
      setReleasesData(releasesStats);

      // Process admin data if available
      if (isAdmin && responses.length > 3) {
        const [, , , systemInfoResponse, healthResponse] = responses;
        const adminStats: AdminPanelData = {
          system_health: {
            overall_status: healthResponse.data.status === 'ok' ? 'healthy' : 'warning',
            database: systemInfoResponse.data.database?.status || 'up',
            api: systemInfoResponse.data.api_health?.status || 'up',
            storage: systemInfoResponse.data.storage?.status || 'up',
          },
          security_alerts: 0, // Would come from security endpoint
          active_users_today: systemInfoResponse.data.api_health?.active_sessions || 0,
          failed_logins_today: 0, // Would come from security logs
          backup_status: {
            last_backup: systemInfoResponse.data.database?.last_backup || new Date().toISOString(),
            status: 'completed' as const,
          },
        };
        setAdminData(adminStats);
      }

      setLastRefresh(new Date());
      setError(null);
      
      if (isRefresh) {
        setSnackbarMessage("Dashboard refreshed successfully");
        setSnackbarOpen(true);
      }
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      
      if (isRefresh) {
        setSnackbarMessage("Failed to refresh dashboard");
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Handle error close
  const handleErrorClose = () => {
    setError(null);
  };

  // Get status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'completed':
        return theme.palette.success.main;
      case 'warning':
      case 'degraded':
        return theme.palette.warning.main;
      case 'critical':
      case 'down':
      case 'failed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Loading state
  if (loading && !dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Loading your dashboard...
            </Typography>
            <LinearProgress sx={{ mt: 2, maxWidth: 400, mx: "auto" }} />
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {getGreeting()}, {user?.first_name || user?.username}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your projects today.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Dashboard">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: "rotate(180deg)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => navigate("/settings")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/projects/new")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              New Project
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={handleErrorClose}
              action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Retry
                </Button>
              }
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Quick Actions */}
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={600 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                        borderColor: alpha(action.color, 0.3),
                      },
                    }}
                    onClick={() => handleQuickAction(action.action, action.title)}
                  >
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: alpha(action.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: action.color,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForward fontSize="small" />}
                        sx={{
                          alignSelf: "flex-start",
                          textTransform: "none",
                          fontWeight: 500,
                          color: action.color,
                          "&:hover": {
                            backgroundColor: alpha(action.color, 0.05),
                          },
                        }}
                      >
                        Get Started
                      </Button>
                    </Stack>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Overview Stats */}
        {dashboardData && (
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => navigate("/projects")}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {dashboardData.overview.total_projects}
                      </Typography>
                      <Groups color="primary" />
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Total Projects
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardData.overview.active_projects} active projects
                    </Typography>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => navigate("/requirements")}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {dashboardData.overview.total_requirements}
                      </Typography>
                      <Assignment color="success" />
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Requirements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardData.overview.approved_requirements} approved
                    </Typography>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => navigate("/releases")}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {releasesData?.active_releases || 0}
                      </Typography>
                      <Launch color="warning" />
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Active Releases
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {releasesData?.upcoming_releases || 0} upcoming
                    </Typography>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => navigate("/settings")}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {dashboardData.overview.active_users}
                      </Typography>
                      <Analytics color="info" />
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Active Users
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Team collaboration
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Admin Panel - Only visible to admins */}
        {isAdmin && (
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              System Administration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Security color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        System Health
                      </Typography>
                      <Chip
                        label={adminData?.system_health.overall_status}
                        color={getStatusColor(adminData?.system_health.overall_status)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </Stack>
                    
                    <Stack spacing={2}>
                      {Object.entries(adminData?.system_health)
                        .filter(([key]) => key !== "overall_status")
                        .map(([service, status]) => (
                          <Stack
                            key={service}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                              {service.replace("_", " ")}
                            </Typography>
                            <Chip
                              label={status}
                              color={getStatusColor(status)}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: "capitalize" }}
                            />
                          </Stack>
                        ))}
                    </Stack>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate("/admin")}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Open Admin Panel
                    </Button>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Storage color="info" />
                      <Typography variant="h6" fontWeight={600}>
                        Activity & Security
                      </Typography>
                    </Stack>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Stack alignItems="center" spacing={1}>
                          <Typography variant="h4" fontWeight={700} color="success.main">
                            {adminData?.active_users_today}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                            Active Users Today
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack alignItems="center" spacing={1}>
                          <Typography variant="h4" fontWeight={700} color="error.main">
                            {adminData?.failed_logins_today}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                            Failed Logins
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Divider />

                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={500}>
                        Last Backup
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          {adminData?.backup_status.last_backup}
                        </Typography>
                        <Chip
                          label={adminData?.backup_status.status}
                          color={getStatusColor(adminData?.backup_status.status)}
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Recent Activity */}
        {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 && (
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Stack divider={<Divider />}>
                {dashboardData.recent_activity.slice(0, 5).map((activity, index) => (
                  <Box key={activity.id} sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Assignment fontSize="small" color="primary" />
                      </Box>
                      <Stack spacing={1} flex={1}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </Stack>
                      {activity.project_name && (
                        <Chip
                          label={activity.project_name}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/activity")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  View All Activity
                </Button>
              </CardActions>
            </Card>
          </Box>
        )}
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DashboardPage;
