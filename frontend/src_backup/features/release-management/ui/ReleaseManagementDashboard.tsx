import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Publish as PublishIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

import { ReleaseCard, ReleaseProgress, ReleaseInfo } from '@/entities/release';
import { useReleaseManagementDashboard } from '../model/release-management.hooks';
import type { 
  ReleaseMetricsCard, 
  ReleaseAlert,
  ReleaseExtended 
} from '../model/release-management.types';
import { RELEASE_MANAGEMENT_PERMISSIONS } from '../model/release-management.types';

interface ReleaseManagementDashboardProps {
  projectId?: number;
  onReleaseClick?: (release: ReleaseExtended) => void;
  onCreateRelease?: () => void;
  onManagePlanning?: () => void;
}

export function ReleaseManagementDashboard({
  projectId,
  onReleaseClick,
  onCreateRelease,
  onManagePlanning
}: ReleaseManagementDashboardProps) {
  const {
    releases,
    stats,
    upcomingReleases,
    recentActivity,
    summary,
    metrics,
    isLoading,
    error,
    lastUpdated,
    actions
  } = useReleaseManagementDashboard(projectId);

  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  // Метрики карточки для отображения
  const metricsCards = useMemo((): ReleaseMetricsCard[] => [
    {
      id: 'active-releases',
      title: 'Active Releases',
      value: summary.totalActive,
      status: summary.totalActive > 10 ? 'warning' : 'good',
      description: 'Currently active releases'
    },
    {
      id: 'completion-rate',
      title: 'Avg. Completion',
      value: `${metrics.completionRate}%`,
      trend: {
        direction: stats?.trends.velocityTrend === 'up' ? 'up' : 
                  stats?.trends.velocityTrend === 'down' ? 'down' : 'stable',
        percentage: 5.2,
        period: 'vs last month'
      },
      status: metrics.completionRate > 80 ? 'good' : 
              metrics.completionRate > 60 ? 'warning' : 'critical'
    },
    {
      id: 'overdue-releases',
      title: 'Overdue',
      value: summary.overdue,
      status: summary.overdue === 0 ? 'good' : 
              summary.overdue <= 2 ? 'warning' : 'critical',
      description: 'Releases past due date'
    },
    {
      id: 'ready-to-publish',
      title: 'Ready to Publish',
      value: summary.readyToPublish,
      status: 'good',
      description: 'Releases ready for publication'
    }
  ], [summary, metrics, stats]);

  // Алерты и уведомления
  const alerts = useMemo((): ReleaseAlert[] => {
    const alertsList: ReleaseAlert[] = [];

    if (summary.overdue > 0) {
      alertsList.push({
        id: 'overdue-releases',
        type: 'warning',
        title: 'Overdue Releases',
        message: `${summary.overdue} release(s) are past their planned date`,
        dismissible: false,
        timestamp: new Date().toISOString()
      });
    }

    if (summary.readyToPublish > 0) {
      alertsList.push({
        id: 'ready-to-publish',
        type: 'success',
        title: 'Releases Ready',
        message: `${summary.readyToPublish} release(s) are ready for publication`,
        actionLabel: 'Review',
        dismissible: true,
        timestamp: new Date().toISOString()
      });
    }

    if (stats?.riskAssessment.highRisk > 0) {
      alertsList.push({
        id: 'high-risk',
        type: 'error',
        title: 'High Risk Releases',
        message: `${stats.riskAssessment.highRisk} release(s) require immediate attention`,
        dismissible: false,
        timestamp: new Date().toISOString()
      });
    }

    return alertsList;
  }, [summary, stats]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUpIcon color="success" fontSize="small" />;
      case 'down': return <TrendingDownIcon color="error" fontSize="small" />;
      default: return <RemoveIcon color="disabled" fontSize="small" />;
    }
  };

  const getStatusColor = (status?: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'primary';
    }
  };

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error Loading Dashboard</AlertTitle>
        {error}
        <Button onClick={actions.refresh} sx={{ mt: 1 }}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Release Management
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton onClick={actions.refresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={onCreateRelease}
          >
            New Release
          </Button>
          
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { onManagePlanning?.(); handleMenuClose(); }}>
              <ListItemIcon>
                <TimelineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Release Planning</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AssessmentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Analytics</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <CalendarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Calendar View</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Loading Progress */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Alerts */}
      {alerts.map(alert => (
        <Alert 
          key={alert.id} 
          severity={alert.type} 
          sx={{ mb: 2 }}
          action={
            alert.actionLabel && (
              <Button color="inherit" size="small">
                {alert.actionLabel}
              </Button>
            )
          }
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.message}
        </Alert>
      ))}

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricsCards.map(metric => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {metric.value}
                      {metric.unit && (
                        <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                          {metric.unit}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  
                  {metric.status && (
                    <Chip 
                      size="small" 
                      color={getStatusColor(metric.status)}
                      label={metric.status.toUpperCase()}
                    />
                  )}
                </Box>
                
                {metric.trend && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(metric.trend.direction)}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {metric.trend.percentage}% {metric.trend.period}
                    </Typography>
                  </Box>
                )}
                
                {metric.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {metric.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Active Releases */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Active Releases
                </Typography>
                <Chip 
                  label={`${releases.length} active`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              {releases.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No active releases
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AssignmentIcon />}
                    sx={{ mt: 2 }}
                    onClick={onCreateRelease}
                  >
                    Create First Release
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {releases.slice(0, 6).map(release => (
                    <Grid item xs={12} sm={6} key={release.id}>
                      <ReleaseCard 
                        release={release}
                        onClick={() => onReleaseClick?.(release)}
                        showProgress
                        showStatus
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {releases.length > 6 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button variant="outlined">
                    View All Releases ({releases.length})
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Upcoming Releases */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Upcoming Releases
                  </Typography>
                  
                  {upcomingReleases.length === 0 ? (
                    <Typography color="text.secondary">
                      No upcoming releases
                    </Typography>
                  ) : (
                    <Box>
                      {upcomingReleases.slice(0, 5).map(release => (
                        <Box 
                          key={release.id}
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            py: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {release.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              v{release.version}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">
                              {release.planned_date && 
                                new Date(release.planned_date).toLocaleDateString()
                              }
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Recent Activity
                  </Typography>
                  
                  {recentActivity.length === 0 ? (
                    <Typography color="text.secondary">
                      No recent activity
                    </Typography>
                  ) : (
                    <Box>
                      {recentActivity.slice(0, 5).map(activity => (
                        <Box 
                          key={activity.id}
                          sx={{ 
                            py: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <Typography variant="body2">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.timestamp).toLocaleString()} • {activity.userName}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Metrics */}
            {stats?.performanceMetrics && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Performance Metrics
                    </Typography>
                    
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Deployment Frequency
                        </Typography>
                        <Typography variant="h6">
                          {stats.performanceMetrics.deploymentFrequency}/week
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Lead Time
                        </Typography>
                        <Typography variant="h6">
                          {stats.performanceMetrics.leadTimeForChanges} days
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Change Failure Rate
                        </Typography>
                        <Typography variant="h6">
                          {Math.round(stats.performanceMetrics.changeFailureRate * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
} 