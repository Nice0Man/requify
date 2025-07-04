import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add,
  Assignment,
  RocketLaunch,
  BugReport,
  Assessment,
  Upload,
  Download,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Using shared utilities
import { usePermissions } from '@/shared/hooks';

// Widget props from types
import type { QuickActionsProps } from '../../types';

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  description: string;
  permission?: string;
}

const actionItems: ActionItem[] = [
  {
    label: 'Create Project',
    icon: <RocketLaunch />,
    color: 'primary',
    path: '/projects/create',
    description: 'Start a new project',
    permission: 'project:create',
  },
  {
    label: 'Add Requirement',
    icon: <Assignment />,
    color: 'info',
    path: '/requirements/create',
    description: 'Define new requirement',
    permission: 'requirement:create',
  },
  {
    label: 'Create Release',
    icon: <Assessment />,
    color: 'success',
    path: '/releases/create',
    description: 'Plan new release',
    permission: 'release:create',
  },
  {
    label: 'Run Tests',
    icon: <BugReport />,
    color: 'warning',
    path: '/testing',
    description: 'Execute test cases',
    permission: 'test:execute',
  },
  {
    label: 'Import Data',
    icon: <Upload />,
    color: 'secondary',
    path: '/admin/import',
    description: 'Import from file',
    permission: 'admin:write',
  },
  {
    label: 'Export Report',
    icon: <Download />,
    color: 'default',
    path: '/reports',
    description: 'Generate reports',
    permission: 'report:export',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions = [],
  layout = 'grid',
  className,
  onActionClick,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const filteredActions = actionItems.filter(action => {
    // Filter by provided actions list if specified
    if (actions.length > 0 && !actions.includes(action.label.toLowerCase().replace(' ', '-'))) {
      return false;
    }
    // Filter by permissions
    if (action.permission && !hasPermission(action.permission)) {
      return false;
    }
    return true;
  });

  const handleActionClick = (action: ActionItem) => {
    if (onActionClick) {
      onActionClick(action.label.toLowerCase().replace(' ', '-'));
    } else {
      navigate(action.path);
    }
  };

  const renderAction = (action: ActionItem) => (
    <Button
      key={action.label}
      variant="outlined"
      onClick={() => handleActionClick(action)}
      sx={{
        height: layout === 'grid' ? 120 : 60,
        display: 'flex',
        flexDirection: layout === 'grid' ? 'column' : 'row',
        gap: layout === 'grid' ? 1 : 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette[action.color as keyof typeof theme.palette]?.main || theme.palette.primary.main}, ${alpha(theme.palette[action.color as keyof typeof theme.palette]?.main || theme.palette.primary.main, 0.8)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {action.icon}
      </Box>
      {layout === 'grid' ? (
        <Box textAlign="center">
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {action.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {action.description}
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {action.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {action.description}
          </Typography>
        </Box>
      )}
    </Button>
  );

  if (layout === 'list') {
    return (
      <Card className={className}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {filteredActions.map(renderAction)}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {filteredActions.map((action) => (
            <Grid item xs={6} sm={4} md={3} key={action.label}>
              {renderAction(action)}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}; 