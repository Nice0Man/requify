import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  LinearProgress,
  alpha,
  Button,
  Skeleton,
  useTheme,
  Chip,
  Stack,
} from '@mui/material';
import {
  RocketLaunch,
  Assignment,
  CheckCircle,
  BugReport,
  People,
  Assessment,
  TrendingUp,
  TrendingDown,
  Refresh,
  Dashboard,
} from '@mui/icons-material';

interface DashboardStatsProps {
  layout?: 'grid' | 'horizontal' | 'vertical';
  showTrends?: boolean;
  className?: string;
  onStatClick?: (statType: string) => void;
}

interface DashboardStatsType {
  total_projects: number;
  total_requirements: number;
  completed_requirements: number;
  test_coverage: number;
  active_users: number;
  recent_releases: number;
  project_health_score: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  onClick,
}) => {
  const theme = useTheme();
  
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: theme.palette.background.paper,
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.12)}`,
          borderColor: alpha(color, 0.2),
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.05)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${alpha(color, 0.1)}`,
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: { color, fontSize: 24 },
              })}
            </Box>
            
            {trend && (
              <Chip
                icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
                label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
                size="small"
                color={trend.isPositive ? 'success' : 'error'}
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-icon': { fontSize: 14 },
                  '& .MuiChip-label': { px: 1 },
                  borderRadius: 1.5,
                }}
              />
            )}
          </Box>

          {/* Content */}
          <Stack spacing={0.5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: '2rem',
                lineHeight: 1.2,
              }}
            >
              {value.toLocaleString()}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: '0.875rem',
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  layout = 'grid',
  showTrends = true,
  className,
  onStatClick,
}) => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Mock data for now until real API is implemented
      const response: DashboardStatsType = {
        total_projects: 12,
        total_requirements: 156,
        completed_requirements: 89,
        test_coverage: 78,
        active_users: 24,
        recent_releases: 3,
        project_health_score: 85,
      };
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setStats(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    loadStats();
  };

  const handleStatClick = (statType: string) => {
    if (onStatClick) {
      onStatClick(statType);
    }
  };

  const getStatCards = () => {
    if (!stats) return [];

    return [
      {
        id: 'projects',
        title: 'Total Projects',
        value: stats.total_projects,
        icon: <RocketLaunch />,
        color: theme.palette.primary.main,
        trend: showTrends ? { value: 12, isPositive: true } : undefined,
      },
      {
        id: 'requirements',
        title: 'Active Requirements',
        value: stats.total_requirements - stats.completed_requirements,
        icon: <Assignment />,
        color: theme.palette.info.main,
        trend: showTrends ? { value: 8, isPositive: true } : undefined,
      },
      {
        id: 'completed',
        title: 'Completed Tasks',
        value: stats.completed_requirements,
        icon: <CheckCircle />,
        color: theme.palette.success.main,
        trend: showTrends ? { value: 15, isPositive: true } : undefined,
      },
      {
        id: 'testing',
        title: 'Test Coverage',
        value: Math.round(stats.test_coverage || 0),
        icon: <BugReport />,
        color: theme.palette.warning.main,
        trend: showTrends ? { value: 3, isPositive: false } : undefined,
      },
      {
        id: 'users',
        title: 'Active Users',
        value: stats.active_users,
        icon: <People />,
        color: theme.palette.secondary.main,
        trend: showTrends ? { value: 5, isPositive: true } : undefined,
      },
      {
        id: 'releases',
        title: 'Recent Releases',
        value: stats.recent_releases,
        icon: <Assessment />,
        color: theme.palette.error.main,
        trend: showTrends ? { value: 2, isPositive: true } : undefined,
      },
    ];
  };

  if (error) {
    return (
      <Card className={className} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="center">
            <Dashboard sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3 }} />
            <Typography color="error" variant="body2" textAlign="center">
              {error}
            </Typography>
            <Button 
              onClick={handleRefresh} 
              size="small" 
              variant="outlined"
              sx={{ textTransform: 'none' }}
            >
              Try Again
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Box className={className}>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Skeleton variant="rounded" width={48} height={48} />
                      <Skeleton variant="rounded" width={60} height={24} />
                    </Box>
                    <Stack spacing={0.5}>
                      <Skeleton variant="text" width="80%" height={40} />
                      <Skeleton variant="text" width="60%" height={20} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const statCards = getStatCards();

  if (layout === 'horizontal') {
    return (
      <Box className={className} display="flex" gap={2} overflow="auto" pb={1}>
        {statCards.map((stat) => {
          const { id, ...statProps } = stat;
          return (
            <Box key={id} minWidth={280}>
              <StatCard
                {...statProps}
                onClick={() => handleStatClick(id)}
              />
            </Box>
          );
        })}
      </Box>
    );
  }

  if (layout === 'vertical') {
    return (
      <Box className={className} display="flex" flexDirection="column" gap={2}>
        {statCards.map((stat) => {
          const { id, ...statProps } = stat;
          return (
            <StatCard
              key={id}
              {...statProps}
              onClick={() => handleStatClick(id)}
            />
          );
        })}
      </Box>
    );
  }

  // Default grid layout
  return (
    <Box className={className}>
      <Stack spacing={4}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Dashboard sx={{ color: 'white', fontSize: 18 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                System Overview
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Real-time insights into your project metrics
            </Typography>
          </Stack>
          
          <IconButton 
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
            <Refresh />
          </IconButton>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          {statCards.map((stat) => {
            const { id, ...statProps } = stat;
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={id}>
                <StatCard
                  {...statProps}
                  onClick={() => handleStatClick(id)}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Health Score */}
        {stats && (
          <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Health Score
                  </Typography>
                  <Chip
                    label={`${Math.round(stats.project_health_score || 0)}%`}
                    color={
                      (stats.project_health_score || 0) >= 80 ? 'success' :
                      (stats.project_health_score || 0) >= 60 ? 'warning' : 'error'
                    }
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={stats.project_health_score || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.divider, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: (stats.project_health_score || 0) >= 80 
                        ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                        : (stats.project_health_score || 0) >= 60
                        ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                        : `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
                    },
                  }}
                />
                
                <Typography variant="caption" color="text.secondary">
                  Based on completion rate, quality metrics, and team velocity
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}; 