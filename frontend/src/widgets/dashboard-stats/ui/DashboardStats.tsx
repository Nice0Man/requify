import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Skeleton,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Assignment,
  RocketLaunch,
  People,
  BugReport,
  CheckCircle,
  Schedule,
  Warning,
  Refresh,
  MoreVert,
} from '@mui/icons-material';

// Using features according to FSD
import { dashboardApi } from '@/features/dashboard/api';
import type { DashboardStats as DashboardStatsType } from '@/features/dashboard/api/dashboard.api';

// Using shared utilities
import { formatNumber } from '@/shared/utils';

// Widget props from types
import type { DashboardStatsProps } from '../../types';

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
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
          <IconButton size="small" sx={{ opacity: 0.5 }}>
            <MoreVert />
          </IconButton>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '2rem',
            mb: 0.5,
            color: theme.palette.text.primary,
          }}
        >
          {formatNumber(value)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, mb: 1 }}
        >
          {title}
        </Typography>

        {trend && (
          <Box display="flex" alignItems="center">
            <Chip
              icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
              label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
              size="small"
              color={trend.isPositive ? 'success' : 'error'}
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        )}
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
      const data = await dashboardApi.getStats();
      setStats(data);
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
        title: 'Total Projects',
        value: stats.total_projects,
        icon: <RocketLaunch />,
        color: theme.palette.primary.main,
        trend: showTrends ? { value: 12, isPositive: true } : undefined,
        key: 'projects',
      },
      {
        title: 'Active Requirements',
        value: stats.total_requirements - stats.completed_requirements,
        icon: <Assignment />,
        color: theme.palette.info.main,
        trend: showTrends ? { value: 8, isPositive: true } : undefined,
        key: 'requirements',
      },
      {
        title: 'Completed Tasks',
        value: stats.completed_requirements,
        icon: <CheckCircle />,
        color: theme.palette.success.main,
        trend: showTrends ? { value: 15, isPositive: true } : undefined,
        key: 'completed',
      },
      {
        title: 'Test Coverage',
        value: Math.round(stats.test_coverage || 0),
        icon: <BugReport />,
        color: theme.palette.warning.main,
        trend: showTrends ? { value: 3, isPositive: false } : undefined,
        key: 'testing',
      },
      {
        title: 'Active Users',
        value: stats.active_users,
        icon: <People />,
        color: theme.palette.secondary.main,
        trend: showTrends ? { value: 5, isPositive: true } : undefined,
        key: 'users',
      },
      {
        title: 'Recent Releases',
        value: stats.recent_releases,
        icon: <Assessment />,
        color: theme.palette.error.main,
        trend: showTrends ? { value: 2, isPositive: true } : undefined,
        key: 'releases',
      },
    ];
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
          <Button onClick={handleRefresh} size="small" sx={{ mt: 1 }}>
            Try Again
          </Button>
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
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="50%" height={24} sx={{ borderRadius: 1 }} />
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
      <Box className={className} display="flex" gap={2} overflow="auto">
        {statCards.map((stat) => (
          <Box key={stat.key} minWidth={250}>
            <StatCard
              {...stat}
              onClick={() => handleStatClick(stat.key)}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (layout === 'vertical') {
    return (
      <Box className={className} display="flex" flexDirection="column" gap={2}>
        {statCards.map((stat) => (
          <StatCard
            key={stat.key}
            {...stat}
            onClick={() => handleStatClick(stat.key)}
          />
        ))}
      </Box>
    );
  }

  // Default grid layout
  return (
    <Box className={className}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          System Overview
        </Typography>
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={stat.key}>
            <StatCard
              {...stat}
              onClick={() => handleStatClick(stat.key)}
            />
          </Grid>
        ))}
      </Grid>

      {stats && (
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Project Health Score
          </Typography>
          <LinearProgress
            variant="determinate"
            value={stats.project_health_score || 0}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {Math.round(stats.project_health_score || 0)}% Overall Health
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 