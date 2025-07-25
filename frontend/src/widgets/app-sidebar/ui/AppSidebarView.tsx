import React, { useMemo, memo } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  alpha,
  useTheme,
  Fade,
  Collapse,
  Paper,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SidebarItem, SidebarItemState } from "@/entities/sidebar";
import {
  SidebarButton,
  SidebarGroup,
  UserProfile,
  groupItemsByCategory,
} from "@/entities/sidebar";
import type {
  NavigationState,
  NavigationActions,
  DndState,
  DndActions,
  GroupsState,
  GroupsActions,
} from "@/features";
import type { User } from "@/entities/user";
import { SortableItem } from "./SortableItem";

// Константы цветов (мемоизированы для предотвращения пересоздания)
const SIDEBAR_COLORS = {
  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    hover: "#f1f5f9",
  },
  text: {
    primary: "#1e293b",
    secondary: "#475569",
    muted: "#64748b",
  },
  border: {
    light: "#e2e8f0",
    medium: "#cbd5e1",
  },
  accent: {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
} as const;

// Конфигурация по умолчанию (мемоизирована)
export const DEFAULT_APP_SIDEBAR_CONFIG = {
  showHeader: true as boolean,
  showUserProfile: true as boolean,
  enableDragAndDrop: true as boolean,
  enableKeyboardNavigation: true as boolean,
  modernStyling: true as boolean,
  glassmorphism: false as boolean,
  expandedWidth: 280,
  collapsedWidth: 64,
  animationDuration: 300,
  showTooltips: true as boolean,
} as const;

export type AppSidebarConfig = typeof DEFAULT_APP_SIDEBAR_CONFIG;

export interface AppSidebarViewProps {
  user?: User;
  config?: Partial<AppSidebarConfig>;
  className?: string;
  sx?: any;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  navigationState: NavigationState;
  navigationActions: NavigationActions;
  dndState: DndState;
  dndActions: DndActions;
  groupsState: GroupsState;
  groupsActions: GroupsActions;
  onLogout: () => void;
  onProfileClick?: (user: User) => void;
  onStateChange?: (isCollapsed: boolean) => void;
}

/**
 * Оптимизированный AppSidebarView с React.memo
 * Презентационный компонент для отображения sidebar
 * Использует мемоизацию для предотвращения ненужных ре-рендеров
 */
