import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  BugReport,
  RocketLaunch,
  Api,
  Launch
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  const metrics = [
    {
      title: 'Active Projects',
      value: '12',
      change: '+2 this month',
      icon: <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.light'
    },
    {
      title: 'Requirements',
      value: '234',
      change: '+18 this week',
      icon: <Assignment sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.light'
    },
    {
      title: 'Test Cases',
      value: '456',
      change: '+25 this week',
      icon: <BugReport sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.light'
    },
    {
      title: 'Releases',
      value: '8',
      change: '+1 this month',
      icon: <RocketLaunch sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.light'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New requirement added',
      project: 'E-Commerce Platform',
      user: 'John Doe',
      time: '2 hours ago'
    },
    {
      id: 2,
      action: 'Test run completed',
      project: 'Mobile App',
      user: 'Jane Smith',
      time: '4 hours ago'
    },
    {
      id: 3,
      action: 'Release deployed',
      project: 'API Gateway',
      user: 'Mike Johnson',
      time: '1 day ago'
    },
    {
      id: 4,
      action: 'Requirement approved',
      project: 'Dashboard',
      user: 'Sarah Wilson',
      time: '2 days ago'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's an overview of your projects and activities.
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: metric.color,
                      mr: 2
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={metric.change}
                  size="small"
                  color="success"
                  variant="outlined"
                  icon={<TrendingUp sx={{ fontSize: 16 }} />}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Recent Activities"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivities.map((activity) => (
                  <Paper
                    key={activity.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: 'grey.50',
                      borderLeft: 3,
                      borderLeftColor: 'primary.main'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {activity.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Project: {activity.project} • By: {activity.user}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Quick Stats"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Requirements Completion
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: '73%',
                          height: '100%',
                          backgroundColor: 'success.main'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      73%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Test Coverage
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: '86%',
                          height: '100%',
                          backgroundColor: 'info.main'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      86%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Release Success Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: '94%',
                          height: '100%',
                          backgroundColor: 'warning.main'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      94%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* API Overview Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6,
              }
            }}
            onClick={() => navigate('/api-overview')}
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Api color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      API Overview & Documentation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Explore all available endpoints and authentication details
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Launch color="action" />
                  </Box>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      70+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      API Endpoints
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      OAuth2
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Authentication
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                      19
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Permission Scopes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      2
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Token Types
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Features:</strong> Complete endpoint documentation • OAuth2 flow examples • Interactive testing tools • Code examples in multiple languages
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 