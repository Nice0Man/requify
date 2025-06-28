import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  Grid,
  TextField,
} from "@mui/material";
import {
  CheckCircle,
  Error as ErrorIcon,
  Email,
  Refresh,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { authApi } from "../api/auth.api";
import {
  EmailVerificationConfirm,
  EmailVerificationRequest,
} from "../types/auth.types";

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);

  const token = searchParams.get("token");

  // Verify email on component mount
  useEffect(() => {
    console.log("EmailVerificationPage loaded with token:", token);
    
    if (!token) {
      console.log("No token found in URL");
      setVerificationStatus("error");
      setError(
        "Invalid or missing verification token. Please check your email or request a new verification link."
      );
      return;
    }

    console.log("Starting email verification...");
    handleVerifyEmail(token);
  }, [token]);

  const handleVerifyEmail = async (token: string) => {
    if (!token) return;

    console.log("handleVerifyEmail called with token:", token.substring(0, 20) + "...");
    setIsLoading(true);
    setError(null);

    try {
      const verifyRequest: EmailVerificationConfirm = { token };
      console.log("Making API call to verify email...");
      const response = await authApi.verifyEmail(verifyRequest);
      console.log("API response:", response);

      if (response.data && response.data.verified) {
        console.log("Email verification successful!");
        setVerificationStatus("success");
        setSuccess(true);
        toast.success(response.data.message || "Email verified successfully!");

        // Redirect to login after successful verification
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: response.data.message,
            },
          });
        }, 3000);
      } else {
        console.log("Email verification failed - response:", response);
        throw new Error(response.data?.message || "Verification failed");
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      setVerificationStatus("error");
      setError(error.message || "Email verification failed");
      toast.error("Email verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);

    try {
      const resendRequest: EmailVerificationRequest = {
        email: userEmail.trim(),
      };
      const response = await authApi.resendVerification(resendRequest);

      if (response.data) {
        toast.success(
          response.data.message || "Verification email sent! Check your inbox."
        );
        setEmailSent(true);
      } else {
        throw new Error("Failed to send verification email");
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            {verificationStatus === "pending" && (
              <>
                <Email sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography component="h1" variant="h4" gutterBottom>
                  Verifying Email
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please wait while we verify your email address...
                </Typography>
              </>
            )}

            {verificationStatus === "success" && (
              <>
                <CheckCircle
                  sx={{ fontSize: 48, color: "success.main", mb: 2 }}
                />
                <Typography
                  component="h1"
                  variant="h4"
                  gutterBottom
                  color="success.main"
                >
                  Email Verified!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your email has been successfully verified. You will be
                  redirected to the login page shortly.
                </Typography>
              </>
            )}

            {verificationStatus === "error" && (
              <>
                <ErrorIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
                <Typography
                  component="h1"
                  variant="h4"
                  gutterBottom
                  color="error.main"
                >
                  Verification Failed
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We couldn't verify your email address. Please try again or
                  request a new verification link.
                </Typography>
              </>
            )}
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success State */}
          {success && (
            <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
              Email verified successfully! Redirecting to login...
            </Alert>
          )}

          {/* Resend Verification Section - Show only on error */}
          {verificationStatus === "error" && (
            <Box sx={{ width: "100%", mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Need a new verification link?
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Email sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleResendVerification}
                  disabled={isResending || !userEmail.trim()}
                  startIcon={
                    isResending ? <CircularProgress size={20} /> : <Refresh />
                  }
                  sx={{ minWidth: 120, height: 40 }}
                >
                  {isResending ? "Sending..." : "Resend"}
                </Button>
              </Box>
            </Box>
          )}

          {/* Navigation Links */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/login"
              >
                Go to Login
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="text"
                component={RouterLink}
                to="/start"
              >
                Back to Home
              </Button>
            </Grid>
          </Grid>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Having trouble?{" "}
              <Link
                component={RouterLink}
                to="/auth/forgot-password"
                underline="hover"
              >
                Contact support
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationPage;
