import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Button,
  IconButton,
  Grid,
  Chip,
  Badge,
  Tooltip,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
} from "@mui/material";
import {
  FlashOn as FlashOnIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  RocketLaunch as RocketLaunchIcon,
  PersonAdd as PersonAddIcon,
  PlayArrow as PlayArrowIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  useDashboardStyleSystem,
  DASHBOARD_TOKENS,
} from "@/shared/styles";
import { ErrorBoundary } from "@/shared/ui";
import type {
  QuickActionsWidgetProps,
  QuickActionsDisplayConfig,
} from "../model";
import { 
  actionsDAO,
  type QuickAction as EntityAction,
  type ActionCategory as EntityCategory,
  type ActionPriority as EntityPriority,
  type ActionsFilters as EntityFilters,
} from "@/features/actions";

/**
 * Получить цвет для категории действий
 */
const getCategoryColor = (category: EntityCategory): string => {
  const colorMap: Record<EntityCategory, string> = {
    creation: "#2563eb", // Blue
    management: "#059669", // Green
    analysis: "#7c3aed", // Purple
    integration: "#d97706", // Orange
    administration: "#dc2626", // Red
    favorites: "#0891b2", // Cyan
  };
  
  return colorMap[category] || "#6b7280"; // Gray default
};

/**
 * Получить иконку для типа действия
 */
const getActionTypeIcon = (type: string): React.ReactElement => {
  const iconMap: Record<string, React.ReactElement> = {
    create_requirement: <AssignmentIcon />,
    create_project: <FolderIcon />,
    create_release: <RocketLaunchIcon />,
    add_user: <PersonAddIcon />,
    run_test: <PlayArrowIcon />,
    generate_report: <AssessmentIcon />,
    export_data: <AssessmentIcon />,
    sync_data: <RocketLaunchIcon />,
    backup: <AssessmentIcon />,
    settings: <SettingsIcon />,
    custom: <AddIcon />,
  };
  
  return iconMap[type] || <FlashOnIcon />;
};

/**
 * Компонент карточки действия
 */
