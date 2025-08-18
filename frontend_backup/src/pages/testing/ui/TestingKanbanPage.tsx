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
  Stack,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

// FSD Imports
import type { KanbanCard } from '@/entities/kanban';
import { KanbanWidget } from '@/widgets/kanban';
import { projectDAO } from '@/entities/project';
import { requirementDAO } from '@/entities/requirement';

export const TestingKanbanPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const projectId = searchParams.get('projectId') ? Number(searchParams.get('projectId')) : undefined;
  const requirementId = searchParams.get('requirementId') ? Number(searchParams.get('requirementId')) : undefined;
  
  // Get projects and requirements for filtering - TODO: convert to React Query hooks
  const [projects, setProjects] = useState<any>(null);
  const [requirements, setRequirements] = useState<any>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [requirementsLoading, setRequirementsLoading] = useState(true);

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

  React.useEffect(() => {
    if (projectId) {
      const loadRequirements = async () => {
        setRequirementsLoading(true);
        try {
          const data = await requirementDAO.getRequirements({ 
            project_id: projectId
          });
          setRequirements(data);
        } catch (error) {
          console.error('Error loading requirements:', error);
        } finally {
          setRequirementsLoading(false);
        }
      };
      loadRequirements();
    } else {
      setRequirements(null);
      setRequirementsLoading(false);
    }
  }, [projectId]);

  // Handle project filter change
  const handleProjectChange = (newProjectId: number | '') => {
    const params = new URLSearchParams();
    if (newProjectId) {
      params.set('projectId', newProjectId.toString());
    }
    setSearchParams(params);
  };

  // Handle requirement filter change
  const handleRequirementChange = (newRequirementId: number | '') => {
    const params = new URLSearchParams(searchParams);
    if (newRequirementId) {
      params.set('requirementId', newRequirementId.toString());
    } else {
      params.delete('requirementId');
    }
    setSearchParams(params);
  };

  // Handle item click
  const handleItemClick = (item: KanbanCard) => {
    navigate(`/testing/${item.id}`);
  };

  // Handle item edit
  const handleItemEdit = (item: KanbanCard) => {
    navigate(`/testing/${item.id}/edit`);
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
            href="/testing"
            onClick={(e) => {
              e.preventDefault();
              navigate('/testing');
            }}
            sx={{ textDecoration: 'none' }}
          >
            Testing
          </Link>
          <Typography color="text.primary">Kanban Board</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Testing Kanban Board
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage test cases execution workflow. Track testing progress from 
            preparation to completion and manage test results efficiently.
          </Typography>
        </Box>

        {/* Filters */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {/* Project Filter */}
          {!projectsLoading && projects && (
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
          )}

          {/* Requirement Filter */}
          {projectId && !requirementsLoading && requirements && (
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Filter by Requirement</InputLabel>
              <Select
                value={requirementId || ''}
                onChange={(e) => handleRequirementChange(e.target.value as number | '')}
                label="Filter by Requirement"
              >
                <MenuItem value="">All Requirements</MenuItem>
                {requirements.items?.map((requirement) => (
                  <MenuItem key={requirement.id} value={requirement.id}>
                    {requirement.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>

        {/* Context Alerts */}
        {projectId && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            onClose={() => handleProjectChange('')}
          >
            Showing test cases for project: {
              projects?.projects?.find(p => p.id === projectId)?.name || `Project ${projectId}`
            }
          </Alert>
        )}

        {requirementId && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            onClose={() => handleRequirementChange('')}
          >
            Showing test cases for requirement: {
              requirements?.items?.find(r => r.id === requirementId)?.title || `Requirement ${requirementId}`
            }
          </Alert>
        )}

        {/* Kanban Widget */}
        <KanbanWidget
          type="tests"
          projectId={projectId}
          requirementId={requirementId}
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