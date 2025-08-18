/**
 * Requirement Card UI Component
 * Карточка требования для отображения в списках
 */

import React, { memo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  AttachFile as AttachIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import type { 
  RequirementType, 
  RequirementPriority, 
  RequirementStatus 
} from '../model/types';

export interface RequirementCardProps {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  progress: number;
  assigneeName?: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  commentsCount?: number;
  attachmentsCount?: number;
  relationsCount?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * Получить цвет для приоритета
 */
const getPriorityColor = (priority: RequirementPriority): string => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800', 
    high: '#f44336',
    critical: '#9c27b0',
  };
  return colors[priority];
};

/**
 * Получить цвет для статуса
 */
const getStatusColor = (status: RequirementStatus): string => {
  const colors = {
    draft: '#9e9e9e',
    review: '#2196f3',
    approved: '#4caf50',
    in_development: '#ff9800',
    testing: '#9c27b0',
    completed: '#4caf50',
    rejected: '#f44336',
  };
  return colors[status];
};

/**
 * Получить перевод типа
 */
const getTypeLabel = (type: RequirementType): string => {
  const labels = {
    functional: 'Функциональное',
    non_functional: 'Нефункциональное',
    business: 'Бизнес',
    user_story: 'Пользовательская история',
    epic: 'Эпик',
  };
  return labels[type];
};

/**
 * Получить перевод приоритета
 */
const getPriorityLabel = (priority: RequirementPriority): string => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
  };
  return labels[priority];
};

/**
 * Получить перевод статуса
 */
const getStatusLabel = (status: RequirementStatus): string => {
  const labels = {
    draft: 'Черновик',
    review: 'На проверке',
    approved: 'Утвержден',
    in_development: 'В разработке',
    testing: 'Тестирование',
    completed: 'Выполнен',
    rejected: 'Отклонен',
  };
  return labels[status];
};

export const RequirementCard = memo<RequirementCardProps>(({
  id,
  title,
  description,
  type,
  priority,
  status,
  progress,
  assigneeName,
  authorName,
  createdAt,
  updatedAt,
  tags,
  commentsCount = 0,
  attachmentsCount = 0,
  relationsCount = 0,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
}) => {
  const theme = useTheme();

  const handleCardClick = (e: React.MouseEvent) => {
    // Не вызываем onClick если кликнули по действиям
    if ((e.target as HTMLElement).closest('.card-actions')) {
      return;
    }
    onClick?.();
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
        transition: 'all 0.2s ease-in-out',
        mb: compact ? 1 : 2,
      }}
    >
      <CardContent sx={{ pb: compact ? 1 : 2 }}>
        {/* Заголовок и статус */}
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
          <Typography 
            variant={compact ? "body1" : "h6"} 
            component="h3"
            sx={{ 
              fontWeight: 600,
              lineHeight: 1.2,
              flex: 1,
              mr: 1,
            }}
          >
            {title}
          </Typography>
          <Chip
            label={getStatusLabel(status)}
            size="small"
            sx={{
              backgroundColor: getStatusColor(status),
              color: 'white',
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Описание */}
        {!compact && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Typography>
        )}

        {/* Прогресс */}
        {progress > 0 && (
          <Box mb={compact ? 1 : 2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Прогресс
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Метаданные */}
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center" 
          flexWrap="wrap"
          gap={0.5}
          mb={compact ? 0.5 : 1}
        >
          <Chip
            label={getTypeLabel(type)}
            size="small"
            variant="outlined"
          />
          <Chip
            label={getPriorityLabel(priority)}
            size="small"
            sx={{
              backgroundColor: getPriorityColor(priority),
              color: 'white',
            }}
          />
          {tags.slice(0, compact ? 1 : 2).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
          {tags.length > (compact ? 1 : 2) && (
            <Typography variant="caption" color="text.secondary">
              +{tags.length - (compact ? 1 : 2)}
            </Typography>
          )}
        </Stack>

        {/* Информация об авторе и исполнителе */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Автор: {authorName}
            </Typography>
            {assigneeName && (
              <>
                <Typography variant="caption" color="text.secondary">•</Typography>
                <Typography variant="caption" color="text.secondary">
                  Исполнитель: {assigneeName}
                </Typography>
              </>
            )}
          </Box>
          
          {!compact && (
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(updatedAt, { 
                addSuffix: true, 
                locale: ru 
              })}
            </Typography>
          )}
        </Box>

        {/* Счетчики */}
        {!compact && (commentsCount > 0 || attachmentsCount > 0 || relationsCount > 0) && (
          <Stack direction="row" spacing={2} alignItems="center" mt={1}>
            {commentsCount > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CommentIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {commentsCount}
                </Typography>
              </Box>
            )}
            {attachmentsCount > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <AttachIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {attachmentsCount}
                </Typography>
              </Box>
            )}
            {relationsCount > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <LinkIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {relationsCount}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </CardContent>

      {/* Действия */}
      {showActions && (onEdit || onDelete) && (
        <CardActions className="card-actions" sx={{ pt: 0, px: 2, pb: 1 }}>
          <Box display="flex" gap={0.5}>
            {onEdit && (
              <Tooltip title="Редактировать">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Удалить">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardActions>
      )}
    </Card>
  );
});

RequirementCard.displayName = 'RequirementCard'; 