import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Backdrop,
  IconButton,
  Container,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NavigateNext, ViewColumn } from "@mui/icons-material";

// FSD Imports
import type { KanbanCard } from "@/entities/kanban";
import { KanbanWidget } from "@/widgets/kanban";
import { useProjects } from "@/entities/project/api/projectQueries";
import { PageLayout } from "@/shared/ui";

export const RequirementsKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const projectId = searchParams.get("projectId")
    ? Number(searchParams.get("projectId"))
    : undefined;

  // Используем React Query хук для получения проектов
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects({ limit: 100 });

  // Мемоизируем найденный проект
  const selectedProject = useMemo(() => {
    if (!projectId || !projectsData?.projects) return null;
    return projectsData.projects.find((p) => p.id === projectId);
  }, [projectId, projectsData?.projects]);

  // Handle project filter change
  const handleProjectChange = (newProjectId: number | "") => {
    if (newProjectId) {
      setSearchParams({ projectId: newProjectId.toString() });
    } else {
      setSearchParams({});
    }
  };

  // Handle item click
  const handleItemClick = (item: KanbanCard) => {
    navigate(`/requirements/${item.id}`);
  };

  // Handle item edit
  const handleItemEdit = (item: KanbanCard) => {
    navigate(`/requirements/${item.id}/edit`);
  };

  // Показываем ошибку если не удалось загрузить проекты
  if (projectsError) {
    return (
      <Container maxWidth={false} disableGutters>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Ошибка загрузки проектов:{" "}
            {projectsError instanceof Error
              ? projectsError.message
              : "Неизвестная ошибка"}
          </Alert>
        </Box>
      </Container>
    );
  }

  // Дополнительные действия в header
  const headerActions = useMemo(
    () => [
      <IconButton
        key="view-kanban"
        size="small"
        color="primary"
        title="Канбан вид"
      >
        <ViewColumn />
      </IconButton>,
    ],
    []
  );
  return (
    <PageLayout title="Требования">
      {/* Backdrop для загрузки проектов */}
      {projectsLoading && (
        <Backdrop sx={{ color: "#fff", zIndex: 1300 }} open={projectsLoading}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress color="inherit" />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Загрузка проектов...
            </Typography>
          </Box>
        </Backdrop>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate("/dashboard");
          }}
          sx={{ textDecoration: "none" }}
        >
          Дашборд
        </Link>
        <Link
          color="inherit"
          href="/requirements"
          onClick={(e) => {
            e.preventDefault();
            navigate("/requirements");
          }}
          sx={{ textDecoration: "none" }}
        >
          Требования
        </Link>
        <Typography color="text.primary">Канбан доска</Typography>
      </Breadcrumbs>

      {/* Project Filter */}
      {!projectsLoading && projectsData && (
        <Box sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Фильтр по проекту</InputLabel>
            <Select
              value={projectId || ""}
              onChange={(e) =>
                handleProjectChange(e.target.value as number | "")
              }
              label="Фильтр по проекту"
            >
              <MenuItem value="">Все проекты</MenuItem>
              {projectsData.projects?.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Project Context Alert */}
      {projectId && selectedProject && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          onClose={() => handleProjectChange("")}
        >
          Отображаются требования для проекта: {selectedProject.name}
        </Alert>
      )}

      {/* Project not found alert */}
      {projectId && !selectedProject && !projectsLoading && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          onClose={() => handleProjectChange("")}
        >
          Проект с ID {projectId} не найден. Показаны все требования.
        </Alert>
      )}

      {/* Kanban Widget */}
      <KanbanWidget
        type="requirements"
        projectId={projectId}
        showTypeSelector={false}
        showFilters={true}
        allowDragDrop={true}
        maxHeight={700}
        onItemClick={handleItemClick}
        onItemEdit={handleItemEdit}
      />
    </PageLayout>
  );
};
