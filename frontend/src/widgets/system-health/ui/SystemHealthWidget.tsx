import React, { memo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grow,
} from "@mui/material";
import { useTheme as useThemeMode } from "@/shared/contexts/PerformanceContext";
import {
  useRenderTracker,
  usePerformanceMeasure,
} from "@/shared/hooks/usePerformanceOptimizations";

import {
  Refresh,
  Memory,
  Storage,
  Speed,
  CheckCircle,
  Warning,
  Error,
  Circle,
  HealthAndSafety,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useSystemHealth } from "@/features/dashboard";
import type { SystemHealth, ServiceHealth } from "@/entities/dashboard";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface SystemHealthWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  showRefresh?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  onHealthClick?: (serviceName: string) => void;
}

// Компонент для отображения статуса сервиса
const ServiceStatusChip = memo<{ service: ServiceHealth }>(({ service }) => {
  const serviceTheme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return serviceTheme.palette.success.main;
      case "warning":
        return serviceTheme.palette.warning.main;
      case "critical":
        return serviceTheme.palette.error.main;
      default:
        return serviceTheme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle fontSize="small" />;
      case "warning":
        return <Warning fontSize="small" />;
      case "critical":
        return <Error fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  return (
    <Chip
      icon={getStatusIcon(service.status)}
      label={service.name}
      size="small"
      variant="outlined"
      sx={{
        borderColor: getStatusColor(service.status),
        color: getStatusColor(service.status),
        backgroundColor: alpha(getStatusColor(service.status), 0.08),
        fontWeight: 500,
      }}
    />
  );
});

ServiceStatusChip.displayName = "ServiceStatusChip";

