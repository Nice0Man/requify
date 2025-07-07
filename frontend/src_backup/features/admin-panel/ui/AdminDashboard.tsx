import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useAdminDashboard } from "../model/admin.hooks";
import { SystemInfo } from "@/entities/admin/ui/SystemInfo";
import { SystemMetrics } from "@/entities/admin/ui/SystemMetrics";

export interface AdminDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const {
    isLoading,
    error,
    stats,
    healthSummary,
    securitySummary,
    systemInfo,
    metrics,
    recentLogs,
    securityEvents,
    refresh,
    canManageSystem,
    canViewLogs,
  } = useAdminDashboard(autoRefresh, refreshInterval);

  if (isLoading && !stats) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const getHealthColor = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const getHealthIcon = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return <CheckCircleIcon />;
      case "warning":
        return <WarningIcon />;
      case "critical":
        return <ErrorIcon />;
      default:
        return <ComputerIcon />;
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        {isLoading && <CircularProgress size={24} />}
      </Box>

      <Grid container spacing={3}>
        {/* System Health */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader
              title="System Health"
              avatar={<ComputerIcon color="primary" />}
            />
            <CardContent>
              {healthSummary ? (
                <Box>
                  <Chip
                    label={healthSummary.overall.toUpperCase()}
                    color={getHealthColor(healthSummary.overall) as any}
                    icon={getHealthIcon(healthSummary.overall)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {Math.floor((healthSummary.uptime || 0) / 3600)}h
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* User Statistics */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader title="Users" avatar={<PeopleIcon color="primary" />} />
            <CardContent>
              {stats ? (
                <Box>
                  <Typography variant="h6">{stats.users.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.users.active} active
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +{stats.users.new_this_month} this month
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Events */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader
              title="Security"
              avatar={<SecurityIcon color="primary" />}
            />
            <CardContent>
              {securitySummary ? (
                <Box>
                  <Typography variant="h6" color="error">
                    {securitySummary.criticalEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical events
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {securitySummary.failedLoginsToday} failed logins today
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Performance */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader
              title="Performance"
              avatar={<SpeedIcon color="primary" />}
            />
            <CardContent>
              {stats ? (
                <Box>
                  <Typography variant="h6">
                    {stats.system.avg_response_time}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg response time
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(stats.system.error_rate * 100).toFixed(1)}% error rate
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">No data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="System Information" />
            <CardContent>
              {systemInfo ? (
                <SystemInfo systemInfo={systemInfo} />
              ) : (
                <Typography color="text.secondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="System Metrics" />
            <CardContent>
              {metrics ? (
                <SystemMetrics metrics={metrics as any} />
              ) : (
                <Typography color="text.secondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Security Events */}
        {canViewLogs && securityEvents.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Security Events" />
              <CardContent>
                <List dense>
                  {securityEvents.slice(0, 5).map((event, index) => (
                    <React.Fragment key={event.id}>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon
                            color={
                              event.severity === "critical"
                                ? "error"
                                : "warning"
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={event.event_type
                            .replace("_", " ")
                            .toUpperCase()}
                          secondary={`${event.description} - ${new Date(
                            event.timestamp
                          ).toLocaleString()}`}
                        />
                      </ListItem>
                      {index < Math.min(securityEvents.length - 1, 4) && (
                        <Divider />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent System Logs */}
        {canViewLogs && recentLogs.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent System Logs" />
              <CardContent>
                <List dense>
                  {recentLogs.slice(0, 5).map((log, index) => (
                    <React.Fragment key={log.id}>
                      <ListItem>
                        <ListItemIcon>
                          <StorageIcon
                            color={log.level === "error" ? "error" : "action"}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={log.message}
                          secondary={`${log.level.toUpperCase()} - ${
                            log.module
                          } - ${new Date(log.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                      {index < Math.min(recentLogs.length - 1, 4) && (
                        <Divider />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
