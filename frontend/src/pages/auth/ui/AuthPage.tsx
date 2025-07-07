import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Box, Container, useTheme, alpha } from "@mui/material";
import { LoginForm, RegisterForm } from "@/features/auth/ui";

const AuthPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle direct navigation to auth routes
  useEffect(() => {
    const currentPath = location.pathname;

    // If user comes directly to /login, /register, etc., redirect to the auth version
    if (currentPath === "/login") {
      navigate("/auth/login", { replace: true });
    } else if (currentPath === "/register") {
      navigate("/auth/register", { replace: true });
    } else if (currentPath === "/forgot-password") {
      navigate("/auth/forgot-password", { replace: true });
    } else if (currentPath === "/reset-password") {
      navigate("/auth/reset-password", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Routes>
          {/* Redirect /auth to /auth/login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />

          {/* Login page */}
          <Route
            path="/login"
            element={
              <LoginForm
                onRegister={() => navigate("/auth/register")}
                onForgotPassword={() => navigate("/auth/forgot-password")}
              />
            }
          />

          {/* Register page */}
          <Route
            path="/register"
            element={<RegisterForm onLogin={() => navigate("/auth/login")} />}
          />

          {/* Forgot password page */}
          <Route
            path="/forgot-password"
            element={
              <Box>
                {/* TODO: Implement ForgotPasswordForm */}
                <LoginForm onRegister={() => navigate("/auth/register")} />
              </Box>
            }
          />

          {/* Reset password page */}
          <Route
            path="/reset-password"
            element={
              <Box>
                {/* TODO: Implement ResetPasswordForm */}
                <LoginForm onRegister={() => navigate("/auth/register")} />
              </Box>
            }
          />

          {/* Fallback to login */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default AuthPage;
