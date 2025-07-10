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
  Container,
  Fade,
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
import { DashboardLayout } from "@/widgets/layout";
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
    <Fade in timeout={600}>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          border: `1px solid rgba(0,0,0,0.06)`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${
              getStatusColor(project.status) === "success"
                ? "#4caf50"
                : getStatusColor(project.status) === "warning"
                ? "#ff9800"
                : getStatusColor(project.status) === "error"
                ? "#f44336"
                : "#2196f3"
            }, transparent)`,
          },
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
            "& .project-actions": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3, pb: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Typography
              variant="h6"
              component="h2"
              fontWeight={700}
              sx={{
                fontSize: "1.1rem",
                lineHeight: 1.3,
              }}
            >
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
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{
              lineHeight: 1.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {project.description || t("projects.placeholders.noDescription")}
          </Typography>

          <Box mb={2}>
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
              <Typography variant="body2" fontWeight={600} color="primary">
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "rgba(0,0,0,0.06)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                },
              }}
            />
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
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                {t("projects.fields.startDate")}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(project.startDate)}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                {t("projects.fields.endDate")}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(project.endDate)}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions
          className="project-actions"
          sx={{
            p: 2,
            pt: 0,
            opacity: 0.7,
            transform: "translateY(4px)",
            transition: "all 0.2s ease",
          }}
        >
          <Button
            size="small"
            startIcon={<EditIcon />}
            sx={{
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {t("common.edit")}
          </Button>
          <Button
            size="small"
            startIcon={<FolderOpenIcon />}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {t("common.open")}
          </Button>
        </CardActions>
      </Card>
    </Fade>
  );

  if (isPending) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Typography color="error">{t("errors.loadingError")}</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Заголовок */}
        <Fade in timeout={400}>
          <Box mb={4}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight={700}
              sx={{
                fontSize: { xs: "1.75rem", md: "2.125rem" },
                background: `linear-gradient(135deg, #1976d2, #42a5f5)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              {t("projects.title")}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400 }}
            >
              {t("projects.subtitle")}
            </Typography>
          </Box>
        </Fade>

        {/* Фильтры и поиск */}
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.06)",
              backgroundColor: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder={t("projects.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.8)",
                    },
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
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "rgba(255,255,255,0.8)",
                    }}
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
                  sx={{
                    "& .MuiToggleButton-root": {
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.12)",
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      },
                    },
                  }}
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
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    },
                  }}
                >
                  {t("projects.createProject")}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Список проектов */}
        {filteredProjects.length === 0 ? (
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 8,
                textAlign: "center",
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Typography variant="h6" color="text.secondary" mb={2}>
                {t("projects.notFound")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                {t("projects.createFirstProject")}
              </Button>
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((project, index) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <Box
                  sx={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    "@keyframes fadeInUp": {
                      "0%": {
                        opacity: 0,
                        transform: "translateY(30px)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <ProjectCard project={project} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default ProjectsPage;