const ActionCard = memo<{
  action: EntityAction;
  isCompact: boolean;
  isFavorite: boolean;
  showDescriptions: boolean;
  showShortcuts: boolean;
  onActionClick?: (action: EntityAction) => void;
  onToggleFavorite?: (actionId: string, isFavorite: boolean) => void;
  onActionExecute?: (action: EntityAction) => void;
}>(({ 
  action, 
  isCompact, 
  isFavorite, 
  showDescriptions, 
  showShortcuts,
  onActionClick, 
  onToggleFavorite,
  onActionExecute 
}) => {
  const theme = useTheme();
  const categoryColor = action.color || getCategoryColor(action.category);

  const handleClick = useCallback(() => {
    if (action.handler) {
      action.handler();
    } else if (onActionExecute) {
      onActionExecute(action);
    } else if (onActionClick) {
      onActionClick(action);
    }
  }, [action, onActionClick, onActionExecute]);

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(action.id, !isFavorite);
  }, [action.id, isFavorite, onToggleFavorite]);

  return (
    <Card
      onClick={action.enabled ? handleClick : undefined}
      sx={{
        cursor: action.enabled ? "pointer" : "not-allowed",
        opacity: action.enabled ? 1 : 0.6,
        position: "relative",
        transition: `all ${DASHBOARD_TOKENS.animation.duration.shorter}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,
        border: `1px solid ${alpha(categoryColor, 0.2)}`,
        bgcolor: alpha(categoryColor, 0.02),
        
        "&:hover": action.enabled ? {
          borderColor: alpha(categoryColor, 0.4),
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Заменяем getShadowForState
          bgcolor: alpha(categoryColor, 0.05),
        } : {},
      }}
    >
      {/* Избранное */}
      {onToggleFavorite && (
        <IconButton
          size="small"
          onClick={handleFavoriteToggle}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 1,
            color: isFavorite ? "warning.main" : "text.disabled",
            opacity: 0.7,
            "&:hover": { opacity: 1 },
          }}
        >
          {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </IconButton>
      )}

      <CardContent sx={{ p: isCompact ? 1.5 : 2, "&:last-child": { pb: isCompact ? 1.5 : 2 } }}>
        {/* Иконка и заголовок */}
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Avatar
            sx={{
              width: isCompact ? 32 : 40,
              height: isCompact ? 32 : 40,
              bgcolor: alpha(categoryColor, 0.1),
              color: categoryColor,
            }}
          >
            {action.icon || getActionTypeIcon(action.type)}
          </Avatar>
          
          <Box flex={1}>
            <Typography 
              variant={isCompact ? "body2" : "subtitle2"} 
              fontWeight={600}
              color="text.primary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {action.title}
            </Typography>
            
            {action.priority === "featured" && (
              <Chip
                size="small"
                label="Рекомендуем"
                sx={{
                  height: 16,
                  fontSize: "0.65rem",
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: "warning.main",
                  mt: 0.5,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Описание */}
        {showDescriptions && action.description && !isCompact && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {action.description}
          </Typography>
        )}

        {/* Горячие клавиши и статистика */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {showShortcuts && action.shortcut && (
            <Chip
              size="small"
              label={action.shortcut}
              variant="outlined"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                borderColor: alpha(categoryColor, 0.3),
                color: categoryColor,
              }}
            />
          )}
          
          {action.usageCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              Использований: {action.usageCount}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

ActionCard.displayName = "ActionCard";

/**
 * QuickActionsWidget - виджет быстрых действий
 * Полная поддержка Context7 и всех режимов дашборда
 * Теперь использует actions entity для работы с данными
 */
export const QuickActionsWidget = memo<QuickActionsWidgetProps>(({
  mode = "detailed",
  layout = "grid",
  density = "comfortable",
  actions = [],
  groups = [],
  displayConfig: userDisplayConfig,
  filters,
  usageStats = [],
  userConfig,
  favoriteActions = [],
  isDataLoading = false,
  dataError = null,
  onActionExecute,
  onActionClick,
  onToggleFavorite,
  onFiltersChange,
  onSettings,
  onRefresh,
  showSettings = true,
  showRefresh = true,
  customTitle,
  customIcon,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const styleSystem = useDashboardStyleSystem(mode, layout, density);

  // Локальное состояние для данных из entity
  const [actionsData, setActionsData] = useState<{
    actions: EntityAction[];
    groups: any[];
  }>({
    actions: [],
    groups: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Конфигурация отображения по умолчанию
  const defaultDisplayConfig: QuickActionsDisplayConfig = useMemo(() => ({
    variant: mode === "minimal" ? "compact" : mode === "compact" ? "cards" : "grid",
    showDescriptions: mode === "detailed" || mode === "fullscreen",
    showIcons: true,
    showShortcuts: mode === "detailed" || mode === "fullscreen",
    groupByCategory: mode === "detailed" || mode === "fullscreen",
    maxActions: mode === "minimal" ? 4 : mode === "compact" ? 6 : 12,
    columns: mode === "minimal" ? 2 : mode === "compact" ? 3 : 4,
    compact: mode === "minimal" || mode === "compact",
    showFavoritesOnly: false,
    animations: true,
    showUsageStats: mode === "detailed" || mode === "fullscreen",
  }), [mode]);

  const displayConfig = useMemo(() => ({
    ...defaultDisplayConfig,
    ...userDisplayConfig,
  }), [defaultDisplayConfig, userDisplayConfig]);

  // Загрузка данных из entity
  const loadActionsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const entityFilters: EntityFilters = {
        searchQuery: searchQuery || undefined,
        enabledOnly: true,
      };
      
      if (filters?.categories?.length) {
        entityFilters.categories = filters.categories as EntityCategory[];
      }

      if (displayConfig.showFavoritesOnly) {
        entityFilters.favoritesOnly = true;
      }

      const data = await actionsDAO.getActions(entityFilters);
      
      setActionsData({
        actions: data.actions,
        groups: data.groups,
      });
    } catch (err) {
      console.error("Ошибка загрузки действий:", err);
      setError(err instanceof Error ? err : new Error("Неизвестная ошибка"));
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, displayConfig.showFavoritesOnly]);

  // Начальная загрузка
  useEffect(() => {
    loadActionsData();
  }, [loadActionsData]);

  // Фильтрация и сортировка действий
  const filteredActions = useMemo(() => {
    let filtered = [...actionsData.actions];
    
    // Сортировка по приоритету и частоте использования
    filtered.sort((a, b) => {
      const priorityOrder = { featured: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.usageCount - a.usageCount;
    });
    
    return filtered.slice(0, displayConfig.maxActions);
  }, [actionsData.actions, displayConfig.maxActions]);

  // Обработчики
  const handleActionExecute = useCallback(async (action: EntityAction) => {
    try {
      await actionsDAO.executeAction(action.id);
      onActionExecute?.(action);
      
      // Обновляем данные после выполнения
      await loadActionsData();
    } catch (err) {
      console.error("Ошибка выполнения действия:", err);
    }
  }, [onActionExecute, loadActionsData]);

  const handleToggleFavorite = useCallback(async (actionId: string, isFavorite: boolean) => {
    try {
      const userId = "current-user"; // TODO: получать из контекста пользователя
      
      if (isFavorite) {
        await actionsDAO.addToFavorites(userId, actionId);
      } else {
        await actionsDAO.removeFromFavorites(userId, actionId);
      }
      
      onToggleFavorite?.(actionId, isFavorite);
      
      // Обновляем данные
      await loadActionsData();
    } catch (err) {
      console.error("Ошибка обновления избранного:", err);
    }
  }, [onToggleFavorite, loadActionsData]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRefresh = useCallback(async () => {
    await loadActionsData();
    onRefresh?.();
  }, [loadActionsData, onRefresh]);

  // Компактный режим
  const isCompact = displayConfig.compact;

  // Рендер ошибки
  if (error || dataError) {
    return (
      <Card className={className} sx={{ ...styleSystem.widgetStyles, ...sx }}>
        <CardContent>
          <Typography color="error" align="center">
            Ошибка загрузки действий: {(error || dataError)?.message}
          </Typography>
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
          ...sx,
          height: layout === "list" ? "fit-content" : "auto",
          minHeight: isCompact ? 250 : 350,
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
              {customIcon || <FlashOnIcon fontSize={isCompact ? "small" : "medium"} />}
            </Avatar>
          }
          title={
            <Typography variant={isCompact ? "subtitle2" : "h6"} fontWeight={600}>
              {customTitle || "Быстрые действия"}
            </Typography>
          }
          subheader={
            !isCompact && (
              <Typography variant="body2" color="text.secondary">
                {filteredActions.length} доступных действий
              </Typography>
            )
          }
          action={
            <Box display="flex" gap={0.5}>
              {showRefresh && (
                <Tooltip title="Обновить">
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={loading || isDataLoading}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {showSettings && onSettings && (
                <Tooltip title="Настройки">
                  <IconButton size="small" onClick={onSettings}>
                    <SettingsIcon fontSize="small" />
                  </IconButton>
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

        <CardContent sx={{ pt: 0 }}>
          {/* Поиск */}
          {!isCompact && (
            <Box mb={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Поиск действий..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                  },
                }}
              />
            </Box>
          )}

          {/* Действия */}
          {filteredActions.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <FlashOnIcon
                sx={{
                  fontSize: 48,
                  color: "text.disabled",
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary" align="center">
                {loading || isDataLoading ? "Загрузка действий..." : "Нет доступных действий"}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={isCompact ? 1 : 1.5}>
              {filteredActions.map((action) => (
                <Grid
                  key={action.id}
                  item
                  xs={12 / Math.min(displayConfig.columns, 4)}
                  sm={12 / Math.min(displayConfig.columns, 4)}
                  md={12 / displayConfig.columns}
                >
                  <ActionCard
                    action={action}
                    isCompact={isCompact}
                    isFavorite={favoriteActions.includes(action.id)}
                    showDescriptions={displayConfig.showDescriptions}
                    showShortcuts={displayConfig.showShortcuts}
                    onActionClick={onActionClick}
                    onToggleFavorite={handleToggleFavorite}
                    onActionExecute={handleActionExecute}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
});

QuickActionsWidget.displayName = "QuickActionsWidget";
