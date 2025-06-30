import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Stack,
  useTheme,
  alpha,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RocketLaunch as RocketLaunchIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Publish as PublishIcon,
  Sync,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { releasesApi, Release, ReleaseStatus } from "../api/releases.api";
import { LoadingSpinner } from "@/shared/components";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`release-tabpanel-${index}`}
      aria-labelledby={`release-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReleaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [release, setRelease] = useState<Release | null>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [changelog, setChangelog] = useState<string>("");
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loadingChangelog, setLoadingChangelog] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  useEffect(() => {
    if (id) {
      loadRelease();
      loadRequirements();
    }
  }, [id]);

  // Load release data
  const loadRelease = async () => {
    if (!id) {
      setError("Release ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const releaseId = parseInt(id, 10);
      if (isNaN(releaseId) || releaseId <= 0) {
        setError(
          `Invalid release ID: "${id}". Please check the URL and try again.`
        );
        setLoading(false);
        return;
      }

      const response = await releasesApi.getRelease(releaseId);
      setRelease(response.data);
    } catch (err: any) {
      console.error("Failed to load release:", err);
      let errorMessage = "Failed to load release details";

      if (err?.response?.status === 404) {
        errorMessage = "Release not found";
      } else if (err?.message) {
        errorMessage = String(err.message);
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load release requirements
  const loadRequirements = async () => {
    if (!id) return;

    try {
      const releaseId = parseInt(id, 10);
      const response = await releasesApi.getReleaseRequirements(releaseId);
      setRequirements(response.data || []);
    } catch (err: any) {
      console.error("Failed to load release requirements:", err);
      setRequirements([]);
    }
  };

  // Load changelog data
  const loadChangelog = async () => {
    if (!id || !release) return;

    try {
      setLoadingChangelog(true);
      const releaseId = parseInt(id, 10);
      const response = await releasesApi.getReleaseChangelog(releaseId);
      setChangelog(response.data.changelog || "No changelog available.");
    } catch (err: any) {
      console.error("Failed to load changelog:", err);
      setChangelog("Failed to load changelog data.");
    } finally {
      setLoadingChangelog(false);
    }
  };

  // Generate and load specifications
  const loadSpecifications = async () => {
    if (!id || !release) return;

    try {
      setLoadingSpecs(true);
      // For now, we'll simulate specifications data
      // In a real implementation, you might have a separate endpoint for listing specs
      setSpecifications([
        {
          id: 1,
          name: `${release.name} v${release.version} Specification`,
          format: "PDF",
          status: "generated",
          generated_at: new Date().toISOString(),
          download_url: "#",
        },
      ]);
    } catch (err: any) {
      console.error("Failed to load specifications:", err);
      setSpecifications([]);
    } finally {
      setLoadingSpecs(false);
    }
  };

  // Handle tab change and load data as needed
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Load data for specific tabs
    if (newValue === 2 && changelog === "") {
      loadChangelog();
    } else if (newValue === 3 && specifications.length === 0) {
      loadSpecifications();
    }
  };

  // Handle edit action
  const handleEdit = async () => {
    if (!release) return;

    try {
      // Navigate to edit page or open edit dialog
      navigate(`/releases/edit/${release.id}`);
    } catch (error) {
      console.error("Failed to navigate to edit:", error);
    }
  };

  // Handle delete action (soft delete)
  const handleDelete = async () => {
    if (!release) return;

    if (
      window.confirm(
        `Are you sure you want to delete release "${release.name}"? This will mark it as deleted but not permanently remove it.`
      )
    ) {
      try {
        await releasesApi.deleteRelease(release.id);
        toast.success("Release marked as deleted successfully");
        navigate("/releases");
      } catch (error) {
        toast.error("Failed to delete release");
        console.error("Failed to delete release:", error);
      }
    }
  };

  // Handle publish action
  const handlePublish = async () => {
    if (!release) return;

    if (
      window.confirm(
        `Are you sure you want to publish release "${release.name}" v${release.version}?`
      )
    ) {
      try {
        const publishData = {
          changelog: `Release ${release.version} published`,
          notification_recipients: [],
        };
        await releasesApi.publishRelease(release.id, publishData);
        toast.success("Release published successfully");
        loadRelease(); // Reload to get updated status
      } catch (error) {
        toast.error("Failed to publish release");
        console.error("Failed to publish release:", error);
      }
    }
  };

  // Handle sync requirements
  const handleSyncRequirements = async () => {
    if (!release) return;

    try {
      const syncData = {
        project_id: release.project_id,
      };
      const response = await releasesApi.syncProjectRequirementsToRelease(
        release.id,
        syncData
      );
      toast.success(
        `Synced ${response.data.synced_requirements} requirements successfully`
      );
      loadRequirements(); // Reload requirements
    } catch (error) {
      toast.error("Failed to sync requirements");
      console.error("Failed to sync requirements:", error);
    }
  };

  // Handle generate specification
  const handleGenerateSpecification = async () => {
    if (!release) return;

    try {
      const specData = {
        format: "pdf" as const,
        language: "ru" as const,
        include_requirements: true,
        include_relationships: true,
        include_changelog: true,
        include_statistics: true,
        template_style: "standard" as const,
        auto_numbering: true,
      };
      const response = await releasesApi.generateReleaseSpecification(
        release.id,
        specData
      );
      toast.success("Specification generated successfully");

      // Open download URL if available
      if (response.data.download_url) {
        window.open(response.data.download_url, "_blank");
      }

      // Reload specifications
      loadSpecifications();
    } catch (error) {
      toast.error("Failed to generate specification");
      console.error("Failed to generate specification:", error);
    }
  };

  // Get status color and icon
  const getStatusColor = (status: string) => {
    switch (status) {
      case ReleaseStatus.PLANNING:
      case ReleaseStatus.PLANNED:
        return theme.palette.info.main;
      case ReleaseStatus.IN_PROGRESS:
        return theme.palette.warning.main;
      case ReleaseStatus.TESTING:
        return theme.palette.secondary.main;
      case ReleaseStatus.READY:
        return theme.palette.primary.main;
      case ReleaseStatus.RELEASED:
        return theme.palette.success.main;
      case ReleaseStatus.CANCELLED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ReleaseStatus.PLANNING:
      case ReleaseStatus.PLANNED:
        return <ScheduleIcon />;
      case ReleaseStatus.IN_PROGRESS:
        return <PlayArrowIcon />;
      case ReleaseStatus.TESTING:
        return <TimelineIcon />;
      case ReleaseStatus.READY:
        return <CheckCircleIcon />;
      case ReleaseStatus.RELEASED:
        return <RocketLaunchIcon />;
      case ReleaseStatus.CANCELLED:
        return <ErrorIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  // Handle navigation back
  const handleBack = () => {
    navigate("/releases");
  };

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  // Error state
  if (error || !release) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ||
            "Release not found. Please check the release ID and try again."}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
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
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              {release.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Version {release.version}
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size="small"
            >
              Delete
            </Button>
          </Box>
        </Stack>

        <Chip
          icon={getStatusIcon(release.status)}
          label={release.status.replace("_", " ")}
          sx={{
            backgroundColor: alpha(getStatusColor(release.status), 0.1),
            color: getStatusColor(release.status),
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        />
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Main Content */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="release tabs"
              >
                <Tab label="Overview" />
                <Tab label="Requirements" />
                <Tab label="Timeline" />
                <Tab label="Documentation" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {release.description || "No description provided."}
                </Typography>

                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Release Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Project ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {release.project_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={500}
                      sx={{ textTransform: "capitalize" }}
                    >
                      {release.status.replace("_", " ")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Planned Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {release.planned_date
                        ? new Date(release.planned_date).toLocaleDateString()
                        : "Not set"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Release Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {release.release_date
                        ? new Date(release.release_date).toLocaleDateString()
                        : "Not released yet"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Requirements ({requirements.length})
                </Typography>

                {loadingChangelog ? (
                  <LinearProgress sx={{ my: 2 }} />
                ) : requirements.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requirements.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.id}</TableCell>
                          <TableCell>{req.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={req.status || "Unknown"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={req.priority || "Unknown"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Requirement">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(`/requirements/${req.id}`)
                                }
                              >
                                <AssignmentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    py={4}
                  >
                    No requirements linked to this release yet.
                  </Typography>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Timeline
              </Typography>
              {loadingChangelog ? (
                <LinearProgress sx={{ my: 2 }} />
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Release Changelog
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                      {changelog}
                    </Typography>
                  </Paper>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={loadChangelog}
                    disabled={loadingChangelog}
                  >
                    Refresh Timeline
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Timeline
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  {loadingChangelog ? "Loading changelog..." : changelog}
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Documentation
              </Typography>
              {loadingSpecs ? (
                <LinearProgress sx={{ my: 2 }} />
              ) : (
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="body1">
                      Specifications & Documentation
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGenerateSpecification}
                      disabled={loadingSpecs}
                    >
                      Generate New Specification
                    </Button>
                  </Box>

                  {specifications.length > 0 ? (
                    <Grid container spacing={2}>
                      {specifications.map((spec) => (
                        <Grid item xs={12} md={6} key={spec.id}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" sx={{ mb: 1 }}>
                                {spec.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                Format: {spec.format}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                              >
                                Generated:{" "}
                                {new Date(spec.generated_at).toLocaleString()}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    window.open(spec.download_url, "_blank")
                                  }
                                >
                                  Download
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() =>
                                    window.open(
                                      spec.preview_url || spec.download_url,
                                      "_blank"
                                    )
                                  }
                                >
                                  Preview
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Paper
                      sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No specifications generated yet. Click "Generate New
                        Specification" to create one.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
            </TabPanel>
          </Card>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Release Details Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              mb: 3,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <RocketLaunchIcon color="primary" fontSize="small" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  Release Details
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Created
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(release.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(release.updated_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Version
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  fontFamily="monospace"
                >
                  {release.version}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: "1.1rem", mb: 2 }}
              >
                Actions
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  fullWidth
                  onClick={handleEdit}
                >
                  Edit Release
                </Button>

                {release.status === "ready" && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PublishIcon />}
                    fullWidth
                    disabled={
                      release.status === "ready" ||
                      release.status === "released" ||
                      release.status === "archived"
                    }
                    onClick={handlePublish}
                  >
                    Publish Release
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={<Sync />}
                  fullWidth
                  onClick={handleSyncRequirements}
                >
                  Sync Requirements
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  fullWidth
                  onClick={handleGenerateSpecification}
                >
                  Generate Specification
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  fullWidth
                  onClick={loadChangelog}
                >
                  Refresh Changelog
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  fullWidth
                  onClick={handleDelete}
                >
                  Delete Release
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReleaseDetailsPage;
