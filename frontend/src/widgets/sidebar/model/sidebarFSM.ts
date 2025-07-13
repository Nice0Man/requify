/**
 * Finite State Machine для управления состояниями сайдбара
 * Реализует Core Interaction Phases & Design Solutions:
 * 1. Initiation (Discoverability & Activation) - DISCOVER, LONG_PRESS
 * 2. Dragging State (Affordance & Feedback) - LIFTING, DRAGGING
 * 3. Drop & Placement (Precision & Confirmation) - DROPPING, SNAPPING
 * 4. Completion & Exit - JIGGLING, EDIT_MODE
 */

export enum SidebarFSMStateType {
  NORMAL = "NORMAL",
  DISCOVER = "DISCOVER", // Показ подсказок о возможности перетаскивания
  LONG_PRESS = "LONG_PRESS", // Длинное нажатие для инициации
  LIFTING = "LIFTING", // Визуальный эффект поднятия элемента
  JIGGLING = "JIGGLING", // Режим редактирования с покачиванием
  DRAGGING = "DRAGGING", // Активное перетаскивание
  DROPPING = "DROPPING", // Процесс размещения
  SNAPPING = "SNAPPING", // Анимация привязки к сетке
  EDIT_MODE = "EDIT_MODE", // Режим редактирования с кнопками
}

export enum SidebarAction {
  SHOW_DISCOVER_HINTS = "SHOW_DISCOVER_HINTS",
  HIDE_DISCOVER_HINTS = "HIDE_DISCOVER_HINTS",
  LONG_PRESS_START = "LONG_PRESS_START",
  LONG_PRESS_END = "LONG_PRESS_END",
  LONG_PRESS_CANCEL = "LONG_PRESS_CANCEL",
  START_LIFTING = "START_LIFTING",
  START_JIGGLING = "START_JIGGLING",
  START_DRAGGING = "START_DRAGGING",
  DRAG_HOVER = "DRAG_HOVER",
  DRAG_LEAVE = "DRAG_LEAVE",
  START_DROPPING = "START_DROPPING",
  SNAP_TO_GRID = "SNAP_TO_GRID",
  ENTER_EDIT_MODE = "ENTER_EDIT_MODE",
  APPROVE_CHANGES = "APPROVE_CHANGES",
  DECLINE_CHANGES = "DECLINE_CHANGES",
  RESET_TO_NORMAL = "RESET_TO_NORMAL",
  MARK_UNSAVED_CHANGES = "MARK_UNSAVED_CHANGES",
  END_DRAGGING = "END_DRAGGING",
}

export interface SidebarFSMState {
  currentState: SidebarFSMStateType;
  longPressItemId: string | null;
  isDragging: boolean;
  isLifting: boolean;
  isJiggling: boolean;
  isSnapping: boolean;
  dragHoverIndex: number | null;
  dragStartIndex: number | null;
  hasUnsavedChanges: boolean;
  originalOrder: string[];
  showDiscoverHints: boolean;
  liftStartTime: number | null;
  jigglingItems: string[];
  snapTargetIndex: number | null;
}

export const initialSidebarFSMState: SidebarFSMState = {
  currentState: SidebarFSMStateType.NORMAL,
  longPressItemId: null,
  isDragging: false,
  isLifting: false,
  isJiggling: false,
  isSnapping: false,
  dragHoverIndex: null,
  dragStartIndex: null,
  hasUnsavedChanges: false,
  originalOrder: [],
  showDiscoverHints: false,
  liftStartTime: null,
  jigglingItems: [],
  snapTargetIndex: null,
};

/**
 * FSM переходы между состояниями
 */
export const sidebarFSMTransitions: Record<
  SidebarFSMStateType,
  Partial<Record<SidebarAction, SidebarFSMStateType>>
