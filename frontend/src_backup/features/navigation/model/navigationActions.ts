import { NavigateFunction } from "react-router-dom";
import { AppDispatch } from "@/app/store";
import {
  startNavigation,
  goBack as goBackAction,
} from "@/app/store/slices/routerSlice";
import { ROUTES } from "@/app/config/routes";

// Тип для навигации
export interface NavigationOptions {
  replace?: boolean;
  state?: any;
}

// Создаем функцию для навигации через Redux
export const createNavigationActions = (
  navigate: NavigateFunction,
  dispatch: AppDispatch
) => {
  // Основная функция навигации
  const navigateToRoute = (
    route: string,
    params?: Record<string, string>,
    queryParams?: Record<string, string>,
    options?: NavigationOptions
  ) => {
    dispatch(startNavigation());

    // Формируем URL с параметрами
    let url = route;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value);
      });
    }

    // Добавляем query параметры
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams);
      url += `?${searchParams.toString()}`;
    }

    // Выполняем навигацию
    navigate(url, {
      replace: options?.replace || false,
      state: options?.state,
    });
  };

  // Специфичные функции навигации для различных страниц
  const navigateToHome = () => navigateToRoute(ROUTES.ROOT);
  const navigateToStart = () => navigateToRoute(ROUTES.START);
  const navigateToDashboard = () => navigateToRoute(ROUTES.DASHBOARD);
  const navigateToLogin = (redirectTo?: string) => {
    const queryParams = redirectTo ? { redirectTo } : undefined;
    navigateToRoute(ROUTES.LOGIN, undefined, queryParams);
  };
  const navigateToRegister = (inviteCode?: string) => {
    const queryParams = inviteCode ? { inviteCode } : undefined;
    navigateToRoute(ROUTES.AUTH.REGISTER, undefined, queryParams);
  };
  const navigateToApiOverview = () => navigateToRoute(ROUTES.API_OVERVIEW);

  // Навигация для проектов
  const navigateToProjects = () => navigateToRoute(ROUTES.PROJECTS.LIST);
  const navigateToProject = (projectId: string) =>
    navigateToRoute(ROUTES.PROJECTS.DETAILS(projectId));
  const navigateToProjectCreate = () => navigateToRoute(ROUTES.PROJECTS.CREATE);
  const navigateToProjectEdit = (projectId: string) =>
    navigateToRoute(ROUTES.PROJECTS.EDIT(projectId));
  const navigateToProjectRequirements = (projectId: string) =>
    navigateToRoute(ROUTES.PROJECTS.REQUIREMENTS(projectId));
  const navigateToProjectReleases = (projectId: string) =>
    navigateToRoute(ROUTES.PROJECTS.RELEASES(projectId));
  const navigateToProjectSettings = (projectId: string) =>
    navigateToRoute(ROUTES.PROJECTS.SETTINGS(projectId));

  // Навигация для требований
  const navigateToRequirements = () =>
    navigateToRoute(ROUTES.REQUIREMENTS.LIST);
  const navigateToRequirement = (requirementId: string) =>
    navigateToRoute(ROUTES.REQUIREMENTS.DETAILS(requirementId));
  const navigateToRequirementCreate = () =>
    navigateToRoute(ROUTES.REQUIREMENTS.CREATE);
  const navigateToRequirementEdit = (requirementId: string) =>
    navigateToRoute(ROUTES.REQUIREMENTS.EDIT(requirementId));

  // Навигация для релизов
  const navigateToReleases = () => navigateToRoute(ROUTES.RELEASES.LIST);
  const navigateToRelease = (releaseId: string) =>
    navigateToRoute(ROUTES.RELEASES.DETAILS(releaseId));
  const navigateToReleaseCreate = () => navigateToRoute(ROUTES.RELEASES.CREATE);
  const navigateToReleaseEdit = (releaseId: string) =>
    navigateToRoute(ROUTES.RELEASES.EDIT(releaseId));

  // Навигация для тестирования
  const navigateToTesting = () => navigateToRoute(ROUTES.TESTING.LIST);
  const navigateToTestPlanCreate = () =>
    navigateToRoute(ROUTES.TESTING.PLANS_CREATE);
  const navigateToTestCaseCreate = () =>
    navigateToRoute(ROUTES.TESTING.CASES_CREATE);
  const navigateToTestReports = () => navigateToRoute(ROUTES.TESTING.REPORTS);
  const navigateToTestExecute = () => navigateToRoute(ROUTES.TESTING.EXECUTE);

  // Навигация для админки
  const navigateToAdmin = () => navigateToRoute(ROUTES.ADMIN);

  // Навигация для настроек
  const navigateToSettings = () => navigateToRoute(ROUTES.SETTINGS);

  // Навигация для отчетов
  const navigateToReports = () => navigateToRoute(ROUTES.REPORTS);

  // Навигация для других страниц
  const navigateToKanban = () => navigateToRoute(ROUTES.KANBAN);
  const navigateToActivity = () => navigateToRoute(ROUTES.ACTIVITY);
  const navigateToNotifications = () => navigateToRoute(ROUTES.NOTIFICATIONS);
  const navigateToTeam = () => navigateToRoute(ROUTES.TEAM);
  const navigateToHistory = () => navigateToRoute(ROUTES.HISTORY);
  const navigateToProfile = () => navigateToRoute(ROUTES.PROFILE);

  // Функция для возврата назад
  const goBack = () => {
    dispatch(goBackAction());
    navigate(-1);
  };

  // Функция для замены текущего роута
  const replaceRoute = (
    route: string,
    params?: Record<string, string>,
    queryParams?: Record<string, string>
  ) => {
    navigateToRoute(route, params, queryParams, { replace: true });
  };

  // Функция для навигации с состоянием
  const navigateWithState = (
    route: string,
    state: any,
    params?: Record<string, string>,
    queryParams?: Record<string, string>
  ) => {
    navigateToRoute(route, params, queryParams, { state });
  };

  return {
    // Основные функции
    navigateToRoute,
    goBack,
    replaceRoute,
    navigateWithState,

    // Публичные страницы
    navigateToHome,
    navigateToStart,
    navigateToApiOverview,

    // Аутентификация
    navigateToLogin,
    navigateToRegister,

    // Основные разделы
    navigateToDashboard,
    navigateToProjects,
    navigateToRequirements,
    navigateToReleases,
    navigateToTesting,
    navigateToKanban,

    // Проекты
    navigateToProject,
    navigateToProjectCreate,
    navigateToProjectEdit,
    navigateToProjectRequirements,
    navigateToProjectReleases,
    navigateToProjectSettings,

    // Требования
    navigateToRequirement,
    navigateToRequirementCreate,
    navigateToRequirementEdit,

    // Релизы
    navigateToRelease,
    navigateToReleaseCreate,
    navigateToReleaseEdit,

    // Тестирование
    navigateToTestPlanCreate,
    navigateToTestCaseCreate,
    navigateToTestReports,
    navigateToTestExecute,

    // Административные функции
    navigateToAdmin,
    navigateToSettings,
    navigateToReports,

    // Дополнительные страницы
    navigateToActivity,
    navigateToNotifications,
    navigateToTeam,
    navigateToHistory,
    navigateToProfile,
  };
};

// Hook для использования навигации
export const useNavigation = () => {
  // Этот hook будет создан позже для использования в компонентах
  return null;
};
