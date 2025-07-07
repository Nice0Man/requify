import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, alpha } from '@mui/material';
import { Add, Assignment, RocketLaunch, BugReport } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
}

export const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      title: 'New Project',
      description: 'Create a new project',
      icon: <RocketLaunch />,
      path: '/projects/new',
      color: '#3b82f6',
    },
    {
      title: 'Add Requirement',
      description: 'Create new requirement',
      icon: <Assignment />,
      path: '/requirements/new',
      color: '#10b981',
    },
    {
      title: 'Create Test Case',
      description: 'Add new test case',
      icon: <BugReport />,
      path: '/testing/new',
      color: '#f59e0b',
    },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Quick Actions
        </Typography>

        <List sx={{ p: 0 }}>
          {actions.map((action, index) => (
            <ListItem
              key={index}
              sx={{
                borderRadius: 2,
                mb: 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(action.color, 0.08),
                  transform: 'translateX(4px)',
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: action.color,
                }}
              >
                {action.icon}
              </ListItemIcon>
              <ListItemText
                primary={action.title}
                secondary={action.description}
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 
