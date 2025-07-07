import React, { useState, useEffect } from "react";
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
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  RocketLaunch as ReleaseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { releasesApi, requirementsApi, projectsApi } from "@/shared/api/index";
import type { ReleaseCreate, ReleaseStatus } from "@/shared/api/types/schemas";
import {
  extractErrorMessage,
  extractFieldErrors,
  clearFieldError,
  FormErrors,
} from "@/shared/utils/errorHandler";
import { Requirement } from '@/entities/requirement/model/types';
import { Project } from '@/entities/project/model/types';

const ReleaseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState<ReleaseCreate>({
    name: "",
    version: "",
    description: "",
    project_id: 0,
    status: ReleaseStatus.PLANNED,
    planned_date: "",
    release_date: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<
    Requirement[]
  >([]);

  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectsApi.getProjects({ limit: 100 });
        setProjects(response.data.items);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, []);

  // Load requirements when project is selected
  useEffect(() => {
    const loadRequirements = async () => {
      if (formData.project_id) {
        try {
          const response = await requirementsApi.getRequirements({
            project_id: formData.project_id,
            limit: 1000,
          });
          setRequirements(response.data.items);
        } catch (error) {
          console.error("Failed to load requirements:", error);
        }
      } else {
        setRequirements([]);
        setSelectedRequirements([]);
      }
    };
    loadRequirements();
  }, [formData.project_id]);

  // Handle form field changes
  const handleChange =
    (field: keyof ReleaseCreate) =>
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

  // Handle project selection
  const handleProjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const projectId = parseInt(event.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      project_id: projectId,
    }));
    setSelectedRequirements([]);
  };

  // Handle requirements selection
  const handleRequirementsChange = (_event: any, newValue: Requirement[]) => {
    setSelectedRequirements(newValue);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Release name is required";
    }

    if (!formData.version.trim()) {
      newErrors.version = "Version is required";
    }

    if (!formData.project_id) {
      newErrors.project_id = "Project is required";
    }

    if (formData.planned_date) {
      const plannedDate = new Date(formData.planned_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (plannedDate < today) {
        newErrors.planned_date = "Planned date cannot be in the past";
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
      const response = await releasesApi.createRelease(formData);

      toast.success("Release created successfully!");
      navigate(`/releases/${response.data.id}`);
    } catch (error) {
      // Extract error message and field errors
      const errorMessage = extractErrorMessage(
        error,
        "Failed to create release"
      );
      const fieldErrs = extractFieldErrors(error);

      if (Object.keys(fieldErrs).length > 0) {
        setErrors(fieldErrs as Record<string, string>);
      } else {
        toast.error(errorMessage);
      }

      console.error("Failed to create release:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/releases");
  };

  const selectedProject = projects.find((p) => p.id === formData.project_id);

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
            <ReleaseIcon sx={{ color: "white", fontSize: 24 }} />
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
              Create New Release
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Plan and manage a new product release
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
              label="Release Name"
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name}
              required
              placeholder="Enter release name"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Version"
              value={formData.version}
              onChange={handleChange("version")}
              error={!!errors.version}
              helperText={errors.version}
              required
              placeholder="e.g., 1.0.0, v2.1.3"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Project"
              value={formData.project_id}
              onChange={handleProjectChange}
              error={!!errors.project_id}
              helperText={errors.project_id}
              required
            >
              <MenuItem value={0}>Select a project</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
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
              <MenuItem value={ReleaseStatus.DRAFT}>Draft</MenuItem>
              <MenuItem value={ReleaseStatus.PLANNED}>Planned</MenuItem>
              <MenuItem value={ReleaseStatus.PLANNING}>Planning</MenuItem>
              <MenuItem value={ReleaseStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={ReleaseStatus.TESTING}>Testing</MenuItem>
              <MenuItem value={ReleaseStatus.READY}>Ready</MenuItem>
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
              placeholder="Describe the release goals and key features"
            />
          </Grid>

          {/* Requirements Selection */}
          {selectedProject && (
            <>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Requirements
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={requirements}
                  getOptionLabel={(option) => option.title}
                  value={selectedRequirements}
                  onChange={handleRequirementsChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option.title}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Requirements"
                      placeholder="Choose requirements for this release"
                      helperText={`${selectedRequirements.length} requirements selected`}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          {/* Schedule */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ mt: 2 }}
            >
              Schedule
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Planned Release Date"
              value={formData.planned_date}
              onChange={handleChange("planned_date")}
              error={!!errors.planned_date}
              helperText={errors.planned_date}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Actual Release Date"
              value={formData.release_date}
              onChange={handleChange("release_date")}
              error={!!errors.release_date}
              helperText={errors.release_date}
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
                {loading ? "Creating..." : "Create Release"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReleaseCreatePage;
