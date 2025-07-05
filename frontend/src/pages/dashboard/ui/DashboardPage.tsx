import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Grow,
  Card,
  Button,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  CheckCircle,
  Add,
  ArrowForward,
  Refresh,
  Analytics,
  Notifications,
  Settings,
  FolderOpen,
  Speed,
  Timeline,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { ActivityFeed } from "@/widgets/activity-feed";
import { ProjectOverview } from "@/widgets/project-overview";
import { SystemHealth } from "@/widgets/system-health";
import { RequirementList } from "@/widgets/requirement-list";

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

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  badge?: string;
}

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Minimalist metrics with key focus
  const metrics: DashboardMetric[] = [
    {
      id: "active-projects",
      title: "Active Projects",
      value: 12,
      change: 8.5,
      trend: "up",
      icon: <FolderOpen />,
      color: theme.palette.primary.main,
      description: "Projects in development",
    },
    {
      id: "total-requirements",
      title: "Requirements",
      value: 247,
      change: 12.3,
      trend: "up",
      icon: <Assignment />,
      color: theme.palette.info.main,
      description: "Total requirements tracked",
    },
    {
      id: "completion-rate",
      title: "Completion Rate",
      value: "89%",
      change: 4.2,
      trend: "up",
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      description: "Overall project completion",
    },
    {
      id: "team-velocity",
      title: "Team Velocity",
      value: 42,
      change: -2.1,
      trend: "down",
      icon: <Speed />,
      color: theme.palette.warning.main,
      description: "Story points per sprint",
    },
  ];

  // Minimalist quick actions
  const quickActions: QuickAction[] = [
    {
      id: "new-project",
      title: "New Project",
      description: "Create a new project",
      icon: <Add />,
      color: theme.palette.primary.main,
      path: "/projects/create",
    },
    {
      id: "new-requirement",
      title: "Add Requirement",
      description: "Create new requirement",
      icon: <Assignment />,
      color: theme.palette.info.main,
      path: "/requirements/create",
    },
    {
      id: "view-reports",
      title: "View Reports",
      description: "Analytics & insights",
      icon: <Analytics />,
      color: theme.palette.secondary.main,
      path: "/reports",
    },
    {
      id: "system-health",
      title: "System Status",
      description: "Monitor system health",
      icon: <Timeline />,
      color: theme.palette.success.main,
      path: "/admin",
      badge: "All systems operational",
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleQuickAction = (action: QuickAction) => {
    navigate(action.path);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section - Minimalist */}
      <Fade in timeout={300}>
        <Box mb={4}>
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
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's what's happening with your projects.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Notifications">
                <IconButton
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <Notifications />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
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
      </Fade>

      {/* Key Metrics - Minimalist Cards */}
      <Fade in timeout={600}>
        <Grid container spacing={3} mb={4}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={metric.id}>
              <Grow in timeout={400 + index * 100}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: theme.palette.background.paper,
                    transition: "all 0.3s ease",
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
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* Quick Actions - Minimalist */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            background: theme.palette.background.paper,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Button
              endIcon={<ArrowForward />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              View All
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={action.id}>
                <Grow in timeout={600 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                      background: alpha(theme.palette.background.paper, 0.8),
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        borderColor: alpha(action.color, 0.3),
                        background: alpha(action.color, 0.02),
                      },
                    }}
                    onClick={() => handleQuickAction(action)}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          background: alpha(action.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: action.color,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {action.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {action.description}
                        </Typography>
                        {action.badge && (
                          <Chip
                            label={action.badge}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: "0.6rem",
                              backgroundColor: alpha(action.color, 0.1),
                              color: action.color,
                            }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Fade>

      {/* Main Content Grid - Minimalist Layout */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Project Overview */}
            <Fade in timeout={1000}>
              <ProjectOverview variant="dashboard" />
            </Fade>

            {/* Recent Requirements */}
            <Fade in timeout={1200}>
              <RequirementList
                limit={5}
                showFilters={false}
                showPagination={false}
                variant="compact"
                showStats={false}
              />
            </Fade>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* System Health */}
            <Fade in timeout={1400}>
              <SystemHealth
                variant="compact"
                showDetails={false}
                autoRefresh={true}
              />
            </Fade>

            {/* Activity Feed */}
            <Fade in timeout={1600}>
              <ActivityFeed limit={5} showFilters={false} />
            </Fade>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
