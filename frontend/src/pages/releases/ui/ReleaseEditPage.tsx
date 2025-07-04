import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Stack,
  Chip,
  useTheme,
  alpha,
  Divider,
  FormHelperText,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Warning,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { releasesApi } from "@/features/release-management/api/releases.api";
import { Release, ReleaseUpdate, ReleaseStatus } from "@/entities/release/model/types";
import { projectsApi } from "@/features/project-management/api/projects.api";
import { Project } from "@/entities/project/model/types";

const ReleaseEditPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const releaseId = parseInt(id || "0");

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [release, setRelease] = useState<Release | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    version: "",
    description: "",
    status: "planning",
    planned_date: "",
    release_date: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load release data
  useEffect(() => {
    if (releaseId) {
      loadRelease();
    }
  }, [releaseId]);

  const loadRelease = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await releasesApi.getRelease(releaseId);
      const releaseData = response.data;
      setRelease(releaseData);

      // Set form values
      setFormValues({
        name: releaseData.name || "",
        version: releaseData.version || "",
        description: releaseData.description || "",
        status: releaseData.status || "planning",
        planned_date: releaseData.planned_date
          ? new Date(releaseData.planned_date).toISOString().split("T")[0]
          : "",
        release_date: releaseData.release_date
          ? new Date(releaseData.release_date).toISOString().split("T")[0]
          : "",
      });

      // Load project data
      if (releaseData.project_id) {
        try {
          const projectResponse = await projectsApi.getProject(
            releaseData.project_id
          );
          setProject(projectResponse.data as any);
        } catch (err) {
          console.warn("Failed to load project data:", err);
        }
      }
    } catch (err: any) {
      console.error("Failed to load release:", err);
      setError(err.message || "Failed to load release");
      toast.error("Failed to load release");
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        if (value.length > 100) return "Name must not exceed 100 characters";
        return "";
      case "version":
        if (!value.trim()) return "Version is required";
        if (value.length > 50) return "Version must not exceed 50 characters";
        const versionPattern =
          /^(\d+\.\d+\.\d+|\d+\.\d+|v\d+\.\d+\.\d+|v\d+\.\d+|\d+\.\d+\.\d+-\w+|v\d+\.\d+\.\d+-\w+)$/;
        if (!versionPattern.test(value)) {
          return "Invalid version format. Use formats like 1.0.0, v1.0.0, 1.0.0-alpha, etc.";
        }
        return "";
      case "description":
        if (value.length > 2000)
          return "Description must not exceed 2000 characters";
        return "";
      case "status":
        if (!value) return "Status is required";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    Object.keys(formValues).forEach((key) => {
      const error = validateField(
        key,
        formValues[key as keyof typeof formValues]
      );
      if (error) {
        errors[key] = error;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(
      name,
      formValues[name as keyof typeof formValues]
    );
    if (error) {
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const updateData: ReleaseUpdate = {
        name: formValues.name,
        version: formValues.version,
        description: formValues.description || undefined,
        status: formValues.status,
        planned_date: formValues.planned_date
          ? formValues.planned_date
          : undefined,
        release_date: formValues.release_date
          ? formValues.release_date
          : undefined,
      };

      await releasesApi.updateRelease(releaseId, updateData);

      toast.success("Release updated successfully");
      navigate(`/releases/${releaseId}`);
    } catch (err: any) {
      console.error("Failed to update release:", err);
      toast.error(err.message || "Failed to update release");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/releases/${releaseId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "info";
      case "in_progress":
        return "warning";
      case "ready":
        return "success";
      case "released":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planning":
        return <Warning />;
      case "in_progress":
        return <Warning />;
      case "ready":
        return <CheckCircle />;
      case "released":
        return <CheckCircle />;
      case "cancelled":
        return <Error />;
      default:
        return <Warning />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading release...
        </Typography>
      </Box>
    );
  }

  if (error || !release) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Release not found"}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/releases")}
        >
          Back to Releases
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleCancel}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              Edit Release
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {release.name} v{release.version}
            </Typography>
          </Box>

          <Chip
            icon={getStatusIcon(release.status)}
            label={release.status.replace("_", " ")}
            color={getStatusColor(release.status) as any}
            sx={{
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          />
        </Stack>

        {project && (
          <Typography variant="body2" color="text.secondary">
            Project: {project.name} ({project.code})
          </Typography>
        )}
      </Box>

      {/* Edit Form */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Release Name"
                  value={formValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  error={touched.name && Boolean(formErrors.name)}
                  helperText={touched.name && formErrors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="version"
                  name="version"
                  label="Version"
                  value={formValues.version}
                  onChange={(e) => handleChange("version", e.target.value)}
                  onBlur={() => handleBlur("version")}
                  error={touched.version && Boolean(formErrors.version)}
                  helperText={
                    (touched.version && formErrors.version) ||
                    "Format: 1.0.0, v1.0.0, 1.0.0-alpha"
                  }
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formValues.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  error={touched.description && Boolean(formErrors.description)}
                  helperText={
                    (touched.description && formErrors.description) ||
                    "Optional description of the release"
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Status and Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Status and Scheduling
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formValues.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    onBlur={() => handleBlur("status")}
                    error={touched.status && Boolean(formErrors.status)}
                    label="Status"
                  >
                    <MenuItem value="planning">Planning</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="released">Released</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                  {touched.status && formErrors.status && (
                    <FormHelperText error>{formErrors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="planned_date"
                  name="planned_date"
                  label="Planned Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formValues.planned_date}
                  onChange={(e) => handleChange("planned_date", e.target.value)}
                  onBlur={() => handleBlur("planned_date")}
                  error={
                    touched.planned_date && Boolean(formErrors.planned_date)
                  }
                  helperText={
                    (touched.planned_date && formErrors.planned_date) ||
                    "Target release date"
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="release_date"
                  name="release_date"
                  label="Release Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formValues.release_date}
                  onChange={(e) => handleChange("release_date", e.target.value)}
                  onBlur={() => handleBlur("release_date")}
                  error={
                    touched.release_date && Boolean(formErrors.release_date)
                  }
                  helperText={
                    (touched.release_date && formErrors.release_date) ||
                    "Actual release date"
                  }
                />
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={saving || Object.keys(formErrors).length > 0}
                    sx={{ borderRadius: 2 }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReleaseEditPage;
