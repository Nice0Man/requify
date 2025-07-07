import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Assignment,
  CalendarToday,
  Person,
  MoreVert,
} from '@mui/icons-material';
import { RequirementProgress } from './RequirementProgress';
import type { Requirement } from '../model/types';

interface RequirementCardProps {
  requirement: Requirement;
  size?: 'small' | 'default' | 'large';
  showPriority?: boolean;
  showStatus?: boolean;
  showDeadline?: boolean;
  showProgress?: boolean;
  editable?: boolean;
  onClick?: (requirement: Requirement) => void;
  onProgressUpdate?: (progress: number) => Promise<void>;
  className?: string;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  size = 'default',
  showPriority = true,
  showStatus = true,
  showDeadline = true,
  showProgress = true,
  editable = false,
  onClick,
  onProgressUpdate,
  className,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onClick) {
      onClick(requirement);
    }
  };

  const getPriorityColor = (priorityId: number) => {
    switch (priorityId) {
      case 1: return theme.palette.error.main; // High
      case 2: return theme.palette.warning.main; // Medium
      case 3: return theme.palette.info.main; // Low
      default: return theme.palette.grey[500];
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return theme.palette.grey[500]; // Draft
      case 2: return theme.palette.info.main; // In Progress
      case 3: return theme.palette.success.main; // Completed
      case 4: return theme.palette.error.main; // Cancelled
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Card
      className={className}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ 
        p: size === 'small' ? 1.5 : 2,
        '&:last-child': { pb: size === 'small' ? 1.5 : 2 },
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar 
              sx={{ 
                width: size === 'small' ? 24 : 32, 
                height: size === 'small' ? 24 : 32,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Assignment fontSize={size === 'small' ? 'small' : 'medium'} />
            </Avatar>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              REQ-{requirement.id}
            </Typography>
          </Stack>
          
          <IconButton size="small" sx={{ opacity: 0.7 }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Stack>

        {/* Title */}
        <Typography 
          variant={size === 'small' ? 'body2' : 'h6'}
          sx={{ 
            mb: 1,
            fontWeight: 600,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}
          title={requirement.title}
        >
          {requirement.title}
        </Typography>

        {/* Description */}
        {requirement.description && (
          <Typography 
            variant="body2"
            color="text.secondary"
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: size === 'small' ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {requirement.description}
          </Typography>
        )}

        {/* Progress */}
        {showProgress && (
          <Box sx={{ mb: 2 }}>
            <RequirementProgress
              progress={requirement.progress || 0}
              requirementId={requirement.id}
              editable={editable}
              size={size === 'small' ? 'small' : 'medium'}
              onProgressUpdate={onProgressUpdate}
            />
          </Box>
        )}

        {/* Tags */}
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
          {showStatus && (
            <Chip
              label={`Статус: ${requirement.status || requirement.status_id}`}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(requirement.status_id), 0.1),
                color: getStatusColor(requirement.status_id),
                fontWeight: 500,
              }}
            />
          )}
          
          {showPriority && (
            <Chip
              label={`Приоритет: ${requirement.priority || requirement.priority_id}`}
              size="small"
              sx={{
                backgroundColor: alpha(getPriorityColor(requirement.priority_id), 0.1),
                color: getPriorityColor(requirement.priority_id),
                fontWeight: 500,
              }}
            />
          )}
        </Stack>

        {/* Footer */}
        <Box sx={{ mt: 'auto' }}>
          {showDeadline && requirement.deadline && (
            <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
              <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Срок: {new Date(requirement.deadline).toLocaleDateString('ru-RU')}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Создано: {new Date(requirement.created_at).toLocaleDateString('ru-RU')}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}; 