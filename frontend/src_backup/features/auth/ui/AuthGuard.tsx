import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Typography,
} from "@mui/material";
import { useAuth } from "../model/auth.context";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  fallback,
  redirectTo = "/auth/login",
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await useAuth();
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [isInitialized]);

  const handleGoToLogin = () => {
    navigate(redirectTo);
  };

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading || !isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Пользователь не аутентифицирован
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={3}
        p={3}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You need to sign in to access this page.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToLogin}
          size="large"
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // Проверяем роли если они требуются
  if (requiredRole && requiredRole.length > 0) {
    const hasRequiredRole = requiredRole.includes(user.role);

    if (!hasRequiredRole) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          flexDirection="column"
          gap={3}
          p={3}
        >
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have permission to access this page. Required role:{" "}
              {requiredRole.join(", ")}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            size="large"
          >
            Go to Dashboard
          </Button>
        </Box>
      );
    }
  }

  // Пользователь аутентифицирован и имеет необходимые права
  return <>{children}</>;
};

// Convenience wrapper for requiring authentication
export const RequireAuth: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}> = ({ children, fallback, redirectTo }) => {
  return (
    <AuthGuard
      requiredRole={["admin", "developer", "viewer", "manager", "qa"]}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthGuard>
  );
};

// Convenience wrapper for requiring permissions
export const RequirePermissions: React.FC<{
  children: React.ReactNode;
  permissions: string[];
  fallback?: React.ReactNode;
}> = ({ children, permissions, fallback }) => {
  return (
    <AuthGuard requiredRole={permissions} fallback={fallback}>
      {children}
    </AuthGuard>
  );
};
