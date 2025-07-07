import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  Typography,
  useTheme,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Grow,
} from '@mui/material';
import {
  Assignment,
  RocketLaunch,
  BugReport,
  Assessment,
  Upload,
  Download,
  Speed,
  Refresh,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Using shared utilities
import { usePermissions } from '@/shared/hooks';

interface QuickActionsProps {
  actions?: string[];
  layout?: 'grid' | 'list' | 'horizontal';
  className?: string;
  onActionClick?: (action: string) => void;
  showHeader?: boolean;
  maxActions?: number;
}

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  path: string;
  description: string;
  permission?: string;
  priority: number;
}

const actionItems: ActionItem[] = [
  {
    id: 'create-project',
    label: 'Create Project',
    icon: <RocketLaunch />,
    color: 'primary',
    path: '/projects/create',
    description: 'Start a new project with team collaboration',
    permission: 'project:create',
    priority: 1,
  },
  {
    id: 'add-requirement',
    label: 'Add Requirement',
    icon: <Assignment />,
    color: 'info',
    path: '/requirements/create',
    description: 'Define new functional requirement',
    permission: 'requirement:create',
    priority: 2,
  },
  {
    id: 'create-release',
    label: 'Create Release',
    icon: <Assessment />,
    color: 'success',
    path: '/releases/create',
    description: 'Plan and schedule new release',
    permission: 'release:create',
    priority: 3,
  },
  {
    id: 'run-tests',
    label: 'Run Tests',
    icon: <BugReport />,
    color: 'warning',
    path: '/testing',
    description: 'Execute automated test suites',
    permission: 'test:execute',
    priority: 4,
  },
  {
    id: 'import-data',
    label: 'Import Data',
    icon: <Upload />,
    color: 'secondary',
    path: '/admin/import',
    description: 'Import data from external sources',
    permission: 'admin:write',
    priority: 5,
  },
  {
    id: 'export-report',
    label: 'Export Report',
    icon: <Download />,
    color: 'error',
    path: '/reports',
    description: 'Generate comprehensive reports',
    permission: 'report:export',
    priority: 6,
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions = [],
  layout = 'grid',
  className,
  onActionClick,
  showHeader = true,
  maxActions = 6,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const filteredActions = actionItems
    .filter(action => {
      // Filter by provided actions list if specified
      if (actions.length > 0 && !actions.includes(action.id)) {
        return false;
      }
      // Filter by permissions
      if (action.permission && !hasPermission(action.permission)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxActions);

  const handleActionClick = (action: ActionItem) => {
    if (onActionClick) {
      onActionClick(action.id);
    } else {
      navigate(action.path);
    }
  };

  const getColorValue = (color: ActionItem['color']) => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const renderActionCard = (action: ActionItem, index: number) => (
    <Grow in timeout={600 + index * 100} key={action.id}>
      <Box>
        <Tooltip title={action.description} arrow placement="top">
          <Button
            variant="outlined"
            onClick={() => handleActionClick(action)}
            sx={{
              height: layout === 'grid' ? 140 : layout === 'horizontal' ? 100 : 80,
              width: '100%',
              display: 'flex',
              flexDirection: layout === 'horizontal' ? 'row' : 'column',
              gap: layout === 'grid' ? 2 : 1.5,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 40px ${alpha(getColorValue(action.color), 0.15)}`,
                borderColor: getColorValue(action.color),
                background: alpha(getColorValue(action.color), 0.02),
                '& .action-icon': {
                  transform: 'scale(1.1)',
                  background: `linear-gradient(135deg, ${getColorValue(action.color)}, ${alpha(getColorValue(action.color), 0.8)})`,
                },
              },
            }}
          >
            <Box
              className="action-icon"
              sx={{
                width: layout === 'grid' ? 56 : 48,
                height: layout === 'grid' ? 56 : 48,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(getColorValue(action.color), 0.1)}, ${alpha(getColorValue(action.color), 0.05)})`,
                border: `1px solid ${alpha(getColorValue(action.color), 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getColorValue(action.color),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: layout === 'grid' ? 28 : 24,
              }}
            >
              {React.cloneElement(action.icon as React.ReactElement, {
                fontSize: 'inherit',
              })}
            </Box>
            
            <Stack 
              spacing={0.5} 
              alignItems={layout === 'horizontal' ? 'flex-start' : 'center'}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Typography 
                variant={layout === 'grid' ? 'subtitle2' : 'body2'} 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  textAlign: layout === 'horizontal' ? 'left' : 'center',
                  lineHeight: 1.2,
                }}
              >
                {action.label}
              </Typography>
              {layout !== 'horizontal' && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    textAlign: 'center',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {action.description}
                </Typography>
              )}
            </Stack>
          </Button>
        </Tooltip>
      </Box>
    </Grow>
  );

  const renderListItem = (action: ActionItem, index: number) => (
    <Fade in timeout={400 + index * 100} key={action.id}>
      <Button
        variant="text"
        onClick={() => handleActionClick(action)}
        sx={{
          width: '100%',
          p: 2,
          borderRadius: 2,
          justifyContent: 'flex-start',
          gap: 2,
          border: `1px solid transparent`,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(getColorValue(action.color), 0.04),
            borderColor: alpha(getColorValue(action.color), 0.2),
            transform: 'translateX(4px)',
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(getColorValue(action.color), 0.1)}, ${alpha(getColorValue(action.color), 0.05)})`,
            border: `1px solid ${alpha(getColorValue(action.color), 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getColorValue(action.color),
          }}
        >
          {action.icon}
        </Box>
        <Stack spacing={0.5} alignItems="flex-start" sx={{ flex: 1, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {action.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {action.description}
          </Typography>
        </Stack>
      </Button>
    </Fade>
  );

  if (layout === 'list') {
    return (
      <Card 
        className={className}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
          background: theme.palette.background.paper,
          overflow: 'hidden',
        }}
      >
        {showHeader && (
          <CardHeader
            avatar={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Speed sx={{ color: 'white', fontSize: 20 }} />
              </Box>
            }
            title={
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Quick Actions
              </Typography>
            }
            action={
              <IconButton 
                size="small"
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Refresh />
              </IconButton>
            }
            sx={{ pb: 1 }}
          />
        )}
        
        <CardContent sx={{ pt: showHeader ? 0 : 3 }}>
          <Stack spacing={1}>
            {filteredActions.map(renderListItem)}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (layout === 'horizontal') {
    return (
      <Box className={className}>
        {showHeader && (
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Speed sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
          </Stack>
        )}
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            overflow: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {filteredActions.map((action, index) => (
            <Box key={action.id} sx={{ minWidth: 280 }}>
              {renderActionCard(action, index)}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Default grid layout
  return (
    <Card 
      className={className}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.04)}`,
        background: theme.palette.background.paper,
        overflow: 'hidden',
      }}
    >
      {showHeader && (
        <CardHeader
          avatar={
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Speed sx={{ color: 'white', fontSize: 20 }} />
            </Box>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Quick Actions
            </Typography>
          }
          action={
            <IconButton 
              size="small"
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <MoreVert />
            </IconButton>
          }
          sx={{ pb: 1 }}
        />
      )}
      
      <CardContent sx={{ pt: showHeader ? 0 : 3 }}>
        <Grid container spacing={2}>
          {filteredActions.map((action, index) => (
            <Grid item xs={6} sm={4} md={3} key={action.id}>
              {renderActionCard(action, index)}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}; 