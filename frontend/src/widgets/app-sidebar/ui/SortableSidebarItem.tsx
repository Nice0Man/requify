import React, { forwardRef } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Box,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import { NavigateFunction } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { SidebarItem } from "../model/types";
import { DragData } from "../model/types";
import { SIDEBAR_Z_INDEX } from "../model/config";

interface SortableSidebarItemProps {
  item: SidebarItem;
  isCollapsed: boolean;
  isActive: boolean;
  isDragOverlay?: boolean;
  onItemClick: (item: SidebarItem) => void;
  navigate?: NavigateFunction;
  isMobile?: boolean;
  setOpen?: (open: boolean) => void;
}

// Утилиты для расчета стилей
const createSidebarStyles = (theme: any, isCollapsed: boolean) => ({
  // Базовые размеры
  sizes: {
    collapsedIcon: 44,
    expandedIcon: 24,
    collapsedContainer: 56,
    expandedContainer: 48,
    borderRadius: isCollapsed ? 2 : 2,
  },

  // Цветовая схема
  colors: {
    primary: theme.palette.primary.main,
    background: theme.palette.background.paper,
    text: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    divider: theme.palette.divider,
    error: theme.palette.error.main,
  },

  // Состояния
  states: {
    default: {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
    },
    hover: {
      backgroundColor: alpha(theme.palette.action.hover, 0.04),
      border: isCollapsed
        ? "none"
        : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      boxShadow: "none",
    },
    active: {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      border: isCollapsed
        ? "none"
        : `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
      boxShadow: "none",
    },
    dragging: {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      border: isCollapsed
        ? "none"
        : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    dropTarget: {
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
      border: isCollapsed
        ? "none"
        : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
});

export const SortableSidebarItem = forwardRef<
  HTMLLIElement,
  SortableSidebarItemProps
>(
  (
    {
      item,
      isCollapsed,
      isActive,
      isDragOverlay = false,
      onItemClick,
      navigate,
      isMobile = false,
      setOpen,
      ...props
    },
    _ref
  ) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const Icon = item.icon;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      isOver,
      setActivatorNodeRef,
    } = useSortable({
      id: item.id,
      data: {
        type: "sidebar-item",
        item,
        sortable: {
          containerId: "sortable-sidebar",
          index: 0,
        },
      } as DragData,
      disabled: !item.isDraggable,
    });

    const styles = createSidebarStyles(theme, isCollapsed);

    const style = {
      transform: CSS.Translate.toString(transform),
      transition: isDragOverlay ? "none" : transition,
    };

    // Определение текущего состояния (только одно активное состояние)
    const currentState = isDragging
      ? "dragging"
      : isOver
      ? "dropTarget"
      : isActive
      ? "active"
      : "default";

    // Обработчик клика
    const handleItemClick = (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isDragging) return;

      onItemClick(item);
      if (item.path && navigate) {
        navigate(item.path);
      }
      if (isMobile && setOpen) {
        setOpen(false);
      }
    };

    // Основной контейнер элемента
    const itemContent = (
      <ListItemButton
        onClick={handleItemClick}
        sx={{
          // Базовая геометрия - центрирование для collapsed режима
          mx: isCollapsed ? 1 : 0.5, // Увеличиваем боковые отступы для центрирования в collapsed
          borderRadius: styles.sizes.borderRadius,
          minHeight: isCollapsed
            ? styles.sizes.collapsedContainer
            : styles.sizes.expandedContainer,
          px: isCollapsed ? 0 : 1.5, // Убираем внутренние отступы в collapsed режиме
          py: 0.5,
          position: "relative",
          overflow: "hidden",
          
          // Центрирование контента в collapsed режиме
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",

          // Применяем текущее состояние стилей
          ...styles.states[currentState],

          // Визуальные эффекты - упрощенные
          opacity: isDragging && !isDragOverlay ? 0.4 : 1,
          cursor: isDragging
            ? "grabbing"
            : item.isDraggable
            ? "grab"
            : "pointer",

          // Упрощенные переходы
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

          // Убираем все outline'ы из контейнера по умолчанию
          outline: "none !important",

          // Hover состояние (только если не активное состояние)
          "&:hover": currentState === "default" ? styles.states.hover : {},

          // Focus состояние - улучшенное для collapsed режима
          "&:focus-visible": isCollapsed ? {
            // В collapsed режиме outline вокруг иконки
            "& .MuiListItemIcon-root": {
              outline: `2px solid ${alpha(styles.colors.primary, 0.6)} !important`,
              outlineOffset: "2px",
            },
          } : {
            // В expanded режиме outline вокруг всего элемента
            outline: `2px solid ${alpha(styles.colors.primary, 0.5)} !important`,
            outlineOffset: "2px",
            border: `1px solid ${alpha(styles.colors.primary, 0.3)}`,
          },
        }}
      >
        {/* Drag Handle - только для expanded режима */}
        {item.isDraggable && !isCollapsed && (
          <Box
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            sx={{
              position: "absolute",
              left: 4,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: isDragging ? 0.8 : 0.3,
              transition: "opacity 0.2s ease",
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              "&:hover": {
                opacity: 0.6,
              },
            }}
          >
            <DragIndicator
              sx={{
                fontSize: 16,
                color: styles.colors.textSecondary,
              }}
            />
          </Box>
        )}

        {/* Icon Container */}
        <ListItemIcon
          {...(isCollapsed && item.isDraggable
            ? { ref: setActivatorNodeRef, ...listeners, ...attributes }
            : {})}
          sx={{
            minWidth: isCollapsed
              ? styles.sizes.collapsedIcon
              : styles.sizes.expandedIcon + 24,
            mr: isCollapsed ? 0 : 1.5,
            ml: isCollapsed ? 0 : item.isDraggable ? 2 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            // В collapsed режиме - это отдельный визуальный элемент
            ...(isCollapsed
              ? {
                  width: styles.sizes.collapsedIcon,
                  height: styles.sizes.collapsedIcon,
                  borderRadius: styles.sizes.borderRadius,
                  backgroundColor:
                    currentState === "active"
                      ? alpha(styles.colors.primary, 0.15)
                      : alpha(styles.colors.primary, 0.08),
                  border: `1px solid ${alpha(
                    styles.colors.primary,
                    currentState === "active" ? 0.25 : 0.12
                  )}`,
                  boxShadow: `0 2px 8px ${alpha(styles.colors.primary, 0.08)}`,
                  transition: "all 0.2s ease",
                  cursor: item.isDraggable ? "grab" : "pointer",

                  // Убираем hover transform - только цвета
                  "&:hover":
                    currentState === "default"
                      ? {
                          backgroundColor: alpha(styles.colors.primary, 0.12),
                          border: `1px solid ${alpha(
                            styles.colors.primary,
                            0.2
                          )}`,
                          boxShadow: `0 4px 12px ${alpha(
                            styles.colors.primary,
                            0.15
                          )}`,
                        }
                      : {},
                }
              : {
                  // В expanded режиме - просто контейнер для иконки
                  color:
                    currentState === "active"
                      ? styles.colors.primary
                      : styles.colors.textSecondary,
                  transition: "color 0.2s ease",
                }),
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
                backgroundColor: styles.colors.error,
                color: theme.palette.error.contrastText,
                right: isCollapsed ? -6 : -4,
                top: isCollapsed ? -2 : 4,
                border: `1px solid ${styles.colors.background}`,
              },
            }}
          >
            <Icon
              sx={{
                fontSize: isCollapsed ? 22 : styles.sizes.expandedIcon, // Уменьшил с 28 до 22 для лучших пропорций
                color: isCollapsed
                  ? styles.colors.primary
                  : currentState === "active"
                  ? styles.colors.primary
                  : styles.colors.textSecondary,
                transition: "all 0.2s ease",
              }}
            />
          </Badge>
        </ListItemIcon>

        {/* Text - только в expanded режиме */}
        {!isCollapsed && (
          <ListItemText
            primary={item.label}
            sx={{
              "& .MuiListItemText-primary": {
                fontSize: "0.875rem",
                fontWeight: currentState === "active" ? 600 : 500,
                color:
                  currentState === "active"
                    ? styles.colors.primary
                    : styles.colors.text,
                transition: "all 0.2s ease",
                letterSpacing: "0.01em",
              },
            }}
          />
        )}

        {/* Индикатор перетаскивания - простой статичный */}
        {isDragging && (
          <Box
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              backgroundColor: styles.colors.primary,
              borderRadius: "50%",
              opacity: 0.8,
              // Убираем анимацию pulse для стабильности
            }}
          />
        )}
      </ListItemButton>
    );

    // Tooltip обертка
    const wrappedContent = isCollapsed ? (
      <Tooltip title={item.label} placement="right" arrow>
        {itemContent}
      </Tooltip>
    ) : item.isDraggable ? (
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
        ref={setNodeRef}
        style={style}
        disablePadding
        sx={{
          position: "relative",
          mb: 0.5,
          zIndex: isDragging ? SIDEBAR_Z_INDEX.draggingItem : 1,
          opacity: isDragOverlay ? 1 : undefined,
        }}
        {...props}
      >
        {wrappedContent}
      </ListItem>
    );
  }
);

SortableSidebarItem.displayName = "SortableSidebarItem";
