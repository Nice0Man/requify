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
  Chip,
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
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  useReleases,
  useReleaseStats,
  useUpdateRelease,
} from "../../../features/release-management";
import { LoadingSpinner } from "../../../shared/ui";
import type {
  Release,
  ReleaseFilters,
} from "../../../features/release-management/api/releaseApi";

const ReleasesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "planned" | "in_progress" | "released" | "cancelled"
  >("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Формируем фильтры для API
  const filters: ReleaseFilters = {
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    projectId: selectedProject === "all" ? undefined : selectedProject,
  };

  const {
    data: releases = [],
    isPending: releasesLoading,
    error: releasesError,
    refetch: refetchReleases,
  } = useReleases(filters);

  const {
    data: releaseStats,
    isPending: releaseStatsLoading,
    error: releaseStatsError,
  } = useReleaseStats();

  const updateRelease = useUpdateRelease();

  // Фильтрация релизов
  const filteredReleases = releases.filter((release: Release) => {
    const matchesSearch =
      release.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || release.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Release["status"]) => {
    switch (status) {
      case "draft":
        return "default";
      case "planned":
        return "info";
      case "in_progress":
        return "warning";
      case "released":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("common.notSet");
    return new Date(dateString).toLocaleDateString();
  };

  const ReleaseCard = ({ release }: { release: Release }) => (
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
            {release.name}
          </Typography>
          <Chip
            label={t(`releases.status.${release.status}`)}
            color={getStatusColor(release.status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Typography variant="body2" color="primary" fontWeight={600} mb={1}>
          {t("releases.fields.version")}: {release.version}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {release.description || t("releases.placeholders.noDescription")}
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("releases.fields.releaseDate")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(release.releaseDate)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("releases.fields.createdAt")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(release.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (releasesLoading || releaseStatsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (releasesError || releaseStatsError) {
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
          {t("releases.title")}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t("releases.subtitle")}
        </Typography>
      </Box>

      {/* Статистика */}
      {releaseStats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
            >
              <Typography variant="h4" color="primary" fontWeight={700}>
                {releaseStats.totalReleases}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("releases.stats.totalReleases")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
            >
              <Typography variant="h4" color="info.main" fontWeight={700}>
                {releaseStats.plannedReleases}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("releases.stats.plannedReleases")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
            >
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {releaseStats.inProgressReleases}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("releases.stats.inProgressReleases")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
            >
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {releaseStats.releasedReleases}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("releases.stats.releasedReleases")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Фильтры и поиск */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder={t("releases.searchPlaceholder")}
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
              <InputLabel>{t("releases.fields.status")}</InputLabel>
              <Select
                value={statusFilter}
                label={t("releases.fields.status")}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
              >
                <MenuItem value="all">{t("releases.status.all")}</MenuItem>
                <MenuItem value="draft">{t("releases.status.draft")}</MenuItem>
                <MenuItem value="planned">
                  {t("releases.status.planned")}
                </MenuItem>
                <MenuItem value="in_progress">
                  {t("releases.status.in_progress")}
                </MenuItem>
                <MenuItem value="released">
                  {t("releases.status.released")}
                </MenuItem>
                <MenuItem value="cancelled">
                  {t("releases.status.cancelled")}
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
              {t("releases.createRelease")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Список релизов */}
      {filteredReleases.length === 0 ? (
        <Paper
          elevation={1}
          sx={{ p: 6, textAlign: "center", borderRadius: 2 }}
        >
          <Typography variant="h6" color="text.secondary" mb={2}>
            {t("releases.notFound")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 600 }}
          >
            {t("releases.createFirstRelease")}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredReleases.map((release) => (
            <Grid item xs={12} md={6} lg={4} key={release.id}>
              <ReleaseCard release={release} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ReleasesPage;
