import React from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { NavigateNext } from "@mui/icons-material";

// FSD Imports
import type { KanbanCard } from "@/entities/kanban";
import { KanbanWidget } from "@/widgets/kanban";

export const ProjectsKanbanPage: React.FC = () => {

  const navigate = useNavigate();

  // Handle item click
  const handleItemClick = (item: KanbanCard) => {
    navigate(`/projects/${item.id}`);
  };

  // Handle item edit
  const handleItemEdit = (item: KanbanCard) => {
    navigate(`/projects/${item.id}/edit`);
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            color="inherit"
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
            sx={{ textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <Link
            color="inherit"
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              navigate("/projects");
            }}
            sx={{ textDecoration: "none" }}
          >
            Projects
          </Link>
          <Typography color="text.primary">Kanban Board</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Projects Kanban Board
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your projects using the Kanban methodology. Drag and drop to
            update status, filter by priority and assignee, and track progress
            visually.
          </Typography>
        </Box>

        {/* Kanban Widget */}
        <KanbanWidget
          type="projects"
          showTypeSelector={false}
          showFilters={true}
          allowDragDrop={true}
          maxHeight={700}
          onItemClick={handleItemClick}
          onItemEdit={handleItemEdit}
        />
      </Box>
    </Container>
  );
};
