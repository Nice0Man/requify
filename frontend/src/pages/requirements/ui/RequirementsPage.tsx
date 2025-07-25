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
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useRequirements } from "@/features/requirements/model/useRequirementQuery";
import { LoadingSpinner } from "@/shared/ui";
import type { Requirement } from "@/entities/requirement";
import { DashboardLayout } from "@/widgets/layout/ui";

const RequirementsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: requirements = [], isPending, error } = useRequirements();

  // Фильтрация требований
  const filteredRequirements = requirements.filter(
    (requirement: Requirement) => {
      const matchesSearch =
        requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        requirement.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || requirement.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || requirement.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    }
  );

  const getStatusColor = (status: Requirement["status"]) => {
    switch (status) {
      case "draft":
        return "default";
      case "approved":
        return "success";
      case "in_development":
        return "warning";
      case "completed":
        return "primary";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: Requirement["priority"]) => {
    switch (priority) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const RequirementCard = ({ requirement }: { requirement: Requirement }) => (
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
            {requirement.title}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={t(`requirements.status.${requirement.status}`)}
              color={getStatusColor(requirement.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={t(`requirements.priority.${requirement.priority}`)}
              color={getPriorityColor(requirement.priority)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {requirement.description ||
            t("requirements.placeholders.noDescription")}
        </Typography>

        {requirement.progress !== undefined && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {t("requirements.fields.progress")}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={requirement.progress || 0}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {requirement.progress}% {t("projects.stats.completed")}
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("requirements.fields.project")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {requirement.project_id ||
                t("requirements.placeholders.noProject")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t("requirements.fields.created")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(requirement.created_at)}
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
          startIcon={<AssignmentIcon />}
          sx={{ fontWeight: 600 }}
        >
          {t("common.view")}
        </Button>
      </CardActions>
    </Card>
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
        <Box p={3} textAlign="center">
          <Typography color="error">{t("errors.loadingError")}</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box p={3}>
        {/* Заголовок */}
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            {t("requirements.title")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t("requirements.subtitle")}
          </Typography>
        </Box>

        {/* Фильтры и поиск */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder={t("requirements.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t("requirements.fields.status")}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t("requirements.fields.status")}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">
                    {t("requirements.status.all")}
                  </MenuItem>
                  <MenuItem value="draft">
                    {t("requirements.status.draft")}
                  </MenuItem>
                  <MenuItem value="approved">
                    {t("requirements.status.approved")}
                  </MenuItem>
                  <MenuItem value="in_progress">
                    {t("requirements.status.inProgress")}
                  </MenuItem>
                  <MenuItem value="completed">
                    {t("requirements.status.completed")}
                  </MenuItem>
                  <MenuItem value="rejected">
                    {t("requirements.status.rejected")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t("requirements.fields.priority")}</InputLabel>
                <Select
                  value={priorityFilter}
                  label={t("requirements.fields.priority")}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="all">
                    {t("requirements.priority.all")}
                  </MenuItem>
                  <MenuItem value="low">
                    {t("requirements.priority.low")}
                  </MenuItem>
                  <MenuItem value="medium">
                    {t("requirements.priority.medium")}
                  </MenuItem>
                  <MenuItem value="high">
                    {t("requirements.priority.high")}
                  </MenuItem>
                  <MenuItem value="critical">
                    {t("requirements.priority.critical")}
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
                {t("requirements.createRequirement")}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Список требований */}
        {filteredRequirements.length === 0 ? (
          <Paper
            elevation={1}
            sx={{ p: 6, textAlign: "center", borderRadius: 2 }}
          >
            <Typography variant="h6" color="text.secondary" mb={2}>
              {t("requirements.notFound")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ fontWeight: 600 }}
            >
              {t("requirements.createFirstRequirement")}
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredRequirements.map((requirement: Requirement) => (
              <Grid item xs={12} md={6} lg={4} key={requirement.id}>
                <RequirementCard requirement={requirement} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default RequirementsPage;
