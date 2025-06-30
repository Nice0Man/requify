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
import {
  projectsApi,
  ProjectWithStats,
  ProjectStatus,
} from "../api/projects.api";
import { getStatusColor } from "../types/project.types";

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
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      // Validate project ID parameter
      if (!id || id.trim() === "") {
        setError("Project ID is required");
        setLoading(false);
        return;
      }

      const projectId = parseInt(id, 10);
      if (isNaN(projectId) || projectId <= 0) {
        setError("Invalid project ID. Please provide a valid project number.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let projectData: ProjectWithStats;
        
        // The backend's GET /{project_id} endpoint already returns ProjectWithStats
        const response = await projectsApi.getProject(projectId);
        console.log('Project API response:', response.data); // Debug logging
        projectData = response.data;
        
        // Ensure all required fields have default values if missing
        const safeProjectData: ProjectWithStats = {
          ...projectData,
          status: projectData.status || 'inactive', // Default status if missing
          total_requirements: projectData.total_requirements || 0,
          requirements_completed: projectData.requirements_completed || 0,
          active_releases: projectData.active_releases || 0,
          specs_count: projectData.specs_count || 0,
          requirement_groups_count: projectData.requirement_groups_count || 0,
          completion_percentage: projectData.completion_percentage || 0,
          is_completed: projectData.is_completed || false,
        };
        
        setProject(safeProjectData);
      } catch (error: any) {
        console.error("Failed to fetch project:", error);

        // Extract error message properly
        let errorMessage = "Failed to load project. Please try again.";
        if (error?.message) {
          if (Array.isArray(error.message)) {
            errorMessage = error.message.join(", ");
          } else if (typeof error.message === "string") {
            errorMessage = error.message;
          } else {
            errorMessage = String(error.message);
          }
        } else if (error?.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }

        setError(errorMessage);
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

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate("/projects")}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Project not found. Please check the project ID and try again.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate("/projects")}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
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
              label={formatStatus(project.status)}
              color={getStatusColor(project.status || "inactive")}
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
                {project.description || "No description provided"}
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
                    Owner ID
                  </Typography>
                  <Typography variant="body1">{project.owner_id}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Status
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip
                  label={formatStatus(project.status)}
                  color={getStatusColor(project.status || "inactive")}
                  size="medium"
                />
              </Box>
              {project.is_completed && (
                <Typography variant="body2" color="success.main">
                  ✓ Project Completed
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Completion: {project.completion_percentage}%
              </Typography>
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
                    {project.total_requirements}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requirements
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(
                      project.requirements_completed,
                      project.total_requirements
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
                    {project.active_releases}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Releases
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
                <People color="info" />
                <Box flex={1}>
                  <Typography variant="h4">{project.specs_count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Specifications
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
                    {project.requirement_groups_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requirement Groups
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
            <Tab label="Releases" icon={<BugReport />} />
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
                  {project.requirements_completed}
                </Typography>
                <Typography variant="body2">Completed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h5" color="warning.main">
                  {project.total_requirements - project.requirements_completed}
                </Typography>
                <Typography variant="body2">Remaining</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h5" color="info.main">
                  {project.completion_percentage}%
                </Typography>
                <Typography variant="body2">Progress</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: "100%" }}
                onClick={() => navigate(`/projects/${id}/requirements`)}
              >
                View All Requirements
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Releases Overview
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h4" color="primary.main">
              {project.active_releases}
            </Typography>
            <Typography variant="body1">Active Releases</Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate(`/projects/${id}/releases`)}
          >
            View All Releases
          </Button>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activity tracking is not yet implemented.
          </Typography>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ProjectDetailsPage;
