import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
  Grid,
  Tooltip,
  Fade,
  Grow,
  Divider,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  HealthAndSafety,
  CheckCircle,
  Warning,
  Error,
  Dataset as Database,
  Api,
  Storage,
  Refresh,
  Timeline,
  Memory,
  Speed,
  Timer,
  TrendingUp,
  TrendingDown,
  Remove,
  Cloud,
  Security,
  NetworkCheck,
} from '@mui/icons-material';

interface SystemHealthProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  onHealthClick?: (component: string) => void;
  variant?: 'compact' | 'detailed' | 'dashboard';
}

interface SystemInfo {
  overall_status: 'healthy' | 'warning' | 'critical';
  database_status: 'healthy' | 'warning' | 'critical';
  api_status: 'healthy' | 'warning' | 'critical';
  storage_status: 'healthy' | 'warning' | 'critical';
  network_status?: 'healthy' | 'warning' | 'critical';
  security_status?: 'healthy' | 'warning' | 'critical';
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  uptime: string;
  response_time?: number;
  active_connections?: number;
  error_rate?: number;
}

// Mock hook for system data
const useSystemHealthQuery = ({ refetchInterval }: { refetchInterval?: number | false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [systemInfo] = useState<SystemInfo>({
    overall_status: 'healthy',
    database_status: 'healthy',
    api_status: 'healthy',
    storage_status: 'healthy',
    network_status: 'healthy',
    security_status: 'healthy',
    cpu_usage: 42,
    memory_usage: 67,
    disk_usage: 23,
    uptime: '2 days 14 hours',
    response_time: 156,
    active_connections: 47,
    error_rate: 0.02,
  });

  const refetch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    if (refetchInterval && typeof refetchInterval === 'number') {
      const interval = setInterval(refetch, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval]);

  return { data: systemInfo, isLoading, refetch, lastUpdated };
};

// Helper functions
const getHealthColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'error';
    default:
      return 'default';
  }
};

const getHealthIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle sx={{ fontSize: 16 }} />;
    case 'warning':
      return <Warning sx={{ fontSize: 16 }} />;
    case 'critical':
      return <Error sx={{ fontSize: 16 }} />;
    default:
      return <HealthAndSafety sx={{ fontSize: 16 }} />;
  }
};

const getUsageColor = (usage: number, theme: any) => {
  if (usage >= 80) return theme.palette.error.main;
  if (usage >= 60) return theme.palette.warning.main;
  return theme.palette.success.main;
};

const getTrendIcon = (value: number, threshold: number) => {
  if (value > threshold) return <TrendingUp sx={{ fontSize: 16 }} />;
  if (value < threshold * 0.8) return <TrendingDown sx={{ fontSize: 16 }} />;
  return <Remove sx={{ fontSize: 16 }} />;
};

