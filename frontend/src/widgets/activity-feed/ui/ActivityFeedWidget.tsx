import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Badge,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Undo as UndoIcon,
  Launch as LaunchIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Description as FileIcon,
  Edit,
  Delete as DeleteIcon,
  CreateNewFolder as FolderPlusIcon,
  FolderOpen,
  Inventory as PackageIcon,
  PersonAdd as UserPlusIcon,
  ChatBubble as MessageIcon,
  PlayCircle,
  Refresh as RefreshCwIcon,
  AccountCircle as UserIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useDashboardStyleSystem, DASHBOARD_TOKENS } from "@/shared/styles";
import { ErrorBoundary } from "@/shared/ui";
import type {
  ActivityFeedWidgetProps,
  ActivityItem,
  ActivityType,
  ActivityPriority,
  ActivityFilters,
} from "../model";
import i18n from "@/shared/lib/i18n";

/**
 * Получить иконку для типа активности
 */
  const getActivityIcon = (type: ActivityType): React.ReactElement => {
    const iconMap: Record<ActivityType, React.ReactElement> = {
      requirement_created: <FileIcon sx={{ fontSize: 16 }} />,
      requirement_updated: <Edit sx={{ fontSize: 16 }} />,
      requirement_deleted: <DeleteIcon sx={{ fontSize: 16 }} />,
      project_created: <FolderPlusIcon sx={{ fontSize: 16 }} />,
      project_updated: <FolderOpen sx={{ fontSize: 16 }} />,
      release_published: <PackageIcon sx={{ fontSize: 16 }} />,
      user_joined: <UserPlusIcon sx={{ fontSize: 16 }} />,
      comment_added: <MessageIcon sx={{ fontSize: 16 }} />,
      test_executed: <PlayCircle sx={{ fontSize: 16 }} />,
      status_changed: <RefreshCwIcon sx={{ fontSize: 16 }} />,
      // Добавляю недостающие простые типы
      project: <FolderOpen sx={{ fontSize: 16 }} />,
      requirement: <FileIcon sx={{ fontSize: 16 }} />,
      release: <PackageIcon sx={{ fontSize: 16 }} />,
      user: <UserIcon sx={{ fontSize: 16 }} />,
      testing: <PlayCircle sx={{ fontSize: 16 }} />,
    };

  return iconMap[type] || <AssignmentIcon fontSize="small" />;
};

/**
 * Получить цвет для приоритета активности
 */
const getPriorityColor = (priority: ActivityPriority): string => {
  const colorMap: Record<ActivityPriority, string> = {
    low: DASHBOARD_TOKENS.colors.dashboard.info,
    medium: DASHBOARD_TOKENS.colors.dashboard.warning,
    high: DASHBOARD_TOKENS.colors.dashboard.error,
    critical: DASHBOARD_TOKENS.colors.dashboard.error,
  };

  return colorMap[priority];
};

/**
 * Компонент элемента активности
 */
