import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
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
import { projectsApi, ProjectCreate, ProjectStatus } from "../api/projects.api";

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState<ProjectCreate>({
    name: "",
    description: "",
    status: ProjectStatus.PLANNING,
    start_date: "",
    end_date: "",
    team_members: [],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange =
    (field: keyof ProjectCreate) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const { [field]: removed, ...rest } = prev;
          return rest;
        });
      }
    };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Project description is required";
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          const apiErrors: Record<string, string> = {};
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
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name}
              required
              placeholder="Enter project name"
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
              helperText={errors.status}
            >
              {Object.values(ProjectStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </MenuItem>
              ))}
            </TextField>
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
              helperText={errors.description}
              placeholder="Describe the project goals, scope, and objectives"
              required
            />
          </Grid>

          {/* Timeline */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ mt: 2 }}
            >
              Timeline
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={formData.start_date}
              onChange={handleChange("start_date")}
              error={!!errors.start_date}
              helperText={errors.start_date}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={formData.end_date}
              onChange={handleChange("end_date")}
              error={!!errors.end_date}
              helperText={errors.end_date}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

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