> = {
  [SidebarFSMStateType.NORMAL]: {
    [SidebarAction.SHOW_DISCOVER_HINTS]: SidebarFSMStateType.DISCOVER,
    [SidebarAction.LONG_PRESS_START]: SidebarFSMStateType.LONG_PRESS,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.DISCOVER]: {
    [SidebarAction.HIDE_DISCOVER_HINTS]: SidebarFSMStateType.NORMAL,
    [SidebarAction.LONG_PRESS_START]: SidebarFSMStateType.LONG_PRESS,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.LONG_PRESS]: {
    [SidebarAction.LONG_PRESS_END]: SidebarFSMStateType.LIFTING,
    [SidebarAction.LONG_PRESS_CANCEL]: SidebarFSMStateType.NORMAL,
    [SidebarAction.START_LIFTING]: SidebarFSMStateType.LIFTING,
    [SidebarAction.ENTER_EDIT_MODE]: SidebarFSMStateType.EDIT_MODE,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.LIFTING]: {
    [SidebarAction.START_JIGGLING]: SidebarFSMStateType.JIGGLING,
    [SidebarAction.START_DRAGGING]: SidebarFSMStateType.DRAGGING,
    [SidebarAction.RESET_TO_NORMAL]: SidebarFSMStateType.NORMAL,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.JIGGLING]: {
    [SidebarAction.START_DRAGGING]: SidebarFSMStateType.DRAGGING,
    [SidebarAction.ENTER_EDIT_MODE]: SidebarFSMStateType.EDIT_MODE,
    [SidebarAction.RESET_TO_NORMAL]: SidebarFSMStateType.NORMAL,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.DRAGGING]: {
    [SidebarAction.START_DROPPING]: SidebarFSMStateType.DROPPING,
    [SidebarAction.DRAG_HOVER]: SidebarFSMStateType.DRAGGING,
    [SidebarAction.DRAG_LEAVE]: SidebarFSMStateType.DRAGGING,
    [SidebarAction.RESET_TO_NORMAL]: SidebarFSMStateType.NORMAL,
    [SidebarAction.END_DRAGGING]: SidebarFSMStateType.EDIT_MODE,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.DROPPING]: {
    [SidebarAction.SNAP_TO_GRID]: SidebarFSMStateType.SNAPPING,
    [SidebarAction.RESET_TO_NORMAL]: SidebarFSMStateType.NORMAL,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.SNAPPING]: {
    [SidebarAction.START_JIGGLING]: SidebarFSMStateType.JIGGLING,
    [SidebarAction.ENTER_EDIT_MODE]: SidebarFSMStateType.EDIT_MODE,
    [SidebarAction.RESET_TO_NORMAL]: SidebarFSMStateType.NORMAL,
    // ... остальные переходы остаются undefined
  },
  [SidebarFSMStateType.EDIT_MODE]: {
    [SidebarAction.APPROVE_CHANGES]: SidebarFSMStateType.NORMAL,
    [SidebarAction.DECLINE_CHANGES]: SidebarFSMStateType.NORMAL,
    [SidebarAction.RESET_TO_NORMAL]: SidebarFSMStateType.NORMAL,
    [SidebarAction.MARK_UNSAVED_CHANGES]: SidebarFSMStateType.EDIT_MODE,
    [SidebarAction.START_DRAGGING]: SidebarFSMStateType.DRAGGING,
    [SidebarAction.DRAG_HOVER]: SidebarFSMStateType.EDIT_MODE,
    [SidebarAction.DRAG_LEAVE]: SidebarFSMStateType.EDIT_MODE,
    // ... остальные переходы остаются undefined
  },
};

/**
 * Reducer для FSM
 */
export function sidebarFSMReducer(
  state: SidebarFSMState,
  action: { type: SidebarAction; payload?: any }
): SidebarFSMState {
  const { type, payload } = action;
  const currentTransitions = sidebarFSMTransitions[state.currentState];
  const nextState = currentTransitions?.[type];

  // Если переход не разрешен, возвращаем текущее состояние
  if (!nextState) {
    return state;
  }

  switch (type) {
    case SidebarAction.SHOW_DISCOVER_HINTS:
      return {
        ...state,
        currentState: nextState,
        showDiscoverHints: true,
      };

    case SidebarAction.HIDE_DISCOVER_HINTS:
      return {
        ...state,
        currentState: nextState,
        showDiscoverHints: false,
      };

    case SidebarAction.LONG_PRESS_START:
      return {
        ...state,
        currentState: nextState,
        longPressItemId: payload?.itemId || null,
      };

    case SidebarAction.LONG_PRESS_END:
      return {
        ...state,
        currentState: nextState,
        longPressItemId: null,
      };

    case SidebarAction.LONG_PRESS_CANCEL:
      return {
        ...state,
        currentState: nextState,
        longPressItemId: null,
      };

    case SidebarAction.START_LIFTING:
      return {
        ...state,
        currentState: nextState,
        isLifting: true,
        liftStartTime: Date.now(),
      };

    case SidebarAction.START_JIGGLING:
      return {
        ...state,
        currentState: nextState,
        isJiggling: true,
        jigglingItems: payload?.itemIds || [],
      };

    case SidebarAction.START_DRAGGING:
      return {
        ...state,
        currentState: nextState,
        isDragging: true,
        dragStartIndex: payload?.startIndex || null,
        isLifting: false,
        isJiggling: false,
      };

    case SidebarAction.DRAG_HOVER:
      return {
        ...state,
        dragHoverIndex: payload?.hoverIndex || null,
      };

    case SidebarAction.DRAG_LEAVE:
      return {
        ...state,
        dragHoverIndex: null,
      };

    case SidebarAction.START_DROPPING:
      return {
        ...state,
        currentState: nextState,
        isDragging: false,
      };

    case SidebarAction.SNAP_TO_GRID:
      return {
        ...state,
        currentState: nextState,
        isSnapping: true,
        snapTargetIndex: payload?.targetIndex || null,
      };

    case SidebarAction.ENTER_EDIT_MODE:
      return {
        ...state,
        currentState: nextState,
        originalOrder: payload?.originalOrder || [],
        hasUnsavedChanges: false,
      };

    case SidebarAction.APPROVE_CHANGES:
      return {
        ...state,
        currentState: nextState,
        longPressItemId: null,
        isDragging: false,
        dragHoverIndex: null,
        hasUnsavedChanges: false,
        originalOrder: [],
      };

    case SidebarAction.DECLINE_CHANGES:
      return {
        ...state,
        currentState: nextState,
        longPressItemId: null,
        isDragging: false,
        dragHoverIndex: null,
        hasUnsavedChanges: false,
        originalOrder: [],
      };

    case SidebarAction.RESET_TO_NORMAL:
      return {
        ...initialSidebarFSMState,
        currentState: SidebarFSMStateType.NORMAL,
      };

    case SidebarAction.MARK_UNSAVED_CHANGES:
      return {
        ...state,
        currentState: nextState,
        hasUnsavedChanges: true,
      };

    case SidebarAction.END_DRAGGING:
      return {
        ...state,
        currentState: nextState,
        isDragging: false,
        hasUnsavedChanges: true,
      };

    default:
      return state;
  }
}

