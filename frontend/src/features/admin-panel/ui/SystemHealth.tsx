import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Stack,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  NetworkCheck,
  Download,
  Upload,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { adminApi } from "../api/admin.api";
import { SystemInfo, SystemMetrics } from "../types/admin.types";
import { PermissionGuard } from "@/shared/ui/PermissionGuard/PermissionGuard";

const SystemHealthComponent: React.FC = () => {
  const theme = useTheme();

  // State
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load system data
  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [infoResponse, metricsResponse] = await Promise.all([
        adminApi.getSystemInfo(),
        adminApi.getMetrics().catch(() => null), // Metrics might not be available
      ]);

      setSystemInfo(infoResponse.data);
      if (metricsResponse) {
        setSystemMetrics(metricsResponse.data);
      }
    } catch (err: any) {
      console.error("Failed to load system data:", err);
      setError(err.message || "Failed to load system data");
      toast.error("Failed to load system data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemData();
    setRefreshing(false);
  };

  // Get status color and icon
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "ok":
        return "success";
      case "warning":
        return "warning";
      case "error":
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "ok":
        return <CheckCircle />;
      case "warning":
        return <Warning />;
      case "error":
      case "critical":
        return <Error />;
      default:
        return <Warning />;
    }
  };

  // Format bytes to human readable
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading system health...
        </Typography>
      </Box>
    );
  }

  return (
    <PermissionGuard>
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            System Health
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overall System Status */}
      {systemInfo && (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(
                        systemInfo.error ? theme.palette.error.main : theme.palette.success.main,
                        0.1
                      ),
                    }}
                  >
                    {systemInfo.error ? (
                      <Error sx={{ fontSize: 30, color: theme.palette.error.main }} />
                    ) : (
                      <CheckCircle sx={{ fontSize: 30, color: theme.palette.success.main }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      System Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {systemInfo.error ? "System Error" : "All Systems Operational"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {systemInfo.app_version || "Unknown"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      App Version
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={600} color="secondary">
                      {systemInfo.environment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Environment
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={600} color="info.main">
                      {systemInfo.uptime ? formatUptime(systemInfo.uptime) : "Unknown"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      <Grid container spacing={3}>
        {/* CPU Usage */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <SpeedIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              />
              <Typography variant="h4" fontWeight={700} color="primary">
                {systemInfo?.cpu_count || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                CPU Cores
              </Typography>
              {systemMetrics && (
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemMetrics.cpu_usage}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {systemMetrics.cpu_usage.toFixed(1)}% Usage
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Usage */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <MemoryIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.secondary.main,
                  mb: 2,
                }}
              />
              <Typography variant="h4" fontWeight={700} color="secondary">
                {systemInfo?.memory?.total ? `${systemInfo.memory.total}GB` : "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total Memory
              </Typography>
              {systemInfo?.memory && (
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemInfo.memory.percent}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {systemInfo.memory.percent.toFixed(1)}% Used
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Disk Usage */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <StorageIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.warning.main,
                  mb: 2,
                }}
              />
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {systemInfo?.disk?.total ? `${systemInfo.disk.total}GB` : "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total Storage
              </Typography>
              {systemInfo?.disk && (
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemInfo.disk.percent}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {systemInfo.disk.percent.toFixed(1)}% Used
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Network I/O */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <NetworkCheck
                sx={{
                  fontSize: 48,
                  color: theme.palette.info.main,
                  mb: 2,
                }}
              />
              <Typography variant="h4" fontWeight={700} color="info.main">
                {systemMetrics?.network_io ? formatBytes(systemMetrics.network_io.bytes_in) : "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Network I/O
              </Typography>
              {systemMetrics?.network_io && (
                <Stack spacing={1}>
                  <Box>
                    <Download sx={{ fontSize: 16, color: "success.main", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatBytes(systemMetrics.network_io.bytes_in)} In
                    </Typography>
                  </Box>
                  <Box>
                    <Upload sx={{ fontSize: 16, color: "warning.main", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatBytes(systemMetrics.network_io.bytes_out)} Out
                    </Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* API Metrics */}
      {systemMetrics && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              API Performance
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {systemMetrics.api_metrics.total_requests.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {systemMetrics.api_metrics.successful_requests.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successful Requests
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {(systemMetrics.api_metrics.error_rate * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Error Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {systemMetrics.api_metrics.avg_response_time.toFixed(2)}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* User Metrics */}
      {systemMetrics && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              User Activity
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {systemMetrics.user_metrics.active_users}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {systemMetrics.user_metrics.new_registrations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Registrations
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {systemMetrics.user_metrics.login_attempts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Login Attempts
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {systemMetrics.user_metrics.failed_logins}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed Logins
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* System Information Table */}
      {systemInfo && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              System Information
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Platform</TableCell>
                    <TableCell>{systemInfo.platform}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon("healthy")}
                        label="Healthy"
                        color="success"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Python Version</TableCell>
                    <TableCell>{systemInfo.python_version}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon("healthy")}
                        label="Healthy"
                        color="success"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Environment</TableCell>
                    <TableCell>{systemInfo.environment}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon("healthy")}
                        label="Healthy"
                        color="success"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Debug Mode</TableCell>
                    <TableCell>{systemInfo.debug_mode ? "Enabled" : "Disabled"}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(systemInfo.debug_mode ? "warning" : "healthy")}
                        label={systemInfo.debug_mode ? "Warning" : "Healthy"}
                        color={systemInfo.debug_mode ? "warning" : "success"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  {systemInfo.uptime && (
                    <TableRow>
                      <TableCell>Uptime</TableCell>
                      <TableCell>{formatUptime(systemInfo.uptime)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon("healthy")}
                          label="Healthy"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
    </PermissionGuard>
  );
};

export default SystemHealthComponent; 