const ActivityItemComponent = memo<{
  item: ActivityItem;
  displayConfig: any;
  onItemClick?: (item: ActivityItem) => void;
  onUndoAction?: (item: ActivityItem) => void;
  isCompact: boolean;
}>(({ item, displayConfig, onItemClick, onUndoAction, isCompact }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleItemClick = useCallback(() => {
    onItemClick?.(item);
  }, [item, onItemClick]);

  const handleUndoClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onUndoAction?.(item);
      handleMenuClose();
    },
    [item, onUndoAction, handleMenuClose]
  );

  const timeAgo = useMemo(() => {
    return formatDistanceToNow(item.timestamp, {
      addSuffix: true,
      locale: ru,
    });
  }, [item.timestamp]);

  const priorityColor = useMemo(
    () => getPriorityColor(item.priority),
    [item.priority]
  );

  return (
    <ListItem
      onClick={handleItemClick}
      sx={{
        cursor: onItemClick ? "pointer" : "default",
        borderRadius: 2,
        mb: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(8px)",
        transition: `all ${DASHBOARD_TOKENS.animation.duration.shorter}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,

        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderColor: alpha(theme.palette.primary.main, 0.12),
          transform: "translateY(-1px)",
          boxShadow: "none", // Удаляю getShadowForState
        },

        "&:active": {
          transform: "translateY(0)",
        },
      }}
    >
      {displayConfig.showAvatars && (
        <ListItemAvatar>
          <Badge
            color="primary"
            variant="dot"
            invisible={item.status !== "pending"}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: priorityColor,
              },
            }}
          >
            <Avatar
              src={item.author.avatar}
              sx={{
                width: isCompact ? 32 : 40,
                height: isCompact ? 32 : 40,
                bgcolor: alpha(priorityColor, 0.1),
                color: priorityColor,
              }}
            >
              {getActivityIcon(item.type)}
            </Avatar>
          </Badge>
        </ListItemAvatar>
      )}

      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} component="span">
            <Typography
              variant={isCompact ? "body2" : "subtitle2"}
              fontWeight={600}
              color="text.primary"
              component="span"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {item.title}
            </Typography>

            {displayConfig.showPriorities && (
              <Chip
                size="small"
                label={item.priority}
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  backgroundColor: alpha(priorityColor, 0.1),
                  color: priorityColor,
                  border: `1px solid ${alpha(priorityColor, 0.2)}`,
                }}
              />
            )}
          </Box>
        }
        secondary={
          <Box component="span">
            {item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{
                  mt: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: isCompact ? 1 : 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.description.length > displayConfig.maxDescriptionLength
                  ? `${item.description.slice(
                      0,
                      displayConfig.maxDescriptionLength
                    )}...`
                  : item.description}
              </Typography>
            )}

            <Box display="flex" alignItems="center" gap={1} mt={0.5} component="span">
              <Typography variant="caption" color="text.secondary" component="span">
                {item.author.name}
              </Typography>

              {displayConfig.showTimestamps && (
                <>
                  <Box
                    component="span"
                    sx={{
                      width: 2,
                      height: 2,
                      bgcolor: "text.secondary",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" component="span">
                    {timeAgo}
                  </Typography>
                </>
              )}

              {displayConfig.showStatuses && (
                <Chip
                  size="small"
                  label={item.status}
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    borderColor: alpha(theme.palette.text.secondary, 0.3),
                  }}
                />
              )}
            </Box>

            {displayConfig.showTags && item.tags && item.tags.length > 0 && (
              <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap" component="span">
                {item.tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    size="small"
                    label={tag}
                    variant="outlined"
                    sx={{
                      height: 16,
                      fontSize: "0.6rem",
                    }}
                  />
                ))}
                {item.tags.length > 3 && (
                  <Typography variant="caption" color="text.secondary" component="span">
                    +{item.tags.length - 3}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        }
      />

      {displayConfig.showActions && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            size="small"
            onClick={handleMenuClick}
            sx={{
              opacity: 0.7,
              transition: `opacity ${DASHBOARD_TOKENS.animation.duration.shorter}ms`,
              "&:hover": { opacity: 1 },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {item.actionUrl && (
              <MenuItem onClick={() => window.open(item.actionUrl, "_blank")}>
                <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
                Открыть
              </MenuItem>
            )}

            {item.isUndoable && (
              <MenuItem onClick={handleUndoClick}>
                <UndoIcon fontSize="small" sx={{ mr: 1 }} />
                Отменить
              </MenuItem>
            )}
          </Menu>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
});

ActivityItemComponent.displayName = "ActivityItemComponent";

/**
 * ActivityFeedWidget - виджет ленты активности
 * Полная поддержка Context7 и всех режимов дашборда
 */
export const ActivityFeedWidget = memo<ActivityFeedWidgetProps>(
  ({
    mode = "detailed",
    layout = "grid",
    density = "comfortable",
    data = [],
    isDataLoading = false,
    dataError = null,
    maxItems = 50,
    infiniteScroll = false,
    showFilters = true,
    showSearch = true,
    autoRefreshInterval,
    filters,
    displayConfig: userDisplayConfig,
    onRefresh,
    onItemClick,
    onUndoAction,
    onFiltersChange,
    className,
    sx,
    ...props
  }) => {
    const theme = useTheme();
    const styleSystem = useDashboardStyleSystem(mode, layout, density);

    // Локальное состояние
    const [searchQuery, setSearchQuery] = useState("");
    const [localFilters, setLocalFilters] = useState<ActivityFilters>(
      filters || {}
    );
    const [refreshing, setRefreshing] = useState(false);

    // Конфигурация отображения по умолчанию
    const defaultDisplayConfig = useMemo(
      () => ({
        showAvatars: mode !== "minimal",
        showTimestamps: mode === "detailed" || mode === "fullscreen",
        showPriorities: mode === "detailed" || mode === "fullscreen",
        showStatuses: mode === "detailed" || mode === "fullscreen",
        showRelatedEntities: mode === "fullscreen",
        showTags: mode === "detailed" || mode === "fullscreen",
        compact: mode === "minimal" || mode === "compact",
        maxDescriptionLength:
          mode === "minimal" ? 50 : mode === "compact" ? 100 : 200,
        showActions: mode !== "minimal",
      }),
      [mode]
    );

    const displayConfig = useMemo(
      () => ({
        ...defaultDisplayConfig,
        ...userDisplayConfig,
      }),
      [defaultDisplayConfig, userDisplayConfig]
    );

    // Фильтрация и поиск данных
    const filteredData = useMemo(() => {
      let filtered = [...data];

      // Поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.author.name.toLowerCase().includes(query)
        );
      }

      // Фильтры
      if (localFilters.types?.length) {
        filtered = filtered.filter((item) =>
          localFilters.types!.includes(item.type)
        );
      }

      if (localFilters.priorities?.length) {
        filtered = filtered.filter((item) =>
          localFilters.priorities!.includes(item.priority)
        );
      }

      if (localFilters.statuses?.length) {
        filtered = filtered.filter((item) =>
          localFilters.statuses!.includes(item.status)
        );
      }

      // Ограничение количества
      filtered = filtered.slice(0, maxItems);

      return filtered;
    }, [data, searchQuery, localFilters, maxItems]);

    // Автообновление
    useEffect(() => {
      if (autoRefreshInterval && onRefresh) {
        const interval = setInterval(() => {
          onRefresh();
        }, autoRefreshInterval * 1000);

        return () => clearInterval(interval);
      }
    }, [autoRefreshInterval, onRefresh]);

    // Обработчики
    const handleRefresh = useCallback(async () => {
      if (onRefresh) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
    }, [onRefresh]);

    const handleSearchChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
      },
      []
    );

    // Компактный режим
    const isCompact = mode === "minimal" || mode === "compact";

    // Загрузочные скелетоны
    const renderSkeleton = () => (
      <List sx={{ p: 0 }}>
        {Array.from({ length: isCompact ? 3 : 5 }).map((_, index) => (
          <ListItem key={index} sx={{ mb: 1 }}>
            {displayConfig.showAvatars && (
              <ListItemAvatar>
                <Skeleton
                  variant="circular"
                  width={isCompact ? 32 : 40}
                  height={isCompact ? 32 : 40}
                />
              </ListItemAvatar>
            )}
            <ListItemText
              primary={<Skeleton variant="text" width="60%" />}
              secondary={
                <Box>
                  <Skeleton variant="text" width="90%" />
                  {!isCompact && <Skeleton variant="text" width="40%" />}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    );

    // Рендер ошибки
    if (dataError) {
      return (
        <Card
          className={className}
          sx={{
            ...styleSystem.widgetStyles,
            ...(sx as object),
          }}
        >
          <CardContent>
            <Typography color="error" align="center">
              {i18n.t("activity.loadError", "Ошибка загрузки активности")}: {dataError.message}
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="outlined"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                {i18n.t("common.retry", "Повторить")}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <ErrorBoundary>
        <Card
          className={className}
          sx={{
            ...styleSystem.widgetStyles,
            ...(sx as object),
            // Context7: Адаптивная высота для разных layout
            height: layout === "list" ? "fit-content" : "400px",
            maxHeight: mode === "fullscreen" ? "600px" : "400px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardHeader
            avatar={
              <Avatar
                sx={{
                  bgcolor: DASHBOARD_TOKENS.colors.dashboard.primary,
                  width: isCompact ? 32 : 40,
                  height: isCompact ? 32 : 40,
                }}
              >
                <ScheduleIcon fontSize={isCompact ? "small" : "medium"} />
              </Avatar>
            }
            title={
              <Typography
                variant={isCompact ? "subtitle2" : "h6"}
                fontWeight={600}
              >
                {i18n.t("activity.title", "Лента активности")}
              </Typography>
            }
            subheader={
              !isCompact && (
                <Typography variant="body2" color="text.secondary">
                  {i18n.t("activity.itemsCount", "{{count}} из {{total}} элементов", {
                    count: filteredData.length,
                    total: data.length,
                  })}
                </Typography>
              )
            }
            action={
              <Box display="flex" gap={0.5}>
                {onRefresh && (
                  <Tooltip title={i18n.t("common.refresh", "Обновить")}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleRefresh}
                        disabled={refreshing || isDataLoading}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            }
            sx={{
              pb: isCompact ? 1 : 2,
              "& .MuiCardHeader-content": {
                overflow: "hidden",
              },
            }}
          />

          {/* Поиск и фильтры */}
          {(showSearch || showFilters) && !isCompact && (
            <Box sx={{ px: 2, pb: 1 }}>
              {showSearch && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder={i18n.t("activity.searchPlaceholder", "Поиск активности...")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: showFilters ? 1 : 0 }}
                />
              )}
            </Box>
          )}

          <CardContent
            sx={{
              flex: 1,
              overflow: "auto",
              pt: 0,
              "&:last-child": { pb: 2 },
            }}
          >
            {isDataLoading || refreshing ? (
              renderSkeleton()
            ) : filteredData.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={4}
              >
                <ScheduleIcon
                  sx={{
                    fontSize: 48,
                    color: "text.disabled",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  {data.length === 0
                    ? i18n.t("activity.noActivity", "Нет активности")
                    : i18n.t("activity.noMatches", "Не найдено совпадений")}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredData.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ActivityItemComponent
                      item={item}
                      displayConfig={displayConfig}
                      onItemClick={onItemClick}
                      onUndoAction={onUndoAction} 
                      isCompact={isCompact}
                    />
                    {index < filteredData.length - 1 && !isCompact && (
                      <Divider component="li" sx={{ my: 1, opacity: 0.3 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    );
  }
);

ActivityFeedWidget.displayName = "ActivityFeedWidget";
