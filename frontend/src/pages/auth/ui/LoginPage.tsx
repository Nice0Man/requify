import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Alert,
  Link,
  Checkbox,
  FormControlLabel,
  Typography,
  Fade,
  Container,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Login as LoginIcon, ArrowBack, Dashboard } from "@mui/icons-material";
import { useAuth } from "@/features/auth/model/auth.context";
import { AuthFormField, AuthButton } from "@/shared/ui";
import type { LoginFormData } from "@/features/auth/model/auth.types";

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    remember_me: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.username, formData.password, clearError]);

  // Validation
  const validateForm = (data: LoginFormData): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    if (!data.username.trim()) {
      validationErrors.username = "Email or username is required";
    } else if (data.username.length < 3) {
      validationErrors.username = "Username must be at least 3 characters";
    }

    if (!data.password) {
      validationErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    return validationErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const loginData: LoginFormData = {
        username: formData.username,
        password: formData.password,
        remember_me: formData.remember_me || false,
      };

      await login(loginData);

      // Show success message
      setIsLoginSuccess(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoginSuccess(false);
    }
  };

  const handleFieldChange =
    (field: keyof LoginFormData) => (value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
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
          {/* Logo Section */}
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
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
                mr: 2,
              }}
            >
              <Dashboard
                sx={{
                  fontSize: { xs: 24, md: 28 },
                  color: "white",
                }}
              />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: { xs: "1.5rem", md: "1.8rem" },
              }}
            >
              Requify
            </Typography>
          </Box>

          {/* Back Button */}
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              ml: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content - Centered Login Form */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          pt: { xs: 9, md: 10 },
          px: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(20px)",
              boxShadow: `0 20px 60px ${alpha(
                theme.palette.common.black,
                0.1
              )}`,
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your requirements management account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={clearError}
                >
                  {error.message ||
                    "Login failed. Please check your credentials."}
                </Alert>
              </Fade>
            )}

            {/* Success Alert */}
            {isLoginSuccess && (
              <Fade in>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Login successful! Redirecting to dashboard...
                </Alert>
              </Fade>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <AuthFormField
                name="username"
                label="Email or Username"
                type="text"
                value={formData.username}
                onChange={handleFieldChange("username")}
                error={errors.username}
                placeholder="Enter your email or username"
                autoComplete="username"
                autoFocus
                required
                validation={{
                  minLength: 3,
                }}
              />

              <AuthFormField
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleFieldChange("password")}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                validation={{
                  minLength: 6,
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.remember_me}
                      onChange={(e) =>
                        handleFieldChange("remember_me")(e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Link
                  component={RouterLink}
                  to="/auth/forgot-password"
                  variant="body2"
                  color="primary"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Box sx={{ mb: 3 }}>
                <AuthButton
                  type="submit"
                  variant="primary"
                  size="large"
                  loading={isLoading || isLoginSuccess}
                  icon={<LoginIcon />}
                  iconPosition="end"
                  disabled={isLoginSuccess}
                >
                  {isLoginSuccess ? "Redirecting..." : "Sign In"}
                </AuthButton>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    component={RouterLink}
                    to="/auth/register"
                    color="primary"
                    underline="hover"
                    sx={{ fontWeight: 600 }}
                  >
                    Create one now
                  </Link>
                </Typography>
              </Box>
            </Box>

            {/* Footer Links */}
            <Box
              sx={{
                textAlign: "center",
                mt: 4,
                pt: 3,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Need help?{" "}
                <Link href="/support" color="primary" underline="hover">
                  Contact Support
                </Link>
                {" · "}
                <Link href="/api-overview" color="primary" underline="hover">
                  API Documentation
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default LoginPage;
