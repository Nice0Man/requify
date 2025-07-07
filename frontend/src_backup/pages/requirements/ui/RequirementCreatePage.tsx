import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Divider,
  Paper,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as RequirementIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type {
  RequirementCreate,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
} from "@/shared/api/types/schemas";
import { referenceApi, requirementsApi, projectsApi } from "@/shared/api/index";

interface Project {
  id: number;
  name: string;
}

// Local interface for form validation
interface FormErrors {
  [key: string]: string;
}

const RequirementCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Form state matching backend schema exactly
  const [formData, setFormData] = useState<RequirementCreate>({
    title: "",
    description: "",
    type_id: 0,
    priority_id: 0,
    status_id: 0,
    project_id: 0,
  });

  // State for form handling
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Data loading state
  const [projects, setProjects] = useState<Project[]>([]);
  const [typeOptions, setTypeOptions] = useState<RequirementType[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<RequirementPriority[]>(
    []
  );
  const [statusOptions, setStatusOptions] = useState<RequirementStatus[]>([]);

  // Load reference data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        setDataLoading(true);
        const [projectsRes, typesRes, prioritiesRes, statusesRes] =
          await Promise.all([
            projectsApi.getProjects({ limit: 100 }),
            referenceApi.getRequirementTypes(),
            referenceApi.getRequirementPriorities(),
            referenceApi.getRequirementStatuses(),
          ]);

        setProjects(projectsRes.data.items);
        setTypeOptions(typesRes.data);
        setPriorityOptions(prioritiesRes.data);
        setStatusOptions(statusesRes.data);

        // Set default status to first one available
        if (statusesRes.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            status_id: statusesRes.data[0].id,
          }));
        }
      } catch (error) {
        toast.error("Failed to load form data");
        console.error("Failed to load form data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle form field changes
  const handleChange =
    (field: keyof RequirementCreate) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: field.endsWith("_id") ? parseInt(value, 10) || 0 : value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.project_id) {
      newErrors.project_id = "Project is required";
    }

    if (!formData.type_id) {
      newErrors.type_id = "Type is required";
    }

    if (!formData.priority_id) {
      newErrors.priority_id = "Priority is required";
    }

    if (!formData.status_id) {
      newErrors.status_id = "Status is required";
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
      const response = await requirementsApi.createRequirement(formData);

      toast.success("Requirement created successfully!");
      navigate(`/requirements/${response.data.id}`);
    } catch (error) {
      // Extract error message and field errors
      const errorMessage = referenceApi.extractErrorMessage(
        error,
        "Failed to create requirement"
      );
      const fieldErrs = referenceApi.extractFieldErrors(error);

      if (Object.keys(fieldErrs).length > 0) {
        setErrors(fieldErrs);
      } else {
        toast.error(errorMessage);
      }

      console.error("Failed to create requirement:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/requirements");
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
            <RequirementIcon sx={{ color: "white", fontSize: 24 }} />
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
              Create New Requirement
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Define a new project requirement with detailed specifications
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Requirement Title"
              value={formData.title}
              onChange={handleChange("title")}
              error={!!errors.title}
              helperText={errors.title}
              required
              placeholder="Enter a clear and concise requirement title"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Project"
              value={formData.project_id}
              onChange={handleChange("project_id")}
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
              label="Priority"
              value={formData.priority_id}
              onChange={handleChange("priority_id")}
              error={!!errors.priority_id}
              helperText={errors.priority_id}
              required
            >
              <MenuItem value={0}>Select priority</MenuItem>
              {priorityOptions.map((priority) => (
                <MenuItem key={priority.id} value={priority.id}>
                  {priority.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type_id}
              onChange={handleChange("type_id")}
              error={!!errors.type_id}
              helperText={errors.type_id}
              required
            >
              <MenuItem value={0}>Select type</MenuItem>
              {typeOptions.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status_id}
              onChange={handleChange("status_id")}
              error={!!errors.status_id}
              helperText={errors.status_id}
              required
            >
              <MenuItem value={0}>Select status</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Description"
              value={formData.description}
              onChange={handleChange("description")}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Provide a detailed description of what needs to be implemented"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Deadline"
              value={formData.deadline || ""}
              onChange={handleChange("deadline")}
              error={!!errors.deadline}
              helperText={errors.deadline}
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
                startIcon={<SaveIcon />}
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
                {loading ? "Creating..." : "Create Requirement"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RequirementCreatePage;
