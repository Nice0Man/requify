import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Paper,
} from "@mui/material";
import {
  Edit,
  Settings,
  Assignment,
  BugReport,
  People,
  CalendarToday,
  TrendingUp,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { projectsApi } from "@/shared/api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await projectsApi.getProject(Number(id));
        setProject(response.data);
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "completed":
        return "info";
      case "on hold":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Alert severity="error">
        Project not found. Please check the project ID and try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {project.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {project.code}
            </Typography>
            <Chip
              label={project.status}
              color={getStatusColor(project.status)}
              size="small"
            />
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{ mr: 1 }}
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            Edit Project
          </Button>
          <IconButton>
            <Settings />
          </IconButton>
        </Box>
      </Box>

      {/* Project Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Description
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {project.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Owner
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar>
                  {project.owner.first_name[0]}
                  {project.owner.last_name[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1">
                    {project.owner.first_name} {project.owner.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.owner.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Assignment color="primary" />
                <Box flex={1}>
                  <Typography variant="h4">
                    {project.stats.total_requirements}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requirements
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(
                      project.stats.completed_requirements,
                      project.stats.total_requirements
                    )}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BugReport color="success" />
                <Box flex={1}>
                  <Typography variant="h4">
                    {project.stats.total_tests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tests
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(
                      project.stats.passed_tests,
                      project.stats.total_tests
                    )}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="info" />
                <Box flex={1}>
                  <Typography variant="h4">
                    {project.team_members.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team Members
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="warning" />
                <Box flex={1}>
                  <Typography variant="h4">
                    {getProgressPercentage(
                      project.stats.completed_requirements,
                      project.stats.total_requirements
                    )}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Requirements" icon={<Assignment />} />
            <Tab label="Team" icon={<People />} />
            <Tab label="Activity" icon={<CalendarToday />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Requirements Overview
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h5" color="success.main">
                  {project.stats.completed_requirements}
                </Typography>
                <Typography variant="body2">Completed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h5" color="warning.main">
                  {project.stats.in_progress_requirements}
                </Typography>
                <Typography variant="body2">In Progress</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h5" color="info.main">
                  {project.stats.pending_requirements}
                </Typography>
                <Typography variant="body2">Pending</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: "100%" }}
                onClick={() => navigate("/requirements")}
              >
                View All Requirements
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Team Members
          </Typography>
          <List>
            {project.team_members.map((member: any) => (
              <ListItem key={member.id}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Avatar>
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </Avatar>
                  <ListItemText primary={member.name} secondary={member.role} />
                </Box>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {project.recent_activity.map((activity: any) => (
              <ListItem key={activity.id}>
                <ListItemText
                  primary={`${activity.action} ${activity.title}`}
                  secondary={new Date(activity.date).toLocaleDateString()}
                />
                <Chip label={activity.type} size="small" variant="outlined" />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ProjectDetailsPage;
