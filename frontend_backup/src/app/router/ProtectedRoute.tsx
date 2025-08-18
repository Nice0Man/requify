import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/permissions";
import { NoPermissionPage } from "@/pages/no-permission";

// =============================================================================
// Типы для ProtectedRoute
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;

  // Проверка ролей (legacy, для обратной совместимости)
  requiredRole?: string;
  requiredRoles?: string[];

  // Новая система разрешений
  resource?: string;
  action?: string;
  anyPermissions?: Array<[string, string]>;
  allPermissions?: Array<[string, string]>;
  page?: string;

  // Дополнительные настройки
  fallbackComponent?: React.ComponentType;
  redirectTo?: string;
}

// =============================================================================
// Компонент ProtectedRoute
// =============================================================================

/**
 * Защищенный маршрут с поддержкой гранулярных разрешений
 *
 * @example
 * // Проверка по роли (legacy)
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * @example
 * // Проверка по разрешению
 * <ProtectedRoute resource="projects" action="manage">
 *   <ProjectManagement />
 * </ProtectedRoute>
 *
 * @example
 * // Проверка доступа к странице
 * <ProtectedRoute page="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  resource,
  action,
  anyPermissions,
  allPermissions,
  page,
  fallbackComponent: FallbackComponent = NoPermissionPage,
  redirectTo,
}) => {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const {
    isLoading: permissionsLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPage,
  } = usePermissions();
  const location = useLocation();

  // =============================================================================
  // Состояние загрузки
  // =============================================================================

  const isLoading = authLoading || permissionsLoading;

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Проверка аутентификации и разрешений...
        </Typography>
      </Box>
    );
  }

  // =============================================================================
  // Проверка аутентификации
  // =============================================================================

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // =============================================================================
  // Проверка разрешений
  // =============================================================================

  const checkPermissions = (): boolean => {
    // Проверка ролей (legacy поддержка)
    if (requiredRole || requiredRoles) {
      if (!user?.role) return false;

      if (requiredRole && user.role !== requiredRole) {
        return false;
      }

      if (requiredRoles && !requiredRoles.includes(user.role)) {
        return false;
      }
    }

    // Проверка доступа к странице
    if (page) {
      return canAccessPage(page);
    }

    // Проверка множественных разрешений (ИЛИ)
    if (anyPermissions && anyPermissions.length > 0) {
      return hasAnyPermission(anyPermissions);
    }

    // Проверка множественных разрешений (И)
    if (allPermissions && allPermissions.length > 0) {
      return hasAllPermissions(allPermissions);
    }

    // Проверка конкретного разрешения
    if (resource && action) {
      return hasPermission(resource, action);
    }

    // Если ничего не указано, разрешаем доступ
    return true;
  };

  const hasAccess = checkPermissions();

  // =============================================================================
  // Обработка отсутствия разрешений
  // =============================================================================

  if (!hasAccess) {
    // Перенаправление если указано
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Показ компонента fallback
    return <FallbackComponent />;
  }

  // =============================================================================
  // Рендеринг защищенного контента
  // =============================================================================

  return <>{children}</>;
};

// =============================================================================
// Специализированные защищенные маршруты
// =============================================================================

/**
 * Административный маршрут - требует роль admin
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;

/**
 * Маршрут для менеджеров проектов
 */
export const ProjectManagerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRoles={["admin", "project_manager"]}>
    {children}
  </ProtectedRoute>
);

/**
 * Маршрут с проверкой разрешения на управление проектами
 */
export const ProjectManagementRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <ProtectedRoute resource="projects" action="manage">
    {children}
  </ProtectedRoute>
);

/**
 * Маршрут с проверкой разрешения на управление пользователями
 */
export const UserManagementRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute resource="users" action="manage">
    {children}
  </ProtectedRoute>
);
