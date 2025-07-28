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
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { authApi } from "@/features/auth/api/authApi";

/**
 * Страница подтверждения email после регистрации
 * Следует принципам FSD архитектуры
 */
const EmailConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  
  // Получаем email из URL параметров или localStorage
  const emailFromParams = searchParams.get("email");
  const emailFromStorage = localStorage.getItem("pendingEmailConfirmation");
  const userEmail = emailFromParams || emailFromStorage || "your-email@example.com";
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Таймер для повторной отправки
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Очистка email из localStorage при размонтировании
  useEffect(() => {
    return () => {
      if (emailFromStorage) {
        localStorage.removeItem("pendingEmailConfirmation");
      }
    };
  }, [emailFromStorage]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;
    
    setIsResending(true);
    setResendError(null);
    
    try {
      await authApi.requestEmailVerification({ email: userEmail });
      
      setShowSuccess(true);
      setResendCooldown(60); // 60 секунд кулдаун
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to resend verification email. Please try again.";
      setResendError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToAuth = () => {
    navigate("/auth", { replace: true });
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard", { replace: true });
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
            {/* Back Button */}
            <Box sx={{ p: 2, pb: 0 }}>
              <Tooltip title="Back to login">
                <IconButton 
                  onClick={handleBackToAuth}
                  sx={{ 
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Success Alert */}
            {showSuccess && (
              <Fade in timeout={300}>
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 0,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.1
                    )}`,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.dark,
                  }}
                >
                  Verification email has been sent!
                </Alert>
              </Fade>
            )}

            {/* Error Alert */}
            {resendError && (
              <Fade in timeout={300}>
                <Alert
                  severity="error"
                  onClose={() => setResendError(null)}
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
                  {resendError}
                </Alert>
              </Fade>
            )}

            {/* Content */}
            <Box sx={{ p: 4, pt: 2 }}>
              {/* Icon */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <EmailIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                </Box>
                
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  Check your email
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    lineHeight: 1.5,
                  }}
                >
                  We've sent a verification link to
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    wordBreak: "break-word",
                  }}
                >
                  {userEmail}
                </Typography>
              </Box>

              {/* Instructions */}
              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <CheckIcon sx={{ color: "success.main", fontSize: 20, mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click the verification link in your email to activate your account
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <CheckIcon sx={{ color: "success.main", fontSize: 20, mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Check your spam folder if you don't see the email
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <CheckIcon sx={{ color: "success.main", fontSize: 20, mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    The link will expire in 24 hours for security
                  </Typography>
                </Box>
              </Stack>

              {/* Actions */}
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || isResending}
                  startIcon={
                    isResending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : resendCooldown > 0 ? (
                      <RefreshIcon sx={{ animation: "rotation 1s linear infinite" }} />
                    ) : (
                      <SendIcon />
                    )
                  }
                  sx={{
                    borderRadius: 5,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: `0 8px 25px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: alpha(theme.palette.primary.main, 0.3),
                      color: alpha("#ffffff", 0.7),
                    },
                  }}
                >
                  {isResending
                    ? "Sending..."
                    : resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s`
                    : "Resend verification email"
                  }
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleGoToDashboard}
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
                  Continue to Dashboard
                </Button>
              </Stack>

              {/* Footer */}
              <Box
                sx={{
                  textAlign: "center",
                  mt: 3,
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Didn't receive the email?{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                    onClick={handleResendEmail}
                  >
                    Click to resend
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default EmailConfirmationPage; 