export const SystemHealth: React.FC<SystemHealthProps> = ({
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className,
  onHealthClick,
  variant = 'detailed',
}) => {
  const theme = useTheme();
  
  const {
    data: systemInfo,
    isLoading,
    refetch: refreshSystemInfo,
    lastUpdated,
  } = useSystemHealthQuery({
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const handleHealthClick = (component: string) => {
    if (onHealthClick) {
      onHealthClick(component);
    }
  };

  const handleRefresh = () => {
    refreshSystemInfo();
  };

  if (!systemInfo) {
    return (
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
        </CardContent>
      </Card>
    );
  }

  const overallHealth = systemInfo.overall_status || 'unknown';
  const components = [
    {
      name: 'Database',
      status: systemInfo.database_status || 'unknown',
      icon: <Database />,
      key: 'database',
      description: 'PostgreSQL cluster',
    },
    {
      name: 'API Server',
      status: systemInfo.api_status || 'unknown',
      icon: <Api />,
      key: 'api',
      description: 'FastAPI backend',
    },
    {
      name: 'Storage',
      status: systemInfo.storage_status || 'unknown',
      icon: <Storage />,
      key: 'storage',
      description: 'File storage system',
    },
    {
      name: 'Network',
      status: systemInfo.network_status || 'unknown',
      icon: <NetworkCheck />,
      key: 'network',
      description: 'Network connectivity',
    },
    {
      name: 'Security',
      status: systemInfo.security_status || 'unknown',
      icon: <Security />,
      key: 'security',
      description: 'Security monitoring',
    },
  ];

  const metrics = [
    {
      name: 'CPU Usage',
      value: systemInfo.cpu_usage,
      unit: '%',
      icon: <Speed />,
      color: getUsageColor(systemInfo.cpu_usage, theme),
      trend: getTrendIcon(systemInfo.cpu_usage, 50),
    },
    {
      name: 'Memory Usage',
      value: systemInfo.memory_usage,
      unit: '%',
      icon: <Memory />,
      color: getUsageColor(systemInfo.memory_usage, theme),
      trend: getTrendIcon(systemInfo.memory_usage, 60),
    },
    {
      name: 'Disk Usage',
      value: systemInfo.disk_usage,
      unit: '%',
      icon: <Cloud />,
      color: getUsageColor(systemInfo.disk_usage, theme),
      trend: getTrendIcon(systemInfo.disk_usage, 40),
    },
  ];

  return (
    <Grow in timeout={600}>
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}`,
          background: theme.palette.background.paper,
          overflow: 'hidden',
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
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                }}
              >
                <HealthAndSafety sx={{ fontSize: 24 }} />
              </Box>
              {overallHealth === 'healthy' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${theme.palette.background.paper}`,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  }}
                />
              )}
            </Box>
          }
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                System Health
              </Typography>
              <Tooltip title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}>
                <Typography variant="caption" color="text.secondary">
                  ({systemInfo.uptime})
                </Typography>
              </Tooltip>
            </Stack>
          }
          action={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                icon={getHealthIcon(overallHealth)}
                label={overallHealth.toUpperCase()}
                color={getHealthColor(overallHealth)}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    marginLeft: 1,
                  },
                }}
              />
              <Tooltip title={isLoading ? 'Refreshing...' : 'Refresh status'}>
                <IconButton 
                  size="small" 
                  onClick={handleRefresh} 
                  disabled={isLoading}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          }
          sx={{ pb: 1 }}
        />

        <CardContent sx={{ pt: 0 }}>
          {/* Performance Metrics */}
          <Fade in timeout={800}>
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                {metrics.map((metric, index) => (
                  <Grid item xs={12} sm={4} key={metric.name}>
                    <Grow in timeout={600 + index * 100}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: alpha(metric.color, 0.04),
                          border: `1px solid ${alpha(metric.color, 0.1)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${alpha(metric.color, 0.2)}`,
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              background: alpha(metric.color, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: metric.color,
                            }}
                          >
                            {metric.icon}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                            {metric.name}
                          </Typography>
                          <Box sx={{ color: metric.color }}>
                            {metric.trend}
                          </Box>
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: metric.color, mb: 1 }}>
                          {metric.value}{metric.unit}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={metric.value}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(metric.color, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: metric.color,
                              boxShadow: `0 2px 8px ${alpha(metric.color, 0.3)}`,
                            },
                          }}
                        />
                      </Box>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>

          {/* System Statistics */}
          {(systemInfo.response_time || systemInfo.active_connections || systemInfo.error_rate) && (
            <Fade in timeout={1000}>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  System Statistics
                </Typography>
                <Grid container spacing={2}>
                  {systemInfo.response_time && (
                    <Grid item xs={6} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: alpha(theme.palette.info.main, 0.04),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                          textAlign: 'center',
                        }}
                      >
                        <Timer sx={{ fontSize: 24, color: theme.palette.info.main, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Response Time
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                          {systemInfo.response_time}ms
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {systemInfo.active_connections && (
                    <Grid item xs={6} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: alpha(theme.palette.secondary.main, 0.04),
                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                          textAlign: 'center',
                        }}
                      >
                        <NetworkCheck sx={{ fontSize: 24, color: theme.palette.secondary.main, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Active Connections
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                          {systemInfo.active_connections}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {systemInfo.error_rate && (
                    <Grid item xs={6} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: alpha(theme.palette.warning.main, 0.04),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                          textAlign: 'center',
                        }}
                      >
                        <Timeline sx={{ fontSize: 24, color: theme.palette.warning.main, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Error Rate
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                          {(systemInfo.error_rate * 100).toFixed(2)}%
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Fade>
          )}

          {/* Component Status */}
          {showDetails && (
            <Fade in timeout={1200}>
              <Box>
                <Divider sx={{ mb: 2, opacity: 0.6 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  Component Status
                </Typography>
                <List sx={{ py: 0 }}>
                  {components.map((component, index) => (
                    <Grow in timeout={800 + index * 100} key={component.key}>
                      <ListItem
                        onClick={() => handleHealthClick(component.key)}
                        sx={{
                          cursor: onHealthClick ? 'pointer' : 'default',
                          borderRadius: 2,
                          mb: 1,
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          background: alpha(theme.palette.background.paper, 0.5),
                          '&:hover': onHealthClick ? {
                            backgroundColor: alpha(getHealthColor(component.status) === 'success' ? theme.palette.success.main : theme.palette.primary.main, 0.04),
                            borderColor: alpha(getHealthColor(component.status) === 'success' ? theme.palette.success.main : theme.palette.primary.main, 0.2),
                            transform: 'translateX(4px)',
                          } : {},
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: alpha(
                                getHealthColor(component.status) === 'success' ? theme.palette.success.main : theme.palette.primary.main,
                                0.1
                              ),
                              border: `1px solid ${alpha(
                                getHealthColor(component.status) === 'success' ? theme.palette.success.main : theme.palette.primary.main,
                                0.2
                              )}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: getHealthColor(component.status) === 'success' ? theme.palette.success.main : theme.palette.primary.main,
                            }}
                          >
                            {component.icon}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {component.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {component.description}
                            </Typography>
                          }
                        />
                        <Chip
                          icon={getHealthIcon(component.status)}
                          label={component.status.toUpperCase()}
                          color={getHealthColor(component.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              marginLeft: 1,
                            },
                          }}
                        />
                      </ListItem>
                    </Grow>
                  ))}
                </List>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};
