import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  History as HistoryIcon,
  Link as LinkIcon,
  BugReport as BugReportIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { fetchRequirementById } from '../redux/slices/requirementsSlice';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const RequirementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRequirement: requirement, loading } = useSelector((state) => state.requirements);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(fetchRequirementById(id));
  }, [dispatch, id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      review: 'warning',
      approved: 'info',
      in_progress: 'secondary',
      testing: 'warning',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
    };
    return colors[priority] || 'default';
  };

  if (loading || !requirement) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              {requirement.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/requirements/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                startIcon={<BugReportIcon />}
                onClick={() => navigate('/testing', { state: { requirementId: id } })}
              >
                Request Test Status
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={requirement.status}
                color={getStatusColor(requirement.status)}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Priority
              </Typography>
              <Chip
                label={requirement.priority}
                color={getPriorityColor(requirement.priority)}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">{requirement.type}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Project
              </Typography>
              <Typography variant="body1">{requirement.project}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Details" />
              <Tab label="Tests" />
              <Tab label="Links" />
              <Tab label="History" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {requirement.description}
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <List>
              {requirement.tests?.map((test) => (
                <ListItem key={test.id}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={test.title}
                    secondary={`Status: ${test.status}`}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <List>
              {requirement.links?.map((link) => (
                <ListItem key={link.id}>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={link.title}
                    secondary={link.url}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <List>
              {requirement.history?.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.description}
                    secondary={new Date(event.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequirementDetails; 