import React, { memo, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  GetApp as DownloadIcon,
  Description as NotesIcon,
  Assignment as RequirementsIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import type { Release } from "../model/types";
import {
  getStatusColor,
  getStatusText,
  formatReleaseDate,
  canPublishRelease,
  isReleasePublished,
} from "../model/utils";
import { ReleaseStatusIcon } from "./ReleaseStatusIcon";
import { ReleaseProgress } from "./ReleaseProgress";

export interface ReleaseCardProps {
  /** Данные релиза */
  release: Release;
  /** Обработчик клика по карточке */
  onClick?: (release: Release) => void;
  /** Обработчик редактирования */
  onEdit?: (release: Release) => void;
  /** Обработчик удаления */
  onDelete?: (release: Release) => void;
  /** Обработчик публикации */
  onPublish?: (release: Release) => void;
  /** Обработчик скачивания */
  onDownload?: (release: Release) => void;
  /** Обработчик просмотра заметок */
  onViewNotes?: (release: Release) => void;
  /** Обработчик просмотра требований */
  onViewRequirements?: (release: Release) => void;
  /** Показывать ли действия */
  showActions?: boolean;
  /** Компактный режим */
  compact?: boolean;
  /** Выбрана ли карточка */
  selected?: boolean;
}

/**
 * Компонент карточки релиза
 */
export const ReleaseCard = memo<ReleaseCardProps>(
  ({
    release,
    onClick,
    onEdit,
    onDelete,
    onPublish,
    onDownload,
    onViewNotes,
    onViewRequirements,
    showActions = true,
    compact = false,
    selected = false,
  }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleCardClick = () => {
      onClick?.(release);
    };

    const handleEdit = () => {
      handleMenuClose();
      onEdit?.(release);
    };

    const handleDelete = () => {
      handleMenuClose();
      onDelete?.(release);
    };

    const handlePublish = () => {
      handleMenuClose();
      onPublish?.(release);
    };

    const canPublish = canPublishRelease(release) && onPublish;
    const isPublished = isReleasePublished(release);

    return (
      <Card
        onClick={handleCardClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          transition: "all 0.2s ease",
          border: selected ? 2 : 1,
          borderColor: selected ? "primary.main" : "divider",
          "&:hover": onClick
            ? {
                boxShadow: 4,
                transform: "translateY(-2px)",
              }
            : {},
          height: compact ? "auto" : 300,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: compact ? 1 : 2 }}>
          {/* Заголовок и меню действий */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
          >
            <Box flex={1}>
              <Typography
                variant={compact ? "subtitle1" : "h6"}
                component="h3"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  mr: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: compact ? 1 : 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {release.name}
              </Typography>

              <Typography
                variant="body2"
                color="primary"
                sx={{ fontWeight: 500, mt: 0.5 }}
              >
                v{release.version}
              </Typography>
            </Box>

            {showActions && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  sx={{ mt: -0.5 }}
                >
                  <MoreIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  {onEdit && (
                    <MenuItem onClick={handleEdit}>
                      <EditIcon sx={{ mr: 1 }} fontSize="small" />
                      Редактировать
                    </MenuItem>
                  )}

                  {canPublish && (
                    <MenuItem onClick={handlePublish}>
                      <PublishIcon sx={{ mr: 1 }} fontSize="small" />
                      Опубликовать
                    </MenuItem>
                  )}

                  {onDownload && isPublished && (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        onDownload(release);
                      }}
                    >
                      <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                      Скачать
                    </MenuItem>
                  )}

                  {onViewNotes && (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        onViewNotes(release);
                      }}
                    >
                      <NotesIcon sx={{ mr: 1 }} fontSize="small" />
                      Заметки к релизу
                    </MenuItem>
                  )}

                  {(onEdit || canPublish || onDownload || onViewNotes) &&
                    onDelete && <Divider />}

                  {onDelete && (
                    <MenuItem
                      onClick={handleDelete}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                      Удалить
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>

          {/* Статус релиза */}
          <Box mb={compact ? 1 : 2}>
            <Chip
              icon={<ReleaseStatusIcon status={release.status} />}
              label={getStatusText(release.status)}
              color={getStatusColor(release.status)}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Описание (только в полном режиме) */}
          {!compact && release.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {release.description}
            </Typography>
          )}

          {/* Даты релиза */}
          {!compact && (
            <Stack spacing={0.5} mb={2}>
              {/* Планируемая дата */}
              {release.plannedDate && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Планируется: {formatReleaseDate(release.plannedDate)}
                  </Typography>
                </Box>
              )}

              {/* Дата релиза */}
              {release.releaseDate && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <PublishIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Выпущен: {formatReleaseDate(release.releaseDate)}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}

          {/* Статистика и прогресс (только если есть данные) */}
          {!compact && <ReleaseProgress release={release} />}

          {/* Компактная версия может показать только прогресс-бар */}
          {compact && (
            <Box mt={1}>
              <ReleaseProgress release={release} compact />
            </Box>
          )}
        </CardContent>

        {/* Действия в нижней части */}
        {showActions && !compact && (
          <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
            <Stack direction="row" spacing={1} width="100%" alignItems="center">
              {onViewRequirements && (
                <Tooltip title="Требования">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRequirements(release);
                    }}
                  >
                    <RequirementsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onViewNotes && (
                <Tooltip title="Заметки к релизу">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewNotes(release);
                    }}
                  >
                    <NotesIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Box flexGrow={1} />

              {/* Кнопка публикации */}
              {canPublish && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PublishIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPublish(release);
                  }}
                >
                  Опубликовать
                </Button>
              )}

              {/* Кнопка скачивания */}
              {onDownload && isPublished && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(release);
                  }}
                >
                  Скачать
                </Button>
              )}
            </Stack>
          </CardActions>
        )}
      </Card>
    );
  }
);

ReleaseCard.displayName = "ReleaseCard";
