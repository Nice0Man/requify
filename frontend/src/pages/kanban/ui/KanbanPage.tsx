import React from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

// FSD Imports
import type { KanbanCard, KanbanType } from '@/entities/kanban';
import { KanbanWidget } from '@/widgets/kanban';

export const KanbanPage: React.FC = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const type = (searchParams.get('type') as KanbanType) || 'requirements';
  const projectId = searchParams.get('projectId') ? Number(searchParams.get('projectId')) : undefined;
  const requirementId = searchParams.get('requirementId') ? Number(searchParams.get('requirementId')) : undefined;

  // Handle item click
  const handleItemClick = (item: KanbanCard) => {
    switch (item.type) {
      case 'projects':
        navigate(`/projects/${item.id}`);
        break;
      case 'requirements':
        navigate(`/requirements/${item.id}`);
        break;
      case 'releases':
        navigate(`/releases/${item.id}`);
        break;
      case 'tests':
        navigate(`/testing/${item.id}`);
        break;
      default:
        console.warn('Unknown item type:', item.type);
    }
  };

  // Handle item edit
  const handleItemEdit = (item: KanbanCard) => {
    switch (item.type) {
      case 'projects':
        navigate(`/projects/${item.id}/edit`);
        break;
      case 'requirements':
        navigate(`/requirements/${item.id}/edit`);
        break;
      case 'releases':
        navigate(`/releases/${item.id}/edit`);
        break;
      case 'tests':
        navigate(`/testing/${item.id}/edit`);
        break;
      default:
        console.warn('Unknown item type:', item.type);
    }
  };

  const getPageTitle = (type: KanbanType) => {
    switch (type) {
      case 'projects':
        return 'Projects Kanban Board';
      case 'requirements':
        return 'Requirements Kanban Board';
      case 'releases':
        return 'Releases Kanban Board';
      case 'tests':
        return 'Testing Kanban Board';
      default:
        return 'Kanban Board';
    }
  };

  const getPageDescription = (type: KanbanType) => {
    switch (type) {
      case 'projects':
        return 'Manage your projects using the Kanban methodology. Track progress and status visually.';
      case 'requirements':
        return 'Manage requirements workflow from draft to approval. Organize and prioritize effectively.';
      case 'releases':
        return 'Track release progress from planning to deployment. Manage deliverables and milestones.';
      case 'tests':
        return 'Manage test case execution workflow. Track testing progress and results efficiently.';
      default:
        return 'Visual project management using Kanban methodology.';
    }
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
          <Typography color="text.primary">Kanban</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {getPageTitle(type)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getPageDescription(type)}
          </Typography>
        </Box>

        {/* Kanban Widget */}
        <KanbanWidget
          type={type}
          projectId={projectId}
          requirementId={requirementId}
          showTypeSelector={true}
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