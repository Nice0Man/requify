import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Message as MessageIcon,
  Person as PersonIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import type { Comment } from '../model/types';

interface CommentCardProps {
  comment: Comment;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
  onReply?: (comment: Comment) => void;
  variant?: 'default' | 'compact';
  showActions?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
  variant = 'default',
  showActions = true,
}) => {
  const isCompact = variant === 'compact';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: isCompact ? 1 : 2,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ pb: isCompact ? 1 : 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Author Avatar */}
          <Avatar
            sx={{
              width: isCompact ? 32 : 40,
              height: isCompact ? 32 : 40,
              bgcolor: 'primary.main',
            }}
          >
            {comment.author_name ?
              getUserInitials(comment.author_name) :
              <PersonIcon fontSize="small" />
            }
          </Avatar>

          {/* Comment Content */}
          <Box flex={1}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant={isCompact ? "body2" : "subtitle2"}
                  fontWeight={600}
                >
                  {comment.author_name || 'Unknown User'}
                </Typography>

                {comment.type && (
                  <Chip
                    label={comment.type}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>

              {showActions && (
                <IconButton size="small">
                  <MoreIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Comment Text */}
            <Typography
              variant={isCompact ? "body2" : "body1"}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              {comment.content}
            </Typography>

            {/* Footer */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.created_at)}
              </Typography>

              {!isCompact && (
                <Box display="flex" gap={1}>
                  {onReply && (
                    <Chip
                      label="Reply"
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => onReply(comment)}
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  )}

                  {onEdit && (
                    <Chip
                      label="Edit"
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => onEdit(comment)}
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  )}

                  {onDelete && (
                    <Chip
                      label="Delete"
                      size="small"
                      variant="outlined"
                      color="error"
                      clickable
                      onClick={() => onDelete(comment.id)}
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 