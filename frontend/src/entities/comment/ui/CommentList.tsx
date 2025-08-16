import { memo, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Skeleton,
  Alert,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Sort as SortIcon,
  ViewList as ThreadIcon,
  ViewHeadline as FlatIcon,
  ViewCompact as CompactIcon,
} from "@mui/icons-material";
import { CommentCard } from "./CommentCard";
import {
  CommentSortOrder,
  CommentViewMode,
  type Comment,
  type CommentFilters,
  type CommentWithDetails,
  type CommentMention,
  type CommentEntityType,
} from "../model/types";

export interface CommentListProps {
  /** Список комментариев */
  comments: (Comment | CommentWithDetails)[];
  /** Режим отображения */
  viewMode?: CommentViewMode;
  /** Порядок сортировки */
  sortOrder?: CommentSortOrder;
  /** Загрузка */
  loading?: boolean;
  /** Ошибка */
  error?: string | null;
  /** Начальные фильтры */
  initialFilters?: Partial<CommentFilters>;
  /** Обработчик клика по комментарию */
  onCommentClick?: (comment: Comment) => void;
  /** Обработчик лайка */
  onCommentLike?: (comment: Comment) => void;
  /** Обработчик ответа */
  onCommentReply?: (comment: Comment) => void;
  /** Обработчик редактирования */
  onCommentEdit?: (comment: Comment) => void;
  /** Обработчик удаления */
  onCommentDelete?: (comment: Comment) => void;
  /** Обработчик клика по автору */
  onAuthorClick?: (authorId: string) => void;
  /** Обработчик клика по упоминанию */
  onMentionClick?: (mention: CommentMention) => void;
  /** Обработчик изменения фильтров */
  onFiltersChange?: (filters: CommentFilters) => void;
  /** Обработчик изменения режима отображения */
  onViewModeChange?: (mode: CommentViewMode) => void;
  /** Обработчик изменения сортировки */
  onSortOrderChange?: (order: CommentSortOrder) => void;
  /** Показывать ли поиск */
  showSearch?: boolean;
  /** Показывать ли фильтры */
  showFilters?: boolean;
  /** Показывать ли контролы сортировки */
  showSorting?: boolean;
  /** Пустое состояние */
  emptyStateMessage?: string;
}

const ENTITY_TYPE_OPTIONS: CommentEntityType[] = [
  "requirement",
  "project",
  "release",
  "test-case",
];
const SORT_ORDER_OPTIONS: { value: CommentSortOrder; label: string }[] = [
  { value: CommentSortOrder.NEWEST_FIRST, label: "Сначала новые" },
  { value: CommentSortOrder.OLDEST_FIRST, label: "Сначала старые" },
  { value: CommentSortOrder.MOST_LIKED, label: "По популярности" },
  { value: CommentSortOrder.MOST_REPLIES, label: "Больше ответов" },
];

/**
 * Сортировка комментариев
 */
const sortComments = (
  comments: (Comment | CommentWithDetails)[],
  sortOrder: CommentSortOrder
): (Comment | CommentWithDetails)[] => {
  const sorted = [...comments];

  switch (sortOrder) {
    case CommentSortOrder.NEWEST_FIRST:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case CommentSortOrder.OLDEST_FIRST:
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case CommentSortOrder.MOST_LIKED:
      return sorted.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    case CommentSortOrder.MOST_REPLIES:
      return sorted.sort(
        (a, b) => (b.replies?.length || 0) - (a.replies?.length || 0)
      );
    default:
      return sorted;
  }
};

/**
 * Преобразование в плоский список (для flat режима)
 */
const flattenComments = (
  comments: (Comment | CommentWithDetails)[]
): (Comment | CommentWithDetails)[] => {
  const result: (Comment | CommentWithDetails)[] = [];

  const flatten = (
    commentList: (Comment | CommentWithDetails)[],
    depth = 0
  ) => {
    commentList.forEach((comment) => {
      result.push({ ...comment, depth } as any);
      if (comment.replies && comment.replies.length > 0) {
        flatten(comment.replies, depth + 1);
      }
    });
  };

  flatten(comments);
  return result;
};

/**
 * Компонент списка комментариев
 * Поддерживает поиск, фильтрацию, сортировку и разные режимы отображения
 */
