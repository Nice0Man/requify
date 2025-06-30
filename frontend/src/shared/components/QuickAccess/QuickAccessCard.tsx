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
  Button,
  Fade,
  Stack,
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
  TrendingUp,
  Person,
  ArrowForward,
  Circle,
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

  const cardStyle = {
    borderRadius: 4,
    boxShadow: `0 8px 32px -8px ${alpha(theme.palette.common.black, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    background: theme.palette.background.paper,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    height: "100%",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "1px",
      background: `linear-gradient(90deg, transparent, ${alpha(
        theme.palette.common.white,
        0.8
      )}, transparent)`,
      zIndex: 1,
    },
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={cardStyle}>
              <CardHeader
                title={<Skeleton variant="text" width="60%" height={28} />}
                sx={{ pb: 2 }}
              />
              <CardContent sx={{ pt: 0 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} sx={{ mb: 3 }}>
                    <Skeleton
                      variant="rectangular"
                      height={80}
                      sx={{ borderRadius: 2, mb: 1 }}
                    />
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
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
        <Card sx={cardStyle}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}, ${alpha(theme.palette.primary.main, 0.05)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  }}
                >
                  <FolderOpen color="primary" fontSize="small" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  My Projects
                </Typography>
              </Box>
            }
            action={
              <IconButton
                size="small"
                onClick={() => navigate("/projects")}
                sx={{
                  color: theme.palette.action.active,
                  opacity: 0.6,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: alpha(theme.palette.action.active, 0.08),
                  },
                }}
              >
                <MoreVert />
              </IconButton>
            }
            sx={{ pb: 2 }}
          />
          <CardContent sx={{ pt: 0, pb: 3 }}>
            {projects.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={4}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.grey[400],
                      0.1
                    )}, ${alpha(theme.palette.grey[400], 0.05)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <FolderOpen
                    sx={{ fontSize: 24, color: theme.palette.grey[400] }}
                  />
                </Box>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  align="center"
                  sx={{ fontWeight: 500 }}
                >
                  No projects assigned
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {projects.slice(0, 3).map((project, index) => (
                  <Fade
                    key={project.id}
                    in={true}
                    timeout={300 + index * 100}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        transition:
                          "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.06
                        )}`,
                        borderRadius: 3,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.02
                          ),
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          transform: "translateY(-2px)",
                          boxShadow: `0 8px 25px -8px ${alpha(
                            theme.palette.primary.main,
                            0.25
                          )}`,
                        },
                      }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          <Box flex={1}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                fontSize: "0.95rem",
                                lineHeight: 1.3,
                              }}
                            >
                              {project.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.text.secondary,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                              }}
                            >
                              {project.code}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {getHealthIcon(project.health_score)}
                            <Circle
                              sx={{
                                fontSize: 8,
                                color: getHealthColor(project.health_score),
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Progress Bar */}
                        <Box mb={2}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              Progress
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
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
                                theme.palette.divider,
                                0.1
                              ),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                              },
                            }}
                          />
                        </Box>

                        {/* Stats */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Group
                              sx={{
                                fontSize: 14,
                                color: theme.palette.text.secondary,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {project.team_size} members
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Assignment
                              sx={{
                                fontSize: 14,
                                color: theme.palette.text.secondary,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {project.requirements_count} requirements
                            </Typography>
                          </Box>
                        </Box>

                        {project.next_milestone && (
                          <Box
                            mt={2}
                            pt={2}
                            borderTop={`1px solid ${alpha(
                              theme.palette.divider,
                              0.06
                            )}`}
                          >
                            <Typography
                              variant="caption"
                              color="primary.main"
                              sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                            >
                              Next: {project.next_milestone}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>
                ))}

                {projects.length > 3 && (
                  <Button
                    variant="text"
                    onClick={() => navigate("/projects")}
                    endIcon={<ArrowForward />}
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      textTransform: "none",
                      justifyContent: "center",
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.08
                        ),
                      },
                    }}
                  >
                    View All Projects
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* My Requirements */}
      <Grid item xs={12} md={4}>
        <Card sx={cardStyle}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.secondary.main,
                      0.1
                    )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${alpha(
                      theme.palette.secondary.main,
                      0.2
                    )}`,
                  }}
                >
                  <Assignment color="secondary" fontSize="small" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  My Requirements
                </Typography>
              </Box>
            }
            action={
              <IconButton
                size="small"
                onClick={() => navigate("/requirements")}
                sx={{
                  color: theme.palette.action.active,
                  opacity: 0.6,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: alpha(theme.palette.action.active, 0.08),
                  },
                }}
              >
                <MoreVert />
              </IconButton>
            }
            sx={{ pb: 2 }}
          />
          <CardContent sx={{ pt: 0, pb: 3 }}>
            {requirements.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={4}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.grey[400],
                      0.1
                    )}, ${alpha(theme.palette.grey[400], 0.05)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Assignment
                    sx={{ fontSize: 24, color: theme.palette.grey[400] }}
                  />
                </Box>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  align="center"
                  sx={{ fontWeight: 500 }}
                >
                  No requirements assigned
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {requirements.slice(0, 3).map((requirement, index) => (
                  <Fade
                    key={requirement.id}
                    in={true}
                    timeout={300 + index * 100}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        transition:
                          "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.06
                        )}`,
                        borderRadius: 3,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.secondary.main,
                            0.02
                          ),
                          borderColor: alpha(theme.palette.secondary.main, 0.3),
                          transform: "translateY(-2px)",
                          boxShadow: `0 8px 25px -8px ${alpha(
                            theme.palette.secondary.main,
                            0.25
                          )}`,
                        },
                      }}
                      onClick={() =>
                        navigate(`/requirements/${requirement.id}`)
                      }
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              flex: 1,
                              fontSize: "0.875rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {requirement.title}
                          </Typography>
                          <Chip
                            label={requirement.priority_name}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              backgroundColor: alpha(
                                getPriorityColor(requirement.priority_name),
                                0.12
                              ),
                              color: getPriorityColor(
                                requirement.priority_name
                              ),
                              border: `1px solid ${alpha(
                                getPriorityColor(requirement.priority_name),
                                0.2
                              )}`,
                              textTransform: "capitalize",
                              ml: 1,
                            }}
                          />
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            mb: 2,
                            display: "block",
                          }}
                        >
                          {requirement.project_name}
                        </Typography>

                        {/* Progress */}
                        <Box mb={2}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              Progress
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                            >
                              {requirement.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={requirement.progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(
                                theme.palette.divider,
                                0.1
                              ),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                              },
                            }}
                          />
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Chip
                            label={requirement.status_name.replace("_", " ")}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: alpha(
                                theme.palette.info.main,
                                0.12
                              ),
                              color: theme.palette.info.main,
                              border: `1px solid ${alpha(
                                theme.palette.info.main,
                                0.2
                              )}`,
                              textTransform: "capitalize",
                            }}
                          />

                          {requirement.deadline && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Schedule
                                sx={{
                                  fontSize: 14,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.75rem" }}
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
                  </Fade>
                ))}

                {requirements.length > 3 && (
                  <Button
                    variant="text"
                    onClick={() => navigate("/requirements")}
                    endIcon={<ArrowForward />}
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      textTransform: "none",
                      justifyContent: "center",
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.secondary.main,
                          0.08
                        ),
                      },
                    }}
                  >
                    View All Requirements
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Approvals */}
      <Grid item xs={12} md={4}>
        <Card sx={cardStyle}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.warning.main,
                      0.1
                    )}, ${alpha(theme.palette.warning.main, 0.05)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${alpha(
                      theme.palette.warning.main,
                      0.2
                    )}`,
                  }}
                >
                  <Schedule color="warning" fontSize="small" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Pending Approvals
                </Typography>
              </Box>
            }
            action={
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.action.active,
                  opacity: 0.6,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: alpha(theme.palette.action.active, 0.08),
                  },
                }}
              >
                <MoreVert />
              </IconButton>
            }
            sx={{ pb: 2 }}
          />
          <CardContent sx={{ pt: 0, pb: 3 }}>
            {approvals.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={4}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.grey[400],
                      0.1
                    )}, ${alpha(theme.palette.grey[400], 0.05)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <CheckCircle
                    sx={{ fontSize: 24, color: theme.palette.grey[400] }}
                  />
                </Box>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  align="center"
                  sx={{ fontWeight: 500 }}
                >
                  No pending approvals
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {approvals.slice(0, 3).map((approval, index) => (
                  <Fade
                    key={approval.id}
                    in={true}
                    timeout={300 + index * 100}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        transition:
                          "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.06
                        )}`,
                        borderRadius: 3,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.warning.main,
                            0.02
                          ),
                          borderColor: alpha(theme.palette.warning.main, 0.3),
                          transform: "translateY(-2px)",
                          boxShadow: `0 8px 25px -8px ${alpha(
                            theme.palette.warning.main,
                            0.25
                          )}`,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              flex: 1,
                              fontSize: "0.875rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {approval.title}
                          </Typography>
                          <Chip
                            label={approval.urgency}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              backgroundColor: alpha(
                                getUrgencyColor(approval.urgency),
                                0.12
                              ),
                              color: getUrgencyColor(approval.urgency),
                              border: `1px solid ${alpha(
                                getUrgencyColor(approval.urgency),
                                0.2
                              )}`,
                              textTransform: "capitalize",
                              ml: 1,
                            }}
                          />
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Person
                            sx={{
                              fontSize: 14,
                              color: theme.palette.text.secondary,
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            Requested by {approval.requested_by}
                          </Typography>
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Chip
                            label={approval.type}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: alpha(
                                theme.palette.info.main,
                                0.12
                              ),
                              color: theme.palette.info.main,
                              border: `1px solid ${alpha(
                                theme.palette.info.main,
                                0.2
                              )}`,
                              textTransform: "capitalize",
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {new Date(
                              approval.requested_at
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}

                {approvals.length > 3 && (
                  <Button
                    variant="text"
                    endIcon={<ArrowForward />}
                    sx={{
                      color: theme.palette.warning.main,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      textTransform: "none",
                      justifyContent: "center",
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.warning.main,
                          0.08
                        ),
                      },
                    }}
                  >
                    View All Approvals
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
