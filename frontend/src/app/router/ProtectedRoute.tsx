import React, { Suspense } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "@/app/providers/AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

// Компонент загрузки для Suspense fallback
const ProtectedRouteFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress size={40} />
  </Box>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Показываем загрузку пока не завершена инициализация
  if (!isInitialized || isLoading) {
    return <ProtectedRouteFallback />;
  }

  // Если пользователь не аутентифицирован, перенаправляем на логин
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Проверяем роль пользователя, если требуется
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<ProtectedRouteFallback />}>
      {children}
    </Suspense>
  );
};
