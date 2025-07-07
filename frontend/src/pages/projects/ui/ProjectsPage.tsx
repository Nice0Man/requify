import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Search as SearchIcon,
  FolderOpen as FolderOpenIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useProjects } from "../../../features/project-management/model/useProjectQuery";
import { LoadingSpinner } from "../../../shared/ui";
import { Project } from "../../../features/project-management/api/projectApi";

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: projects = [], isPending, error } = useProjects();

  // Фильтрация проектов
  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "primary";
      case "on_hold":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return t("projects.placeholders.noDate");
    return new Date(dateString).toLocaleDateString();
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" component="h2" fontWeight={700}>
            {project.name}
          </Typography>
          <Chip
            label={t(
              `projects.statusText.${
                project.status === "on_hold" ? "onHold" : project.status
              }`
            )}
            color={getStatusColor(project.status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {project.description || t("projects.placeholders.noDescription")}
        </Typography>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {t("projects.fields.progress")}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {project.progress}% {t("projects.stats.completed")}
          </Typography>
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <GroupIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {project.teamSize} {t("projects.stats.participants")}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AssignmentIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {project.requirementsCount || 0}{" "}
              {t("projects.stats.requirements")}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("projects.fields.startDate")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(project.startDate)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("projects.fields.endDate")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(project.endDate)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button size="small" startIcon={<EditIcon />} sx={{ fontWeight: 600 }}>
          {t("common.edit")}
        </Button>
        <Button
          size="small"
          startIcon={<EditIcon />}
          color="error"
          sx={{ fontWeight: 600 }}
        >
          {t("common.delete")}
        </Button>
      </CardActions>
    </Card>
  );

  if (isPending) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error">{t("errors.loadingError")}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Заголовок */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {t("projects.title")}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t("projects.subtitle")}
        </Typography>
      </Box>

      {/* Фильтры и поиск */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={t("projects.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t("projects.fields.status")}</InputLabel>
              <Select
                value={statusFilter}
                label={t("projects.fields.status")}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">{t("projects.status.all")}</MenuItem>
                <MenuItem value="active">
                  {t("projects.status.active")}
                </MenuItem>
                <MenuItem value="completed">
                  {t("projects.status.completed")}
                </MenuItem>
                <MenuItem value="on_hold">
                  {t("projects.status.onHold")}
                </MenuItem>
                <MenuItem value="cancelled">
                  {t("projects.status.cancelled")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newViewMode) =>
                newViewMode && setViewMode(newViewMode)
              }
              aria-label={t("common.view")}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ fontWeight: 600 }}
            >
              {t("projects.createProject")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Список проектов */}
      {filteredProjects.length === 0 ? (
        <Paper
          elevation={1}
          sx={{ p: 6, textAlign: "center", borderRadius: 2 }}
        >
          <Typography variant="h6" color="text.secondary" mb={2}>
            {t("projects.notFound")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 600 }}
          >
            {t("projects.createFirstProject")}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProjectsPage;
