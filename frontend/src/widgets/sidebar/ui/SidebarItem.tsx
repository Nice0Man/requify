import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Badge,
  Chip,
  alpha,
  useTheme,
  keyframes,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import { useLocation } from "react-router-dom";
import { SidebarItem as SidebarItemType } from "../model/types";
import { SIDEBAR_CONSTANTS } from "../model/config";
import { useTranslation } from "react-i18next";
import { DropIndicator } from "./DropIndicator";

interface SidebarItemProps {
  item: SidebarItemType;
  index: number;
  isCollapsed: boolean;
  isActive: boolean;
  isExpanded?: boolean;
  isLongPressing?: boolean;
  isGlobalDragging?: boolean;
  dragHoverIndex?: number | null;
  level?: number;
  shouldBlockClicks?: boolean;
  shouldBlockNavigation?: boolean;
  onItemClick: (item: SidebarItemType) => void;
  onToggleExpanded?: (itemId: string) => void;
  onDrop?: (dragIndex: number, hoverIndex: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragHover?: (targetIndex: number) => void;
  onDragLeave?: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  navigate?: (path: string) => void;
  isMobile?: boolean;
  setOpen?: (open: boolean) => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  index,
  isCollapsed,
  isActive,
  isExpanded = false,
  isLongPressing = false,
  isGlobalDragging = false,
  dragHoverIndex = null,
  level = 0,
  shouldBlockClicks = false,
  shouldBlockNavigation = false,
  onItemClick,
  onToggleExpanded,
  onDrop,
  onDragStart,
  onDragEnd,
  onDragHover,
  onDragLeave,
  onLongPressStart,
  onLongPressEnd,
  navigate,
  isMobile = false,
  setOpen,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const ref = useRef<HTMLLIElement>(null);
  const [hasActiveLongPress, setHasActiveLongPress] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const Icon = item.icon;
  const isDragHover = dragHoverIndex === index;
  const [showDropIndicator, setShowDropIndicator] = useState(false);
  const dropIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Управление показом drop indicator с задержкой для избежания мигания
  useEffect(() => {
    if (dropIndicatorTimeoutRef.current) {
      clearTimeout(dropIndicatorTimeoutRef.current);
    }

    // Показываем индикатор только в режиме редактирования при реальном drag hover
    if (isDragHover && isGlobalDragging) {
      // Показываем сразу при наведении
      setShowDropIndicator(true);
    } else {
      // Скрываем с небольшой задержкой
      dropIndicatorTimeoutRef.current = setTimeout(() => {
        setShowDropIndicator(false);
      }, 150);
    }

    return () => {
      if (dropIndicatorTimeoutRef.current) {
        clearTimeout(dropIndicatorTimeoutRef.current);
      }
    };
  }, [isDragHover, isGlobalDragging]);

  // Drag and drop configuration
  const [{ isDragging }, drag] = useDrag<
    { id: string; index: number; type: string },
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      type: "SIDEBAR_ITEM",
      item: () => {
        console.log("🔄 Drag started for item:", item.id);
        onDragStart?.();
        return { id: item.id, index, type: "SIDEBAR_ITEM" };
      },
      canDrag: () => {
        return Boolean(isGlobalDragging && item.isDraggable && level === 0);
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (draggedItem, monitor) => {
        console.log(
          "✅ Drag ended for item:",
          item.id,
          "didDrop:",
          monitor.didDrop()
        );
        onDragEnd?.();
      },
    }),
    [
      isGlobalDragging,
      item.isDraggable,
      item.id,
      level,
      index,
      onDragStart,
      onDragEnd,
    ]
  );

  const [, drop] = useDrop<{ id: string; index: number }, unknown, unknown>(
    () => ({
      accept: "SIDEBAR_ITEM",
      hover: (draggedItem: { id: string; index: number }) => {
        if (draggedItem.index !== index) {
          onDragHover?.(index);
        }
      },
      drop: (draggedItem: { id: string; index: number }) => {
        if (draggedItem.index !== index) {
          console.log("📦 Drop on item:", item.id, "from:", draggedItem.id);
          onDrop?.(draggedItem.index, index);
          return { dropped: true };
        }
      },
    }),
    [index, item.id, onDrop, onDragHover]
  );

  // Combine drag and drop refs
  drag(drop(ref));

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  // Long press handlers
  const startLongPress = () => {
    const timer = setTimeout(() => {
      setHasActiveLongPress(true);
      onLongPressStart?.();
    }, SIDEBAR_CONSTANTS.LONG_PRESS_DURATION);
    setLongPressTimer(timer);
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (hasActiveLongPress) {
      setHasActiveLongPress(false);
      onLongPressEnd?.();
    }
  };

  // Mouse events
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button === 0 && level === 0) {
      // Only left click and top level items
      startLongPress();
    }
  };

  const handleMouseUp = () => {
    // Только отменяем долгое нажатие если FSM не в состоянии LONG_PRESS
    // Это предотвращает race condition
    if (!shouldBlockClicks) {
      cancelLongPress();
    }
  };

  const handleMouseLeave = () => {
    // Только отменяем долгое нажатие если FSM не в состоянии LONG_PRESS
    // Это предотвращает race condition
    if (!shouldBlockClicks) {
      cancelLongPress();
    }
  };

  // Touch events
  const handleTouchStart = (event: React.TouchEvent) => {
    if (level === 0) {
      startLongPress();
    }
  };

  const handleTouchEnd = () => {
    // Только отменяем долгое нажатие если FSM не в состоянии LONG_PRESS
    // Это предотвращает race condition
    if (!shouldBlockClicks) {
      cancelLongPress();
    }
  };

  // Click handler
  const handleItemClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Блокируем навигационные клики если FSM запрещает их (long press или edit mode)
    if (shouldBlockNavigation) {
      return;
    }

    // Также блокируем если есть активное локальное долгое нажатие
    if (hasActiveLongPress) {
      return;
    }

    onItemClick(item);
    if (item.path && navigate) {
      navigate(item.path);
    }
    if (isMobile && setOpen) {
      setOpen(false);
    }
  };

  // В режиме редактирования не показываем активный стиль
  const showActiveStyle = isActive && !isGlobalDragging;

  // Определяем, является ли элемент соседним к перетаскиваемому
  const isDragNeighbor =
    isGlobalDragging &&
    !isDragging &&
    dragHoverIndex !== null &&
    Math.abs(dragHoverIndex - index) <= 1;

  const itemContent = (
    <ListItemButton
      onClick={handleItemClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        mx: isCollapsed ? 0.5 : 0.5,
        borderRadius: isCollapsed ? 3.5 : 1.5,
        minHeight: isCollapsed ? 52 : 44,
        pl: isCollapsed ? 0.5 : 1.5,
        pr: isCollapsed ? 0.5 : 1.5,
        py: isCollapsed ? 0.5 : 0.5,
        position: "relative",
        overflow: "hidden",
        backgroundColor: showActiveStyle
          ? alpha(theme.palette.primary.main, 0.08)
          : "transparent",
        border: "1px solid transparent",
        outline: "none !important",
        boxShadow: "none",
        "&:focus": {
          outline: "none !important",
          border: isCollapsed ? "none" : "1px solid transparent",
          boxShadow: "none !important",
        },
        "&:focus-visible": {
          outline: `2px solid ${alpha(
            theme.palette.primary.main,
            0.5
          )} !important`,
          outlineOffset: "2px",
          border: isCollapsed
            ? "none"
            : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        },
        "&:hover":
          !hasActiveLongPress && !isDragging && !isDragHover
            ? isCollapsed
              ? {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  border: "none",
                }
              : {
                  backgroundColor: alpha(theme.palette.action.hover, 0.04),
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                }
            : {},
        "&:active":
          !isDragging && !isDragHover
            ? {
                backgroundColor: alpha(theme.palette.action.hover, 0.06),
              }
            : {},
        // Стили для состояний drag
        ...(showActiveStyle && {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          border: isCollapsed
            ? "none"
            : `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }),
        ...(isDragHover && {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          border: isCollapsed
            ? "none"
            : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }),
        ...(isDragging && {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          zIndex: 1000,
          border: isCollapsed
            ? "none"
            : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }),
        ...(isDragNeighbor && {
          backgroundColor: alpha(theme.palette.action.hover, 0.02),
        }),
        transition: isDragging
          ? "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1), border 0.15s ease-out, outline 0.15s ease-out",
        cursor: isDragging
          ? "grabbing"
          : isGlobalDragging && item.isDraggable && level === 0
          ? "grab"
          : hasActiveLongPress
          ? "default"
          : "pointer",
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: isCollapsed ? 52 : 48,
          mr: isCollapsed ? 0 : 1.5,
          ml: isCollapsed ? 0 : 0,
          color: showActiveStyle
            ? theme.palette.primary.main
            : isDragHover
            ? theme.palette.primary.main
            : theme.palette.primary.main, // Всегда синий цвет
          transition:
            "all 0.2s ease, border 0.15s ease-out, outline 0.15s ease-out",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: isCollapsed ? 48 : 44,
          height: isCollapsed ? 48 : 44,
          borderRadius: isCollapsed ? 3.5 : 1.5, // Более округлые для collapsed mode
          backgroundColor: isCollapsed
            ? showActiveStyle
              ? alpha(theme.palette.primary.main, 0.15)
              : alpha(theme.palette.primary.main, 0.08)
            : showActiveStyle
            ? alpha(theme.palette.primary.main, 0.08)
            : "transparent",
          border: isCollapsed
            ? `1px solid ${alpha(
                theme.palette.primary.main,
                showActiveStyle ? 0.25 : 0.12
              )}`
            : "none",
          outline: "none !important",
          boxShadow: isCollapsed
            ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`
            : "none",
          "&:focus": {
            outline: "none !important",
            border: isCollapsed
              ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
              : "none",
          },
          "&:focus-visible": {
            outline: `2px solid ${alpha(
              theme.palette.primary.main,
              0.5
            )} !important`,
            outlineOffset: "2px",
          },
          "&:hover": isCollapsed
            ? {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 6px 16px ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
                transform: "translateY(-2px) scale(1.02)",
              }
            : {},
        }}
      >
        <Badge
          badgeContent={item.badge}
          color="error"
          invisible={!item.badge}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.6rem",
              height: 16,
              minWidth: 16,
              borderRadius: 1,
              fontWeight: 600,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              right: isCollapsed ? -6 : -4,
              top: isCollapsed ? -2 : 4,
            },
          }}
        >
          <Icon
            sx={{
              fontSize: isCollapsed ? 28 : 22,
              color: "inherit",
              transition: "all 0.2s ease",
            }}
          />
        </Badge>
      </ListItemIcon>

      {!isCollapsed && (
        <>
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: showActiveStyle ? 500 : 400,
                    color: showActiveStyle
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    transition: "all 0.2s ease",
                    letterSpacing: "0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  {item.label}
                </Typography>
                {item.isNew && (
                  <Chip
                    label={t("common.new")}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: "0.6rem",
                      fontWeight: 500,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      border: "none",
                      borderRadius: 1,
                      "& .MuiChip-label": {
                        px: 0.5,
                      },
                    }}
                  />
                )}
              </Box>
            }
          />
        </>
      )}
    </ListItemButton>
  );

  const wrappedContent =
    isCollapsed && level === 0 ? (
      <Tooltip title={item.label} placement="right" arrow>
        {itemContent}
      </Tooltip>
    ) : isGlobalDragging && item.isDraggable && level === 0 ? (
      <Tooltip
        title={
          isDragging ? t("sidebar.draggingTooltip") : t("sidebar.dragTooltip")
        }
        placement="right"
        arrow
      >
        {itemContent}
      </Tooltip>
    ) : (
      itemContent
    );

  return (
    <ListItem
      ref={ref}
      disablePadding
      sx={{
        position: "relative",
        mb: 0.5,
        transition: "all 0.2s ease",
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 100 : 1,
      }}
    >
      {showDropIndicator && <DropIndicator />}
      {wrappedContent}
    </ListItem>
  );
};
