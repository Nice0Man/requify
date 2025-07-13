import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, alpha, Chip } from '@mui/material';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed';
  progress: number;
  requirements: number;
  testCases: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return '#94a3b8';
    case 'in_progress': return '#3b82f6';
    case 'testing': return '#f59e0b';
    case 'completed': return '#10b981';
    default: return '#94a3b8';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'planning': return 'Planning';
    case 'in_progress': return 'In Progress';
    case 'testing': return 'Testing';
    case 'completed': return 'Completed';
    default: return 'Unknown';
  }
};

export const ProjectOverviewWidget: React.FC = () => {
  const projects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      status: 'in_progress',
      progress: 75,
      requirements: 24,
      testCases: 18,
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      status: 'testing',
      progress: 90,
      requirements: 16,
      testCases: 12,
    },
    {
      id: '3',
      name: 'API Integration',
      status: 'planning',
      progress: 25,
      requirements: 8,
      testCases: 3,
    },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Recent Projects
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {projects.map((project) => (
            <Box
              key={project.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(getStatusColor(project.status), 0.2)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: getStatusColor(project.status),
                  backgroundColor: alpha(getStatusColor(project.status), 0.02),
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600 }}
                >
                  {project.name}
                </Typography>
                <Chip
                  label={getStatusLabel(project.status)}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getStatusColor(project.status), 0.1),
                    color: getStatusColor(project.status),
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={project.progress || 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(getStatusColor(project.status), 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStatusColor(project.status),
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Requirements: {project.requirements}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Test Cases: {project.testCases}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}; 
