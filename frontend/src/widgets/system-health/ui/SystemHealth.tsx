import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  HealthAndSafety,
  CheckCircle,
  Warning,
  Error,
  Database,
  Api,
  Storage,
  Refresh,
} from '@mui/icons-material';

// Using features according to FSD
import { useAdminSystem } from '@/features/admin-panel';

// Widget props from types
import type { SystemHealthProps } from '../../types';

const getHealthColor = (status: string) => {
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
      return <CheckCircle />;
    case 'warning':
      return <Warning />;
    case 'critical':
      return <Error />;
    default:
      return <HealthAndSafety />;
  }
};

export const SystemHealth: React.FC<SystemHealthProps> = ({
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className,
  onHealthClick,
}) => {
  const theme = useTheme();
  const { systemInfo, isLoading, refreshSystemInfo } = useAdminSystem();

  React.useEffect(() => {
    if (autoRefresh && refreshInterval) {
      const interval = setInterval(refreshSystemInfo, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshSystemInfo]);

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
      <Card className={className}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <HealthAndSafety />
            <Typography>Loading system health...</Typography>
          </Box>
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
    },
    {
      name: 'API Server',
      status: systemInfo.api_status || 'unknown',
      icon: <Api />,
      key: 'api',
    },
    {
      name: 'Storage',
      status: systemInfo.storage_status || 'unknown',
      icon: <Storage />,
      key: 'storage',
    },
  ];

  return (
    <Card 
      className={className}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <HealthAndSafety />
          </Box>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            System Health
          </Typography>
        }
        action={
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={getHealthIcon(overallHealth)}
              label={overallHealth.toUpperCase()}
              color={getHealthColor(overallHealth) as any}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <IconButton size="small" onClick={handleRefresh} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ pt: 0 }}>
        {showDetails && (
          <List sx={{ py: 0 }}>
            {components.map((component) => (
              <ListItem
                key={component.key}
                onClick={() => handleHealthClick(component.key)}
                sx={{
                  cursor: onHealthClick ? 'pointer' : 'default',
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': onHealthClick ? {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  } : {},
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {component.icon}
                </ListItemIcon>
                <ListItemText
                  primary={component.name}
                  secondary={`Status: ${component.status}`}
                />
                <Chip
                  label={component.status.toUpperCase()}
                  color={getHealthColor(component.status) as any}
                  size="small"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        )}

        {systemInfo.cpu_usage !== undefined && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              CPU Usage: {Math.round(systemInfo.cpu_usage)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={systemInfo.cpu_usage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: systemInfo.cpu_usage > 80 
                    ? theme.palette.error.main
                    : systemInfo.cpu_usage > 60
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                },
              }}
            />
          </Box>
        )}

        {systemInfo.memory_usage !== undefined && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Memory Usage: {Math.round(systemInfo.memory_usage)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={systemInfo.memory_usage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: systemInfo.memory_usage > 85
                    ? theme.palette.error.main
                    : systemInfo.memory_usage > 70
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                },
              }}
            />
          </Box>
        )}

        <Box 
          mt={2} 
          pt={2} 
          borderTop={`1px solid ${alpha(theme.palette.divider, 0.1)}`}
        >
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date().toLocaleTimeString()}
            {autoRefresh && ` • Auto-refresh: ${refreshInterval / 1000}s`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 