import React, { useCallback, useMemo } from "react";
import {
  Box,
  List,
  Typography,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Fade,
  Paper,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  useSidebar,
  useSidebarItems,
  useSidebarBottomItems,
  useSidebarDnd,
} from "../model";
import { SidebarItem as SidebarItemType } from "../model/types";
import { SIDEBAR_CONSTANTS } from "../model/config";
import { SortableSidebarItem } from "./SortableSidebarItem";
import { SidebarDragOverlay } from "./SidebarDragOverlay";
import { SortableDropIndicator } from "./SortableDropIndicator";

export const SidebarWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    isCollapsed,
    isMobile: isMobileDevice,
    isOpen,
    expandedItems,
    activeItem,
    toggleCollapse,
    toggleExpanded,
    setOpen,
    config,
  } = useSidebar();

  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    activeId,
    isDragging,
  } = useSidebarDnd();

  const items = useSidebarItems();
  const bottomItems = useSidebarBottomItems();

  const sidebarWidth = isCollapsed ? config.collapsedWidth : config.width;

  // Настройка сенсоров для лучшего UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: SIDEBAR_CONSTANTS.SENSOR_OPTIONS.delay,
        tolerance: SIDEBAR_CONSTANTS.SENSOR_OPTIONS.tolerance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Обработчики drag events
  const onDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    console.log("🚀 Drag start:", active.id);
    handleDragStart(active.id);
  }, [handleDragStart]);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    handleDragOver(over?.id || null);
  }, [handleDragOver]);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    console.log("🏁 Drag end:", active.id, "over:", over?.id);
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        console.log("📦 Reordering from", oldIndex, "to", newIndex);
      }
    }
    
    handleDragEnd(active.id, over?.id || null);
  }, [handleDragEnd, items]);

  const onDragCancel = useCallback(() => {
    console.log("❌ Drag cancel");
    handleDragCancel();
  }, [handleDragCancel]);

  // Обработчик клика по элементу
  const handleItemClick = useCallback((item: SidebarItemType) => {
    if (item.children) {
      if (isCollapsed) {
        toggleCollapse();
        setTimeout(() => {
          if (!expandedItems.includes(item.id)) {
            toggleExpanded(item.id);
          }
        }, 150);
      } else {
        toggleExpanded(item.id);
      }
    } else if (item.path) {
      navigate(item.path);
      if (isMobileDevice) {
        setOpen(false);
      }
    }
  }, [isCollapsed, expandedItems, toggleCollapse, toggleExpanded, navigate, isMobileDevice, setOpen]);

  // Определение активного элемента
  const isItemActive = useCallback((item: SidebarItemType): boolean => {
    if (activeItem === item.id) return true;
    if (item.children) {
      return item.children.some((child) => activeItem === child.id);
    }
    return false;
  }, [activeItem]);

  // Массив ID для SortableContext
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  return (
    <>
      {/* Мобильная заглушка */}
      {isMobileDevice && isOpen && (
        <Fade in={isOpen} timeout={200}>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha(theme.palette.common.black, 0.4),
              zIndex: theme.zIndex.drawer - 1,
            }}
            onClick={() => setOpen(false)}
          />
        </Fade>
      )}

      {/* DND Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        {/* Основной контейнер sidebar */}
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            top: 0,
            left: isMobileDevice ? (isOpen ? 0 : -sidebarWidth) : 0,
            bottom: 0,
            width: sidebarWidth,
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow:
              isOpen && isMobileDevice
                ? `0 0 16px ${alpha(theme.palette.common.black, 0.1)}`
                : "none",
            zIndex: theme.zIndex.drawer,
            transition: `all ${config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header с логотипом */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              minHeight: 64,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isCollapsed && (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: "1.1rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Requify
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.7rem",
                      fontWeight: 400,
                      opacity: 0.8,
                    }}
                  >
                    v2.0
                  </Typography>
                </>
              )}
            </Box>
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.action.hover, 0.08),
                },
              }}
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>

          {/* Индикатор режима перетаскивания */}
          {isDragging && !isCollapsed && (
            <SortableDropIndicator 
              isVisible={isDragging} 
              isCollapsed={isCollapsed}
            />
          )}

          {/* Основное содержимое с сортируемыми элементами */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden auto",
              py: 1,
              "&::-webkit-scrollbar": {
                width: 2,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.divider, 0.2),
                borderRadius: 1,
              },
            }}
          >
            <SortableContext
              items={itemIds}
              strategy={config.sortingStrategy}
              id={SIDEBAR_CONSTANTS.CONTAINER_ID}
            >
              <List disablePadding>
                {items.map((item) => (
                  <SortableSidebarItem
                    key={item.id}
                    item={item}
                    isCollapsed={isCollapsed}
                    isActive={isItemActive(item)}
                    onItemClick={handleItemClick}
                    navigate={navigate}
                    isMobile={isMobileDevice}
                    setOpen={setOpen}
                  />
                ))}
              </List>
            </SortableContext>
          </Box>

          {/* Разделитель */}
          <Divider
            sx={{ 
              mx: 2, 
              my: 1, 
              borderColor: alpha(theme.palette.divider, 0.08) 
            }}
          />

          {/* Нижняя секция */}
          <Box sx={{ py: 0.5 }}>
            <List disablePadding>
              {bottomItems.map((item) => (
                <SortableSidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                  isActive={isItemActive(item)}
                  onItemClick={handleItemClick}
                  navigate={navigate}
                  isMobile={isMobileDevice}
                  setOpen={setOpen}
                />
              ))}
            </List>
          </Box>
        </Paper>

        {/* Drag Overlay */}
        <SidebarDragOverlay
          activeId={activeId}
          items={items}
          isCollapsed={isCollapsed}
        />
      </DndContext>
    </>
  );
};
