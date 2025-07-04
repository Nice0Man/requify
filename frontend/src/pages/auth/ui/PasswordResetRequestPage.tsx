import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  InputAdornment,
  Divider,
} from "@mui/material";
import { Email, Lock, ArrowBack, Send } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/api/auth.api";
import { PasswordResetRequest } from '@/shared/lib/types/api';

// Validation schema
const resetRequestSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email address is required"),
});

const PasswordResetRequestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PasswordResetRequest>({
    resolver: yupResolver(resetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      await authApi.requestPasswordReset(data);

      setSubmittedEmail(data.email);
      setSuccess(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      let errorMessage = "Failed to send reset email. Please try again.";
      
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

  const handleResendEmail = async () => {
    const email = getValues("email") || submittedEmail;
    if (email) {
      await onSubmit({ email });
    }
  };

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
            {/* Success Icon and Message */}
            <Box sx={{ mb: 3 }}>
              <Send sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
              <Typography
                variant="h4"
                color="text.primary"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Check Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We've sent password reset instructions to:
              </Typography>
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 500, mb: 3 }}
              >
                {submittedEmail}
              </Typography>
            </Box>

            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: 2, textAlign: "left" }}
            >
              <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                <strong>What's next?</strong>
              </Typography>
              <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the reset link in the email</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </Typography>
            </Alert>

            {/* Resend Button */}
            <Button
              variant="outlined"
              onClick={handleResendEmail}
              disabled={isLoading}
              sx={{ mb: 3, px: 3 }}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
            >
              {isLoading ? "Sending..." : "Resend Email"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?
              </Typography>
            </Divider>

            {/* Back to Login */}
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
          </Paper>
        </Box>
      </Container>
    );
  }

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
                Reset Password
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ fontWeight: 500 }}
            >
              Forgot Your Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your email address and we'll send you instructions to reset
              your password
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
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              placeholder="Enter your email address"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={
                errors.email?.message ||
                "We'll send reset instructions to this email"
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              {...register("email")}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 3,
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
                  <Send />
                )
              }
            >
              {isLoading
                ? "Sending Instructions..."
                : "Send Reset Instructions"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?
              </Typography>
            </Divider>

            {/* Navigation Links */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} />
                Back to Sign In
              </Link>
              <Link
                component={RouterLink}
                to="/auth/register"
                variant="body2"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Create Account
              </Link>
            </Box>
          </Box>

          {/* Help Section */}
          <Box
            sx={{ mt: 4, p: 2, backgroundColor: "grey.50", borderRadius: 2 }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Need Help?
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="ul"
              sx={{ m: 0, pl: 2 }}
            >
              <li>Make sure to check your spam/junk folder</li>
              <li>The reset link will expire in 24 hours</li>
              <li>
                If you don't receive the email, try again or contact support
              </li>
            </Typography>
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

export default PasswordResetRequestPage;
