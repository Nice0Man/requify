import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Alert,
  Fade,
  Typography,
  useTheme,
  alpha,
  Slide,
  Link,
} from "@mui/material";
import { SocialLoginButtons, AuthTabs, AuthFormHeader } from "@/entities/auth";
import { LoginFormWidget } from "./LoginFormWidget";
import { RegisterFormWidget } from "./RegisterFormWidget";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Slide direction="left" in={value === index} timeout={300}>
          <Box sx={{ width: "100%" }}>{children}</Box>
        </Slide>
      )}
    </div>
  );
}

export const AuthContainerWidget: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, isLoading, error, loginWithSocial } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  // Tab management
  const [activeTab, setActiveTab] = useState(mode === "register" ? 1 : 0);

  // Redirect if already authenticated - REMOVED
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/dashboard", { replace: true });
  //   }
  // }, [isAuthenticated, navigate]);

  // Event Handlers
  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await loginWithSocial(provider);
      // Navigate to dashboard removed
      console.log(`Social login with ${provider} successful`);
    } catch (error) {
      console.error(`Social login with ${provider} failed:`, error);
    }
  };

  const handleFormSuccess = () => {
    // Dashboard redirect removed
    console.log(`Form success for tab: ${activeTab === 0 ? 'login' : 'register'}`);
    // No automatic redirect to dashboard
  };

  // Brand Header
  const renderBrandHeader = () => (
    <Fade in timeout={800} style={{ transitionDelay: "200ms" }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        {/* Brand Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: { xs: "1.5rem", sm: "1.8rem" },
              fontWeight: 700,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            R
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2rem", sm: "2.5rem" },
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            Requify
          </Typography>
        </Box>
      </Box>
    </Fade>
  );

  // Removed early return for authenticated users
  // if (isAuthenticated) {
  //   return null;
  // }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, 
          #ffffff 0%, 
          #f8fafc 20%, 
          #e3f2fd 40%, 
          #bbdefb 60%, 
          #90caf9 80%, 
          #64b5f6 100%
        )`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(
              "#2196f3",
              0.15
            )} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(
              "#1976d2",
              0.1
            )} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha(
              "#ffffff",
              0.8
            )} 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, ${alpha(
              "#e3f2fd",
              0.6
            )} 0%, transparent 50%)
          `,
          zIndex: 0,
        },
        py: 2,
        px: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {renderBrandHeader()}
        <Fade in timeout={600} style={{ transitionDelay: "400ms" }}>
          <Paper
            elevation={20}
            sx={{
              borderRadius: 6,
              overflow: "hidden",
              background: alpha("#ffffff", 0.95),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha("#ffffff", 0.2)}`,
              boxShadow: `
                0 25px 50px -12px ${alpha("#000000", 0.25)},
                0 0 0 1px ${alpha("#ffffff", 0.05)} inset
              `,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            {/* Global Auth Error Alert */}
            {error && (
              <Fade in timeout={300}>
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 0,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.1
                    )}`,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.dark,
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Tabs */}
            <AuthTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isLoading={isLoading}
            />

            {/* Form Content */}
            <Box sx={{ p: 4 }}>
              {/* Form Header */}
              <AuthFormHeader isLogin={activeTab === 0} />

              {/* Social Buttons */}
              <SocialLoginButtons
                onSocialLogin={handleSocialLogin}
                isLoading={isLoading}
              />

              {/* Tab Panels */}
              <TabPanel value={activeTab} index={0}>
                <LoginFormWidget onSuccess={handleFormSuccess} />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <RegisterFormWidget onSuccess={handleFormSuccess} />
              </TabPanel>

              {/* Footer Links */}
              <Box
                sx={{
                  textAlign: "center",
                  mt: 3,
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 0
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {activeTab === 0 ? "Create Account" : "Sign In"}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};
