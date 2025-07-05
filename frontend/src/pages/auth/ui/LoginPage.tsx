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
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { useAuth } from "@/features/auth/model/auth.context";
import { AuthFormLayout, AuthFormField, AuthButton } from "@/shared/ui";
import type { LoginFormData } from "@/features/auth/model/auth.types";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    remember_me: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        username: formData.username, // username contains email in the form
        password: formData.password,
        remember_me: formData.remember_me || false,
      };

      await login(loginData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
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
    <AuthFormLayout
      title="Welcome Back"
      subtitle="Sign in to your requirements management account"
      maxWidth="sm"
    >
      {/* Error Alert */}
      {error && (
        <Fade in>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={clearError}
          >
            {error.message || "Login failed. Please check your credentials."}
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

        <AuthButton
          type="submit"
          variant="primary"
          size="large"
          loading={isLoading}
          icon={<LoginIcon />}
          iconPosition="end"
        >
          Sign In
        </AuthButton>

        <Box sx={{ textAlign: "center", mt: 3 }}>
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
    </AuthFormLayout>
  );
};

export default LoginPage;