/**
 * Хелперы для проверки состояний (Core Interaction Phases)
 */
export const sidebarFSMHelpers = {
  // Базовые состояния
  isNormal: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.NORMAL,
  isEditMode: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.EDIT_MODE,

  // Фаза 1: Initiation (Discoverability & Activation)
  isDiscovering: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.DISCOVER,
  isLongPress: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.LONG_PRESS,
  canInitiateLongPress: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.NORMAL ||
    state.currentState === SidebarFSMStateType.DISCOVER,

  // Фаза 2: Dragging State (Affordance & Feedback)
  isLifting: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.LIFTING,
  isJiggling: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.JIGGLING,
  isDragging: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.DRAGGING,
  canDrag: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.JIGGLING ||
    state.currentState === SidebarFSMStateType.EDIT_MODE,

  // Фаза 3: Drop & Placement (Precision & Confirmation)
  isDropping: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.DROPPING,
  isSnapping: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.SNAPPING,

  // UI состояния
  shouldShowDiscoverHints: (state: SidebarFSMState) => state.showDiscoverHints,
  shouldShowResetButton: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.LONG_PRESS,
  shouldShowEditControls: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.EDIT_MODE,
  shouldShowJiggling: (state: SidebarFSMState) => state.isJiggling,
  shouldShowLiftEffect: (state: SidebarFSMState) => state.isLifting,
  shouldShowSnapAnimation: (state: SidebarFSMState) => state.isSnapping,

  // Блокировки взаимодействий
  shouldBlockClicks: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.LONG_PRESS ||
    state.currentState === SidebarFSMStateType.LIFTING ||
    state.currentState === SidebarFSMStateType.DRAGGING ||
    state.currentState === SidebarFSMStateType.DROPPING,
  shouldBlockNavigation: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.LONG_PRESS ||
    state.currentState === SidebarFSMStateType.EDIT_MODE ||
    state.currentState === SidebarFSMStateType.LIFTING ||
    state.currentState === SidebarFSMStateType.JIGGLING ||
    state.currentState === SidebarFSMStateType.DRAGGING ||
    state.currentState === SidebarFSMStateType.DROPPING ||
    state.currentState === SidebarFSMStateType.SNAPPING,

  // Состояние изменений
  hasUnsavedChanges: (state: SidebarFSMState) => state.hasUnsavedChanges,

  // Временные хелперы
  shouldPersistLongPress: (state: SidebarFSMState) =>
    state.currentState === SidebarFSMStateType.LONG_PRESS,
  getLiftDuration: (state: SidebarFSMState) =>
    state.liftStartTime ? Date.now() - state.liftStartTime : 0,
};

/**
 * Типы для действий FSM (Core Interaction Phases)
 */
export type SidebarFSMAction =
  // Фаза 1: Initiation (Discoverability & Activation)
  | { type: SidebarAction.SHOW_DISCOVER_HINTS }
  | { type: SidebarAction.HIDE_DISCOVER_HINTS }
  | { type: SidebarAction.LONG_PRESS_START; payload: { itemId: string } }
  | { type: SidebarAction.LONG_PRESS_END }
  | { type: SidebarAction.LONG_PRESS_CANCEL }
  | { type: SidebarAction.START_LIFTING; payload?: { itemId: string } }

  // Фаза 2: Dragging State (Affordance & Feedback)
  | { type: SidebarAction.START_JIGGLING; payload?: { itemIds: string[] } }
  | { type: SidebarAction.START_DRAGGING; payload?: { startIndex: number } }
  | { type: SidebarAction.DRAG_HOVER; payload?: { hoverIndex: number } }
  | { type: SidebarAction.DRAG_LEAVE }

  // Фаза 3: Drop & Placement (Precision & Confirmation)
  | { type: SidebarAction.START_DROPPING }
  | { type: SidebarAction.SNAP_TO_GRID; payload?: { targetIndex: number } }

  // Фаза 4: Completion & Exit
  | {
      type: SidebarAction.ENTER_EDIT_MODE;
      payload: { originalOrder: string[] };
    }
  | { type: SidebarAction.APPROVE_CHANGES }
  | { type: SidebarAction.DECLINE_CHANGES }
  | { type: SidebarAction.RESET_TO_NORMAL }
  | { type: SidebarAction.MARK_UNSAVED_CHANGES }
  | { type: SidebarAction.END_DRAGGING };
