import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { 
  Dashboard, 
  ArrowBack, 
  Info, 
  ContactSupport, 
  Language,
  GitHub,
  Description,
} from "@mui/icons-material";

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
      navigate("/auth");
    }
  };

  const handleSignIn = () => {
    navigate("/auth");
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
      {/* Enhanced Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 1200,
          height: { xs: 72, md: 80 },
        }}
      >
        <Toolbar
          sx={{
            height: "100%",
            px: { xs: 2, md: 4 },
            minHeight: { xs: 72, md: 80 },
          }}
        >
          {/* Logo Section - Enhanced */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              flexGrow: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                mr: { xs: 2, md: 3 },
                boxShadow: theme.shadows[8],
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: theme.shadows[12],
                },
              }}
            >
              <Dashboard 
                sx={{ 
                  fontSize: { xs: "2rem", md: "2.2rem" },
                  color: "white",
                }} 
              />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Requify
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.75rem",
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Requirements Management
              </Typography>
            </Box>
          </Box>

          {/* Status Badge */}
          <Chip
            label="Beta"
            size="small"
            sx={{
              backgroundColor: theme.palette.success.main,
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 24,
              mr: 2,
              display: { xs: "none", sm: "flex" },
            }}
          />

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Documentation */}
            <Tooltip title="Documentation">
              <IconButton
                onClick={() => window.open("/docs", "_blank")}
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  display: { xs: "none", md: "flex" },
                }}
              >
                <Description />
              </IconButton>
            </Tooltip>

            {/* GitHub */}
            <Tooltip title="GitHub Repository">
              <IconButton
                onClick={() => window.open("https://github.com/requify", "_blank")}
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    color: theme.palette.text.primary,
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                  },
                  display: { xs: "none", md: "flex" },
                }}
              >
                <GitHub />
              </IconButton>
            </Tooltip>

            {/* Support */}
            <Tooltip title="Support & Help">
              <IconButton
                onClick={() => navigate("/support")}
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    color: theme.palette.info.main,
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                  },
                  display: { xs: "none", sm: "flex" },
                }}
              >
                <ContactSupport />
              </IconButton>
            </Tooltip>

            {/* Back Button (when in auth section) */}
            {showAuthSection && (
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => setShowAuthSection(false)}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  fontWeight: 600,
                  px: 2,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.grey[500], 0.1),
                  },
                }}
              >
                Back
              </Button>
            )}

            {/* Main Action Buttons */}
            {isAuthenticated ? (
              <Button
                variant="contained"
                onClick={() => navigate("/dashboard")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.2 },
                  borderRadius: 3,
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  "&:hover": {
                    boxShadow: theme.shadows[8],
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Dashboard
              </Button>
            ) : !showAuthSection ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="text"
                  onClick={() => navigate("/demo")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    px: 2,
                    borderRadius: 2,
                    display: { xs: "none", sm: "flex" },
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.grey[500], 0.1),
                    },
                  }}
                >
                  Demo
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSignIn}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    px: { xs: 2.5, md: 3.5 },
                    py: { xs: 1, md: 1.2 },
                    borderRadius: 3,
                    boxShadow: theme.shadows[4],
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    "&:hover": {
                      boxShadow: theme.shadows[8],
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Sign In
                </Button>
              </Box>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      {!showAuthSection ? (
        <Box sx={{ pt: { xs: 9, md: 10 } }}>
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
        <Box sx={{ pt: { xs: 9, md: 10 } }}>
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
