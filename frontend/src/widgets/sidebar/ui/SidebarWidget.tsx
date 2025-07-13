import React, { useState, useReducer, useEffect } from "react";
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
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "react-device-detect";
import { SidebarItem } from "./SidebarItem";
import { TemporaryDropPreview } from "./TemporaryDropPreview";
import { SidebarResetButton } from "./SidebarResetButton";
import { EditControls } from "./EditControls";
import { DiscoveryHints } from "./DiscoveryHints";
import { InteractionEffects } from "./InteractionEffects";
import { MagneticGrid } from "./MagneticGrid";
import {
  useSidebar,
  useSidebarItems,
  useSidebarBottomItems,
  useSidebarDragAndDrop,
  useSidebarStore,
} from "../model";
import {
  sidebarFSMReducer,
  initialSidebarFSMState,
  sidebarFSMHelpers,
  SidebarAction,
} from "../model/sidebarFSM";

export const SidebarWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // FSM состояние
  const [fsmState, dispatch] = useReducer(
    sidebarFSMReducer,
    initialSidebarFSMState
  );

  // Логирование изменений FSM состояния (только важные изменения)
  useEffect(() => {
    if (fsmState.currentState !== "NORMAL") {
      console.log("🔄 FSM State changed:", {
        currentState: fsmState.currentState,
        isEditMode: sidebarFSMHelpers.isEditMode(fsmState),
        canDrag: sidebarFSMHelpers.canDrag(fsmState),
      });
    }
  }, [fsmState.currentState]);

  // Локальное состояние для drag hover
  const [dragHoverIndex, setDragHoverIndex] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<any | null>(null);
  const [showDropPreview, setShowDropPreview] = useState<boolean>(false);

  // Таймаут для автоматического сброса долгого нажатия
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (sidebarFSMHelpers.shouldPersistLongPress(fsmState)) {
      // Автоматически сбрасываем долгое нажатие через 10 секунд
      timeout = setTimeout(() => {
        dispatch({ type: SidebarAction.LONG_PRESS_END });
      }, 10000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [fsmState.currentState]);

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

  const items = useSidebarItems();
  const bottomItems = useSidebarBottomItems();
  const { handleDrop: originalHandleDrop, handleResetOrder } =
    useSidebarDragAndDrop();

  const handleDrop = (dragIndex: number, hoverIndex: number) => {
    originalHandleDrop(dragIndex, hoverIndex);

    // Помечаем, что есть несохраненные изменения
    if (sidebarFSMHelpers.isEditMode(fsmState)) {
      dispatch({
        type: SidebarAction.MARK_UNSAVED_CHANGES,
      });
    }

    // Не вызываем handleDragEnd здесь, это будет сделано в end callback useDrag
  };

  const sidebarWidth = isCollapsed ? config.collapsedWidth : config.width;

  // Принудительно разворачиваем сайдбар при загрузке
  React.useEffect(() => {
    // Используем resetSidebar для полной очистки состояния
    const { resetSidebar } = useSidebarStore.getState();
    resetSidebar();

    console.log("🔧 Sidebar reset and expanded");
  }, []); // Запускаем только один раз при монтировании

  const handleItemClick = (item: any) => {
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
  };

  const handleLongPressStart = (itemId: string) => {
    if (!isCollapsed && sidebarFSMHelpers.canInitiateLongPress(fsmState)) {
      dispatch({
        type: SidebarAction.LONG_PRESS_START,
        payload: { itemId },
      });
    }
  };

  const handleLongPressEnd = () => {
    dispatch({ type: SidebarAction.LONG_PRESS_END });
  };

  const handleEnterEditMode = () => {
    const originalOrder = items.map((item) => item.id);
    dispatch({
      type: SidebarAction.ENTER_EDIT_MODE,
      payload: { originalOrder },
    });
  };

  const handleApproveChanges = () => {
    dispatch({ type: SidebarAction.APPROVE_CHANGES });
  };

  const handleDeclineChanges = () => {
    // Восстанавливаем исходный порядок
    if (fsmState.originalOrder.length > 0) {
      handleResetOrder();
    }
    dispatch({ type: SidebarAction.DECLINE_CHANGES });
  };

  const handleDragStart = (item?: any) => {
    setDragHoverIndex(null);
    setDraggedItem(item || null);
    setShowDropPreview(false);
    // Переводим FSM в состояние DRAGGING
    if (sidebarFSMHelpers.isEditMode(fsmState)) {
      dispatch({ type: SidebarAction.START_DRAGGING });
    }
  };

  const handleDragEnd = () => {
    setDragHoverIndex(null);
    setDraggedItem(null);
    setShowDropPreview(false);
    // Возвращаем FSM в состояние EDIT_MODE после завершения drag
    if (sidebarFSMHelpers.isDragging(fsmState)) {
      dispatch({ type: SidebarAction.END_DRAGGING });
    }
  };

  const handleDragHover = (targetIndex: number) => {
    if (
      sidebarFSMHelpers.isEditMode(fsmState) ||
      sidebarFSMHelpers.isDragging(fsmState)
    ) {
      setDragHoverIndex(targetIndex);
      setShowDropPreview(true);
      dispatch({
        type: SidebarAction.DRAG_HOVER,
        payload: { hoverIndex: targetIndex },
      });
    }
  };

  const handleDragLeave = () => {
    setDragHoverIndex(null);
    setShowDropPreview(false);
    dispatch({ type: SidebarAction.DRAG_LEAVE });
  };

  // Хендлеры для Discovery Hints
  const handleHideDiscoveryHints = () => {
    dispatch({ type: SidebarAction.HIDE_DISCOVER_HINTS });
  };

  const isItemActive = (item: any): boolean => {
    if (activeItem === item.id) return true;
    if (item.children) {
      return item.children.some((child: any) => activeItem === child.id);
    }
    return false;
  };

  // Выбираем backend для drag and drop в зависимости от устройства
  const dndBackend = isMobile ? TouchBackend : HTML5Backend;
  const dndOptions = isMobile ? { enableMouseEvents: true } : {};

  return (
    <DndProvider backend={dndBackend} options={dndOptions}>
      {/* Discovery Hints - подсказки для пользователя (только в режиме обнаружения) */}
      {sidebarFSMHelpers.shouldShowDiscoverHints(fsmState) && (
        <DiscoveryHints
          show={true}
          onHide={handleHideDiscoveryHints}
          isCollapsed={isCollapsed}
        />
      )}

      {/* Interaction Effects - визуальные эффекты взаимодействий (только когда нужно) */}
      {(fsmState.isLifting || fsmState.jigglingItems.length > 0 || sidebarFSMHelpers.isDragging(fsmState) || fsmState.snapTargetIndex !== null) && (
        <InteractionEffects
          isLifting={fsmState.isLifting}
          isJiggling={fsmState.jigglingItems.length > 0}
          isDragging={sidebarFSMHelpers.isDragging(fsmState)}
          isSnapping={fsmState.snapTargetIndex !== null}
        >
          <div></div>
        </InteractionEffects>
      )}

      {/* Magnetic Grid - магнитная сетка для drag & drop (только в режиме редактирования) */}
      {sidebarFSMHelpers.isEditMode(fsmState) && (
        <MagneticGrid
          isActive={true}
          onDrop={handleDrop}
          onSnapPreview={handleDragHover}
          onSnapClear={handleDragLeave}
          itemCount={items.length}
          draggedItemIndex={null}
          hoveredItemIndex={dragHoverIndex}
        >
          <div></div>
        </MagneticGrid>
      )}

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

      {/* Боковая панель */}
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          left: isMobileDevice ? (isOpen ? 0 : -sidebarWidth) : 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          background: theme.palette.background.paper,
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
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: isCollapsed ? "1rem" : "1.1rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              opacity: isCollapsed ? 0 : 1,
              transition: `all ${config.animationDuration}ms ease`,
            }}
          >
            {isCollapsed ? "R" : "Requify"}
          </Typography>

          <IconButton
            onClick={toggleCollapse}
            size="small"
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              backgroundColor: "transparent",
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              color: theme.palette.text.secondary,
              transition: "all 0.15s ease",
              p: 0.5,
              "&:hover": {
                backgroundColor: alpha(theme.palette.action.hover, 0.04),
                color: theme.palette.text.primary,
              },
            }}
          >
            {isCollapsed ? (
              <ChevronRight sx={{ fontSize: 16 }} />
            ) : (
              <ChevronLeft sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Box>

        {/* Основная навигация */}
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
          <List disablePadding>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {/* Показываем временный drop preview если hover на эту позицию */}
                {showDropPreview &&
                  dragHoverIndex === index &&
                  draggedItem &&
                  draggedItem.id !== item.id && (
                    <TemporaryDropPreview
                      item={draggedItem}
                      isCollapsed={isCollapsed}
                      index={index}
                    />
                  )}

                <SidebarItem
                  item={item}
                  index={index}
                  isCollapsed={isCollapsed}
                  isActive={isItemActive(item)}
                  isExpanded={expandedItems.includes(item.id)}
                  isLongPressing={fsmState.longPressItemId === item.id}
                  isGlobalDragging={sidebarFSMHelpers.isEditMode(fsmState)}
                  dragHoverIndex={dragHoverIndex}
                  shouldBlockClicks={sidebarFSMHelpers.shouldBlockClicks(
                    fsmState
                  )}
                  shouldBlockNavigation={sidebarFSMHelpers.shouldBlockNavigation(
                    fsmState
                  )}
                  onItemClick={handleItemClick}
                  onToggleExpanded={toggleExpanded}
                  onDrop={handleDrop}
                  onDragStart={() => handleDragStart(item)}
                  onDragEnd={handleDragEnd}
                  onDragHover={handleDragHover}
                  onDragLeave={handleDragLeave}
                  onLongPressStart={() => handleLongPressStart(item.id)}
                  onLongPressEnd={handleLongPressEnd}
                  navigate={navigate}
                  isMobile={isMobileDevice}
                  setOpen={setOpen}
                />
              </React.Fragment>
            ))}
            
            {/* Показываем drop preview в конце списка если hover на последнюю позицию */}
            {showDropPreview && 
             dragHoverIndex === items.length && 
             draggedItem && (
              <TemporaryDropPreview
                item={draggedItem}
                isCollapsed={isCollapsed}
                index={items.length}
              />
            )}
          </List>
        </Box>

        {/* Разделитель */}
        <Divider
          sx={{ mx: 2, my: 1, borderColor: alpha(theme.palette.divider, 0.08) }}
        />

        {/* Кнопка сброса (показывается при долгом нажатии) */}
        {sidebarFSMHelpers.shouldShowResetButton(fsmState) && (
          <SidebarResetButton
            isVisible={true}
            onClose={handleLongPressEnd}
            onEnterEditMode={handleEnterEditMode}
          />
        )}

        {/* Контролы редактирования (показываются в режиме редактирования) */}
        {sidebarFSMHelpers.shouldShowEditControls(fsmState) && (
          <EditControls
            onApprove={handleApproveChanges}
            onDecline={handleDeclineChanges}
            hasUnsavedChanges={fsmState.hasUnsavedChanges}
          />
        )}

        {/* Нижняя секция */}
        <Box sx={{ py: 0.5 }}>
          <List disablePadding>
            {bottomItems.map((item, index) => (
              <SidebarItem
                key={item.id}
                item={item}
                index={index}
                isCollapsed={isCollapsed}
                isActive={isItemActive(item)}
                shouldBlockClicks={sidebarFSMHelpers.shouldBlockClicks(
                  fsmState
                )}
                shouldBlockNavigation={sidebarFSMHelpers.shouldBlockNavigation(
                  fsmState
                )}
                onItemClick={handleItemClick}
                navigate={navigate}
                isMobile={isMobileDevice}
                setOpen={setOpen}
              />
            ))}
          </List>
        </Box>
      </Paper>
    </DndProvider>
  );
};
