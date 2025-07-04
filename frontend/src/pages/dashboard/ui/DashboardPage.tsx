import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  alpha,
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 1,
          }}
        >
          {getGreeting()}, {getUserDisplayName()}!
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.1rem' }}
        >
          Welcome back to your project management dashboard
        </Typography>
      </Box>

      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Statistics Overview */}
        <Grid item xs={12}>
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
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6} lg={4}>
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
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} md={6} lg={4}>
          <ActivityFeed
            limit={8}
            showFilters={false}
            onActivityClick={(activityId) => {
              // Navigate to specific activity or show details
              console.log('Activity clicked:', activityId);
            }}
          />
        </Grid>

        {/* System Health (Admin Only) */}
        {isAdmin && (
          <Grid item xs={12} md={6} lg={4}>
            <SystemHealth
              showDetails={true}
              autoRefresh={true}
              refreshInterval={30000}
              onHealthClick={(component) => {
                window.location.href = `/admin?tab=system&component=${component}`;
              }}
            />
          </Grid>
        )}

        {/* Recent Project Overview */}
        {dashboardData?.recentProject && (
          <Grid item xs={12} md={6} lg={4}>
            <ProjectOverview
              projectId={dashboardData.recentProject.id}
              showDetails={true}
              showProgress={true}
              onProjectClick={(projectId) => {
                window.location.href = `/projects/${projectId}`;
              }}
            />
          </Grid>
        )}
      </Grid>

      {/* Additional Widgets for Large Screens */}
      {theme.breakpoints.up('lg') && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Extended Activity Feed */}
            <Grid item xs={12} lg={6}>
              <ActivityFeed
                limit={15}
                showFilters={true}
                onActivityClick={(activityId) => {
                  console.log('Activity clicked:', activityId);
                }}
              />
            </Grid>

            {/* Quick Actions Extended */}
            <Grid item xs={12} lg={6}>
              <QuickActions
                layout="list"
                actions={['create-project', 'add-requirement', 'run-tests']}
                onActionClick={(action) => {
                  console.log('Quick action:', action);
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage;
