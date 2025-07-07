import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Assignment as AssignmentIcon,
  RocketLaunch as RocketIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

export const QuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: t('dashboard.quickActions.createProject'),
      description: t('dashboard.quickActions.createProjectDesc'),
      icon: <AddIcon />,
      color: 'primary',
      onClick: () => navigate('/projects/create')
    },
    {
      title: t('dashboard.quickActions.createRequirement'),
      description: t('dashboard.quickActions.createRequirementDesc'),
      icon: <AssignmentIcon />,
      color: 'secondary',
      onClick: () => navigate('/requirements/create')
    },
    {
      title: t('dashboard.quickActions.createRelease'),
      description: t('dashboard.quickActions.createReleaseDesc'),
      icon: <RocketIcon />,
      color: 'success',
      onClick: () => navigate('/releases/create')
    },
    {
      title: t('dashboard.quickActions.createTestCase'),
      description: t('dashboard.quickActions.createTestCaseDesc'),
      icon: <BugIcon />,
      color: 'warning',
      onClick: () => navigate('/testing/create')
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('dashboard.quickActions.title')}
      </Typography>
      
      <Grid container spacing={2}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={action.onClick}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    color: `${action.color}.main`,
                    mb: 1,
                    fontSize: '2rem'
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  size="small" 
                  color={action.color as any}
                  variant="outlined"
                >
                  {t('common.create')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 