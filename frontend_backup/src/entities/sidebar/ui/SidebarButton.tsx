import React, { memo, useMemo } from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Chip,
  Badge,
  alpha,
} from "@mui/material";
import { DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import type { SidebarItem, SidebarItemState } from "../model/types";
import { SIDEBAR_ICON_MAP } from "../model/constants";

// Мемоизированные цвета для предотвращения пересоздания
const SIDEBAR_COLORS = {
  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    hover: "#f1f5f9",
    active: "#e2e8f0",
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
    warning: "#f59e0b",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
} as const;

export interface SidebarButtonProps {
  item: SidebarItem;
  state: SidebarItemState;
  isCollapsed: boolean;
  onClick: (item: SidebarItem) => void;
  sx?: any;
  // Drag and drop props
  dragProps?: {
    attributes?: any;
    listeners?: any;
    isDragging?: boolean;
  };
}

/**
 * Оптимизированный SidebarButton с React.memo
 * Предотвращает ненужные ре-рендеры для лучшей производительности
 * Интегрирует drag handle внутри кнопки справа [[cite](https://www.redblobgames.com/making-of/draggable/)]
 */
export const SidebarButton: React.FC<SidebarButtonProps> = memo(
  ({ item, state, isCollapsed, onClick, sx, dragProps }) => {
    // Мемоизированная иконка (проверяем тип и приводим к нужному)
    const IconComponent = useMemo(() => {
      if (typeof item.icon === "string") {
        const iconKey = item.icon as keyof typeof SIDEBAR_ICON_MAP;
        return SIDEBAR_ICON_MAP[iconKey] || SIDEBAR_ICON_MAP.Dashboard;
      }
      return SIDEBAR_ICON_MAP.Dashboard; // fallback для ReactNode
    }, [item.icon]);

    // Мемоизированные базовые стили
    const baseStyles = useMemo(
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
        justifyContent: isCollapsed ? "center" : "flex-start",
        gap: isCollapsed ? 0 : 1.5,
        position: "relative",
        transition: "all 0.2s ease-in-out",
        background: state.isActive
          ? `linear-gradient(135deg, ${alpha(
              SIDEBAR_COLORS.accent.primary,
              0.1
            )} 0%, ${alpha(SIDEBAR_COLORS.accent.primary, 0.05)} 100%)`
          : "transparent",
        border: state.isActive
          ? `1px solid ${alpha(SIDEBAR_COLORS.accent.primary, 0.2)}`
          : "1px solid transparent",
        boxShadow: state.isActive ? SIDEBAR_COLORS.shadow.sm : "none",
        color: state.isActive
          ? SIDEBAR_COLORS.accent.primary
          : SIDEBAR_COLORS.text.primary,
        opacity: dragProps?.isDragging ? 0.5 : 1,
        "&:hover": {
          background: state.isActive
            ? `linear-gradient(135deg, ${alpha(
                SIDEBAR_COLORS.accent.primary,
                0.15
              )} 0%, ${alpha(SIDEBAR_COLORS.accent.primary, 0.08)} 100%)`
            : `linear-gradient(135deg, ${alpha(
                SIDEBAR_COLORS.background.hover,
                0.8
              )} 0%, ${alpha(SIDEBAR_COLORS.background.secondary, 0.6)} 100%)`,
          border: state.isActive
            ? `1px solid ${alpha(SIDEBAR_COLORS.accent.primary, 0.3)}`
            : `1px solid ${alpha(SIDEBAR_COLORS.border.light, 0.5)}`,
          boxShadow: SIDEBAR_COLORS.shadow.md,
          transform: isCollapsed ? "scale(1.05)" : "translateY(-1px)",
          "& .MuiListItemIcon-root": {
            color: state.isActive
              ? SIDEBAR_COLORS.accent.primary
              : SIDEBAR_COLORS.text.secondary,
          },
          // Показываем drag handle при hover
          "& .drag-handle": {
            opacity: item.isDraggable && !isCollapsed ? 1 : 0,
          },
        },
        "&:active": {
          transform: isCollapsed ? "scale(0.98)" : "translateY(0)",
        },
        ...sx,
      }),
      [state, isCollapsed, sx, dragProps?.isDragging, item.isDraggable]
    );

    // Мемоизированные стили иконки
    const iconStyles = useMemo(
      () => ({
        minWidth: isCollapsed ? "auto" : 40,
        width: isCollapsed ? 24 : 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: state.isActive
          ? SIDEBAR_COLORS.accent.primary
          : SIDEBAR_COLORS.text.secondary,
        transition: "color 0.2s ease",
      }),
      [isCollapsed, state.isActive]
    );

    // Мемоизированный контент badge/chip (исправлен путь к badge)
    const badgeContent = useMemo(() => {
      if (item.badge?.count) {
        return (
          <Chip
            label={item.badge.count}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: alpha(SIDEBAR_COLORS.accent.success, 0.1),
              color: SIDEBAR_COLORS.accent.success,
              fontWeight: 600,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        );
      }
      return null;
    }, [item.badge?.count]);

    // Мемоизированный drag handle 
    const dragHandle = useMemo(() => {
      if (!item.isDraggable || isCollapsed || !dragProps) return null;

      return (
        <Box
          className="drag-handle"
          {...dragProps.attributes}
          {...dragProps.listeners}
          sx={{
            opacity: 0,
            transition: "opacity 0.2s ease-in-out",
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: 1,
            color: SIDEBAR_COLORS.text.muted,
            "&:hover": {
              color: SIDEBAR_COLORS.accent.primary,
              bgcolor: alpha(SIDEBAR_COLORS.accent.primary, 0.1),
            },
            "&:active": {
              cursor: "grabbing",
            },
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()} // Предотвращаем клик по кнопке при драге
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      );
    }, [item.isDraggable, isCollapsed, dragProps]);

    // Мемоизированный обработчик клика
    const handleClick = useMemo(() => () => onClick(item), [onClick, item]);

    return (
      <Tooltip
        title={isCollapsed ? item.label : ""}
        placement="right"
        arrow
        disableHoverListener={!isCollapsed}
        enterDelay={500}
        leaveDelay={200}
      >
        <ListItemButton sx={baseStyles} onClick={handleClick}>
          <ListItemIcon sx={iconStyles}>
            {item.badge?.count ? (
              <Badge
                badgeContent={item.badge.count}
                color={item.badge.color || "primary"}
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.65rem",
                    height: 16,
                    minWidth: 16,
                    borderRadius: "8px",
                  },
                }}
              >
                <IconComponent fontSize="small" />
              </Badge>
            ) : (
              <IconComponent fontSize="small" />
            )}
          </ListItemIcon>

          {!isCollapsed && (
            <>
              <ListItemText
                primary={item.label}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "0.9rem",
                    fontWeight: state.isActive ? 600 : 500,
                    color: state.isActive
                      ? SIDEBAR_COLORS.accent.primary
                      : SIDEBAR_COLORS.text.primary,
                    transition: "all 0.2s ease",
                  },
                  m: 0,
                }}
              />

              {/* Badge/Chip and Drag Handle area */}
              <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
                {badgeContent}
                {dragHandle}
              </Box>
            </>
          )}

          {/* Status indicator for active state */}
          {state.isActive && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: 24,
                borderRadius: "0 2px 2px 0",
                background: `linear-gradient(180deg, ${SIDEBAR_COLORS.accent.primary} 0%, ${SIDEBAR_COLORS.accent.success} 100%)`,
                boxShadow: `0 0 8px ${alpha(
                  SIDEBAR_COLORS.accent.primary,
                  0.3
                )}`,
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  }
);

SidebarButton.displayName = "SidebarButton";
