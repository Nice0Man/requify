import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/api/auth.api";
import { PasswordResetConfirm } from "@/shared/types";

// Validation schema
const resetConfirmSchema = yup.object({
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Please confirm your new password"),
});

interface PasswordResetFormData {
  new_password: string;
  confirm_password: string;
}

const PasswordResetConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordResetFormData>({
    resolver: yupResolver(resetConfirmSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = watch("new_password");

  // Check if token is valid on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError(
        "Invalid or missing reset token. Please request a new password reset."
      );
      return;
    }

    // Token validation logic could be added here
    setTokenValid(true);
  }, [token]);

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 50) return "error";
    if (strength < 75) return "warning";
    return "success";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 25) return "Very Weak";
    if (strength < 50) return "Weak";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const onSubmit = async (data: PasswordResetFormData) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const resetData: PasswordResetConfirm = {
        token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      };

      await authApi.confirmPasswordReset(resetData);

      setSuccess(true);
      toast.success(
        "Password reset successful! You can now sign in with your new password."
      );

      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password reset successful! Please sign in with your new password.",
          },
        });
      }, 3000);
    } catch (error: any) {
      let errorMessage = "Failed to reset password. Please try again or request a new reset link.";
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // Handle validation errors (array of error objects)
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg) return err.msg;
            if (err.message) return err.message;
            return 'Validation error';
          }).join(', ');
        } 
        // Handle single validation error object
        else if (typeof detail === 'object' && detail.msg) {
          errorMessage = detail.msg;
        }
        // Handle string detail
        else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Invalid token state
  if (tokenValid === false) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: { xs: 4, md: 8 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: { xs: 3, md: 4 },
              width: "100%",
              borderRadius: 2,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              textAlign: "center",
            }}
          >
            <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography
              variant="h4"
              color="text.primary"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Invalid Reset Link
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This password reset link is invalid or has expired.
            </Typography>

            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2, textAlign: "left" }}
            >
              <Typography variant="body2">
                Reset links expire after 24 hours for security reasons. Please
                request a new password reset.
              </Typography>
            </Alert>

            <Button
              component={RouterLink}
              to="/auth/forgot-password"
              variant="contained"
              size="large"
              sx={{ mb: 2, px: 4 }}
            >
              Request New Reset Link
            </Button>

            <Box sx={{ mt: 2 }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Back to Sign In
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: { xs: 4, md: 8 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: { xs: 3, md: 4 },
              width: "100%",
              borderRadius: 2,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              textAlign: "center",
            }}
          >
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography
              variant="h4"
              color="text.primary"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Password Reset Complete
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your password has been successfully reset. You can now sign in
              with your new password.
            </Typography>

            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Redirecting to sign in page...
            </Alert>

            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              sx={{ px: 4 }}
            >
              Go to Sign In
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Main reset form
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: { xs: 4, md: 8 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 3, md: 4 },
            width: "100%",
            borderRadius: 2,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Lock sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Create New Password
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Choose a strong password for your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={3}>
              {/* New Password */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="New Password"
                  placeholder="Enter your new password"
                  type={showNewPassword ? "text" : "password"}
                  id="new_password"
                  autoComplete="new-password"
                  autoFocus
                  error={!!errors.new_password}
                  helperText={errors.new_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register("new_password")}
                />

                {/* Password Strength Indicator */}
                {newPassword && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        Strength:
                      </Typography>
                      <Typography
                        variant="body2"
                        color={`${getStrengthColor(passwordStrength)}.main`}
                        sx={{ fontWeight: 500 }}
                      >
                        {getStrengthText(passwordStrength)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: 4,
                        backgroundColor: "grey.300",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${passwordStrength}%`,
                          height: "100%",
                          backgroundColor: `${getStrengthColor(
                            passwordStrength
                          )}.main`,
                          transition:
                            "width 0.3s ease, background-color 0.3s ease",
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  autoComplete="new-password"
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register("confirm_password")}
                />
              </Grid>
            </Grid>

            {/* Password Requirements */}
            <Box
              sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 2 }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Password Requirements:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="ul"
                sx={{ m: 0, pl: 2 }}
              >
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character (@$!%*?&)</li>
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                },
                "&:disabled": {
                  background: "#ccc",
                },
              }}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckCircle />
                )
              }
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>

            {/* Back to Login */}
            <Box sx={{ textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Back to Sign In
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Requify - Requirements Management System
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Version 1.0.0 | © 2025 Requify
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PasswordResetConfirmPage;