export const CommentList = memo<CommentListProps>(
  ({
    comments,
    viewMode = CommentViewMode.THREAD,
    sortOrder = CommentSortOrder.NEWEST_FIRST,
    loading = false,
    error = null,
    initialFilters = {},
    onCommentClick,
    onCommentLike,
    onCommentReply,
    onCommentEdit,
    onCommentDelete,
    onAuthorClick,
    onMentionClick,
    onFiltersChange,
    onViewModeChange,
    onSortOrderChange,
    showSearch = true,
    showFilters = true,
    showSorting = true,
    emptyStateMessage = "Комментарии не найдены",
  }) => {
    const [filters, setFilters] = useState<CommentFilters>({
      search: "",
      entityType: [],
      hasReplies: undefined,
      hasAttachments: undefined,
      onlyMentioned: false,
      ...initialFilters,
    });

    // Фильтрация комментариев
    const filteredComments = useMemo(() => {
      return comments.filter((comment) => {
        const matchesSearch =
          !filters.search ||
          comment.content
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          comment.authorName
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        const matchesEntityType =
          !filters.entityType?.length ||
          filters.entityType.includes(comment.entityType);

        const matchesAuthor =
          !filters.authorId || comment.authorId === filters.authorId;

        const matchesEntity =
          !filters.entityId || comment.entityId === filters.entityId;

        const matchesReplies =
          filters.hasReplies === undefined ||
          (filters.hasReplies
            ? (comment.replies?.length || 0) > 0
            : (comment.replies?.length || 0) === 0);

        const matchesAttachments =
          filters.hasAttachments === undefined ||
          (comment as CommentWithDetails).attachments
            ? filters.hasAttachments
              ? (comment as CommentWithDetails).attachments!.length > 0
              : (comment as CommentWithDetails).attachments!.length === 0
            : !filters.hasAttachments;

        return (
          matchesSearch &&
          matchesEntityType &&
          matchesAuthor &&
          matchesEntity &&
          matchesReplies &&
          matchesAttachments
        );
      });
    }, [comments, filters]);

    // Сортировка комментариев
    const sortedComments = useMemo(() => {
      return sortComments(filteredComments, sortOrder);
    }, [filteredComments, sortOrder]);

    // Подготовка комментариев для отображения
    const displayComments = useMemo(() => {
      switch (viewMode) {
        case CommentViewMode.FLAT:
          return flattenComments(sortedComments);
        case CommentViewMode.COMPACT:
        case CommentViewMode.THREAD:
        default:
          return sortedComments;
      }
    }, [sortedComments, viewMode]);

    // Обработчик изменения фильтров
    const handleFiltersChange = (newFilters: Partial<CommentFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange?.(updatedFilters);
    };

    // Рендер скелетонов при загрузке
    const renderSkeletons = () => (
      <Box>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box>
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="text" width={80} height={16} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        ))}
      </Box>
    );

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    return (
      <Box>
        {/* Поиск и фильтры */}
        {(showSearch || showFilters || showSorting) && (
          <Paper sx={{ p: 2, mb: 3 }}>
            {showSearch && (
              <TextField
                fullWidth
                placeholder="Поиск комментариев..."
                value={filters.search}
                onChange={(e) =>
                  handleFiltersChange({ search: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: showFilters || showSorting ? 2 : 0 }}
              />
            )}

            {(showFilters || showSorting) && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
              >
                {/* Фильтры */}
                {showFilters && (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    flexWrap="wrap"
                  >
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Тип сущности</InputLabel>
                      <Select
                        multiple
                        value={filters.entityType || []}
                        onChange={(e) =>
                          handleFiltersChange({
                            entityType: e.target.value as CommentEntityType[],
                          })
                        }
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {ENTITY_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={filters.hasReplies}
                      onChange={(_, value) =>
                        handleFiltersChange({ hasReplies: value })
                      }
                    >
                      <ToggleButton value={true}>С ответами</ToggleButton>
                      <ToggleButton value={false}>Без ответов</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}

                {/* Контролы сортировки и режима */}
                <Box display="flex" alignItems="center" gap={2}>
                  {showSorting && (
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Сортировка</InputLabel>
                      <Select
                        value={sortOrder}
                        onChange={(e) =>
                          onSortOrderChange?.(
                            e.target.value as CommentSortOrder
                          )
                        }
                        startAdornment={<SortIcon />}
                      >
                        {SORT_ORDER_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {onViewModeChange && (
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(_, mode) => mode && onViewModeChange(mode)}
                      size="small"
                    >
                      <ToggleButton value={CommentViewMode.THREAD}>
                        <ThreadIcon />
                      </ToggleButton>
                      <ToggleButton value={CommentViewMode.FLAT}>
                        <FlatIcon />
                      </ToggleButton>
                      <ToggleButton value={CommentViewMode.COMPACT}>
                        <CompactIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Заголовок и статистика */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="body2" color="text.secondary">
            {loading
              ? "Загрузка..."
              : `Найдено комментариев: ${displayComments.length}`}
          </Typography>
        </Box>

        {/* Содержимое */}
        {loading ? (
          renderSkeletons()
        ) : (
          <>
            {displayComments.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={8}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {emptyStateMessage}
                </Typography>
                {filters.search && (
                  <Typography variant="body2" color="text.secondary">
                    Попробуйте изменить критерии поиска
                  </Typography>
                )}
              </Box>
            ) : (
              <Box>
                {displayComments.map((comment, index) => (
                  <Fade in timeout={300} key={comment.id}>
                    <div>
                      <CommentCard
                        comment={comment}
                        onClick={onCommentClick}
                        onLike={onCommentLike}
                        onReply={onCommentReply}
                        onEdit={onCommentEdit}
                        onDelete={onCommentDelete}
                        onAuthorClick={onAuthorClick}
                        onMentionClick={onMentionClick}
                        depth={
                          viewMode === CommentViewMode.FLAT
                            ? (comment as any).depth
                            : 0
                        }
                        showReplies={viewMode === CommentViewMode.THREAD}
                        compact={viewMode === CommentViewMode.COMPACT}
                      />
                      {index < displayComments.length - 1 &&
                        viewMode === CommentViewMode.FLAT && (
                          <Divider sx={{ my: 1 }} />
                        )}
                    </div>
                  </Fade>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    );
  }
);

CommentList.displayName = "CommentList";
