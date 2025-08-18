import React, { memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  AvatarGroup,
  Avatar,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  People as PeopleIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import type { Team } from '../model/types';

export interface TeamCardProps {
  /** Данные команды */
  team: Team;
  /** Обработчик клика по карточке */
  onClick?: (team: Team) => void;
  /** Обработчик меню действий */
  onMenuClick?: (event: React.MouseEvent, team: Team) => void;
  /** Показывать ли действия */
  showActions?: boolean;
  /** Компактный режим */
  compact?: boolean;
}

/**
 * Компонент карточки команды
 * Отображает основную информацию о команде, участников и статистику
 */
export const TeamCard = memo<TeamCardProps>(({
  team,
  onClick,
  onMenuClick,
  showActions = true,
  compact = false,
}) => {
  const handleCardClick = () => {
    onClick?.(team);
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onMenuClick?.(event, team);
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        '&:hover': onClick ? {
          boxShadow: 2,
          transform: 'translateY(-2px)',
        } : undefined,
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ pb: compact ? 1 : 2 }}>
        {/* Заголовок и действия */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flex={1}>
            <Typography 
              variant={compact ? "body1" : "h6"} 
              component="h3"
              sx={{ 
                fontWeight: 600,
                mb: compact ? 0.5 : 1,
                wordBreak: 'break-word',
              }}
            >
              {team.name}
            </Typography>
            
            {team.archived && (
              <Chip
                icon={<ArchiveIcon />}
                label="Архивирована"
                size="small"
                color="default"
                sx={{ mb: 1 }}
              />
            )}
          </Box>

          {showActions && (
            <Tooltip title="Действия">
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{ ml: 1 }}
              >
                <MoreIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Описание */}
        {team.description && !compact && (
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
            {team.description}
          </Typography>
        )}

        {/* Участники */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AvatarGroup 
              max={compact ? 3 : 4}
              sx={{ 
                '& .MuiAvatar-root': { 
                  width: compact ? 28 : 32, 
                  height: compact ? 28 : 32,
                  fontSize: compact ? '0.75rem' : '0.875rem',
                },
              }}
            >
              {team.members?.map((member, index) => (
                <Tooltip key={member.id || index} title={member.username || 'Участник'}>
                  <Avatar
                    src={member.avatar_url}
                    alt={member.username}
                  >
                    {member.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
            
            <Box display="flex" alignItems="center" ml={1}>
              <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {team.members?.length || 0}
              </Typography>
            </Box>
          </Box>

          {/* Дата создания */}
          {!compact && team.created_at && (
            <Typography variant="caption" color="text.secondary">
              {new Date(team.created_at).toLocaleDateString('ru-RU')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

TeamCard.displayName = 'TeamCard'; 