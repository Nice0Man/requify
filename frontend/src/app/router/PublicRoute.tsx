import React, { Suspense } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "@/app/providers/AuthProvider";

interface PublicRouteProps {
  children: React.ReactNode;
}

// Компонент загрузки для Suspense fallback
const RouteFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress size={40} />
  </Box>
);

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Показываем загрузку пока не завершена инициализация
  if (!isInitialized || isLoading) {
    return <RouteFallback />;
  }

  // Если пользователь аутентифицирован, перенаправляем на dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    
    return (
      <Navigate 
        to={from} 
        replace 
        state={{ from: location }} 
      />
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      {children}
    </Suspense>
  );
};
