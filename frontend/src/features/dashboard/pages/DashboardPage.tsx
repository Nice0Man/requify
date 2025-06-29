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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/auth.context";
import { dashboardApi, DashboardStats } from "../api/dashboard.api";
import { usersApi } from "@/features/auth/api/users.api";
import { adminApi } from "@/features/admin/api/admin.api";
import { StatCard } from "@/shared/components/StatCard/StatCard";
import { ActivityFeed } from "@/shared/components/ActivityFeed/ActivityFeed";
import { QuickAccess } from "@/shared/components/QuickAccess/QuickAccessCard";

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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

      // Fetch dashboard data
      const [dashboardResponse, myDashboardResponse] = await Promise.all([
        dashboardApi.getDashboardData(),
        dashboardApi.getMyDashboard(),
      ]);

      // Combine data
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
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
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

  // Loading state
  if (loading && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>

        {/* Stats skeleton */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Skeleton variant="rectangular" height={120} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Content skeleton */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Skeleton variant="rectangular" height={400} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Skeleton variant="rectangular" height={400} />
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
              {getGreeting()}, {user?.first_name || user?.username}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: "1.1rem" }}
            >
              Here's what's happening with your projects today
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
            <IconButton
              onClick={() => navigate("/settings")}
              sx={{
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.grey[500], 0.2),
                },
              }}
            >
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* Last refresh indicator */}
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastRefresh.toLocaleTimeString()}
          {refreshing && " • Refreshing..."}
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={dashboardData?.overview.active_projects || 0}
            subtitle={`${dashboardData?.overview.total_projects || 0} total`}
            trend={{
              value: 12,
              direction: "up",
              label: "this month",
            }}
            icon={<FolderOpen />}
            color="primary"
            onClick={() => navigate("/projects")}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Requirements"
            value={dashboardData?.overview.total_requirements || 0}
            subtitle={`${
              dashboardData?.overview.pending_requirements || 0
            } pending`}
            trend={{
              value: 8,
              direction: "up",
              label: "this week",
            }}
            icon={<Assignment />}
            color="secondary"
            onClick={() => navigate("/requirements")}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={dashboardData?.overview.active_users || 0}
            subtitle={`${dashboardData?.overview.total_users || 0} total`}
            trend={{
              value: 5,
              direction: "up",
              label: "this month",
            }}
            icon={<Group />}
            color="success"
            onClick={() => navigate("/admin/users")}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={`${
              dashboardData?.project_performance.completion_rate.toFixed(2) || 0
            }%`}
            subtitle="Project success"
            trend={{
              value:
                dashboardData?.project_performance.completion_rate.toFixed(2) || 0 > 85
                  ? 3
                  : -2,
              direction:
                dashboardData?.project_performance.completion_rate.toFixed(2) || 0 > 85
                  ? "up"
                  : "down",
              label: "vs last period",
            }}
            icon={<CheckCircle />}
            color="info"
            variant="highlighted"
          />
        </Grid>
      </Grid>

      {/* Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.success.main,
                0.1
              )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TrendingUp color="success" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Performance Metrics
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.success.main,
                      }}
                    >
                      {dashboardData?.project_performance.on_time_delivery || 0}
                      %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      On-time Delivery
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: theme.palette.info.main }}
                    >
                      {dashboardData?.project_performance.quality_score || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quality Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.warning.main,
                      }}
                    >
                      {dashboardData?.project_performance.team_productivity ||
                        0}
                      %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Team Productivity
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {dashboardData?.trending_metrics.active_teams || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Teams
                    </Typography>
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
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <RocketLaunch color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Trending This Period
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Requirements This Week
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {dashboardData?.trending_metrics.requirements_this_week ||
                        0}
                    </Typography>
                    <Chip
                      label={`+${
                        (dashboardData?.trending_metrics
                          .requirements_this_week || 0) -
                        (dashboardData?.trending_metrics
                          .requirements_last_week || 0)
                      }`}
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  </Box>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Releases This Month
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {dashboardData?.trending_metrics.releases_this_month || 0}
                    </Typography>
                    <Chip
                      label={`+${
                        (dashboardData?.trending_metrics.releases_this_month ||
                          0) -
                        (dashboardData?.trending_metrics.releases_last_month ||
                          0)
                      }`}
                      size="small"
                      color="info"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  </Box>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Avg. Project Duration
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {dashboardData?.trending_metrics.avg_project_duration || 0}{" "}
                    days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Access */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Access
        </Typography>
        <QuickAccess
          projects={dashboardData?.quick_access.my_projects || []}
          requirements={dashboardData?.quick_access.my_requirements || []}
          approvals={dashboardData?.quick_access.pending_approvals || []}
        />
      </Box>

      {/* Activity Feed */}
      <Box sx={{ mb: 4 }}>
        <ActivityFeed
          activities={dashboardData?.recent_activity || []}
          title="Recent Activity"
          maxItems={8}
          showMoreButton={true}
          onShowMore={() => navigate("/activity")}
          onActivityClick={(activity) => {
            // Navigate based on activity type
            switch (activity.type) {
              case "project":
                navigate("/projects");
                break;
              case "requirement":
                navigate("/requirements");
                break;
              case "release":
                navigate("/releases");
                break;
              default:
                break;
            }
          }}
        />
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
