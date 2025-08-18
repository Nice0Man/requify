import React, { memo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  Collapse,
  Divider,
  Badge,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  ThumbUp as LikeIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Attachment as AttachmentIcon,
  Person as MentionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as TimeIcon,
} from "@mui/icons-material";
import type {
  Comment,
  CommentWithDetails,
  CommentMention,
} from "../model/types";

export interface CommentCardProps {
  /** Данные комментария */
  comment: Comment | CommentWithDetails;
  /** Обработчик клика по комментарию */
  onClick?: (comment: Comment) => void;
  /** Обработчик лайка */
  onLike?: (comment: Comment) => void;
  /** Обработчик ответа */
  onReply?: (comment: Comment) => void;
  /** Обработчик редактирования */
  onEdit?: (comment: Comment) => void;
  /** Обработчик удаления */
  onDelete?: (comment: Comment) => void;
  /** Обработчик клика по автору */
  onAuthorClick?: (authorId: string) => void;
  /** Обработчик клика по упоминанию */
  onMentionClick?: (mention: CommentMention) => void;
  /** Уровень вложенности (для ответов) */
  depth?: number;
  /** Показывать ли ответы */
  showReplies?: boolean;
  /** Компактный режим */
  compact?: boolean;
  /** Максимальная длина контента до сворачивания */
  maxContentLength?: number;
}

/**
 * Форматирование времени
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}д назад`;
  } else if (hours > 0) {
    return `${hours}ч назад`;
  } else if (minutes > 0) {
    return `${minutes}м назад`;
  } else {
    return "только что";
  }
};

/**
 * Обработка упоминаний в тексте
 */
const renderContentWithMentions = (
  content: string,
  mentions?: CommentMention[],
  onMentionClick?: (mention: CommentMention) => void
): React.ReactNode => {
  if (!mentions || mentions.length === 0) {
    return content;
  }

  let lastIndex = 0;
  const elements: React.ReactNode[] = [];

  mentions
    .sort((a, b) => a.startIndex - b.startIndex)
    .forEach((mention, index) => {
      // Добавляем текст до упоминания
      if (mention.startIndex > lastIndex) {
        elements.push(content.slice(lastIndex, mention.startIndex));
      }

      // Добавляем упоминание
      elements.push(
        <Chip
          key={`mention-${index}`}
          label={`@${mention.userName}`}
          size="small"
          variant="outlined"
          color="primary"
          icon={<MentionIcon />}
          onClick={() => onMentionClick?.(mention)}
          sx={{
            cursor: "pointer",
            mx: 0.5,
            "&:hover": {
              backgroundColor: "primary.light",
            },
          }}
        />
      );

      lastIndex = mention.endIndex;
    });

  // Добавляем оставшийся текст
  if (lastIndex < content.length) {
    elements.push(content.slice(lastIndex));
  }

  return elements;
};

/**
 * Компонент карточки комментария
 * Отображает комментарий с автором, содержимым, действиями и ответами
 */
