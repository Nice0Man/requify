<<<<<<< HEAD
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import {
  Add,
  Assignment,
  BugReport,
  Group,
  Settings,
  Analytics,
  Folder,
  Description,
  Build,
} from "@mui/icons-material";
import { LiquidGlassIcon } from "@/shared/ui";

interface ActionButton {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  action: () => void;
  description: string;
  category: "create" | "manage" | "analyze";
}

export const QuickActionsWidget = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const actions: ActionButton[] = [
    {
      id: "create-project",
      label: "Новый проект",
      icon: Add,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      action: () => console.log("Создать проект"),
      description: "Создать новый проект",
      category: "create",
    },
    {
      id: "create-requirement",
      label: "Требование",
      icon: Assignment,
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
      action: () => console.log("Создать требование"),
      description: "Добавить новое требование",
      category: "create",
    },
    {
      id: "create-test",
      label: "Тест-кейс",
      icon: BugReport,
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
      action: () => console.log("Создать тест"),
      description: "Создать новый тест-кейс",
      category: "create",
    },
    {
      id: "manage-team",
      label: "Команда",
      icon: Group,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
      action: () => console.log("Управление командой"),
      description: "Управление участниками",
      category: "manage",
    },
    {
      id: "project-settings",
      label: "Настройки",
      icon: Settings,
      color: theme.palette.grey[600],
      gradient: `linear-gradient(135deg, ${theme.palette.grey[600]}, ${theme.palette.grey[800]})`,
      action: () => console.log("Настройки проекта"),
      description: "Настройки проекта",
      category: "manage",
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: Analytics,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
      action: () => console.log("Открыть аналитику"),
      description: "Просмотр аналитики",
      category: "analyze",
    },
    {
      id: "documentation",
      label: "Документация",
      icon: Description,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
      action: () => console.log("Открыть документацию"),
      description: "Техническая документация",
      category: "analyze",
    },
    {
      id: "build-tools",
      label: "Сборка",
      icon: Build,
      color: theme.palette.text.secondary,
      gradient: `linear-gradient(135deg, ${
        theme.palette.text.secondary
      }, ${alpha(theme.palette.text.secondary, 0.8)})`,
      action: () => console.log("Инструменты сборки"),
      description: "Инструменты сборки",
      category: "manage",
    },
  ];
