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
  Alert,
  Snackbar,
  Fade,
  Grow,
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
  DragIndicator,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Using widgets according to FSD
import { Kanban } from '@/widgets';
import type { KanbanProps } from '@/widgets/types';

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
  const [allowDragDrop, setAllowDragDrop] = useState(true);
  const [variant, setVariant] = useState<'compact' | 'detailed' | 'minimal'>('detailed');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

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

  const handleItemMove = useCallback(async (itemId: number, fromColumn: string, toColumn: string) => {
    try {
      // Show loading notification
      setNotification({
        open: true,
        message: 'Updating item status...',
        severity: 'info',
      });

      // Here you would implement the actual status update API call
      console.log(`Move item ${itemId} from ${fromColumn} to ${toColumn}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Item status updated successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating item:', error);
      setNotification({
        open: true,
        message: 'Failed to update item status',
        severity: 'error',
      });
    }
  }, []);

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

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
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
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              Kanban Board
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentConfig.description}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="board">
                <ViewColumn />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Variant Toggle */}
            <ToggleButtonGroup
              value={variant}
              exclusive
              onChange={(_, value) => value && setVariant(value)}
              size="small"
            >
              <ToggleButton value="minimal">Minimal</ToggleButton>
              <ToggleButton value="compact">Compact</ToggleButton>
              <ToggleButton value="detailed">Detailed</ToggleButton>
            </ToggleButtonGroup>

            {/* Action Buttons */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateNew}
              disabled={!currentConfig.canCreate}
              sx={{
                backgroundColor: currentConfig.color,
                '&:hover': {
                  backgroundColor: alpha(currentConfig.color, 0.8),
                },
              }}
            >
              Create New
            </Button>

            <IconButton onClick={handleRefresh} title="Refresh">
              <Refresh />
            </IconButton>

            <IconButton onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>

            <IconButton onClick={handleMenuClick} title="More Options">
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* Mode Tabs */}
        <Paper elevation={0} sx={{ backgroundColor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
          <Tabs
            value={Object.keys(modeConfig).indexOf(currentMode)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 60,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
              },
            }}
          >
            {Object.entries(modeConfig).map(([key, config]) => (
              <Tab
                key={key}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {config.icon}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {config.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                onClick={() => handleModeChange(key as KanbanProps['mode'])}
                sx={{
                  color: config.color,
                  '&.Mui-selected': {
                    backgroundColor: alpha(config.color, 0.1),
                  },
                }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Settings Bar */}
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              icon={<DragIndicator />}
              label={allowDragDrop ? "Drag & Drop: ON" : "Drag & Drop: OFF"}
              color={allowDragDrop ? "success" : "default"}
              onClick={() => setAllowDragDrop(!allowDragDrop)}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              icon={currentConfig.icon}
              label={`Mode: ${currentConfig.label}`}
              sx={{ 
                backgroundColor: alpha(currentConfig.color, 0.1),
                color: currentConfig.color,
              }}
            />
            {projectId && (
              <Chip
                label={`Project: ${projectId}`}
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {user?.first_name} {user?.last_name} • {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Kanban Board */}
      <Fade in timeout={500}>
        <Box>
          {viewMode === 'board' ? (
            <Kanban
              mode={currentMode}
              projectId={projectId}
              showFilters={true}
              allowDragDrop={allowDragDrop}
              onItemClick={handleItemClick}
              onItemMove={handleItemMove}
              variant={variant}
            />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                List view coming soon...
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>

      {/* Settings Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <FilterList />
          </ListItemIcon>
          <ListItemText>Advanced Filters</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download />
          </ListItemIcon>
          <ListItemText>Export Board</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText>Board Settings</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default KanbanPage; 