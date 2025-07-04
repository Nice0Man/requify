import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  Paper,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as ProjectIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  projectsApi,
  ProjectCreate,
} from "@/features/project-management/api/projects.api";
import { useAuth } from "@/features/auth/model/auth.context";

// Local interfaces for this page
interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ProjectValidation {
  validateProjectForm(data: ProjectFormData): FormErrors;
}

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Form state matching backend schema exactly
  const [formData, setFormData] = useState<ProjectCreate>({
    code: "",
    name: "",
    description: "",
    status: ProjectStatus.PLANNING, // Default status
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Handle form field changes
  const handleChange =
    (field: keyof ProjectCreate) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      
      // Apply transformations based on field type
      if (field === 'code') {
        value = ProjectValidation.code.transform(value);
      }
      
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const { [field]: removed, ...rest } = prev;
          return rest;
        });
      }
    };

  // Validate form using backend validation rules
  const validateForm = (): boolean => {
    const validationErrors = FormErrors.validateProjectForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await projectsApi.createProject(formData);

      toast.success("Project created successfully!");
      navigate(`/projects/${response.data.id}`);
    } catch (error: any) {
      console.error("Failed to create project:", error);

      // Handle API validation errors
      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const apiErrors: FormErrors = {};
          error.response.data.detail.forEach((err: any) => {
            if (err.loc && err.msg) {
              const field = err.loc[err.loc.length - 1];
              apiErrors[field] = err.msg;
            }
          });
          setErrors(apiErrors);
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error(error.message || "Failed to create project");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/projects");
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ProjectIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Create New Project
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set up a new project to manage requirements and deliverables
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Form */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Project Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Code"
              value={formData.code}
              onChange={handleChange("code")}
              error={!!errors.code}
              helperText={errors.code || "Unique identifier (letters, numbers, hyphens, underscores only)"}
              required
              placeholder="e.g., PROJ-2024"
              inputProps={{
                maxLength: ProjectValidation.code.maxLength,
                style: { textTransform: 'uppercase' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={handleChange("status")}
              error={!!errors.status}
              helperText={errors.status || "Current project status"}
              required
            >
              {Object.values(ProjectStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name || "Descriptive name for the project"}
              required
              placeholder="Enter project name"
              inputProps={{
                maxLength: ProjectValidation.name.maxLength,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={handleChange("description")}
              error={!!errors.description}
              helperText={errors.description || "Describe the project goals, scope, and objectives (optional)"}
              placeholder="Describe the project goals, scope, and objectives"
              inputProps={{
                maxLength: ProjectValidation.description.maxLength,
              }}
            />
          </Grid>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" color="error" fontWeight={600}>
                  Please fix the following errors:
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>
                      <Typography variant="body2" color="error">
                        <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {message}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Paper>
            </Grid>
          )}

          {/* Actions */}
          <Grid item xs={12}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 4 }}
            >
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProjectCreatePage;
