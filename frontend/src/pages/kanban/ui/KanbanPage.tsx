import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  ViewColumn,
  ViewList,
  Assignment,
  RocketLaunch,
  BugReport,
  Add,
  FilterList,
  Settings,
  Refresh,
  Download,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Using widgets according to FSD
import { Kanban } from '@/widgets';
import type { KanbanProps } from '@/widgets';

// Using features according to FSD  
import { useAuth } from '@/features/auth';

// Using shared utilities
import { usePermissions } from '@/shared/hooks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kanban-tabpanel-${index}`}
      aria-labelledby={`kanban-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
};

const KanbanPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Get mode from URL params or default to requirements
  const initialMode = (searchParams.get('mode') as KanbanProps['mode']) || 'requirements';
  const projectId = searchParams.get('project') ? Number(searchParams.get('project')) : undefined;

  const [currentMode, setCurrentMode] = useState<KanbanProps['mode']>(initialMode);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Permissions
  const canCreateRequirements = hasPermission('requirements:create');
  const canCreateProjects = hasPermission('projects:create');
  const canCreateTasks = hasPermission('testing:create');
  const canViewAdmin = hasPermission('admin:read');

  // Mode configuration
  const modeConfig = useMemo(() => ({
    requirements: {
      label: 'Requirements',
      icon: <Assignment />,
      color: theme.palette.primary.main,
      description: 'Manage requirements workflow',
      canCreate: canCreateRequirements,
      createPath: '/requirements/create',
    },
    projects: {
      label: 'Projects',
      icon: <RocketLaunch />,
      color: theme.palette.secondary.main,
      description: 'Track project progress',
      canCreate: canCreateProjects,
      createPath: '/projects/create',
    },
    tasks: {
      label: 'Test Cases',
      icon: <BugReport />,
      color: theme.palette.warning.main,
      description: 'Monitor testing workflow',
      canCreate: canCreateTasks,
      createPath: '/testing/cases/create',
    },
  }), [canCreateRequirements, canCreateProjects, canCreateTasks, theme.palette]);

  // Update URL when mode changes
  const handleModeChange = useCallback((mode: KanbanProps['mode']) => {
    setCurrentMode(mode);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', mode);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Handlers
  const handleItemClick = useCallback((itemId: number, itemType: string) => {
    switch (itemType) {
      case 'requirement':
        navigate(`/requirements/${itemId}`);
        break;
      case 'project':
        navigate(`/projects/${itemId}`);
        break;
      case 'task':
        navigate(`/testing/cases/${itemId}`);
        break;
    }
  }, [navigate]);

  const handleItemMove = useCallback((itemId: number, fromColumn: string, toColumn: string) => {
    // Here you would implement the actual status update API call
    console.log(`Move item ${itemId} from ${fromColumn} to ${toColumn}`);
    // Example implementation:
    // switch (currentMode) {
    //   case 'requirements':
    //     await requirementsApi.updateRequirement(itemId, { status: toColumn });
    //     break;
    //   case 'projects':
    //     await projectsApi.updateProject(itemId, { status: toColumn });
    //     break;
    //   case 'tasks':
    //     await testCasesApi.updateTestCase(itemId, { status: toColumn });
    //     break;
    // }
  }, [currentMode]);

  const handleCreateNew = useCallback(() => {
    const config = modeConfig[currentMode];
    if (config.canCreate && config.createPath) {
      navigate(config.createPath);
    }
  }, [currentMode, modeConfig, navigate]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const currentConfig = modeConfig[currentMode];

  return (
    <Container 
      maxWidth={isFullscreen ? false : "xl"} 
      sx={{ 
        py: 3,
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          backgroundColor: theme.palette.background.default,
          overflow: 'auto',
        })
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${currentConfig.color}, ${alpha(currentConfig.color, 0.7)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {currentConfig.icon}
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {currentConfig.label} Board
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentConfig.description}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {currentConfig.canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateNew}
                sx={{ borderRadius: 2 }}
              >
                Create {currentConfig.label.slice(0, -1)}
              </Button>
            )}

            <IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>

            <IconButton onClick={handleMenuClick}>
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* Mode Selector */}
        <Paper
          sx={{
            p: 1,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Tabs
              value={['requirements', 'projects', 'tasks'].indexOf(currentMode)}
              onChange={(_, newValue) => {
                const modes: KanbanProps['mode'][] = ['requirements', 'projects', 'tasks'];
                handleModeChange(modes[newValue]);
              }}
              sx={{
                '& .MuiTab-root': {
                  borderRadius: 2,
                  minHeight: 'auto',
                  py: 1,
                },
              }}
            >
              {Object.entries(modeConfig).map(([mode, config]) => (
                <Tab
                  key={mode}
                  icon={config.icon}
                  label={config.label}
                  iconPosition="start"
                  sx={{
                    color: config.color,
                    '&.Mui-selected': {
                      backgroundColor: alpha(config.color, 0.1),
                      color: config.color,
                    },
                  }}
                />
              ))}
            </Tabs>

            <Box display="flex" alignItems="center" gap={1}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{ '& .MuiToggleButton-root': { borderRadius: 2 } }}
              >
                <ToggleButton value="board">
                  <ViewColumn fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>

              {projectId && (
                <Chip
                  label={`Project ${projectId}`}
                  size="small"
                  onDelete={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('project');
                    setSearchParams(newParams);
                  }}
                />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Kanban Board */}
      {viewMode === 'board' ? (
        <Kanban
          mode={currentMode}
          projectId={projectId}
          showFilters={true}
          allowDragDrop={true}
          onItemClick={handleItemClick}
          onItemMove={handleItemMove}
          className={isFullscreen ? 'kanban-fullscreen' : ''}
        />
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            List view coming soon...
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Switch to board view to see your {currentConfig.label.toLowerCase()}
          </Typography>
        </Paper>
      )}

      {/* Settings Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => {
          // Refresh data
          window.location.reload();
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Refresh Data" />
        </MenuItem>

        <MenuItem onClick={() => {
          // Export board data
          console.log('Export board data');
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Export Data" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => {
          navigate('/settings');
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Board Settings" />
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default KanbanPage; 