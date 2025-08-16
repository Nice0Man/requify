import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
  LinearProgress,
  Paper,
  InputBase,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import { useProjects } from "@/entities/project/api/projectQueries";
import type { ProjectStatus } from "@/entities/project/model/types";
import { PROJECT_STATUSES } from "@/entities/project/model/types";

// Simple date formatter
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export const ProjectsPage: React.FC = () => {
  const { t } = i18n;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjects({
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const projects = projectsResponse?.projects || [];

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "development":
        return "warning";
      case "completed":
        return "success";
      case "testing":
        return "info";
      case "cancelled":
        return "error";
      case "archived":
        return "default";
      default:
        return "primary";
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    const statusLabels: Record<ProjectStatus, string> = {
      active: t("projects.status.active"),
      inactive: t("projects.status.inactive"),
      archived: t("projects.status.archived"),
      planning: t("projects.status.planning"),
      development: t("projects.status.development"),
      testing: t("projects.status.testing"),
      completed: t("projects.status.completed"),
      cancelled: t("projects.status.cancelled"),
    };
    return statusLabels[status] || status;
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Typography color="error">Error loading projects</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          {t("projects.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("projects.subtitle")}
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              <InputBase
                placeholder={t("projects.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("projects.filterByStatus")}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ProjectStatus | "all")
                }
                label={t("projects.filterByStatus")}
              >
                <MenuItem value="all">{t("projects.status.all")}</MenuItem>
                {PROJECT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box display="flex" justifyContent="center">
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? "List View" : "Grid View"}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={() => {
                // Handle create project
              }}
            >
              {t("projects.actions.create")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {t("projects.noProjectsFound")}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid
              item
              xs={12}
              sm={viewMode === "grid" ? 6 : 12}
              md={viewMode === "grid" ? 4 : 12}
              key={project.id}
            >
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => {
                  // Handle project click
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  pb={1}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      fontSize="0.75rem"
                    >
                      {project.code || `PRJ-${project.id}`}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status)}
                      variant={
                        project.status === "completed" ? "filled" : "outlined"
                      }
                    />
                  </Stack>
                </Box>

                <CardContent sx={{ pt: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, height: 40, overflow: "hidden" }}
                  >
                    {project.description || t("projects.noDescription")}
                  </Typography>

                  <Stack spacing={2}>
                    {/* Статистика из ProjectWithStats */}
                    {"total_requirements" in project && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          {t("projects.fields.progress")}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="primary"
                        >
                          {project.completion_percentage || 0}%
                        </Typography>
                      </Box>
                    )}

                    {"total_requirements" in project && (
                      <LinearProgress
                        variant="determinate"
                        value={Number(project.completion_percentage) || 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "rgba(0,0,0,0.06)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <GroupIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {/* Здесь можно добавить количество участников команды из ProjectTeamResponse */}
                          {t("projects.stats.participants")}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <DescriptionIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {"total_requirements" in project
                            ? project.total_requirements
                            : 0}{" "}
                          {t("projects.stats.requirements")}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t("projects.fields.created")}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(project.created_at)}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary">
                          {t("projects.fields.updated")}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(project.updated_at)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton size="small">
                      <StarBorderIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProjectsPage;
