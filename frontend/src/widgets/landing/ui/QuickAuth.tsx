import React, { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  Fade,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google,
  GitHub,
  Person,
  Email,
  Lock,
  AccountCircle,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@/features/auth/model/auth.context";
import type { LoginFormData, RegisterFormData } from "@/features/auth/model/auth.types";

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const QuickAuth: React.FC = () => {
  const theme = useTheme();
  const { login, register, isLoading, error, clearError } = useAuth();

  // Tab management
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Form validation
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  // =============================================================================
  // Validation Functions
  // =============================================================================

  const validateLogin = useCallback((data: LoginFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.username.trim()) {
      errors.username = "Username is required";
    } else if (data.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  }, []);

  const validateRegister = useCallback((data: RegisterFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.username.trim()) {
      errors.username = "Username is required";
    } else if (data.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = "Username can only contain letters, numbers and underscores";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!data.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (!data.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
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
  }, []);

  // =============================================================================
  // Event Handlers
  // =============================================================================

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    clearError();
    setLoginErrors({});
    setRegisterErrors({});
  }, [clearError]);

  const handleLoginChange = useCallback((field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setLoginData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (loginErrors[field]) {
      setLoginErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [loginErrors]);

  const handleRegisterChange = useCallback((field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setRegisterData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (registerErrors[field]) {
      setRegisterErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [registerErrors]);

  const handleLogin = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    const errors = validateLogin(loginData);
    setLoginErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await login(loginData);
    } catch (error) {
      // Error is handled by the auth context
    }
  }, [loginData, validateLogin, login]);

  const handleRegister = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    const errors = validateRegister(registerData);
    setRegisterErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await register(registerData);
    } catch (error) {
      // Error is handled by the auth context
    }
  }, [registerData, validateRegister, register]);

  const handleSocialLogin = useCallback((provider: string) => {
    // TODO: Implement social login
    console.log(`Social login with ${provider}`);
  }, []);

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}22 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 3,
          overflow: "hidden",
          background: theme.palette.background.paper,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Requify
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Requirements Management System
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={clearError}
              sx={{ m: 2, mb: 0 }}
            >
              {error.message}
            </Alert>
          </Fade>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tab
            label="Sign In"
            icon={<Person />}
            iconPosition="start"
            sx={{ textTransform: "none" }}
          />
          <Tab
            label="Sign Up"
            icon={<AccountCircle />}
            iconPosition="start"
            sx={{ textTransform: "none" }}
          />
        </Tabs>

        {/* Login Form */}
        <TabPanel value={activeTab} index={0}>
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              fullWidth
              label="Username"
              name="username"
              autoComplete="username"
              value={loginData.username}
              onChange={handleLoginChange("username")}
              error={!!loginErrors.username}
              helperText={loginErrors.username}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={loginData.password}
              onChange={handleLoginChange("password")}
              error={!!loginErrors.password}
              helperText={loginErrors.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={loginData.remember_me}
                  onChange={handleLoginChange("remember_me")}
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ mt: 1 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>
          </Box>
        </TabPanel>

        {/* Register Form */}
        <TabPanel value={activeTab} index={1}>
          <Box component="form" onSubmit={handleRegister} noValidate>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={registerData.first_name}
                onChange={handleRegisterChange("first_name")}
                error={!!registerErrors.first_name}
                helperText={registerErrors.first_name}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={registerData.last_name}
                onChange={handleRegisterChange("last_name")}
                error={!!registerErrors.last_name}
                helperText={registerErrors.last_name}
                margin="normal"
              />
            </Box>

            <TextField
              fullWidth
              label="Username"
              name="username"
              autoComplete="username"
              value={registerData.username}
              onChange={handleRegisterChange("username")}
              error={!!registerErrors.username}
              helperText={registerErrors.username}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={registerData.email}
              onChange={handleRegisterChange("email")}
              error={!!registerErrors.email}
              helperText={registerErrors.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={registerData.password}
              onChange={handleRegisterChange("password")}
              error={!!registerErrors.password}
              helperText={registerErrors.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={registerData.confirm_password}
              onChange={handleRegisterChange("confirm_password")}
              error={!!registerErrors.confirm_password}
              helperText={registerErrors.confirm_password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={registerData.terms_accepted}
                  onChange={handleRegisterChange("terms_accepted")}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{" "}
                  <Link href="#" color="primary">
                    Terms of Service
                  </Link>
                </Typography>
              }
              sx={{ mt: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={registerData.privacy_accepted}
                  onChange={handleRegisterChange("privacy_accepted")}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{" "}
                  <Link href="#" color="primary">
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mt: 1 }}
            />

            {registerErrors.terms_accepted && (
              <Typography color="error" variant="caption" display="block">
                {registerErrors.terms_accepted}
              </Typography>
            )}

            {registerErrors.privacy_accepted && (
              <Typography color="error" variant="caption" display="block">
                {registerErrors.privacy_accepted}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>
        </TabPanel>

        {/* Social Login */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or continue with
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={() => handleSocialLogin("google")}
              sx={{
                py: 1.5,
                borderColor: theme.palette.divider,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.primary.main + "08",
                },
              }}
            >
              Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHub />}
              onClick={() => handleSocialLogin("github")}
              sx={{
                py: 1.5,
                borderColor: theme.palette.divider,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.primary.main + "08",
                },
              }}
            >
              GitHub
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuickAuth;
