import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Dashboard, ArrowBack } from "@mui/icons-material";

import { useAuth } from "@/features/auth/model/auth.context";
import { FullPageScroll } from "@/shared/ui";
import {
  HeroSection,
  SystemFeatures,
  BusinessMetrics,
  QuickAuth,
  LandingFooter,
} from "@/widgets/landing";

const StartPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading, user } = useAuth();

  const [showAuthSection, setShowAuthSection] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Handle section change
  const handleSectionChange = (index: number) => {
    console.log(`Active section: ${index}`);
  };

  // Обработчики для Hero Section
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setShowAuthSection(true);
    }
  };

  const handleSignIn = () => {
    setShowAuthSection(true);
  };

  // Обработчики для аутентификации
  const handleLogin = async (credentials: {
    username: string;
    password: string;
    remember_me: boolean;
  }) => {
    try {
      setAuthError(null);
      await login(credentials);
      setAuthSuccess("Successfully signed in! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setAuthError("Invalid credentials. Please try again.");
    }
  };

  const handleRegister = async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      setAuthError(null);
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
        confirm_password: data.password,
        first_name: "",
        last_name: "",
        terms_accepted: true,
        privacy_accepted: true,
      });
      setAuthSuccess("Account created successfully! Please sign in.");
    } catch (error) {
      setAuthError("Registration failed. Please try again.");
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      setAuthError(null);
      // В реальном приложении здесь был бы запрос на восстановление пароля
      setAuthSuccess("Reset link sent to your email!");
    } catch (error) {
      setAuthError("Failed to send reset link. Please try again.");
    }
  };

  // Обработчик клика по функции
  const handleFeatureClick = (featureId: string) => {
    if (isAuthenticated) {
      // Навигация к соответствующему разделу
      switch (featureId) {
        case "requirements":
          navigate("/requirements");
          break;
        case "analytics":
          navigate("/dashboard");
          break;
        case "collaboration":
          navigate("/projects");
          break;
        case "traceability":
          navigate("/releases");
          break;
        case "automation":
          navigate("/testing");
          break;
        case "compliance":
          navigate("/admin");
          break;
        default:
          navigate("/dashboard");
      }
    } else {
      setShowAuthSection(true);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 1200,
        }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Dashboard sx={{ mr: 2, color: theme.palette.primary.main }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              Requify
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {showAuthSection && (
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => setShowAuthSection(false)}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                }}
              >
                Back
              </Button>
            )}

            {isAuthenticated ? (
              <Button
                variant="contained"
                onClick={() => navigate("/dashboard")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Dashboard
              </Button>
            ) : !showAuthSection ? (
              <Button
                variant="outlined"
                onClick={handleSignIn}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Sign In
              </Button>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      {!showAuthSection ? (
        <Box sx={{ pt: 8 }}>
          <FullPageScroll
            onSectionChange={handleSectionChange}
            showNavigation={true}
            showProgress={true}
            threshold={50}
            animationDuration={0.8}
          >
            {/* Hero Section */}
            <HeroSection
              onGetStarted={handleGetStarted}
              isAuthenticated={isAuthenticated}
            />

            {/* System Features */}
            <SystemFeatures onFeatureClick={handleFeatureClick} />

            {/* Business Metrics */}
            <BusinessMetrics animated />

            {/* Landing Footer */}
            <LandingFooter />
          </FullPageScroll>
        </Box>
      ) : (
        /* Authentication Section */
        <Box sx={{ pt: 8 }}>
          <QuickAuth
            onLogin={handleLogin}
            onRegister={handleRegister}
            onForgotPassword={handleForgotPassword}
            isLoading={isLoading}
            error={authError}
            success={authSuccess}
          />
        </Box>
      )}
    </Box>
  );
};

export default StartPage;
