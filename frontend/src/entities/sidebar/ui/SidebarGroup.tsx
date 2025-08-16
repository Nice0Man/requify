import React, { memo, useMemo } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  alpha,
  Typography,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  ChevronRight,
} from "@mui/icons-material";
import type { SidebarItem, SidebarItemState } from "../model/types";
import { SIDEBAR_ICON_MAP } from "../model/constants";

// Мемоизированные цвета
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
  },
  accent: {
    primary: "#3b82f6",
    success: "#10b981",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
} as const;

interface SidebarGroupProps {
  group: SidebarItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onItemClick: (item: SidebarItem) => void;
  getItemState: (item: SidebarItem) => SidebarItemState;
}

/**
 * Оптимизированный SidebarGroup с React.memo
 * Предотвращает ненужные ре-рендеры для групп навигации
 */
export const SidebarGroup: React.FC<SidebarGroupProps> = memo(
  ({ group, isCollapsed, isExpanded, onToggleExpand, onItemClick, getItemState }) => {
    // Мемоизированная иконка группы
    const GroupIcon = useMemo(() => {
      if (typeof group.icon === 'string') {
        const iconKey = group.icon as keyof typeof SIDEBAR_ICON_MAP;
        return SIDEBAR_ICON_MAP[iconKey] || SIDEBAR_ICON_MAP.Dashboard;
      }
      return SIDEBAR_ICON_MAP.Dashboard;
    }, [group.icon]);

    // Мемоизированный обработчик клика для группы
    const handleGroupClick = useMemo(
      () => () => {
        if (isCollapsed) {
          // В свернутом режиме клик на группу открывает её
          onItemClick(group);
        } else {
          // В развернутом режиме переключаем расширение
          onToggleExpand();
        }
      },
      [isCollapsed, onItemClick, onToggleExpand, group]
    );

    // Мемоизированные стили кнопки группы
    const groupButtonStyles = useMemo(
      () => ({
        px: isCollapsed ? 0 : 2,
        py: 1.5,
        mx: isCollapsed ? "auto" : 0,
        width: isCollapsed ? 44 : "100%",
        maxWidth: isCollapsed ? 44 : "100%",
        minHeight: 44,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between",
        gap: isCollapsed ? 0 : 1.5,
        transition: "all 0.2s ease-in-out",
        background: "transparent",
        "&:hover": {
          background: `linear-gradient(135deg, ${alpha(
            SIDEBAR_COLORS.background.hover,
            0.8
          )} 0%, ${alpha(SIDEBAR_COLORS.background.secondary, 0.6)} 100%)`,
          boxShadow: SIDEBAR_COLORS.shadow.sm,
          transform: isCollapsed ? "scale(1.05)" : "translateY(-1px)",
        },
      }),
      [isCollapsed]
    );

    // Мемоизированные стили иконки
    const iconStyles = useMemo(
      () => ({
        minWidth: isCollapsed ? "auto" : 40,
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: SIDEBAR_COLORS.text.secondary,
        transition: "color 0.2s ease",
      }),
      [isCollapsed]
    );

    // Мемоизированные дочерние элементы с состояниями
    const childrenWithStates = useMemo(
      () => group.children?.map(child => ({
        item: child,
        state: getItemState(child),
      })) || [],
      [group.children, getItemState]
    );

    return (
      <Box sx={{ width: "100%" }}>
        {/* Заголовок группы */}
        <ListItemButton sx={groupButtonStyles} onClick={handleGroupClick}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : 1.5,
              flex: 1,
            }}
          >
            <ListItemIcon sx={iconStyles}>
              <GroupIcon fontSize="small" />
            </ListItemIcon>

            {!isCollapsed && (
              <ListItemText
                primary={group.label}
                sx={{
                  m: 0,
                  "& .MuiListItemText-primary": {
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: SIDEBAR_COLORS.text.primary,
                    transition: "all 0.2s ease",
                  },
                }}
              />
            )}
          </Box>

          {/* Индикатор расширения */}
          {!isCollapsed && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: SIDEBAR_COLORS.text.muted,
                transition: "transform 0.2s ease",
                transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            >
              <ExpandLess fontSize="small" />
            </Box>
          )}
        </ListItemButton>

        {/* Дочерние элементы */}
        {!isCollapsed && group.children && (
          <Collapse in={isExpanded} timeout={300} unmountOnExit>
            <List component="div" disablePadding>
              {childrenWithStates.map(({ item: child, state }) => (
                <ListItem
                  key={child.id}
                  disablePadding
                  sx={{
                    pl: 4, // Отступ для вложенных элементов
                    mb: 0.5,
                  }}
                >
                  <ListItemButton
                    selected={state.isActive}
                    onClick={() => onItemClick(child)}
                    sx={{
                      py: 1,
                      borderRadius: 1.5,
                      minHeight: 36,
                      transition: "all 0.2s ease",
                      background: state.isActive
                        ? alpha(SIDEBAR_COLORS.accent.primary, 0.08)
                        : "transparent",
                      "&:hover": {
                        background: state.isActive
                          ? alpha(SIDEBAR_COLORS.accent.primary, 0.12)
                          : alpha(SIDEBAR_COLORS.background.hover, 0.5),
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: state.isActive
                          ? SIDEBAR_COLORS.accent.primary
                          : SIDEBAR_COLORS.text.muted,
                      }}
                    >
                      <ChevronRight fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={child.label}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "0.85rem",
                          fontWeight: state.isActive ? 600 : 500,
                          color: state.isActive
                            ? SIDEBAR_COLORS.accent.primary
                            : SIDEBAR_COLORS.text.secondary,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  }
);

SidebarGroup.displayName = "SidebarGroup"; 