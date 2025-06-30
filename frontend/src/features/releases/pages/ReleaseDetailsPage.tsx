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

  // State
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loadingRequirements, setLoadingRequirements] = useState(false);

  // Load release data
  useEffect(() => {
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
        setRelease(null);
      } finally {
        setLoading(false);
      }
    };

    loadRelease();
  }, [id]);

  // Load release requirements
  useEffect(() => {
    const loadRequirements = async () => {
      if (!release) return;

      try {
        setLoadingRequirements(true);
        const response = await releasesApi.getReleaseRequirements(release.id, {
          limit: 100,
        });
        setRequirements(response.data || []);
      } catch (err: any) {
        console.error("Failed to load release requirements:", err);
        setRequirements([]);
      } finally {
        setLoadingRequirements(false);
      }
    };

    loadRequirements();
  }, [release]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  // Handle edit
  const handleEdit = () => {
    navigate(`/releases/${release?.id}/edit`);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!release) return;

    if (
      window.confirm(
        `Are you sure you want to delete release "${release.name}"?`
      )
    ) {
      try {
        await releasesApi.deleteRelease(release.id);
        toast.success("Release deleted successfully");
        navigate("/releases");
      } catch (error) {
        toast.error("Failed to delete release");
        console.error("Failed to delete release:", error);
      }
    }
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

                {loadingRequirements ? (
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
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Timeline
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Timeline data will be loaded from the API.
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Documentation
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Documentation will be loaded from the API.
                </Typography>
              </Box>
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
                  variant="outlined"
                  startIcon={<PublishIcon />}
                  fullWidth
                  disabled={release.status === ReleaseStatus.RELEASED}
                >
                  Publish Release
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  fullWidth
                >
                  Generate Specification
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarTodayIcon />}
                  fullWidth
                >
                  View Changelog
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
