import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

// FSD Imports
import type { KanbanCard } from '@/entities/kanban';
import { KanbanWidget } from '@/widgets/kanban';
import { projectDAO } from '@/entities/project';

export const ReleasesKanbanPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const projectId = searchParams.get('projectId') ? Number(searchParams.get('projectId')) : undefined;
  
  // Get projects for filtering - TODO: convert to React Query hook
  const [projects, setProjects] = useState<any>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectDAO.getProjects({ limit: 100 });
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };
    loadProjects();
  }, []);

  // Handle project filter change
  const handleProjectChange = (newProjectId: number | '') => {
    if (newProjectId) {
      setSearchParams({ projectId: newProjectId.toString() });
    } else {
      setSearchParams({});
    }
  };

  // Handle item click
  const handleItemClick = (item: KanbanCard) => {
    navigate(`/releases/${item.id}`);
  };

  // Handle item edit
  const handleItemEdit = (item: KanbanCard) => {
    navigate(`/releases/${item.id}/edit`);
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
              navigate('/dashboard');
            }}
            sx={{ textDecoration: 'none' }}
          >
            Dashboard
          </Link>
          <Link 
            color="inherit" 
            href="/releases"
            onClick={(e) => {
              e.preventDefault();
              navigate('/releases');
            }}
            sx={{ textDecoration: 'none' }}
          >
            Releases
          </Link>
          <Typography color="text.primary">Kanban Board</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Releases Kanban Board
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track release progress from planning to deployment. Visualize the release pipeline 
            and manage deliverables effectively.
          </Typography>
        </Box>

        {/* Project Filter */}
        {!projectsLoading && projects && (
          <Box sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Project</InputLabel>
              <Select
                value={projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value as number | '')}
                label="Filter by Project"
              >
                <MenuItem value="">All Projects</MenuItem>
                {projects.projects?.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Project Context Alert */}
        {projectId && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            onClose={() => handleProjectChange('')}
          >
            Showing releases for project: {
              projects?.projects?.find(p => p.id === projectId)?.name || `Project ${projectId}`
            }
          </Alert>
        )}

        {/* Kanban Widget */}
        <KanbanWidget
          type="releases"
          projectId={projectId}
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