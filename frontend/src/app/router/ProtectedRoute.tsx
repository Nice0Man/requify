import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NoPermissionPage } from "@/pages/no-permission";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
}) => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Показываем загрузку пока Auth0 инициализируется
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
          Проверка аутентификации...
        </Typography>
      </Box>
    );
  }

  // Если не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Проверяем роль, если требуется
  const hasRequiredRole = () => {
    if (!user?.role) return false;
    
    // Проверка одной роли
    if (requiredRole) {
      return user.role === requiredRole;
    }
    
    // Проверка массива ролей
    if (requiredRoles && requiredRoles.length > 0) {
      return requiredRoles.includes(user.role);
    }
    
    return true;
  };

  if ((requiredRole || requiredRoles) && !hasRequiredRole()) {
    return <NoPermissionPage />;
  }

  return <>{children}</>;
};
