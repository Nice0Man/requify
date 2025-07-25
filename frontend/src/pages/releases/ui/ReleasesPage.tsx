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
  alpha,
  useTheme,
  Container,
  Fade,
  Slide,
} from "@mui/material";
import {
  Add as AddIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Search as SearchIcon,
  RocketLaunch,
} from "@mui/icons-material";
import {
  useReleases,
  useReleaseStats,
  useUpdateRelease,
} from "@/features/releases";
import { LoadingSpinner } from "@/shared/ui";
import { DashboardLayout } from "@/widgets/layout/ui";
import type { Release, ReleaseFilters } from "@/entities/release/model/types";

const ReleasesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "planned" | "in_progress" | "published" | "archived"
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
      case "planned":
        return "info";
      case "in_progress":
        return "warning";
      case "published":
        return "success";
      case "archived":
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
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.default, 0.6)} 100%)`,
        backdropFilter: "blur(20px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
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
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            {release.name}
          </Typography>
          <Chip
            label={t(`releases.status.${release.status}`)}
            color={getStatusColor(release.status)}
            size="small"
            sx={{
              fontWeight: 600,
              boxShadow: `0 2px 8px ${alpha(theme.palette.grey[500], 0.3)}`,
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            mb: 1,
          }}
        >
          {t("releases.fields.version")}: {release.version}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.6 }}
        >
          {release.description || t("releases.placeholders.noDescription")}
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("releases.fields.releaseDate")}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {release.releaseDate
                ? formatDate(release.releaseDate.toString())
                : "-"}
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
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  if (releasesError || releaseStatsError) {
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
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 1)} 0%, 
            ${alpha(theme.palette.grey[50], 0.8)} 100%)`,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.palette.info.main} 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, ${theme.palette.success.main} 0%, transparent 50%)`,
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ py: 4, position: "relative", zIndex: 1 }}
        >
          {/* Заголовок */}
          <Fade in={true} timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 3,
                    boxShadow: `0 8px 24px ${alpha(
                      theme.palette.info.main,
                      0.3
                    )}`,
                  }}
                >
                  <RocketLaunch sx={{ color: "white", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 0.5,
                    }}
                  >
                    {t("releases.title")}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t("releases.subtitle")}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>

          {/* Статистика */}
          {releaseStats && (
            <Slide direction="up" in={true} timeout={400}>
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      textAlign: "center",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.background.default, 0.6)} 100%)`,
                      backdropFilter: "blur(20px)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 8px 24px ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      },
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 800,
                        mb: 1,
                      }}
                    >
                      {releaseStats.totalCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("releases.stats.totalReleases")}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Slide>
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
                    <MenuItem value="draft">
                      {t("releases.status.draft")}
                    </MenuItem>
                    <MenuItem value="planned">
                      {t("releases.status.planned")}
                    </MenuItem>
                    <MenuItem value="in_progress">
                      {t("releases.status.in_progress")}
                    </MenuItem>
                    <MenuItem value="published">
                      {t("releases.status.published")}
                    </MenuItem>
                    <MenuItem value="archived">
                      {t("releases.status.archived")}
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
              {filteredReleases.map((release: Release) => (
                <Grid item xs={12} md={6} lg={4} key={release.id}>
                  <ReleaseCard release={release} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default ReleasesPage;
