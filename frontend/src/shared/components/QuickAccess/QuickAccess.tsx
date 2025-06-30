import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert,
  FolderOpen,
  Assignment,
  Group,
  Schedule,
  Warning,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  QuickProject,
  QuickRequirement,
  PendingApproval,
} from "@/features/dashboard/api/dashboard.api";

export interface QuickAccessProps {
  projects: QuickProject[];
  requirements: QuickRequirement[];
  approvals: PendingApproval[];
  loading?: boolean;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({
  projects,
  requirements,
  approvals,
  loading = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getHealthColor = (health: string) => {
    switch (health) {
      case "good":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "critical":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "good":
        return <CheckCircle fontSize="small" />;
      case "warning":
        return <Warning fontSize="small" />;
      case "critical":
        return <Error fontSize="small" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return theme.palette.error.main;
      case "high":
        return theme.palette.warning.main;
      case "medium":
        return theme.palette.info.main;
      case "low":
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <CardHeader title={<Skeleton variant="text" width="60%" />} />
              <CardContent>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* My Projects */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            height: "100%",
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <FolderOpen color="primary" fontSize="small" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  My Projects
                </Typography>
              </Box>
            }
            action={
              <IconButton size="small" onClick={() => navigate("/projects")}>
                <MoreVert />
              </IconButton>
            }
            sx={{ pb: 1 }}
          />
          <CardContent sx={{ pt: 0 }}>
            {projects.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={3}
              >
                <FolderOpen
                  sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }}
                />
                <Typography
                  color="text.secondary"
                  variant="body2"
                  align="center"
                >
                  No projects assigned
                </Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {projects.slice(0, 3).map((project) => (
                  <Card
                    key={project.id}
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={1}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {project.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {getHealthIcon(project.health_score)}
                          <Typography
                            variant="caption"
                            sx={{ color: getHealthColor(project.health_score) }}
                          >
                            {project.health_score}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        {project.code}
                      </Typography>

                      <Box mb={1}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.5}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {project.completion_percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.completion_percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Group fontSize="small" color="action" />
                          <Typography variant="caption">
                            {project.team_size}
                          </Typography>
                          <Assignment fontSize="small" color="action" />
                          <Typography variant="caption">
                            {project.requirements_count}
                          </Typography>
                        </Box>
                        <Chip
                          label={project.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* My Requirements */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            height: "100%",
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Assignment color="secondary" fontSize="small" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  My Requirements
                </Typography>
              </Box>
            }
            action={
              <IconButton
                size="small"
                onClick={() => navigate("/requirements")}
              >
                <MoreVert />
              </IconButton>
            }
            sx={{ pb: 1 }}
          />
          <CardContent sx={{ pt: 0 }}>
            {requirements.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={3}
              >
                <Assignment
                  sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }}
                />
                <Typography
                  color="text.secondary"
                  variant="body2"
                  align="center"
                >
                  No requirements assigned
                </Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {requirements.slice(0, 4).map((requirement) => (
                  <Card
                    key={requirement.id}
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.secondary.main,
                          0.04
                        ),
                        borderColor: theme.palette.secondary.main,
                      },
                    }}
                    onClick={() => navigate(`/requirements/${requirement.id}`)}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={1}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, flex: 1, mr: 1 }}
                        >
                          {requirement.title}
                        </Typography>
                        <Chip
                          label={requirement.priority_name}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            backgroundColor: alpha(
                              getPriorityColor(requirement.priority_name),
                              0.1
                            ),
                            color: getPriorityColor(requirement.priority_name),
                            border: `1px solid ${alpha(
                              getPriorityColor(requirement.priority_name),
                              0.2
                            )}`,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        {requirement.project_name}
                      </Typography>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Chip
                          label={requirement.status_name}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                        {requirement.deadline && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Schedule fontSize="small" color="action" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(
                                requirement.deadline
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Approvals */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            height: "100%",
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Schedule color="warning" fontSize="small" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  Pending Approvals
                </Typography>
              </Box>
            }
            action={
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            }
            sx={{ pb: 1 }}
          />
          <CardContent sx={{ pt: 0 }}>
            {approvals.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={3}
              >
                <CheckCircle
                  sx={{
                    fontSize: 48,
                    color: theme.palette.success.main,
                    mb: 1,
                  }}
                />
                <Typography
                  color="text.secondary"
                  variant="body2"
                  align="center"
                >
                  All caught up!
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  align="center"
                >
                  No pending approvals
                </Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {approvals.slice(0, 4).map((approval) => (
                  <Card
                    key={approval.id}
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.warning.main,
                          0.04
                        ),
                        borderColor: theme.palette.warning.main,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={1}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, flex: 1, mr: 1 }}
                        >
                          {approval.title}
                        </Typography>
                        <Chip
                          label={approval.urgency}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            backgroundColor: alpha(
                              getUrgencyColor(approval.urgency),
                              0.1
                            ),
                            color: getUrgencyColor(approval.urgency),
                            border: `1px solid ${alpha(
                              getUrgencyColor(approval.urgency),
                              0.2
                            )}`,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        {approval.type} • {approval.requested_by}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {new Date(approval.requested_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