// Компонент для отображения метрики системы
const SystemMetric = memo<{
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
}>(({ icon, label, value, unit, color }) => {
  const metricTheme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(metricTheme.palette.divider, 0.1)}`,
        backgroundColor: alpha(color, 0.04),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Box sx={{ color, fontSize: 20 }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h6" fontWeight={600} color={color}>
        {value}
        {unit}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          mt: 1,
          height: 4,
          borderRadius: 2,
          backgroundColor: alpha(color, 0.1),
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            borderRadius: 2,
          },
        }}
      />
    </Box>
  );
});

SystemMetric.displayName = "SystemMetric";

export const SystemHealthWidget = memo<SystemHealthWidgetProps>(
  ({ variant = "detailed", showRefresh = true, className, onHealthClick }) => {
    const muiTheme = useTheme();
    const t = i18n.t;

    // Query
    const {
      data: health,
      isLoading,
      error,
      isError,
      refetch,
      isFetching,
    } = useSystemHealth();

    const isCompact = variant === "compact";

    // Service status color mapping
    const getServiceColor = useCallback(
      (status: ServiceHealth["status"]) => {
        switch (status) {
          case "online":
            return muiTheme.palette.success.main;
          case "degraded":
            return muiTheme.palette.warning.main;
          case "offline":
            return muiTheme.palette.error.main;
          default:
            return muiTheme.palette.grey[500];
        }
      },
      [muiTheme.palette]
    );

    const getStatusIcon = useCallback((status: ServiceHealth["status"]) => {
      switch (status) {
        case "online":
          return <CheckCircle fontSize="small" />;
        case "degraded":
          return <Warning fontSize="small" />;
        case "offline":
          return <Error fontSize="small" />;
        default:
          return <Error fontSize="small" />;
      }
    }, []);

    // Get system status icon
    const getSystemStatusIcon = useCallback(
      (status: SystemHealth["status"]) => {
        switch (status) {
          case "healthy":
            return <CheckCircle fontSize="small" />;
          case "warning":
            return <Warning fontSize="small" />;
          case "critical":
            return <Error fontSize="small" />;
          default:
            return <Error fontSize="small" />;
        }
      },
      []
    );

    // Get system status color
    const getSystemStatusColor = useCallback(
      (status: SystemHealth["status"]) => {
        switch (status) {
          case "healthy":
            return muiTheme.palette.success.main;
          case "warning":
            return muiTheme.palette.warning.main;
          case "critical":
            return muiTheme.palette.error.main;
          default:
            return muiTheme.palette.grey[500];
        }
      },
      [muiTheme.palette]
    );

    // Backup-style loading state
    if (isLoading) {
      return (
        <Card
          className={className}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
            boxShadow: `0 2px 20px ${alpha(
              muiTheme.palette.common.black,
              0.04
            )}`,
            background: muiTheme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${muiTheme.palette.success.main}, ${muiTheme.palette.primary.main})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HealthAndSafety sx={{ color: "white", fontSize: 20 }} />
              </Box>
            }
            title={
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: "1.1rem" }}
              >
                {t("dashboard.systemHealth.title")}
              </Typography>
            }
            action={
              showRefresh && (
                <IconButton
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
                    "&:hover": {
                      backgroundColor: alpha(
                        muiTheme.palette.primary.main,
                        0.04
                      ),
                      borderColor: alpha(muiTheme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              )
            }
            sx={{ pb: 1 }}
          />

          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(
                      muiTheme.palette.divider,
                      0.08
                    )}`,
                    background: muiTheme.palette.background.paper,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={16}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Skeleton variant="rounded" width={60} height={24} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      );
    }

    // Backup-style error state
    if (isError) {
      return (
        <Card className={className}>
          <CardContent>
            <Alert
              severity="error"
              action={
                showRefresh && (
                  <Tooltip title={t("common.refresh", "Обновить")}>
                    <span>
                      <IconButton
                        color="inherit"
                        size="small"
                        onClick={() => refetch()}
                        disabled={isFetching}
                      >
                        <Refresh />
                      </IconButton>
                    </span>
                  </Tooltip>
                )
              }
            >
              <Typography variant="body2">
                {t("system.error", "System health check failed")}:{" "}
                {error?.message || "Unknown error"}
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    if (!health) {
      return null;
    }

    const isHealthy = health.status === "healthy";
    const statusColor = isHealthy
      ? muiTheme.palette.success.main
      : muiTheme.palette.error.main;

    return (
      <Grow in timeout={600}>
        <Card
          className={className}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
            boxShadow: `0 4px 24px ${alpha(
              muiTheme.palette.common.black,
              0.06
            )}`,
            background: muiTheme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          <CardHeader
            avatar={
              <Box position="relative">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: `linear-gradient(135deg, ${muiTheme.palette.success.main}, ${muiTheme.palette.primary.main})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: `0 4px 12px ${alpha(
                      muiTheme.palette.success.main,
                      0.3
                    )}`,
                  }}
                >
                  <HealthAndSafety sx={{ fontSize: 24 }} />
                </Box>

                {/* Context7 Status Pulse */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: statusColor,
                    border: `2px solid ${muiTheme.palette.background.paper}`,
                    animation: isHealthy
                      ? "contextPulse 2s ease-in-out infinite"
                      : "none",
                    "@keyframes contextPulse": {
                      "0%, 100%": { transform: "scale(1)", opacity: 1 },
                      "50%": { transform: "scale(1.2)", opacity: 0.8 },
                    },
                  }}
                />
              </Box>
            }
            title={
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: isCompact ? "1rem" : "1.25rem",
                  }}
                >
                  {t("dashboard.systemHealth.title")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  System Status: {health.status}
                </Typography>
              </Box>
            }
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={health.status}
                  size="small"
                  icon={getSystemStatusIcon(
                    health.status as SystemHealth["status"]
                  )}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(
                      getSystemStatusColor(health.status),
                      0.1
                    )}, ${alpha(getSystemStatusColor(health.status), 0.05)})`,
                    border: `1px solid ${alpha(
                      getSystemStatusColor(health.status),
                      0.2
                    )}`,
                    color: getSystemStatusColor(health.status),
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    height: 28,
                    "& .MuiChip-icon": {
                      color: getSystemStatusColor(health.status),
                      fontSize: 16,
                    },
                  }}
                />

                {showRefresh && (
                  <Tooltip title={t("common.refresh", "Обновить")}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${alpha(
                            muiTheme.palette.divider,
                            0.1
                          )}`,
                          "&:hover": {
                            backgroundColor: alpha(
                              muiTheme.palette.primary.main,
                              0.04
                            ),
                            borderColor: alpha(
                              muiTheme.palette.primary.main,
                              0.2
                            ),
                          },
                        }}
                      >
                        <Refresh
                          fontSize="small"
                          sx={{
                            ...(isFetching && {
                              animation: "spin 1s linear infinite",
                              "@keyframes spin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" },
                              },
                            }),
                          }}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            }
            sx={{ pb: 1 }}
          />

          <CardContent sx={{ pt: 0 }}>
            {isCompact ? (
              // Compact layout
              <Grid container spacing={2}>
                {health.services?.map((service, index) => (
                  <Grid item xs={6} key={service.name}>
                    <Box
                      onClick={() => onHealthClick?.(service.name)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          getServiceColor(service.status),
                          0.2
                        )}`,
                        background: `linear-gradient(135deg, ${alpha(
                          getServiceColor(service.status),
                          0.05
                        )}, transparent)`,
                        cursor: onHealthClick ? "pointer" : "default",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": onHealthClick
                          ? {
                              transform: "translateY(-2px)",
                              boxShadow: muiTheme.shadows[4],
                            }
                          : {},
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getStatusIcon(service.status)}
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ flex: 1 }}
                        >
                          {service.name}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // Detailed layout
              <List disablePadding>
                {health.services?.map((service, index) => (
                  <React.Fragment key={service.name}>
                    <ListItem
                      onClick={() => onHealthClick?.(service.name)}
                      sx={{
                        borderRadius: 2,
                        cursor: onHealthClick ? "pointer" : "default",
                        "&:hover": onHealthClick
                          ? {
                              backgroundColor: alpha(
                                muiTheme.palette.primary.main,
                                0.04
                              ),
                            }
                          : {},
                      }}
                    >
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(
                              getServiceColor(service.status),
                              0.1
                            )}, ${alpha(
                              getServiceColor(service.status),
                              0.05
                            )})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `1px solid ${alpha(
                              getServiceColor(service.status),
                              0.2
                            )}`,
                          }}
                        >
                          {getStatusIcon(service.status)}
                        </Box>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            {service.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Last check:{" "}
                            {new Date(service.lastCheck).toLocaleTimeString()}
                          </Typography>
                        }
                      />

                      <Box textAlign="right">
                        <Chip
                          label={service.status}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.7rem",
                            height: 24,
                            borderColor: alpha(
                              getServiceColor(service.status),
                              0.3
                            ),
                            color: getServiceColor(service.status),
                            fontWeight: 600,
                          }}
                        />
                        {service.responseTime && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Response: {service.responseTime}ms
                          </Typography>
                        )}
                      </Box>
                    </ListItem>

                    {index < (health.services?.length || 0) - 1 && (
                      <Divider sx={{ mx: 2 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* System summary metrics */}
            <Box mt={3}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                System Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.08
                      )}`,
                      background: muiTheme.palette.background.paper,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {health.memoryUsage}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("system.memory", "Memory")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.08
                      )}`,
                      background: muiTheme.palette.background.paper,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {health.cpuUsage}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("system.cpu", "CPU")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.08
                      )}`,
                      background: muiTheme.palette.background.paper,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {health.diskUsage}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("system.disk", "Disk")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        muiTheme.palette.divider,
                        0.08
                      )}`,
                      background: muiTheme.palette.background.paper,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {health.activeUsers}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("system.activeUsers", "Active Users")}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    );
  }
);

SystemHealthWidget.displayName = "SystemHealthWidget";
