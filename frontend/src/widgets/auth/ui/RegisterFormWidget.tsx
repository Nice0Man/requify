import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  FormControlLabel,
  Checkbox,
  Link,
  Typography,
  Alert,
  Collapse,
  Snackbar,
  IconButton,
} from "@mui/material";
import { PersonAdd, Close, Email } from "@mui/icons-material";
import { AuthFormField, AuthButton } from "@/shared/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { RegisterFormData } from "@/features/auth/model/types";

export interface RegisterFormWidgetProps {
  onSuccess?: () => void;
}

export const RegisterFormWidget: React.FC<RegisterFormWidgetProps> = ({
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState<RegisterFormData>({
    role: "viewer",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    terms_accepted: false,
    privacy_accepted: false,
  });

  // Form validation errors and API errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Email confirmation notification state
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  // Validation function
  const validateForm = (data: RegisterFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!data.username.trim()) {
      newErrors.username = "Username is required";
    } else if (data.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!data.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!data.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!data.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (data.password !== data.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (!data.terms_accepted) {
      newErrors.terms_accepted = "You must accept the terms of service";
    }

    if (!data.privacy_accepted) {
      newErrors.privacy_accepted = "You must accept the privacy policy";
    }

    return newErrors;
  };

  // Event handlers
  const handleFieldChange =
    (field: keyof RegisterFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          console.log(`Cleared error for field: ${field}`);
          return newErrors;
        });
      }

      // Clear API error when user starts typing
      if (apiError) {
        setApiError(null);
      }
    };

  // Handle notification click - redirect to email check
  const handleNotificationClick = () => {
    setShowEmailNotification(false);
    navigate(`/email-confirmation?email=${encodeURIComponent(pendingEmail)}`, {
      replace: true,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setApiError(null); // Clear previous API errors

    if (Object.keys(validationErrors).length > 0) {
      console.log("Client validation errors:", validationErrors);
      return;
    }

    console.log("Submitting registration data:", formData);

    try {
      await register(formData);

      // Сохраняем email для страницы подтверждения
      localStorage.setItem("pendingEmailConfirmation", formData.email);
      setPendingEmail(formData.email);

      // Показываем уведомление о проверке email только после успешного ответа
      setShowEmailNotification(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      console.log(
        "Full error object:",
        JSON.stringify(error?.response?.data, null, 2)
      );
      console.log("Error status:", error?.response?.status);
      console.log("Error response:", error?.response);
      console.log("Error message:", error?.message);

      // Handle API errors and show them to user
      // Check for ValidationError in both possible structures
      const isValidationError =
        error?.response?.data?.error?.type === "ValidationError" ||
        error?.response?.data?.type === "ValidationError";

      if (isValidationError) {
        const responseData = error.response.data;
        console.log("Full response data structure:", responseData);

        // Handle both structures: {error: {...}} and direct {type: "ValidationError", ...}
        const errorData = responseData.error || responseData;
        const details = errorData.details;

        console.log("ValidationError data:", errorData);
        console.log("ValidationError details:", details);

        if (
          details?.validation_errors &&
          Array.isArray(details.validation_errors)
        ) {
          // Handle field-specific validation errors
          const fieldErrors: Record<string, string> = {};

          details.validation_errors.forEach((err: any, index: number) => {
            console.log(`Processing validation error ${index}:`, err);
            if (err.field && err.message) {
              // Remove 'body.' prefix from field name
              let fieldName = err.field.replace(/^body\./, "");

              // Clean up the error message - remove "Value error, " prefix if present
              let cleanMessage = err.message.replace(/^Value error,\s*/, "");

              fieldErrors[fieldName] = cleanMessage;

              console.log(
                `Field error mapped: ${fieldName} -> ${cleanMessage}`
              );
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            console.log("Setting field errors:", fieldErrors);
          }
        }

        // Set general API error message
        const generalMessage =
          errorData.message === "Request validation failed"
            ? "Please fix the errors below"
            : errorData.message;
        setApiError(generalMessage);
      } else if (error?.response?.status === 400) {
        // Handle 400 Bad Request with HTTPException structure
        const responseData = error?.response?.data;
        console.log("400 Error response data:", responseData);

        // Handle both structures: {error: {...}} and direct structure
        const errorData = responseData?.error || responseData;

        console.log("400 Error data:", errorData);

        if (errorData?.type === "HTTPException" && errorData?.message) {
          setApiError(errorData.message);
          console.log("Set 400 HTTPException error:", errorData.message);
        } else {
          setApiError("Invalid registration data");
        }
      } else if (error?.response?.status === 401) {
        setApiError("Invalid credentials. Please try again");
      } else if (error?.response?.status === 409) {
        setApiError("Username or email already exists");
      } else if (error?.response?.status === 400) {
        setApiError("Invalid registration data");
      } else if (error?.response?.status === 403) {
        setApiError("Forbidden. Please contact support");
      } else if (error?.response?.status === 422) {
        // Handle 422 Unprocessable Entity with validation errors
        const responseData = error?.response?.data;
        console.log("422 Error response data:", responseData);

        // Handle both structures: {error: {...}} and direct structure
        const errorData = responseData?.error || responseData;
        const details = errorData?.details;

        console.log("422 Error data:", errorData);
        console.log("Has details?", !!details);
        console.log("Has validation_errors?", !!details?.validation_errors);
        console.log("Validation errors array:", details?.validation_errors);

        if (
          details?.validation_errors &&
          Array.isArray(details.validation_errors)
        ) {
          const fieldErrors: Record<string, string> = {};
          details.validation_errors.forEach((err: any, index: number) => {
            console.log(`Processing 422 error ${index}:`, err);
            if (err.field && err.message) {
              let fieldName = err.field.replace(/^body\./, "");
              let cleanMessage = err.message.replace(/^Value error,\s*/, "");
              fieldErrors[fieldName] = cleanMessage;
              console.log(`422 Mapped: ${fieldName} -> ${cleanMessage}`);
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            console.log("Set 422 field errors:", fieldErrors);
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
          // Fallback for 422 without proper validation structure
          const fallbackMessage =
            errorData?.message ||
            responseData?.message ||
            error?.message ||
            "Validation failed";
          console.log("422 fallback message:", fallbackMessage);
          setApiError(fallbackMessage);
        }
      } else if (error?.response?.status === 429) {
        setApiError("Too many registration attempts. Please try again later");
      } else if (error?.message?.includes("CORS")) {
        setApiError("Connection error. Please check server settings");
      } else {
        setApiError(
          error?.response?.data?.message ||
            error?.message ||
            "Registration failed. Please try again"
        );
      }
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

      {/* Email Confirmation Notification */}
      <Snackbar
        open={showEmailNotification}
        onClose={() => setShowEmailNotification(false)}
        autoHideDuration={null}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ 
          mt: 8,
          '& .MuiAlert-root': {
            cursor: 'pointer',
            minWidth: 400,
            '&:hover': {
              backgroundColor: 'success.dark',
            },
          }
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClick={handleNotificationClick}
          icon={<Email />}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmailNotification(false);
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Typography 
            variant="body2" 
            sx={{ fontWeight: 600 }}
          >
            Регистрация успешна! Проверьте вашу почту.
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: "block", 
              mt: 0.5 
            }}
          >
            Нажмите здесь, чтобы перейти к подтверждению email
          </Typography>
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <AuthFormField
          name="first_name"
          label="First Name"
          type="text"
          value={formData.first_name || ""}
          onChange={handleFieldChange("first_name")}
          error={errors.first_name}
          placeholder="John"
          autoComplete="given-name"
          required
        />

        <AuthFormField
          name="last_name"
          label="Last Name"
          type="text"
          value={formData.last_name || ""}
          onChange={handleFieldChange("last_name")}
          error={errors.last_name}
          placeholder="Doe"
          autoComplete="family-name"
          required
        />
      </Box>

      <AuthFormField
        name="username"
        label="Username"
        type="text"
        value={formData.username}
        onChange={handleFieldChange("username")}
        error={errors.username}
        placeholder="Choose a username"
        autoComplete="username"
        required
      />

      <AuthFormField
        name="email"
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleFieldChange("email")}
        error={errors.email}
        placeholder="Enter your email"
        autoComplete="email"
        required
      />

      <AuthFormField
        name="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleFieldChange("password")}
        error={errors.password}
        placeholder="Create a password"
        autoComplete="new-password"
        required
      />

      <AuthFormField
        name="confirm_password"
        label="Confirm Password"
        type="password"
        value={formData.confirm_password}
        onChange={handleFieldChange("confirm_password")}
        error={errors.confirm_password}
        placeholder="Confirm your password"
        autoComplete="new-password"
        required
      />

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.terms_accepted}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  terms_accepted: e.target.checked,
                }))
              }
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{" "}
              <Link href="/terms" target="_blank" color="primary">
                Terms of Service
              </Link>
            </Typography>
          }
        />
        {errors.terms_accepted && (
          <Typography variant="caption" color="error" sx={{ ml: 4 }}>
            {errors.terms_accepted}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.privacy_accepted}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  privacy_accepted: e.target.checked,
                }))
              }
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{" "}
              <Link href="/privacy" target="_blank" color="primary">
                Privacy Policy
              </Link>
            </Typography>
          }
        />
        {errors.privacy_accepted && (
          <Typography variant="caption" color="error" sx={{ ml: 4 }}>
            {errors.privacy_accepted}
          </Typography>
        )}
      </Box>

      <AuthButton
        type="submit"
        variant="primary"
        size="large"
        loading={isLoading}
        icon={<PersonAdd />}
        iconPosition="end"
        fullWidth={true}
      >
        Create Account
      </AuthButton>
    </Box>
  );
};
