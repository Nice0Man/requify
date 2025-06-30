import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import { Save, Cancel, ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { projectsApi, ProjectWithStats, ProjectStatus } from "../api/projects.api";
import { getStatusColor } from "../types/project.types";
import { toast } from "react-toastify";

interface ProjectEditFormData {
  code: string;
  name: string;
  description: string;
  status: ProjectStatus;
}

const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProjectEditFormData>();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError("Project ID is required");
        setLoading(false);
        return;
      }

      const projectId = parseInt(id, 10);
      if (isNaN(projectId) || projectId <= 0) {
        setError("Invalid project ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await projectsApi.getProject(projectId);
        const projectData = response.data;
        
        setProject(projectData);
        
        // Populate form with current project data
        reset({
          code: projectData.code,
          name: projectData.name,
          description: projectData.description || "",
          status: projectData.status as ProjectStatus,
        });
      } catch (error: any) {
        console.error("Failed to fetch project:", error);
        
        let errorMessage = "Failed to load project";
        if (error?.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, reset]);

  const onSubmit = async (data: ProjectEditFormData) => {
    if (!project) return;

    setSaving(true);
    try {
      const updateData = {
        code: data.code,
        name: data.name,
        description: data.description,
        status: data.status,
      };

      await projectsApi.updateProject(project.id, updateData);
      
      toast.success("Project updated successfully");
      navigate(`/projects/${project.id}`);
    } catch (error: any) {
      console.error("Failed to update project:", error);
      
      let errorMessage = "Failed to update project";
      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((item: any) => 
            typeof item === 'string' ? item : item.msg || 'Validation error'
          ).join(", ");
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    navigate(`/projects/${id}`);
  };

  const handleBackToProjects = () => {
    navigate("/projects");
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
          onClick={handleBackToProjects}
          startIcon={<ArrowBack />}
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
          Project not found
        </Alert>
        <Button
          variant="outlined"
          onClick={handleBackToProjects}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleBackToProjects}
            startIcon={<ArrowBack />}
          >
            Back to Projects
          </Button>
          <Typography variant="h4" component="h1">
            Edit Project
          </Typography>
        </Stack>
        
        <Typography variant="subtitle1" color="text.secondary">
          Project ID: {project.id}
        </Typography>
      </Box>

      {/* Edit Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Project Code */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="code"
                  control={control}
                  rules={{
                    required: "Project code is required",
                    pattern: {
                      value: /^[A-Z0-9\-_]+$/,
                      message: "Code can only contain uppercase letters, numbers, hyphens and underscores"
                    },
                    minLength: {
                      value: 1,
                      message: "Code must be at least 1 character"
                    },
                    maxLength: {
                      value: 50,
                      message: "Code cannot exceed 50 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Code"
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      placeholder="PROJ-001"
                    />
                  )}
                />
              </Grid>

              {/* Project Status */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        {...field}
                        label="Status"
                        renderValue={(value) => (
                          <Chip
                            label={value?.charAt(0).toUpperCase() + value?.slice(1)}
                            color={getStatusColor(value)}
                            size="small"
                          />
                        )}
                      >
                        {Object.values(ProjectStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            <Chip
                              label={status.charAt(0).toUpperCase() + status.slice(1)}
                              color={getStatusColor(status)}
                              size="small"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.status.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Project Name */}
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Project name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters"
                    },
                    maxLength: {
                      value: 100,
                      message: "Name cannot exceed 100 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="Enter project name"
                    />
                  )}
                />
              </Grid>

              {/* Project Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 2000,
                      message: "Description cannot exceed 2000 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Enter project description"
                    />
                  )}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    disabled={saving || !isDirty}
                    sx={{ minWidth: 140 }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Project Stats (Read-only) */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Project Statistics (Read-only)
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Requirements
              </Typography>
              <Typography variant="h6">
                {project.total_requirements}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Completed Requirements
              </Typography>
              <Typography variant="h6">
                {project.requirements_completed}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Active Releases
              </Typography>
              <Typography variant="h6">
                {project.active_releases}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Specifications
              </Typography>
              <Typography variant="h6">
                {project.specs_count}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectEditPage; 