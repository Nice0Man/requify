import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ROUTES } from "@/app/config/routes";

// Типы для роутера
export interface RouterState {
  currentRoute: string;
  previousRoute: string | null;
  isNavigating: boolean;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  navigationHistory: string[];
}

// Начальное состояние
const initialState: RouterState = {
  currentRoute: ROUTES.ROOT,
  previousRoute: null,
  isNavigating: false,
  params: {},
  queryParams: {},
  navigationHistory: [ROUTES.ROOT],
};

// Типы для actions
export interface NavigatePayload {
  route: string;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
  replace?: boolean;
}

export const routerSlice = createSlice({
  name: "router",
  initialState,
  reducers: {
    // Начать навигацию
    startNavigation: (state) => {
      state.isNavigating = true;
    },

    // Завершить навигацию
    completeNavigation: (state, action: PayloadAction<NavigatePayload>) => {
      const {
        route,
        params = {},
        queryParams = {},
        replace = false,
      } = action.payload;

      state.previousRoute = state.currentRoute;
      state.currentRoute = route;
      state.params = params;
      state.queryParams = queryParams;
      state.isNavigating = false;

      // Управление историей навигации
      if (replace) {
        state.navigationHistory[state.navigationHistory.length - 1] = route;
      } else {
        state.navigationHistory.push(route);
        // Ограничиваем историю до 50 записей
        if (state.navigationHistory.length > 50) {
          state.navigationHistory = state.navigationHistory.slice(-50);
        }
      }
    },

    // Навигация назад
    goBack: (state) => {
      if (state.navigationHistory.length > 1) {
        state.navigationHistory.pop();
        const previousRoute =
          state.navigationHistory[state.navigationHistory.length - 1];
        state.previousRoute = state.currentRoute;
        state.currentRoute = previousRoute;
        state.params = {};
        state.queryParams = {};
      }
    },

    // Сброс навигации
    resetNavigation: (state) => {
      state.currentRoute = ROUTES.ROOT;
      state.previousRoute = null;
      state.isNavigating = false;
      state.params = {};
      state.queryParams = {};
      state.navigationHistory = [ROUTES.ROOT];
    },

    // Обновить параметры роута
    updateRouteParams: (
      state,
      action: PayloadAction<{
        params?: Record<string, string>;
        queryParams?: Record<string, string>;
      }>
    ) => {
      const { params, queryParams } = action.payload;
      if (params) {
        state.params = { ...state.params, ...params };
      }
      if (queryParams) {
        state.queryParams = { ...state.queryParams, ...queryParams };
      }
    },

    // Очистить параметры роута
    clearRouteParams: (state) => {
      state.params = {};
      state.queryParams = {};
    },
  },
});

export const {
  startNavigation,
  completeNavigation,
  goBack,
  resetNavigation,
  updateRouteParams,
  clearRouteParams,
} = routerSlice.actions;

// Selectors
export const selectCurrentRoute = (state: { router: RouterState }) =>
  state.router.currentRoute;
export const selectPreviousRoute = (state: { router: RouterState }) =>
  state.router.previousRoute;
export const selectIsNavigating = (state: { router: RouterState }) =>
  state.router.isNavigating;
export const selectRouteParams = (state: { router: RouterState }) =>
  state.router.params;
export const selectQueryParams = (state: { router: RouterState }) =>
  state.router.queryParams;
export const selectNavigationHistory = (state: { router: RouterState }) =>
  state.router.navigationHistory;

export default routerSlice.reducer;
