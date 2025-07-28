import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Fade,
  useTheme,
  alpha,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { authApi } from "@/features/auth/api/authApi";

type VerificationState =
  | "verifying"
  | "success"
  | "error"
  | "expired"
  | "invalid";

/**
 * Страница подтверждения email по токену из URL
 * Следует принципам FSD архитектуры
 */
const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [verificationState, setVerificationState] =
    useState<VerificationState>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Автоматическое подтверждение при загрузке
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState("invalid");
        setErrorMessage("Verification token is missing from the URL.");
        return;
      }

      try {
        setVerificationState("verifying");

        await authApi.confirmEmailVerification({ token });

        setVerificationState("success");

        // Очищаем pending email из localStorage если есть
        localStorage.removeItem("pendingEmailConfirmation");
      } catch (error: any) {
        console.error("Email verification failed:", error);

        const status = error?.response?.status;
        const errorData = error?.response?.data;

        if (status === 400) {
          setVerificationState("invalid");
          setErrorMessage(
            "Invalid verification token. Please check the link in your email."
          );
        } else if (status === 410 || errorData?.message?.includes("expired")) {
          setVerificationState("expired");
          setErrorMessage(
            "This verification link has expired. Please request a new one."
          );
        } else {
          setVerificationState("error");
          setErrorMessage(
            errorData?.message ||
              error?.message ||
              "Failed to verify email. Please try again."
          );
        }
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoToLogin = () => {
    navigate("/auth", { replace: true });
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleRequestNewLink = () => {
    navigate("/email-confirmation", { replace: true });
  };

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

  const renderVerificationContent = () => {
    switch (verificationState) {
      case "verifying":
        return (
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <CircularProgress
                size={40}
                sx={{ color: theme.palette.primary.main }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Verifying your email...
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                lineHeight: 1.5,
              }}
            >
              Please wait while we confirm your email address.
            </Typography>
          </Box>
        );

      case "success":
        return (
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.success.main,
                  0.1
                )}, ${alpha(theme.palette.success.light, 0.1)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <CheckIcon
                sx={{
                  fontSize: 40,
                  color: theme.palette.success.main,
                }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Email verified successfully!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                lineHeight: 1.5,
                mb: 4,
              }}
            >
              Your email address has been confirmed. You can now access all
              features of your account.
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="contained"
                onClick={handleGoToDashboard}
                startIcon={<DashboardIcon />}
                sx={{
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 14px 0 ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    boxShadow: `0 8px 25px 0 ${alpha(
                      theme.palette.primary.main,
                      0.4
                    )}`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Go to Dashboard
              </Button>

              <Button
                variant="outlined"
                onClick={handleGoToLogin}
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                Continue to Login
              </Button>
            </Stack>
          </Box>
        );

      case "expired":
        return (
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.warning.main,
                  0.1
                )}, ${alpha(theme.palette.warning.light, 0.1)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <EmailIcon
                sx={{
                  fontSize: 40,
                  color: theme.palette.warning.main,
                }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Verification link expired
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                lineHeight: 1.5,
                mb: 4,
              }}
            >
              This verification link has expired for security reasons. Please
              request a new verification email.
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="contained"
                onClick={handleRequestNewLink}
                startIcon={<EmailIcon />}
                sx={{
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 14px 0 ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    boxShadow: `0 8px 25px 0 ${alpha(
                      theme.palette.primary.main,
                      0.4
                    )}`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Request new verification link
              </Button>

              <Button
                variant="outlined"
                onClick={handleGoToLogin}
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                Back to Login
              </Button>
            </Stack>
          </Box>
        );

      case "invalid":
      case "error":
      default:
        return (
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.error.main,
                  0.1
                )}, ${alpha(theme.palette.error.light, 0.1)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <ErrorIcon
                sx={{
                  fontSize: 40,
                  color: theme.palette.error.main,
                }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Verification failed
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                lineHeight: 1.5,
                mb: 2,
              }}
            >
              {errorMessage ||
                "Unable to verify your email address. The link may be invalid or expired."}
            </Typography>

            <Alert
              severity="error"
              sx={{
                mb: 4,
                textAlign: "left",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">
                <strong>What you can do:</strong>
                <br />
                • Check if the link is complete and not broken
                <br />
                • Request a new verification email
                <br />• Contact support if the problem persists
              </Typography>
            </Alert>

            <Stack spacing={2}>
              <Button
                variant="contained"
                onClick={handleRequestNewLink}
                startIcon={<EmailIcon />}
                sx={{
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 14px 0 ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    boxShadow: `0 8px 25px 0 ${alpha(
                      theme.palette.primary.main,
                      0.4
                    )}`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Request new verification link
              </Button>

              <Button
                variant="outlined"
                onClick={handleGoToLogin}
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                Back to Login
              </Button>
            </Stack>
          </Box>
        );
    }
  };

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
            {/* Content */}
            <Box sx={{ p: 4 }}>{renderVerificationContent()}</Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default EmailVerificationPage;