export const AppSidebarView: React.FC<AppSidebarViewProps> = memo(
  ({
    user,
    config: userConfig = {},
    className,
    sx,
    isCollapsed,
    onToggleCollapse,
    navigationState,
    navigationActions,
    dndState,
    dndActions,
    groupsState,
    groupsActions,
    onLogout,
    onProfileClick,
    onStateChange,
  }) => {
    const theme = useTheme();

    // Мемоизированная конфигурация
    const config = useMemo(
      () => ({ ...DEFAULT_APP_SIDEBAR_CONFIG, ...userConfig }),
      [userConfig]
    );

    // Мемоизированные группированные элементы
    const groupedItems = useMemo(
      () => groupItemsByCategory(dndState.sidebarItems),
      [dndState.sidebarItems]
    );

    // Мемоизированная функция получения состояния элемента
    const getItemState = useMemo(
      () =>
        (item: SidebarItem): SidebarItemState => {
          const navState = navigationActions.getItemState(
            item,
            navigationState.activeItemId
          );
          return {
            ...navState,
            isExpanded: item.isGroup
              ? groupsActions.isGroupExpanded(item.metadata?.category || "main")
              : undefined,
          };
        },
      [navigationActions, navigationState.activeItemId, groupsActions]
    );

    // Мемоизированная ширина drawer
    const drawerWidth = useMemo(
      () =>
        isCollapsed ? config.collapsedWidth || 64 : config.expandedWidth || 280,
      [isCollapsed, config.collapsedWidth, config.expandedWidth]
    );

    // Мемоизированные современные стили
    const modernStyles = useMemo(
      () =>
        config.modernStyling
          ? {
              background: `linear-gradient(135deg, ${alpha(
                SIDEBAR_COLORS.background.primary,
                0.95
              )} 0%, ${alpha(SIDEBAR_COLORS.background.secondary, 0.98)} 100%)`,
              backdropFilter: config.glassmorphism ? "blur(12px)" : "none",
              borderRight: `1px solid ${alpha(
                SIDEBAR_COLORS.border.light,
                0.6
              )}`,
              boxShadow: SIDEBAR_COLORS.shadow.lg,
            }
          : {},
      [config.modernStyling, config.glassmorphism]
    );

    // Мемоизированные стили drawer
    const drawerStyles = useMemo(
      () => ({
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
          height: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          ...modernStyles,
        },
        ...sx,
      }),
      [drawerWidth, theme.transitions, modernStyles, sx]
    );

    return (
      <Drawer variant="permanent" className={className} sx={drawerStyles}>
        <DndContext
          sensors={dndState.sensors}
          collisionDetection={closestCenter}
          onDragStart={dndActions.handleDragStart}
          onDragEnd={dndActions.handleDragEnd}
        >
          {/* Header with toggle */}
          {config.showHeader && (
            <Paper
              elevation={0}
              sx={{
                px: isCollapsed ? 0 : 2,
                py: 2,
                minHeight: 64,
                borderBottom: `1px solid ${SIDEBAR_COLORS.border.light}`,
                background: alpha(SIDEBAR_COLORS.background.secondary, 0.3),
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "space-between",
                position: "relative",
              }}
            >
              {/* App Icon/Name - clickable */}
              <Box
                onClick={onToggleCollapse}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: isCollapsed ? 0 : 1,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                {isCollapsed ? (
                  <Tooltip title="Развернуть Requify" placement="right">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${SIDEBAR_COLORS.accent.primary} 0%, ${SIDEBAR_COLORS.accent.success} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1rem",
                        boxShadow: SIDEBAR_COLORS.shadow.sm,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          boxShadow: SIDEBAR_COLORS.shadow.md,
                        },
                      }}
                    >
                      R
                    </Box>
                  </Tooltip>
                ) : (
                  <Fade in={!isCollapsed} timeout={300}>
                    <Tooltip title="Свернуть Requify" placement="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1.5,
                            background: `linear-gradient(135deg, ${SIDEBAR_COLORS.accent.primary} 0%, ${SIDEBAR_COLORS.accent.success} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            boxShadow: SIDEBAR_COLORS.shadow.sm,
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          R
                        </Box>
                        <Typography
                          variant="h6"
                          component="h1"
                          sx={{
                            fontWeight: 600,
                            color: SIDEBAR_COLORS.text.primary,
                            fontSize: "1.25rem",
                            letterSpacing: "-0.025em",
                            userSelect: "none",
                          }}
                        >
                          Requify
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Fade>
                )}
              </Box>
            </Paper>
          )}

          {/* Navigation Content */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden auto",
              py: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: isCollapsed ? "center" : "stretch",
              "&::-webkit-scrollbar": {
                width: 6,
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: SIDEBAR_COLORS.border.medium,
                borderRadius: 3,
                "&:hover": {
                  background: SIDEBAR_COLORS.text.muted,
                },
              },
            }}
          >
            <List
              component="nav"
              disablePadding
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: isCollapsed ? "center" : "stretch",
                flex: 1,
              }}
            >
              {/* Main Navigation Items */}
              {groupedItems.main && groupedItems.main.length > 0 && (
                <>
                  <Collapse in={!isCollapsed} timeout={300}>
                    <Typography
                      variant="overline"
                      sx={{
                        display: "block",
                        px: 3,
                        py: 1,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: SIDEBAR_COLORS.text.muted,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Навигация
                    </Typography>
                  </Collapse>

                  <SortableContext
                    items={groupedItems.main
                      .filter((item) => !item.isGroup)
                      .map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {groupedItems.main.map((item) => (
                      <ListItem
                        key={item.id}
                        disablePadding
                        sx={{
                          px: isCollapsed ? 0 : 1,
                          width: "100%",
                          display: "flex",
                          justifyContent: isCollapsed ? "center" : "stretch",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        {item.isGroup ? (
                          <SidebarGroup
                            group={item}
                            isCollapsed={isCollapsed}
                            isExpanded={groupsActions.isGroupExpanded(
                              item.metadata?.category || "main"
                            )}
                            onToggleExpand={() =>
                              groupsActions.handleToggleGroup(
                                item.metadata?.category || "main"
                              )
                            }
                            onItemClick={navigationActions.handleItemClick}
                            getItemState={getItemState}
                          />
                        ) : (
                          <SortableItem
                            item={item}
                            isCollapsed={isCollapsed}
                            onItemClick={navigationActions.handleItemClick}
                            getItemState={getItemState}
                          />
                        )}
                      </ListItem>
                    ))}
                  </SortableContext>
                </>
              )}

              {/* Spacer to push bottom items down */}
              <Box sx={{ flex: 1 }} />

              {/* Bottom Admin Panel Settings - styled like navigation */}
              {groupedItems.admin && groupedItems.admin.length > 0 && (
                <>
                  <Collapse in={!isCollapsed} timeout={300}>
                    <Typography
                      variant="overline"
                      sx={{
                        display: "block",
                        px: 3,
                        py: 1,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: SIDEBAR_COLORS.text.muted,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Админ
                    </Typography>
                  </Collapse>

                  <SortableContext
                    items={groupedItems.admin
                      .filter((item) => !item.isGroup)
                      .map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {groupedItems.admin.map((item) => (
                      <ListItem
                        key={item.id}
                        disablePadding
                        sx={{
                          px: isCollapsed ? 0 : 1,
                          width: "100%",
                          display: "flex",
                          justifyContent: isCollapsed ? "center" : "stretch",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        {item.isGroup ? (
                          <SidebarGroup
                            group={item}
                            isCollapsed={isCollapsed}
                            isExpanded={groupsActions.isGroupExpanded(
                              item.metadata?.category || "admin"
                            )}
                            onToggleExpand={() =>
                              groupsActions.handleToggleGroup(
                                item.metadata?.category || "admin"
                              )
                            }
                            onItemClick={navigationActions.handleItemClick}
                            getItemState={getItemState}
                          />
                        ) : (
                          <SortableItem
                            item={item}
                            isCollapsed={isCollapsed}
                            onItemClick={navigationActions.handleItemClick}
                            getItemState={getItemState}
                          />
                        )}
                      </ListItem>
                    ))}
                  </SortableContext>
                </>
              )}

              {groupedItems.bottom && groupedItems.bottom.length > 0 && (
                <>
                  <Divider
                    sx={{
                      my: 1,
                      mx: isCollapsed ? 0 : 2,
                      borderColor: alpha(SIDEBAR_COLORS.border.light, 0.5),
                    }}
                  />
                  {groupedItems.bottom.map((item) => (
                    <ListItem
                      key={item.id}
                      disablePadding
                      sx={{
                        px: isCollapsed ? 0 : 1,
                        width: "100%",
                        display: "flex",
                        justifyContent: isCollapsed ? "center" : "stretch",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <SidebarButton
                        item={item}
                        state={getItemState(item)}
                        isCollapsed={isCollapsed}
                        onClick={navigationActions.handleItemClick}
                      />
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          </Box>

          {/* User Profile */}
          {config.showUserProfile && user && (
            <UserProfile
              user={user}
              isCollapsed={isCollapsed}
              onClick={onProfileClick ? () => onProfileClick(user) : undefined}
              onLogout={onLogout}
              onSettings={() => {
                // Навигация к настройкам
                console.log("Navigate to settings");
              }}
            />
          )}
        </DndContext>

        <DragOverlay>
          {dndState.activeId && dndActions.getActiveItem() ? (
            <SidebarButton
              item={dndActions.getActiveItem()!}
              state={getItemState(dndActions.getActiveItem()!)}
              isCollapsed={isCollapsed}
              onClick={() => {}}
              sx={{
                opacity: 0.8,
                transform: "rotate(5deg)",
                boxShadow: SIDEBAR_COLORS.shadow.lg,
              }}
            />
          ) : null}
        </DragOverlay>
      </Drawer>
    );
  }
);

AppSidebarView.displayName = "AppSidebarView";
