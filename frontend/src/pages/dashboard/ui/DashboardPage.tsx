import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  alpha,
  useTheme,
  Chip,
  LinearProgress,
  IconButton,
  Fade,
  Button,
  Stack,
  Container,
} from "@mui/material";
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Speed,
  FolderOpen,
  BugReport,
  RocketLaunch,
  People,
  ArrowForward,
  Refresh,
  Timeline,
  Analytics,
  Add,
} from "@mui/icons-material";
import { DashboardLayout } from "@/widgets/layout";
import { useDashboardStats } from "../../../features/dashboard/model/useDashboardQuery";
import { LoadingSpinner } from "../../../shared/ui";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const metrics = [
    {
      title: t("dashboard.activeProjects"),
      value: stats?.activeProjects || 12,
      icon: FolderOpen,
      color: theme.palette.primary.main,
      trend: "+8%",
      subtitle: t("dashboard.projectsInDevelopment"),
      background: `linear-gradient(135deg, ${alpha(
        theme.palette.primary.main,
        0.1
      )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
      iconBg: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    {
      title: t("dashboard.requirements"),
      value: stats?.activeRequirements || 156,
      icon: Assignment,
      color: theme.palette.secondary.main,
      trend: "+12%",
      subtitle: t("dashboard.activeRequirements"),
      background: `linear-gradient(135deg, ${alpha(
        theme.palette.secondary.main,
        0.1
      )} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
      iconBg: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
    {
      title: t("dashboard.completionRate"),
      value: `${stats?.completionRate || 78}%`,
      icon: CheckCircle,
      color: theme.palette.success.main,
      trend: "+5%",
      subtitle: t("dashboard.totalReadiness"),
      background: `linear-gradient(135deg, ${alpha(
        theme.palette.success.main,
        0.1
      )} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
      iconBg: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
    },
    {
      title: t("dashboard.team"),
      value: stats?.teamVelocity || 24,
      icon: People,
      color: theme.palette.info.main,
      trend: "+3%",
      subtitle: t("dashboard.activeParticipants"),
      background: `linear-gradient(135deg, ${alpha(
        theme.palette.info.main,
        0.1
      )} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
      iconBg: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
    },
  ];

  const recentActivity = [
    {
      title: t("dashboard.newProject", { project: "Mobile App" }),
      time: t("dashboard.2HoursAgo"),
      type: t("dashboard.project"),
      color: theme.palette.primary.main,
      icon: FolderOpen,
    },
    {
      title: t("dashboard.requirementUpdated", { requirement: "REQ-145" }),
      time: t("dashboard.4HoursAgo"),
      type: t("dashboard.requirement"),
      color: theme.palette.secondary.main,
      icon: Assignment,
    },
    {
      title: t("dashboard.releaseDeployed", { release: "v2.1.0" }),
      time: t("dashboard.6HoursAgo"),
      type: t("dashboard.release"),
      color: theme.palette.success.main,
      icon: RocketLaunch,
    },
    {
      title: t("dashboard.bugFixed", { bug: "BUG-89" }),
      time: t("dashboard.1DayAgo"),
      type: t("dashboard.bug"),
      color: theme.palette.warning.main,
      icon: BugReport,
    },
  ];

  const projects = [
    t("dashboard.crmSystem"),
    t("dashboard.mobileApp"),
    t("dashboard.apiGateway"),
    t("dashboard.dashboardUi"),
  ];

  const quickActions = [
    {
      title: t("dashboard.createProject"),
      description: t("dashboard.startNewProject"),
      icon: Add,
      color: theme.palette.primary.main,
      action: "/projects/new",
    },
    {
      title: t("dashboard.addRequirement"),
      description: t("dashboard.createRequirement"),
      icon: Assignment,
      color: theme.palette.secondary.main,
      action: "/requirements/new",
    },
    {
      title: t("dashboard.scheduleRelease"),
      description: t("dashboard.newRelease"),
      icon: RocketLaunch,
      color: theme.palette.info.main,
      action: "/releases/new",
    },
  ];

  return (
    <DashboardLayout>
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, ${
            theme.palette.background.default
          } 0%, ${alpha(theme.palette.grey[50], 0.5)} 100%)`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.02,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main} 0%, transparent 50%), 
                             radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ py: 4 }}>
            {/* Заголовок с действиями */}
            <Fade in timeout={800}>
              <Box sx={{ mb: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h3"
                      component="h1"
                      gutterBottom
                      fontWeight={700}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {t("dashboard.dashboard")}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{
                        fontSize: "1.1rem",
                        fontWeight: 400,
                      }}
                    >
                      {t("dashboard.welcomeMessage")}
                    </Typography>
                  </Box>
                  <IconButton
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        transform: "rotate(180deg)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Box>

                {/* Быстрые действия */}
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  {quickActions.map((action, index) => (
                    <Fade in timeout={1000 + index * 200} key={action.title}>
                      <Button
                        variant="outlined"
                        startIcon={<action.icon />}
                        sx={{
                          borderRadius: 3,
                          py: 1.5,
                          px: 3,
                          borderColor: alpha(action.color, 0.3),
                          color: action.color,
                          backgroundColor: alpha(action.color, 0.05),
                          "&:hover": {
                            backgroundColor: alpha(action.color, 0.1),
                            borderColor: action.color,
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 25px ${alpha(
                              action.color,
                              0.15
                            )}`,
                          },
                          transition: "all 0.3s ease",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        {action.title}
                      </Button>
                    </Fade>
                  ))}
                </Stack>
              </Box>
            </Fade>

            {/* Метрики */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Grid item xs={12} sm={6} lg={3} key={index}>
                    <Fade in timeout={1200 + index * 200}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          background: metric.background,
                          border: `1px solid ${alpha(metric.color, 0.1)}`,
                          position: "relative",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: `0 20px 40px ${alpha(
                              metric.color,
                              0.15
                            )}`,
                            border: `1px solid ${alpha(metric.color, 0.2)}`,
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "40%",
                            height: "100%",
                            background: `radial-gradient(circle at top right, ${alpha(
                              metric.color,
                              0.1
                            )} 0%, transparent 60%)`,
                          },
                        }}
                      >
                        <CardContent
                          sx={{ p: 3, position: "relative", zIndex: 1 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                background: metric.iconBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 8px 24px ${alpha(
                                  metric.color,
                                  0.25
                                )}`,
                              }}
                            >
                              <Icon sx={{ color: "white", fontSize: 28 }} />
                            </Box>
                            <Chip
                              label={metric.trend}
                              size="small"
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.success.main,
                                  0.1
                                ),
                                color: theme.palette.success.main,
                                fontWeight: 600,
                                fontSize: "0.8rem",
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{
                              color: metric.color,
                              mb: 0.5,
                              fontSize: "2rem",
                            }}
                          >
                            {metric.value}
                          </Typography>

                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              color: theme.palette.text.primary,
                              mb: 0.5,
                              fontSize: "1rem",
                            }}
                          >
                            {metric.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            {metric.subtitle}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                );
              })}
            </Grid>

            {/* Основной контент */}
            <Grid container spacing={4}>
              {/* Прогресс проектов */}
              <Grid item xs={12} lg={8}>
                <Fade in timeout={1800}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                      backdropFilter: "blur(20px)",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -50,
                        right: -50,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${alpha(
                          theme.palette.primary.main,
                          0.05
                        )} 0%, transparent 70%)`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 4,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Timeline sx={{ color: "white", fontSize: 20 }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700}>
                          {t("dashboard.projectsProgress")}
                        </Typography>
                      </Box>
                      <Button
                        endIcon={<ArrowForward />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {t("dashboard.allProjects")}
                      </Button>
                    </Box>

                    <Box sx={{ space: "y", gap: 3 }}>
                      {projects.map((project, index) => (
                        <Box key={index} sx={{ mb: 4 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography variant="h6" fontWeight={600}>
                              {project}
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              {65 + index * 10}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={65 + index * 10}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: alpha(
                                theme.palette.divider,
                                0.08
                              ),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 6,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                boxShadow: `0 2px 8px ${alpha(
                                  theme.palette.primary.main,
                                  0.3
                                )}`,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              {/* Недавняя активность */}
              <Grid item xs={12} lg={4}>
                <Fade in timeout={2000}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                      backdropFilter: "blur(20px)",
                      height: "fit-content",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 4,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Analytics sx={{ color: "white", fontSize: 20 }} />
                      </Box>
                      <Typography variant="h5" fontWeight={700}>
                        {t("dashboard.activity")}
                      </Typography>
                    </Box>

                    <Box sx={{ space: "y", gap: 2 }}>
                      {recentActivity.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 2,
                              p: 2,
                              borderRadius: 2,
                              border: `1px solid ${alpha(activity.color, 0.1)}`,
                              backgroundColor: alpha(activity.color, 0.03),
                              mb: 2,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: alpha(activity.color, 0.06),
                                transform: "translateX(4px)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                backgroundColor: alpha(activity.color, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Icon
                                sx={{ fontSize: 16, color: activity.color }}
                              />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{
                                  mb: 0.5,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {activity.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                {activity.time}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>

                    <Button
                      fullWidth
                      endIcon={<ArrowForward />}
                      sx={{
                        mt: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.5,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                        color: theme.palette.primary.main,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      {t("dashboard.allActivity")}
                    </Button>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