export const CommentCard = memo<CommentCardProps>(
  ({
    comment,
    onClick,
    onLike,
    onReply,
    onEdit,
    onDelete,
    onAuthorClick,
    onMentionClick,
    depth = 0,
    showReplies = true,
    compact = false,
    maxContentLength = 300,
  }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showFullContent, setShowFullContent] = useState(false);
    const [repliesExpanded, setRepliesExpanded] = useState(depth < 2); // Автоматически раскрываем первые 2 уровня

    const isDetailedComment = "author" in comment;
    const author = isDetailedComment ? comment.author : null;
    const attachments = isDetailedComment ? comment.attachments : undefined;
    const mentions = isDetailedComment ? comment.mentions : undefined;
    const replies = comment.replies || [];

    const shouldTruncateContent =
      !showFullContent && comment.content.length > maxContentLength;
    const displayContent = shouldTruncateContent
      ? comment.content.slice(0, maxContentLength) + "..."
      : comment.content;

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleCardClick = () => {
      onClick?.(comment);
    };

    const handleLike = (event: React.MouseEvent) => {
      event.stopPropagation();
      onLike?.(comment);
    };

    const handleReply = (event: React.MouseEvent) => {
      event.stopPropagation();
      onReply?.(comment);
    };

    const handleEdit = () => {
      handleMenuClose();
      onEdit?.(comment);
    };

    const handleDelete = () => {
      handleMenuClose();
      onDelete?.(comment);
    };

    const handleAuthorClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      onAuthorClick?.(comment.authorId);
    };

    return (
      <Card
        sx={{
          ml: depth * 2, // Отступ для вложенных комментариев
          mb: 1,
          cursor: onClick ? "pointer" : "default",
          "&:hover": onClick
            ? {
                boxShadow: 1,
              }
            : undefined,
          transition: "box-shadow 0.2s ease-in-out",
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ pb: compact ? 1 : 2 }}>
          {/* Заголовок с автором */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  author?.isOnline ? (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "success.main",
                        border: "1px solid",
                        borderColor: "background.paper",
                      }}
                    />
                  ) : undefined
                }
              >
                <Avatar
                  src={comment.authorAvatar || author?.avatar}
                  alt={comment.authorName}
                  sx={{
                    width: compact ? 28 : 32,
                    height: compact ? 28 : 32,
                    cursor: onAuthorClick ? "pointer" : "default",
                  }}
                  onClick={handleAuthorClick}
                >
                  {comment.authorName[0]?.toUpperCase()}
                </Avatar>
              </Badge>

              <Box>
                <Typography
                  variant={compact ? "caption" : "subtitle2"}
                  sx={{
                    fontWeight: 600,
                    cursor: onAuthorClick ? "pointer" : "default",
                  }}
                  onClick={handleAuthorClick}
                >
                  {comment.authorName}
                  {author?.role && (
                    <Chip
                      label={author.role}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1, height: 16, fontSize: "0.6rem" }}
                    />
                  )}
                </Typography>

                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(comment.createdAt)}
                    {comment.isEdited && " (изменено)"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton size="small" onClick={handleMenuClick}>
              <MoreIcon />
            </IconButton>
          </Box>

          {/* Содержимое комментария */}
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {renderContentWithMentions(
              displayContent,
              mentions,
              onMentionClick
            )}
          </Typography>

          {/* Кнопка "Показать полностью" */}
          {shouldTruncateContent && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(true);
              }}
              sx={{ p: 0, minWidth: "auto" }}
            >
              Показать полностью
            </Button>
          )}

          {/* Вложения */}
          {attachments && attachments.length > 0 && (
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {attachments.map((attachment) => (
                <Chip
                  key={attachment.id}
                  icon={<AttachmentIcon />}
                  label={attachment.name}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(attachment.url, "_blank");
                  }}
                />
              ))}
            </Box>
          )}

          {/* Действия */}
          {!compact && (
            <Box mt={1} display="flex" alignItems="center" gap={1}>
              <Button
                size="small"
                startIcon={<LikeIcon />}
                color={comment.isLiked ? "primary" : "inherit"}
                onClick={handleLike}
                sx={{ minWidth: "auto" }}
              >
                {comment.likesCount || 0}
              </Button>

              {onReply && (
                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={handleReply}
                  sx={{ minWidth: "auto" }}
                >
                  Ответить
                </Button>
              )}

              {replies.length > 0 && showReplies && (
                <Button
                  size="small"
                  startIcon={
                    repliesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setRepliesExpanded(!repliesExpanded);
                  }}
                  sx={{ minWidth: "auto" }}
                >
                  {replies.length} {replies.length === 1 ? "ответ" : "ответов"}
                </Button>
              )}
            </Box>
          )}

          {/* Ответы */}
          {showReplies && replies.length > 0 && (
            <Collapse in={repliesExpanded}>
              <Box mt={2}>
                <Divider sx={{ mb: 1 }} />
                {replies.map((reply) => (
                  <CommentCard
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    compact={depth > 1}
                    showReplies={depth < 3} // Ограничиваем глубину вложенности
                    onClick={onClick}
                    onLike={onLike}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAuthorClick={onAuthorClick}
                    onMentionClick={onMentionClick}
                  />
                ))}
              </Box>
            </Collapse>
          )}

          {/* Меню действий */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {comment.canEdit && (
              <MenuItem onClick={handleEdit}>
                <EditIcon sx={{ mr: 1 }} />
                Редактировать
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                /* TODO: Поделиться */ handleMenuClose();
              }}
            >
              <ShareIcon sx={{ mr: 1 }} />
              Поделиться
            </MenuItem>

            {comment.canDelete && (
              <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                <DeleteIcon sx={{ mr: 1 }} />
                Удалить
              </MenuItem>
            )}
          </Menu>
        </CardContent>
      </Card>
    );
  }
);

CommentCard.displayName = "CommentCard";
