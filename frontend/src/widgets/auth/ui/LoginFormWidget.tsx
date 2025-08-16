import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  Collapse,
} from "@mui/material";
import { Login } from "@mui/icons-material";
import { AuthFormField, AuthButton } from "@/shared/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { LoginFormData } from "@/features/auth/model/types";

export interface LoginFormWidgetProps {
  onSuccess?: () => void;
}

export const LoginFormWidget: React.FC<LoginFormWidgetProps> = ({
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    remember_me: false,
  });

  // Form validation errors and API errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Validation function
  const validateForm = (data: LoginFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!data.username.trim()) {
      newErrors.username = "Username or email is required";
    } else if (data.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  // Event handlers
  const handleFieldChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setApiError(null);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await login(formData);
      if (onSuccess) {
        onSuccess();
      }
      // Removed fallback redirect to dashboard
    } catch (error: any) {
      console.log("Login error:", error);
      const status = error?.response?.status;
      const responseData = error?.response?.data;

      console.log("Error status:", status);
      console.log("Response data:", responseData);

      // Handle API errors and show them to user
      // Check for ValidationError in both possible structures
      const isValidationError =
        responseData?.error?.type === "ValidationError" ||
        responseData?.type === "ValidationError";

      if (isValidationError) {
        // Handle both structures: {error: {...}} and direct {type: "ValidationError", ...}
        const errorData = responseData.error || responseData;
        const details = errorData.details;

        if (
          details?.validation_errors &&
          Array.isArray(details.validation_errors)
        ) {
          // Handle field-specific validation errors
          const fieldErrors: Record<string, string> = {};

          details.validation_errors.forEach((err: any) => {
            if (err.field && err.message) {
              // Remove 'body.' prefix from field name
              let fieldName = err.field.replace(/^body\./, "");

              // Clean up the error message - remove "Value error, " prefix if present
              let cleanMessage = err.message.replace(/^Value error,\s*/, "");

              fieldErrors[fieldName] = cleanMessage;
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
        }

        // Set general API error message
        const generalMessage =
          errorData.message === "Request validation failed"
            ? "Please fix the errors below"
            : errorData.message;
        setApiError(generalMessage);
      } else if (status === 400) {
        // Handle 400 Bad Request - could be HTTPException or other errors
        const errorData = responseData?.error || responseData;

        if (errorData?.type === "HTTPException") {
          // Handle specific HTTPException messages (like email verification)
          const message = errorData.message || "Bad request";
          setApiError(message);
        } else {
          // Generic 400 error handling
          const message =
            errorData?.message || responseData?.message || "Bad request";
          setApiError(message);
        }
      } else if (status === 401) {
        console.log("401 error detected - setting API error");
        setApiError("Неверный логин или пароль");
      } else if (status === 403) {
        setApiError("Account is disabled");
      } else if (status === 422) {
        // Handle 422 Unprocessable Entity with validation errors
        // Handle both structures: {error: {...}} and direct structure
        const errorData = responseData?.error || responseData;
        const details = errorData?.details;

        if (
          details?.validation_errors &&
          Array.isArray(details.validation_errors)
        ) {
          const fieldErrors: Record<string, string> = {};
          details.validation_errors.forEach((err: any) => {
            if (err.field && err.message) {
              let fieldName = err.field.replace(/^body\./, "");
              let cleanMessage = err.message.replace(/^Value error,\s*/, "");
              fieldErrors[fieldName] = cleanMessage;
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }

          const errorMessages = details.validation_errors
            .map(
              (err: any) =>
                err.message?.replace(/^Value error,\s*/, "") ||
                "Validation error"
            )
            .join(", ");
          setApiError(`Please fix the following: ${errorMessages}`);
        } else {
          const fallbackMessage =
            errorData?.message ||
            responseData?.message ||
            error?.message ||
            "Validation failed";
          setApiError(fallbackMessage);
        }
      } else if (status === 429) {
        setApiError("Too many login attempts. Please try again later");
      } else if (error?.message?.includes("CORS")) {
        setApiError("Connection error. Please check server settings");
      } else {
        // Generic error handling with correct data access
        const errorData = responseData?.error || responseData;
        const message =
          errorData?.message ||
          error?.message ||
          "Login failed. Please try again";
        setApiError(message);
      }

      console.log("Final API error state:", apiError);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* API Error Alert */}
      <Collapse in={!!apiError}>
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setApiError(null)}
        >
          {apiError}
        </Alert>
      </Collapse>

      <AuthFormField
        name="username"
        label="Username or Email"
        type="text"
        value={formData.username}
        onChange={handleFieldChange("username")}
        error={errors.username}
        placeholder="Enter your username or email"
        autoComplete="username"
        autoFocus
        required
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
                setFormData((prev) => ({
                  ...prev,
                  remember_me: e.target.checked,
                }))
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
        icon={<Login />}
        iconPosition="end"
        fullWidth={true}
      >
        Sign In
      </AuthButton>
    </Box>
  );
};
