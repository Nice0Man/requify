import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  Stack,
  useTheme,
  alpha,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  Assignment,
  RocketLaunch,
  BugReport,
  People,
  Speed,
  Refresh,
  ArrowForward,
  Insights,
  Add,
  ViewColumn,
  Analytics,
  FolderOpen,
  CheckCircle,
  TrendingDown,
} from "@mui/icons-material";
import { DashboardLayout } from "@/widgets/layout";
import { DashboardStatsWidget } from "@/widgets/dashboard-stats";
import { ProjectOverviewWidget } from "@/widgets/project-overview";
import { ActivityFeedWidget } from "@/widgets/activity-feed";
import { QuickActions } from "@/features/dashboard/ui/QuickActions";
import { useDashboardStats } from "@/features/dashboard/model/useDashboardQuery";
import { LoadingSpinner } from "@/shared/ui";

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: string;
  description: string;
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { data: stats, isPending, error } = useDashboardStats();

  if (isPending) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box p={3} textAlign="center">
          <Typography color="error">{t("errors.loadingError")}</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  // Minimalist metrics with key focus
  const metrics: DashboardMetric[] = [
    {
      id: "active-projects",
      title: t("dashboard.activeProjects"),
      value: stats?.activeProjects || 12,
      change: 8.5,
      trend: "up",
      icon: <FolderOpen />,
      color: theme.palette.primary.main,
      description: t("dashboard.projectsInDevelopment"),
    },
    {
      id: "total-requirements",
      title: t("dashboard.requirements"),
      value: stats?.activeRequirements || 247,
      change: 12.3,
      trend: "up",
      icon: <Assignment />,
      color: theme.palette.info.main,
      description: t("dashboard.activeRequirements"),
    },
    {
      id: "completion-rate",
      title: t("dashboard.completionRate"),
      value: `${stats?.completionRate || 89}%`,
      change: 4.2,
      trend: "up",
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      description: t("dashboard.totalReadiness"),
    },
    {
      id: "team-velocity",
      title: t("dashboard.team"),
      value: stats?.teamVelocity || 42,
      change: -2.1,
      trend: "down",
      icon: <Speed />,
      color: theme.palette.warning.main,
      description: t("dashboard.activeParticipants"),
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section - Minimalist */}
        <Box
          mb={4}
          sx={{
            opacity: 0,
            transform: "translateY(20px)",
            animation: "fadeInUp 0.6s ease-out 0.1s forwards",
            "@keyframes fadeInUp": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                {t("dashboard.title")}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's what's happening with your projects.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <span>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={isLoading}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* Key Metrics - Minimalist Cards */}
        <Grid
          container
          spacing={3}
          mb={4}
          sx={{
            opacity: 0,
            transform: "translateY(20px)",
            animation: "fadeInUp 0.6s ease-out 0.3s forwards",
            "@keyframes fadeInUp": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={metric.id}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  background: theme.palette.background.paper,
                  transition: "all 0.3s ease",
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: `fadeInUp 0.6s ease-out ${
                    0.5 + index * 0.1
                  }s forwards`,
                  "@keyframes fadeInUp": {
                    "0%": { opacity: 0, transform: "translateY(20px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 24px ${alpha(metric.color, 0.12)}`,
                    borderColor: alpha(metric.color, 0.2),
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: alpha(metric.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: metric.color,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box flex={1}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                      }}
                    >
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      mt={0.5}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp
                          sx={{
                            fontSize: 16,
                            color: theme.palette.success.main,
                          }}
                        />
                      ) : (
                        <TrendingDown
                          sx={{
                            fontSize: 16,
                            color: theme.palette.error.main,
                          }}
                        />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            metric.trend === "up"
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                          fontWeight: 600,
                        }}
                      >
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}%
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions - with Drag & Drop Support */}
        <Box
          sx={{
            mb: 4,
            opacity: 0,
            transform: "translateY(20px)",
            animation: "fadeInUp 0.6s ease-out 0.9s forwards",
            "@keyframes fadeInUp": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <QuickActions />
        </Box>

        {/* Main Content Grid - Minimalist Layout */}
        <Grid container spacing={3}>
          {/* Left Column - Primary Content */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Project Overview */}
              <Box
                sx={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: "fadeInUp 0.6s ease-out 1.5s forwards",
                  "@keyframes fadeInUp": {
                    "0%": { opacity: 0, transform: "translateY(20px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Recent Projects
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { name: "CRM System", progress: 78, status: "active" },
                      {
                        name: "Mobile App",
                        progress: 45,
                        status: "development",
                      },
                      { name: "API Gateway", progress: 92, status: "testing" },
                    ].map((project, index) => (
                      <Box key={index}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {project.name}
                          </Typography>
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                              color: theme.palette.primary.main,
                            }}
                          />
                        </Stack>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <Box
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${project.progress}%`,
                                  height: "100%",
                                  bgcolor: theme.palette.primary.main,
                                  borderRadius: 3,
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ minWidth: 35 }}
                          >
                            {project.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>

              {/* Recent Requirements */}
              <Box
                sx={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: "fadeInUp 0.6s ease-out 1.7s forwards",
                  "@keyframes fadeInUp": {
                    "0%": { opacity: 0, transform: "translateY(20px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Recent Requirements
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      {
                        id: "REQ-145",
                        title: "User Authentication System",
                        priority: "high",
                      },
                      {
                        id: "REQ-146",
                        title: "Payment Integration",
                        priority: "medium",
                      },
                      {
                        id: "REQ-147",
                        title: "Email Notifications",
                        priority: "low",
                      },
                      {
                        id: "REQ-148",
                        title: "Data Export Feature",
                        priority: "medium",
                      },
                    ].map((req, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {req.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {req.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={req.priority}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            backgroundColor: alpha(
                              req.priority === "high"
                                ? theme.palette.error.main
                                : req.priority === "medium"
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                              0.1
                            ),
                            color:
                              req.priority === "high"
                                ? theme.palette.error.main
                                : req.priority === "medium"
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Grid>

          {/* Right Column - Secondary Content */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* System Health */}
              <Box
                sx={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: "fadeInUp 0.6s ease-out 1.9s forwards",
                  "@keyframes fadeInUp": {
                    "0%": { opacity: 0, transform: "translateY(20px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    System Health
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      {
                        name: "API Status",
                        status: "operational",
                        color: theme.palette.success.main,
                      },
                      {
                        name: "Database",
                        status: "operational",
                        color: theme.palette.success.main,
                      },
                      {
                        name: "Cache",
                        status: "degraded",
                        color: theme.palette.warning.main,
                      },
                      {
                        name: "CDN",
                        status: "operational",
                        color: theme.palette.success.main,
                      },
                    ].map((service, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">{service.name}</Typography>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: service.color,
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>

              {/* Activity Feed */}
              <Box
                sx={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: "fadeInUp 0.6s ease-out 2.1s forwards",
                  "@keyframes fadeInUp": {
                    "0%": { opacity: 0, transform: "translateY(20px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Recent Activity
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      {
                        title: "New project created",
                        time: "2 hours ago",
                        icon: FolderOpen,
                        color: theme.palette.primary.main,
                      },
                      {
                        title: "Requirement updated",
                        time: "4 hours ago",
                        icon: Assignment,
                        color: theme.palette.secondary.main,
                      },
                      {
                        title: "Release deployed",
                        time: "6 hours ago",
                        icon: RocketLaunch,
                        color: theme.palette.success.main,
                      },
                      {
                        title: "Bug fixed",
                        time: "1 day ago",
                        icon: BugReport,
                        color: theme.palette.warning.main,
                      },
                    ].map((activity, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            background: alpha(activity.color, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: activity.color,
                          }}
                        >
                          <activity.icon sx={{ fontSize: 16 }} />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default DashboardPage;
