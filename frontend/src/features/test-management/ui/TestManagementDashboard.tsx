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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PlayArrow,
  Assessment,
  BugReport,
  CheckCircle,
  Schedule,
  MoreVert,
  Add,
  Refresh,
} from '@mui/icons-material';
import { useTestManagementDashboard } from '../model/test-management.hooks';
import { TestCaseCard } from '@/entities/test-case';

interface TestManagementDashboardProps {
  projectId?: number;
  compact?: boolean;
}

export function TestManagementDashboard({
  projectId,
  compact = false,
}: TestManagementDashboardProps) {
  const {
    testPlans,
    testCases,
    executions,
    analytics,
    summary,
    recentActivity,
    criticalIssues,
    upcomingRuns,
    loading,
    error,
    loadDashboardData,
    refreshAnalytics,
  } = useTestManagementDashboard(projectId);

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
          Loading test management dashboard...
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

  return (
    <Box sx={{ p: compact ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant={compact ? "h6" : "h5"} fontWeight="bold">
          Test Management Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Add />} variant="contained" size="small">
            New Test Plan
          </Button>
          <Button startIcon={<PlayArrow />} variant="outlined" size="small">
            Run Tests
          </Button>
          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { refreshAnalytics(); handleMenuClose(); }}>
          <Refresh sx={{ mr: 1 }} /> Refresh Analytics
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Assessment sx={{ mr: 1 }} /> Generate Report
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
                    <Assessment color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {summary.totalCases}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Test Cases
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={analytics.automationRate} 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {analytics.automationRate}% Automated
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
                      {summary.passRate}%
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Pass Rate
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={summary.passRate} 
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
                    <BugReport color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {summary.coverage}%
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Test Coverage
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={summary.coverage} 
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {summary.activePlans}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Plans
                  </Typography>
                  {summary.activePlans > 0 && (
                    <Chip 
                      label="Running" 
                      color="info" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Test Plans */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Test Plans
              </Typography>
              {testPlans.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active test plans
                </Typography>
              ) : (
                <List dense>
                  {testPlans.slice(0, 5).map((plan) => (
                    <ListItem key={plan.id} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Assessment color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={plan.name}
                        secondary={`${plan.status} • ${plan.test_case_count || 0} test cases`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip 
                        label={plan.status} 
                        size="small" 
                        color={plan.status === 'active' ? 'success' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Test Activity
              </Typography>
              {recentActivity.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              ) : (
                <List dense>
                  {recentActivity.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        {activity.result === 'passed' ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : activity.result === 'failed' ? (
                          <BugReport color="error" fontSize="small" />
                        ) : (
                          <Schedule color="disabled" fontSize="small" />
                        )}
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

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Critical Issues
                </Typography>
                <List dense>
                  {criticalIssues.slice(0, 3).map((issue) => (
                    <ListItem key={issue.id} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <BugReport color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={issue.description}
                        secondary={`${issue.testCaseName} • ${issue.severity} severity`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip 
                        label={issue.status} 
                        size="small" 
                        color={issue.status === 'open' ? 'error' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Test Cases */}
        {!compact && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Test Cases
                  </Typography>
                  <Button size="small" variant="outlined">
                    View All
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  {testCases.slice(0, 6).map((testCase) => (
                    <Grid item xs={12} sm={6} md={4} key={testCase.id}>
                      <TestCaseCard 
                        testCase={testCase}
                        showActions={true}
                        compact={true}
                      />
                    </Grid>
                  ))}
                </Grid>

                {testCases.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Assessment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No test cases found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start by creating your first test case
                    </Typography>
                    <Button variant="contained" startIcon={<Add />}>
                      Create Test Case
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