=======
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
>>>>>>> 561cfbf79a41517e070303e2a3e30da6de4d02f6

  const handleActionClick = (action: ActionButton) => {
    action.action();
  };

  const getCategoryConfig = (category: ActionButton["category"]) => {
    switch (category) {
      case "create":
        return {
          title: "Создание",
          color: theme.palette.primary.main,
          background: alpha(theme.palette.primary.main, 0.08),
        };
      case "manage":
        return {
          title: "Управление",
          color: theme.palette.secondary.main,
          background: alpha(theme.palette.secondary.main, 0.08),
        };
      case "analyze":
        return {
          title: "Анализ",
          color: theme.palette.success.main,
          background: alpha(theme.palette.success.main, 0.08),
        };
      default:
        return {
          title: "Действия",
          color: theme.palette.text.primary,
          background: alpha(theme.palette.text.primary, 0.08),
        };
    }
  };

  const groupedActions = actions.reduce((groups, action) => {
    const category = action.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {} as Record<string, ActionButton[]>);

  return (
    <Card
<<<<<<< HEAD
      elevation={0}
      sx={{
        borderRadius: 5,
        // Authentic Liquid Glass background
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.25)} 0%, 
            ${alpha(theme.palette.common.white, isDark ? 0.04 : 0.12)} 50%,
            ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)} 100%
          ),
          linear-gradient(225deg, 
            ${alpha(theme.palette.primary.main, 0.06)} 0%, 
            transparent 60%
          ),
          ${alpha(theme.palette.background.paper, isDark ? 0.5 : 0.85)}
        `,
        // Advanced backdrop filter
        backdropFilter: "blur(40px) saturate(150%) contrast(120%)",
        WebkitBackdropFilter: "blur(40px) saturate(150%) contrast(120%)",
        // Multi-layer border
        border: `1px solid ${alpha(
          theme.palette.common.white,
          isDark ? 0.15 : 0.25
        )}`,
        position: "relative",
        overflow: "hidden",
        height: "100%",
        // Enhanced shadow system
        boxShadow: `
          inset 0 1px 0 ${alpha(
            theme.palette.common.white,
            isDark ? 0.15 : 0.3
          )},
          inset 0 -1px 0 ${alpha(
            theme.palette.common.black,
            isDark ? 0.2 : 0.05
          )},
          0 4px 24px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)},
          0 1px 6px ${alpha(theme.palette.common.black, isDark ? 0.2 : 0.04)},
          0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}
        `,

        // Top light refraction
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: `
            linear-gradient(180deg, 
              ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.2)} 0%, 
              ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.1)} 40%,
              transparent 100%
            )
          `,
          borderRadius: "20px 20px 0 0",
          pointerEvents: "none",
          mixBlendMode: "overlay",
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <LiquidGlassIcon
            icon={Folder}
            color={theme.palette.primary.main}
            size={32}
            variant="secondary"
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${
                theme.palette.text.primary
              }, ${alpha(theme.palette.text.primary, 0.8)})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `0 1px 2px ${alpha(
                theme.palette.common.black,
                isDark ? 0.3 : 0.1
              )}`,
            }}
          >
            Быстрые действия
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {Object.entries(groupedActions).map(
            ([category, categoryActions], categoryIndex) => {
              const categoryConfig = getCategoryConfig(
                category as ActionButton["category"]
              );

              return (
                <Fade in timeout={1000 + categoryIndex * 300} key={category}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: categoryConfig.color,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        textShadow: `0 1px 1px ${alpha(
                          theme.palette.common.black,
                          isDark ? 0.2 : 0.05
                        )}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&::before": {
                          content: '""',
                          width: 3,
                          height: 12,
                          borderRadius: 1.5,
                          background: `linear-gradient(135deg, ${
                            categoryConfig.color
                          }, ${alpha(categoryConfig.color, 0.7)})`,
                          boxShadow: `0 2px 8px ${alpha(
                            categoryConfig.color,
                            0.3
                          )}`,
                        },
                      }}
                    >
                      {categoryConfig.title}
                    </Typography>

                    <Grid container spacing={2}>
                      {categoryActions.map((action, index) => (
                        <Grid item xs={6} sm={4} key={action.id}>
                          <Fade
                            in
                            timeout={1200 + categoryIndex * 300 + index * 150}
                          >
                            <Button
                              onClick={() => handleActionClick(action)}
                              sx={{
                                width: "100%",
                                height: 80,
                                borderRadius: 4,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                position: "relative",
                                overflow: "hidden",
                                textTransform: "none",
                                // Liquid Glass action button
                                background: `
                                linear-gradient(135deg, 
                                  ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.1 : 0.2
                                  )} 0%, 
                                  ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.03 : 0.08
                                  )} 50%,
                                  ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.06 : 0.15
                                  )} 100%
                                ),
                                linear-gradient(225deg, 
                                  ${alpha(action.color, 0.08)} 0%, 
                                  transparent 60%
                                ),
                                ${alpha(
                                  theme.palette.background.paper,
                                  isDark ? 0.4 : 0.7
                                )}
                              `,
                                backdropFilter: "blur(20px) saturate(120%)",
                                WebkitBackdropFilter:
                                  "blur(20px) saturate(120%)",
                                border: `1px solid ${alpha(
                                  action.color,
                                  0.12
                                )}`,
                                boxShadow: `
                                inset 0 1px 0 ${alpha(
                                  theme.palette.common.white,
                                  isDark ? 0.1 : 0.2
                                )},
                                inset 0 -1px 0 ${alpha(
                                  theme.palette.common.black,
                                  isDark ? 0.15 : 0.03
                                )},
                                0 2px 12px ${alpha(action.color, 0.1)},
                                0 1px 4px ${alpha(
                                  theme.palette.common.black,
                                  isDark ? 0.2 : 0.05
                                )}
                              `,
                                transition:
                                  "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",

                                "&:hover": {
                                  transform: "translateY(-3px) scale(1.03)",
                                  background: `
                                  linear-gradient(135deg, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.15 : 0.3
                                    )} 0%, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.08 : 0.15
                                    )} 50%,
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.1 : 0.22
                                    )} 100%
                                  ),
                                  linear-gradient(225deg, 
                                    ${alpha(action.color, 0.15)} 0%, 
                                    transparent 60%
                                  ),
                                  ${alpha(
                                    theme.palette.background.paper,
                                    isDark ? 0.6 : 0.85
                                  )}
                                `,
                                  backdropFilter:
                                    "blur(40px) saturate(150%) contrast(110%)",
                                  WebkitBackdropFilter:
                                    "blur(40px) saturate(150%) contrast(110%)",
                                  border: `1px solid ${alpha(
                                    action.color,
                                    0.25
                                  )}`,
                                  boxShadow: `
                                  inset 0 1px 0 ${alpha(
                                    theme.palette.common.white,
                                    isDark ? 0.2 : 0.35
                                  )},
                                  inset 0 -1px 0 ${alpha(
                                    theme.palette.common.black,
                                    isDark ? 0.2 : 0.05
                                  )},
                                  0 8px 32px ${alpha(action.color, 0.25)},
                                  0 2px 12px ${alpha(
                                    theme.palette.common.black,
                                    isDark ? 0.3 : 0.08
                                  )},
                                  0 0 0 1px ${alpha(action.color, 0.2)},
                                  0 0 20px ${alpha(action.color, 0.15)}
                                `,
                                },

                                "&:active": {
                                  transform: "translateY(-1px) scale(1.01)",
                                  transition: "all 0.15s ease-out",
                                  backdropFilter: "blur(30px) saturate(130%)",
                                  WebkitBackdropFilter:
                                    "blur(30px) saturate(130%)",
                                },

                                // Top light refraction for button
                                "&::before": {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: "60%",
                                  background: `
                                  linear-gradient(180deg, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.08 : 0.15
                                    )} 0%, 
                                    ${alpha(
                                      theme.palette.common.white,
                                      isDark ? 0.04 : 0.08
                                    )} 40%,
                                    transparent 100%
                                  )
                                `,
                                  borderRadius: "16px 16px 0 0",
                                  pointerEvents: "none",
                                  mixBlendMode: "overlay",
                                },

                                // Specular highlights on hover
                                "&::after": {
                                  content: '""',
                                  position: "absolute",
                                  top: -2,
                                  left: -2,
                                  right: -2,
                                  bottom: -2,
                                  background: `
                                  conic-gradient(from 45deg at 30% 30%, 
                                    ${alpha(action.color, 0.25)} 0deg,
                                    transparent 90deg,
                                    transparent 180deg,
                                    ${alpha(action.color, 0.2)} 270deg,
                                    transparent 360deg
                                  )
                                `,
                                  borderRadius: 18,
                                  opacity: 0,
                                  transition:
                                    "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                  pointerEvents: "none",
                                  zIndex: -1,
                                  filter: "blur(1px)",
                                },

                                "&:hover::after": {
                                  opacity: 1,
                                },
                              }}
                            >
                              {/* Icon with improved styling */}
                              <LiquidGlassIcon
                                icon={action.icon}
                                color={action.color}
                                size={48}
                                variant="secondary"
                              />

                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  color: theme.palette.text.primary,
                                  textAlign: "center",
                                  lineHeight: 1.2,
                                  position: "relative",
                                  zIndex: 1,
                                  textShadow: `0 1px 2px ${alpha(
                                    theme.palette.common.black,
                                    isDark ? 0.3 : 0.1
                                  )}`,
                                  background: `linear-gradient(135deg, ${
                                    theme.palette.text.primary
                                  }, ${alpha(
                                    theme.palette.text.primary,
                                    0.8
                                  )})`,
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                {action.label}
                              </Typography>
                            </Button>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              );
            }
          )}
        </Box>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${alpha(
              theme.palette.divider,
              isDark ? 0.08 : 0.12
            )}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.secondary, 0.6),
              fontSize: "0.7rem",
              textAlign: "center",
              display: "block",
              textShadow: `0 1px 1px ${alpha(
                theme.palette.common.black,
                isDark ? 0.1 : 0.02
              )}`,
            }}
          >
            Нажмите на действие для быстрого доступа
          </Typography>
=======
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
>>>>>>> 561cfbf79a41517e070303e2a3e30da6de4d02f6
        </Box>
      </CardContent>
    </Card>
  );
<<<<<<< HEAD
};
=======
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
>>>>>>> 561cfbf79a41517e070303e2a3e30da6de4d02f6
