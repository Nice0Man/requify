import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  alpha,
  Stack,
  Card,
  CardContent,
  Fade,
  Grow,
  Avatar,
  Chip,
} from '@mui/material';

// Using widgets according to FSD
import {
  DashboardStats,
  ActivityFeed,
  QuickActions,
  ProjectOverview,
  SystemHealth,
} from '@/widgets';

// Using features according to FSD
import { useAuth } from '@/features/auth';
import { useDashboard } from '@/features/dashboard';

// Using shared utilities
import { getUserInitials } from '@/shared/utils';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  const { dashboardData, isLoading } = useDashboard();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || 'User';
  };

  const isAdmin = hasPermission('admin:read');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
        pb: 4,
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Stack spacing={3}>
              {/* Header with User Info */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    {getUserInitials(getUserDisplayName())}
                  </Avatar>
                  
                  <Stack spacing={1}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                        lineHeight: 1.2,
                      }}
                    >
                      {getGreeting()}, {getUserDisplayName()}!
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 400,
                        opacity: 0.8,
                      }}
                    >
                      Welcome back to your project management dashboard
                    </Typography>
                  </Stack>
                </Stack>

                {/* Status Chip */}
                <Chip
                  label={isAdmin ? 'Administrator' : 'User'}
                  color={isAdmin ? 'primary' : 'default'}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                />
              </Box>

              {/* Quick Stats Summary */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.04)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Today's Overview
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {dashboardData?.stats?.active_projects || 0} active projects • {dashboardData?.stats?.pending_requirements || 0} pending requirements
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Fade>

        {/* Main Dashboard Grid */}
        <Stack spacing={4}>
          {/* Statistics Overview */}
          <Grow in timeout={800}>
            <Box>
              <DashboardStats
                layout="grid"
                showTrends={true}
                onStatClick={(statType) => {
                  // Navigate to specific sections based on stat type
                  switch (statType) {
                    case 'projects':
                      window.location.href = '/projects';
                      break;
                    case 'requirements':
                      window.location.href = '/requirements';
                      break;
                    case 'testing':
                      window.location.href = '/testing';
                      break;
                    case 'users':
                      if (isAdmin) window.location.href = '/admin';
                      break;
                    case 'releases':
                      window.location.href = '/releases';
                      break;
                  }
                }}
              />
            </Box>
          </Grow>

          {/* Main Content Grid */}
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12} md={6} lg={4}>
              <Grow in timeout={1000}>
                <Box sx={{ height: '100%' }}>
                  <QuickActions
                    layout="grid"
                    onActionClick={(action) => {
                      switch (action) {
                        case 'create-project':
                          window.location.href = '/projects/create';
                          break;
                        case 'add-requirement':
                          window.location.href = '/requirements/create';
                          break;
                        case 'create-release':
                          window.location.href = '/releases/create';
                          break;
                        case 'run-tests':
                          window.location.href = '/testing';
                          break;
                        case 'export-report':
                          window.location.href = '/reports';
                          break;
                      }
                    }}
                  />
                </Box>
              </Grow>
            </Grid>

            {/* Activity Feed */}
            <Grid item xs={12} md={6} lg={4}>
              <Grow in timeout={1200}>
                <Box sx={{ height: '100%' }}>
                  <ActivityFeed
                    limit={8}
                    showFilters={false}
                    onActivityClick={(activityId) => {
                      console.log('Activity clicked:', activityId);
                    }}
                  />
                </Box>
              </Grow>
            </Grid>

            {/* System Health (Admin Only) */}
            {isAdmin && (
              <Grid item xs={12} md={6} lg={4}>
                <Grow in timeout={1400}>
                  <Box sx={{ height: '100%' }}>
                    <SystemHealth
                      showDetails={true}
                      autoRefresh={true}
                      refreshInterval={30000}
                      onHealthClick={(component) => {
                        window.location.href = `/admin?tab=system&component=${component}`;
                      }}
                    />
                  </Box>
                </Grow>
              </Grid>
            )}

            {/* Recent Project Overview */}
            {dashboardData?.recentProject && (
              <Grid item xs={12} md={6} lg={isAdmin ? 4 : 6}>
                <Grow in timeout={1600}>
                  <Box sx={{ height: '100%' }}>
                    <ProjectOverview
                      projectId={dashboardData.recentProject.id}
                      showDetails={true}
                      showProgress={true}
                      onProjectClick={(projectId) => {
                        window.location.href = `/projects/${projectId}`;
                      }}
                    />
                  </Box>
                </Grow>
              </Grid>
            )}
          </Grid>

          {/* Additional Widgets Section */}
          <Grid container spacing={3}>
            {/* Extended Activity Feed for Large Screens */}
            <Grid item xs={12} lg={8}>
              <Grow in timeout={1800}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
                    background: theme.palette.background.paper,
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <ActivityFeed
                      limit={15}
                      showFilters={true}
                      onActivityClick={(activityId) => {
                        console.log('Activity clicked:', activityId);
                      }}
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* Quick Actions Extended */}
            <Grid item xs={12} lg={4}>
              <Grow in timeout={2000}>
                <Box sx={{ height: '100%' }}>
                  <QuickActions
                    layout="list"
                    actions={['create-project', 'add-requirement', 'run-tests']}
                    onActionClick={(action) => {
                      console.log('Quick action:', action);
                    }}
                  />
                </Box>
              </Grow>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default DashboardPage;
