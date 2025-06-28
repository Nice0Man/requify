import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  BugReport as BugReportIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { fetchDashboardStats } from '../redux/slices/dashboardSlice';

const StatCard = ({ title, value, icon }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography component="h2" variant="h6" color="primary" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stats, recentActivities, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/requirements/new')}
            >
              Create Requirement
            </Button>
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={() => navigate('/testing')}
            >
              Request Test Status
            </Button>
          </Box>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Requirements"
            value={stats?.totalRequirements || 0}
            icon={<AssignmentIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            icon={<TimelineIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="In Testing"
            value={stats?.inTesting || 0}
            icon={<BugReportIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Completed"
            value={stats?.completed || 0}
            icon={<AssignmentIcon color="success" />}
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities?.map((activity, index) => (
                <Box key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 