import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  useTheme,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Email,
  Lock,
  Google,
  GitHub,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

interface QuickAuthProps {
  onSignUp?: (email: string, password: string) => void;
  onSignIn?: (email: string, password: string) => void;
  onSocialAuth?: (provider: string) => void;
  isLoading?: boolean;
}

export const QuickAuth: React.FC<QuickAuthProps> = ({
  onSignUp,
  onSignIn,
  onSocialAuth,
  isLoading = false,
}) => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp?.(email, password);
    } else {
      onSignIn?.(email, password);
    }
  };

  const handleSocialAuth = (provider: string) => {
    onSocialAuth?.(provider);
  };

  return (
    <Box
      ref={sectionRef}
              className="auth-compact"
      sx={{
        height: "100vh",
        minHeight: "100vh",
        maxHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 2, md: 4 },
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        scrollSnapAlign: "start",
        opacity: 0,
        transform: "translateY(50px)",
        transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
        "&.animate-in": {
          opacity: 1,
          transform: "translateY(0)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          backgroundImage: `radial-gradient(circle at 30% 40%, ${theme.palette.primary.main} 0%, transparent 50%), 
                           radial-gradient(circle at 70% 70%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, height: "100%" }}>
        <Stack spacing={4} sx={{ height: "100%", justifyContent: "center", py: 3 }} className="auth-form">
          {/* Header */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              width: '100%',
              maxWidth: '600px',
              mx: 'auto',
              px: 2,
              opacity: 0,
              transform: "translateY(30px)",
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              ".animate-in &": {
                opacity: 1,
                transform: "translateY(0)",
              },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.5rem", md: "3rem" },
                fontWeight: 700,
                color: theme.palette.text.primary,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                mb: 1.5,
                textAlign: 'center'
              }}
            >
              {isSignUp ? "Get started today" : "Welcome back"}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                fontWeight: 400,
                lineHeight: 1.4,
                textAlign: 'center',
                maxWidth: '500px',
                mx: 'auto',
              }}
            >
              {isSignUp
                ? "Create your account and start building better software"
                : "Sign in to continue to your dashboard"}
            </Typography>
          </Box>

          {/* Auth Card */}
          <Card
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              boxShadow: theme.shadows[4],
              backgroundColor: theme.palette.background.paper,
              maxWidth: '600px',
              mx: 'auto',
              width: '100%',
              opacity: 0,
              transform: "translateY(40px)",
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
              ".animate-in &": {
                opacity: 1,
                transform: "translateY(0)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Stack spacing={3}>
                {/* Social Auth Buttons */}
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    startIcon={<Google />}
                    onClick={() => handleSocialAuth("google")}
                    disabled={isLoading}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    Continue with Google
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    startIcon={<GitHub />}
                    onClick={() => handleSocialAuth("github")}
                    disabled={isLoading}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    Continue with GitHub
                  </Button>
                </Stack>

                {/* Divider */}
                <Box sx={{ position: "relative" }}>
                  <Divider />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: theme.palette.background.paper,
                      px: 2,
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    or
                  </Typography>
                </Box>

                {/* Email/Password Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      size="medium"
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1.5, color: "text.secondary" }} />,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          fontSize: "1.1rem",
                          py: 1.5,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-focused": {
                            transform: "translateY(-2px)",
                            boxShadow: theme.shadows[2],
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "1rem",
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      size="medium"
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1.5, color: "text.secondary" }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="medium"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          fontSize: "1.1rem",
                          py: 1.5,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-focused": {
                            transform: "translateY(-2px)",
                            boxShadow: theme.shadows[2],
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "1rem",
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading || !email || !password}
                      sx={{
                        py: 2.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "1.2rem",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[8],
                        },
                        "&:disabled": {
                          transform: "none",
                        },
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : isSignUp ? (
                        "Create Account"
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </Stack>
                </Box>

                {/* Toggle Mode */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <Button
                      variant="text"
                      onClick={() => setIsSignUp(!isSignUp)}
                      disabled={isLoading}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "1rem",
                        p: 0,
                        minWidth: "auto",
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </Button>
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};
