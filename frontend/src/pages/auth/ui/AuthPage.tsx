import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Divider,
  Link,
  Checkbox,
  FormControlLabel,
  Fade,
  Slide,
  Container,
  Paper,
  useTheme,
  alpha,
  LinearProgress,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Google,
  GitHub,
  Login,
  PersonAdd,
  ArrowForward,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Person,
  Email,
  Lock,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/model/useAuth";
import { Auth0StatusBanner } from "@/features/auth/ui/Auth0StatusBanner";
import type {
  LoginFormData,
  RegisterFormData,
} from "@/features/auth/model/types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Slide direction="left" in={value === index} timeout={300}>
          <Box sx={{ width: "100%" }}>{children}</Box>
        </Slide>
      )}
    </div>
  );
}

// Auth Form Field Component
interface AuthFormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  icon?: React.ReactNode;
}

const AuthFormField: React.FC<AuthFormFieldProps> = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  autoFocus = false,
  icon,
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";
  const fieldIcon =
    icon ||
    (type === "email" ? (
      <Email />
    ) : type === "password" ? (
      <Lock />
    ) : (
      <Person />
    ));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        name={name}
        label={label}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        error={!!error}
        helperText={error}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        InputProps={{
          startAdornment: fieldIcon && (
            <InputAdornment position="start">
              <Box
                sx={{
                  color: focused
                    ? theme.palette.primary.main
                    : "text.secondary",
                  transition: "color 0.3s ease",
                }}
              >
                {fieldIcon}
              </Box>
            </InputAdornment>
          ),
          endAdornment: isPassword && (
            <InputAdornment position="end">
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
                size="small"
                sx={{ color: "text.secondary" }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 5,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundColor: focused
              ? alpha(theme.palette.primary.main, 0.03)
              : alpha("#ffffff", 0.9),
            backdropFilter: "blur(10px)",
            minHeight: "56px",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            },
            "&.Mui-focused": {
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
            "&.Mui-error": {
              borderColor: theme.palette.error.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.error.main, 0.2)}`,
            },
          },
          "& .MuiInputLabel-root": {
            fontWeight: 500,
            "&.Mui-focused": {
              color: theme.palette.primary.main,
            },
          },
        }}
      />
    </Box>
  );
};

// Auth Button Component
interface AuthButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "social";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  socialProvider?: "google" | "github";
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = true,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "end",
  socialProvider,
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const getSocialColors = (provider?: string) => {
    switch (provider) {
      case "google":
        return {
          background: "#ffffff",
          color: "#1f1f1f",
          border: "#dadce0",
          hover: "#f8f9fa",
        };
      case "github":
        return {
          background: "#24292e",
          color: "#ffffff",
          border: "#24292e",
          hover: "#1a1e22",
        };
      default:
        return {
          background: "#ffffff",
          color: "#1f1f1f",
          border: "#dadce0",
          hover: "#f8f9fa",
        };
    }
  };

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 5,
      textTransform: "none" as const,
      fontWeight: 600,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      minHeight: size === "small" ? 40 : size === "large" ? 56 : 48,
      fontSize:
        size === "small" ? "0.875rem" : size === "large" ? "1.125rem" : "1rem",
      px: size === "small" ? 3 : size === "large" ? 5 : 4,
    };

    if (variant === "social" && socialProvider) {
      const colors = getSocialColors(socialProvider);
      return {
        ...baseStyles,
        background: colors.background,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        "&:hover": {
          background: colors.hover,
          transform: "translateY(-1px)",
          boxShadow: `0 4px 12px ${alpha(colors.color, 0.2)}`,
        },
      };
    }

    if (variant === "primary") {
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: theme.palette.primary.contrastText,
        border: "none",
        boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
        "&:hover": {
          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          boxShadow: `0 8px 25px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
          transform: "translateY(-3px) scale(1.02)",
        },
      };
    }

    return {
      ...baseStyles,
      background: `linear-gradient(135deg, ${alpha("#ffffff", 0.9)}, ${alpha(
        "#f8fafc",
        0.9
      )})`,
      color: theme.palette.primary.main,
      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      "&:hover": {
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.primary.main, 0.05)})`,
        borderColor: theme.palette.primary.main,
        transform: "translateY(-2px) scale(1.01)",
      },
    };
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      fullWidth={fullWidth}
      sx={getButtonStyles()}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            mr: 1,
            color: variant === "primary" ? "white" : theme.palette.primary.main,
          }}
        />
      )}
      {icon && iconPosition === "start" && !loading && (
        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>{icon}</Box>
      )}
      {children}
      {icon && iconPosition === "end" && !loading && (
        <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>{icon}</Box>
      )}
    </Button>
  );
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    login,
    register,
    isLoading,
    error,
    isAuthenticated,
    loginWithSocial,
  } = useAuth();

  // Tab management
  const [activeTab, setActiveTab] = useState(0);

  // Form states
  const [loginData, setLoginData] = useState<LoginFormData>({
    username: "",
    password: "",
    remember_me: false,
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    terms_accepted: false,
    privacy_accepted: false,
  });

  // Form validation errors
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>(
    {}
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validation Functions
  const validateLogin = (data: LoginFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.username.trim()) {
      errors.username = "Username or email is required";
    } else if (data.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };

  const validateRegister = (data: RegisterFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.username.trim()) {
      errors.username = "Username is required";
    } else if (data.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!data.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    if (!data.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!data.confirm_password) {
      errors.confirm_password = "Please confirm your password";
    } else if (data.password !== data.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (!data.terms_accepted) {
      errors.terms_accepted = "You must accept the terms of service";
    }

    if (!data.privacy_accepted) {
      errors.privacy_accepted = "You must accept the privacy policy";
    }

    return errors;
  };

  // Event Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setLoginErrors({});
    setRegisterErrors({});
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateLogin(loginData);
    setLoginErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      await login(loginData);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateRegister(registerData);
    setRegisterErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      await register(registerData);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await loginWithSocial(provider as "google" | "github");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(`Social login with ${provider} failed:`, error);
    }
  };

  // Render Methods
  const renderSocialButtons = () => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 2 }}
      >
        Continue with
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <AuthButton
          variant="social"
          socialProvider="google"
          icon={<Google />}
          onClick={() => handleSocialLogin("google")}
          size="medium"
        >
          Google
        </AuthButton>
        <AuthButton
          variant="social"
          socialProvider="github"
          icon={<GitHub />}
          onClick={() => handleSocialLogin("github")}
          size="medium"
        >
          GitHub
        </AuthButton>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
          or
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Box>
    </Box>
  );

  const renderFormHeader = () => (
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 1,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {activeTab === 0 ? "Welcome Back" : "Create Account"}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: { xs: "0.875rem", sm: "0.9rem" },
          lineHeight: 1.5,
        }}
      >
        {activeTab === 0
          ? "Sign in to your account to continue"
          : "Join us today and get started"}
      </Typography>
    </Box>
  );

  const renderLoginForm = () => (
    <Box component="form" onSubmit={handleLoginSubmit}>
      <AuthFormField
        name="username"
        label="Username or Email"
        type="text"
        value={loginData.username}
        onChange={(value) => {
          setLoginData((prev: LoginFormData) => ({ ...prev, username: value }));
          if (loginErrors.username) {
            setLoginErrors((prev: Record<string, string>) => ({
              ...prev,
              username: "",
            }));
          }
        }}
        error={loginErrors.username}
        placeholder="Enter your username or email"
        autoComplete="username"
        autoFocus
        required
      />

      <AuthFormField
        name="password"
        label="Password"
        type="password"
        value={loginData.password}
        onChange={(value) => {
          setLoginData((prev: LoginFormData) => ({ ...prev, password: value }));
          if (loginErrors.password) {
            setLoginErrors((prev: Record<string, string>) => ({
              ...prev,
              password: "",
            }));
          }
        }}
        error={loginErrors.password}
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
              checked={loginData.remember_me}
              onChange={(e) =>
                setLoginData((prev: LoginFormData) => ({
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

  const renderRegisterForm = () => (
    <Box component="form" onSubmit={handleRegisterSubmit}>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <AuthFormField
          name="first_name"
          label="First Name"
          type="text"
          value={registerData.first_name || ""}
          onChange={(value) => {
            setRegisterData((prev: RegisterFormData) => ({
              ...prev,
              first_name: value,
            }));
            if (registerErrors.first_name) {
              setRegisterErrors((prev: Record<string, string>) => ({
                ...prev,
                first_name: "",
              }));
            }
          }}
          error={registerErrors.first_name}
          placeholder="John"
          autoComplete="given-name"
          required
        />

        <AuthFormField
          name="last_name"
          label="Last Name"
          type="text"
          value={registerData.last_name || ""}
          onChange={(value) => {
            setRegisterData((prev: RegisterFormData) => ({
              ...prev,
              last_name: value,
            }));
            if (registerErrors.last_name) {
              setRegisterErrors((prev: Record<string, string>) => ({
                ...prev,
                last_name: "",
              }));
            }
          }}
          error={registerErrors.last_name}
          placeholder="Doe"
          autoComplete="family-name"
          required
        />
      </Box>

      <AuthFormField
        name="username"
        label="Username"
        type="text"
        value={registerData.username}
        onChange={(value) => {
          setRegisterData((prev: RegisterFormData) => ({
            ...prev,
            username: value,
          }));
          if (registerErrors.username) {
            setRegisterErrors((prev: Record<string, string>) => ({
              ...prev,
              username: "",
            }));
          }
        }}
        error={registerErrors.username}
        placeholder="Choose a username"
        autoComplete="username"
        required
      />

      <AuthFormField
        name="email"
        label="Email Address"
        type="email"
        value={registerData.email}
        onChange={(value) => {
          setRegisterData((prev: RegisterFormData) => ({
            ...prev,
            email: value,
          }));
          if (registerErrors.email) {
            setRegisterErrors((prev: Record<string, string>) => ({
              ...prev,
              email: "",
            }));
          }
        }}
        error={registerErrors.email}
        placeholder="Enter your email"
        autoComplete="email"
        required
      />

      <AuthFormField
        name="password"
        label="Password"
        type="password"
        value={registerData.password}
        onChange={(value) => {
          setRegisterData((prev: RegisterFormData) => ({
            ...prev,
            password: value,
          }));
          if (registerErrors.password) {
            setRegisterErrors((prev: Record<string, string>) => ({
              ...prev,
              password: "",
            }));
          }
        }}
        error={registerErrors.password}
        placeholder="Create a password"
        autoComplete="new-password"
        required
      />

      <AuthFormField
        name="confirm_password"
        label="Confirm Password"
        type="password"
        value={registerData.confirm_password}
        onChange={(value) => {
          setRegisterData((prev: RegisterFormData) => ({
            ...prev,
            confirm_password: value,
          }));
          if (registerErrors.confirm_password) {
            setRegisterErrors((prev: Record<string, string>) => ({
              ...prev,
              confirm_password: "",
            }));
          }
        }}
        error={registerErrors.confirm_password}
        placeholder="Confirm your password"
        autoComplete="new-password"
        required
      />

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={registerData.terms_accepted}
              onChange={(e) =>
                setRegisterData((prev: RegisterFormData) => ({
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
        {registerErrors.terms_accepted && (
          <Typography variant="caption" color="error" sx={{ ml: 4 }}>
            {registerErrors.terms_accepted}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={registerData.privacy_accepted}
              onChange={(e) =>
                setRegisterData((prev: RegisterFormData) => ({
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
        {registerErrors.privacy_accepted && (
          <Typography variant="caption" color="error" sx={{ ml: 4 }}>
            {registerErrors.privacy_accepted}
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

  const renderHeader = () => (
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

  if (isAuthenticated) {
    return null;
  }

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
        {renderHeader()}

        {/* Auth0 Status Banner */}
        <Fade in timeout={600} style={{ transitionDelay: "200ms" }}>
          <Box sx={{ mb: 3, maxWidth: 500, mx: "auto" }}>
            <Auth0StatusBanner />
          </Box>
        </Fade>

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
            {/* Error Alert */}
            {error && (
              <Fade in timeout={300}>
                <Alert
                  severity="error"
                  onClose={() => {}}
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
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Tabs */}
            <Box
              sx={{
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: `linear-gradient(135deg, ${alpha(
                  "#ffffff",
                  0.9
                )}, ${alpha("#f8fafc", 0.9)})`,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    "&.Mui-selected": {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  },
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              >
                <Tab
                  label="Sign In"
                  icon={<Login />}
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab
                  label="Create Account"
                  icon={<PersonAdd />}
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
              </Tabs>
            </Box>

            {/* Loading Progress */}
            {isLoading && (
              <LinearProgress
                sx={{
                  height: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "& .MuiLinearProgress-bar": {
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              />
            )}

            {/* Form Content */}
            <Box sx={{ p: 4 }}>
              {/* Form Header */}
              {renderFormHeader()}

              {/* Social Buttons */}
              {renderSocialButtons()}

              {/* Tab Panels */}
              <TabPanel value={activeTab} index={0}>
                {renderLoginForm()}
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {renderRegisterForm()}
              </TabPanel>

              {/* Footer Links */}
              <Box
                sx={{
                  textAlign: "center",
                  mt: 3,
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 0
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {activeTab === 0 ? "Create Account" : "Sign In"}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default AuthPage;
