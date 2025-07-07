import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Assignment,
  CheckCircle,
  Warning,
  Schedule,
  BugReport,
  Visibility,
  MoreVert,
  FilterList,
  Add,
  Analytics,
  Assessment,
} from '@mui/icons-material';
import { useRequirementManagementDashboard } from '../model/requirement-management.hooks';
import { RequirementCard, RequirementProgress } from '@/entities/requirement';

interface RequirementManagementDashboardProps {
  projectId?: number;
  showFilters?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function RequirementManagementDashboard({
  projectId,
  showFilters = true,
  showActions = true,
  compact = false,
}: RequirementManagementDashboardProps) {
  const {
    requirements,
    stats,
    analytics,
    recentActivity,
    criticalRequirements,
    upcomingDeadlines,
    testCoverage,
    loading,
    error,
    loadDashboardData,
    refreshStats,
  } = useRequirementManagementDashboard(projectId);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loading requirement management dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={loadDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="disabled" />;
    }
  };

  return (
    <Box sx={{ p: compact ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant={compact ? "h6" : "h5"} fontWeight="bold">
          Requirement Management Dashboard
        </Typography>
        
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {showFilters && (
              <Button startIcon={<FilterList />} variant="outlined" size="small">
                Filters
              </Button>
            )}
            <Button startIcon={<Add />} variant="contained" size="small">
              New Requirement
            </Button>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { refreshStats(); handleMenuClose(); }}>
          <Analytics sx={{ mr: 1 }} /> Refresh Analytics
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Assessment sx={{ mr: 1 }} /> Generate Report
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Visibility sx={{ mr: 1 }} /> View Traceability Matrix
        </MenuItem>
      </Menu>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Assignment color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {stats.total}
                    </Typography>
                    {getTrendIcon(analytics.trends.velocity_trend)}
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Requirements
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.completion_rate} 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {stats.completion_rate}% Complete
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {stats.test_coverage}%
                    </Typography>
                    {getTrendIcon('up')}
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Test Coverage
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.test_coverage} 
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {stats.pending_approvals}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Pending Approvals
                  </Typography>
                  {stats.pending_approvals > 0 && (
                    <Chip 
                      label="Action Required" 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {stats.overdue_count}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Overdue Requirements
                  </Typography>
                  {stats.overdue_count > 0 && (
                    <Chip 
                      label="Critical" 
                      color="error" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Quality Metrics */}
        {!compact && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quality Metrics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Clarity Score</Typography>
                    <Typography variant="body2">{analytics.quality_metrics.clarity_score}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={analytics.quality_metrics.clarity_score} 
                    color="primary"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Completeness</Typography>
                    <Typography variant="body2">{analytics.quality_metrics.completeness_score}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={analytics.quality_metrics.completeness_score} 
                    color="secondary"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Testability</Typography>
                    <Typography variant="body2">{analytics.quality_metrics.testability_score}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={analytics.quality_metrics.testability_score} 
                    color="success"
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Traceability</Typography>
                    <Typography variant="body2">{analytics.quality_metrics.traceability_score}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={analytics.quality_metrics.traceability_score} 
                    color="info"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Test Coverage Details */}
        {!compact && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Test Coverage Analysis
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {testCoverage.tested_requirements} of {testCoverage.total_requirements} requirements tested
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={testCoverage.coverage_percentage} 
                    color="primary"
                    sx={{ mt: 1, mb: 2 }}
                  />
                </Box>
                
                {testCoverage.test_gaps.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Coverage Gaps:
                    </Typography>
                    <List dense>
                      {testCoverage.test_gaps.slice(0, 3).map((gap, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <BugReport color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={gap.requirement_title}
                            secondary={gap.gap_type}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {testCoverage.test_gaps.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{testCoverage.test_gaps.length - 3} more gaps
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Critical Requirements */}
        <Grid item xs={12} md={compact ? 12 : 6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Critical Requirements
              </Typography>
              {criticalRequirements.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No critical requirements at this time
                </Typography>
              ) : (
                <List dense>
                  {criticalRequirements.slice(0, compact ? 3 : 5).map((requirement) => (
                    <ListItem key={requirement.id} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main' }}>
                          <Warning fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={requirement.title}
                        secondary={`${requirement.status} • ${requirement.priority} priority`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip 
                        label={requirement.status} 
                        size="small" 
                        color="warning"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={compact ? 12 : 6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {recentActivity.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              ) : (
                <List dense>
                  {recentActivity.slice(0, compact ? 3 : 5).map((activity) => (
                    <ListItem key={activity.id} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {activity.user_name?.charAt(0) || 'U'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity.description}
                        secondary={new Date(activity.timestamp).toLocaleString()}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Requirements List */}
        {!compact && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Active Requirements
                  </Typography>
                  <Button size="small" variant="outlined">
                    View All
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  {requirements.slice(0, 6).map((requirement) => (
                    <Grid item xs={12} sm={6} md={4} key={requirement.id}>
                      <RequirementCard 
                        requirement={requirement}
                        showActions={true}
                        compact={true}
                      />
                    </Grid>
                  ))}
                </Grid>

                {requirements.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No requirements found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start by creating your first requirement
                    </Typography>
                    <Button variant="contained" startIcon={<Add />}>
                      Create Requirement
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 