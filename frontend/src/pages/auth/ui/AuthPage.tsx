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
} from "@mui/material";
import {
  Google,
  GitHub,
  Login,
  PersonAdd,
  ArrowForward,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/model/auth.context";
import { AuthFormLayout, AuthFormField, AuthButton } from "@/shared/ui";
import type {
  LoginFormData,
  RegisterFormData,
} from "@/features/auth/model/auth.types";

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
          <Box>{children}</Box>
        </Slide>
      )}
    </div>
  );
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    login,
    register,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    clearError,
    grant_type,
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
    if (isInitialized && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return null;
  }

  // Don't render auth page if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  // =============================================================================
  // Validation Functions
  // =============================================================================

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
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username =
        "Username can only contain letters, numbers and underscores";
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
      errors.password =
        "Password must contain uppercase, lowercase, and numbers";
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

  // =============================================================================
  // Event Handlers
  // =============================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    clearError();
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

  const handleSocialLogin = (provider: string) => {
    console.log(`Social login with ${provider}`);
    // TODO: Implement social login
  };

  // =============================================================================
  // Render Methods
  // =============================================================================

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
      <Box sx={{ display: "flex", gap: 2 }}>
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

  const renderLoginForm = () => (
    <Box component="form" onSubmit={handleLoginSubmit}>
      <AuthFormField
        name="username"
        label="Username or Email"
        type="text"
        value={loginData.username}
        onChange={(value) => {
          setLoginData((prev) => ({ ...prev, username: value }));
          if (loginErrors.username) {
            setLoginErrors((prev) => ({ ...prev, username: "" }));
          }
        }}
        error={loginErrors.username}
        placeholder="Enter your username or email"
        autoComplete="username"
        autoFocus
        required
        validation={{
          minLength: 3,
        }}
      />

      <AuthFormField
        name="password"
        label="Password"
        type="password"
        value={loginData.password}
        onChange={(value) => {
          setLoginData((prev) => ({ ...prev, password: value }));
          if (loginErrors.password) {
            setLoginErrors((prev) => ({ ...prev, password: "" }));
          }
        }}
        error={loginErrors.password}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
        validation={{
          minLength: 6,
        }}
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
                setLoginData((prev) => ({
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
          value={registerData.first_name}
          onChange={(value) => {
            setRegisterData((prev) => ({ ...prev, first_name: value }));
            if (registerErrors.first_name) {
              setRegisterErrors((prev) => ({ ...prev, first_name: "" }));
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
          value={registerData.last_name}
          onChange={(value) => {
            setRegisterData((prev) => ({ ...prev, last_name: value }));
            if (registerErrors.last_name) {
              setRegisterErrors((prev) => ({ ...prev, last_name: "" }));
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
          setRegisterData((prev) => ({ ...prev, username: value }));
          if (registerErrors.username) {
            setRegisterErrors((prev) => ({ ...prev, username: "" }));
          }
        }}
        error={registerErrors.username}
        placeholder="johndoe"
        autoComplete="username"
        required
        validation={{
          minLength: 3,
          pattern: /^[a-zA-Z0-9_]+$/,
        }}
        helperText="Only letters, numbers, and underscores allowed"
      />

      <AuthFormField
        name="email"
        label="Email Address"
        type="email"
        value={registerData.email}
        onChange={(value) => {
          setRegisterData((prev) => ({ ...prev, email: value }));
          if (registerErrors.email) {
            setRegisterErrors((prev) => ({ ...prev, email: "" }));
          }
        }}
        error={registerErrors.email}
        placeholder="john.doe@example.com"
        autoComplete="email"
        required
        validation={{
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        }}
      />

      <AuthFormField
        name="password"
        label="Password"
        type="password"
        value={registerData.password}
        onChange={(value) => {
          setRegisterData((prev) => ({ ...prev, password: value }));
          if (registerErrors.password) {
            setRegisterErrors((prev) => ({ ...prev, password: "" }));
          }
        }}
        error={registerErrors.password}
        placeholder="Create a strong password"
        autoComplete="new-password"
        required
        showPasswordStrength
        validation={{
          minLength: 8,
          pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        }}
      />

      <AuthFormField
        name="confirm_password"
        label="Confirm Password"
        type="password"
        value={registerData.confirm_password}
        onChange={(value) => {
          setRegisterData((prev) => ({ ...prev, confirm_password: value }));
          if (registerErrors.confirm_password) {
            setRegisterErrors((prev) => ({ ...prev, confirm_password: "" }));
          }
        }}
        error={registerErrors.confirm_password}
        placeholder="Confirm your password"
        autoComplete="new-password"
        required
        validation={{
          customValidator: (value) =>
            value !== registerData.password ? "Passwords do not match" : null,
        }}
      />

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={registerData.terms_accepted}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  terms_accepted: e.target.checked,
                }));
                if (registerErrors.terms_accepted) {
                  setRegisterErrors((prev) => ({
                    ...prev,
                    terms_accepted: "",
                  }));
                }
              }}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{" "}
              <Link href="/terms" color="primary" underline="hover">
                Terms of Service
              </Link>
            </Typography>
          }
        />
        {registerErrors.terms_accepted && (
          <Typography variant="body2" color="error" sx={{ ml: 4, mt: 0.5 }}>
            {registerErrors.terms_accepted}
          </Typography>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={registerData.privacy_accepted}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  privacy_accepted: e.target.checked,
                }));
                if (registerErrors.privacy_accepted) {
                  setRegisterErrors((prev) => ({
                    ...prev,
                    privacy_accepted: "",
                  }));
                }
              }}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{" "}
              <Link href="/privacy" color="primary" underline="hover">
                Privacy Policy
              </Link>
            </Typography>
          }
        />
        {registerErrors.privacy_accepted && (
          <Typography variant="body2" color="error" sx={{ ml: 4, mt: 0.5 }}>
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
      >
        Create Account
      </AuthButton>
    </Box>
  );

  return (
    <AuthFormLayout
      title="Welcome to Requify"
      subtitle="Professional requirements management for development teams"
      maxWidth="md"
    >
      {/* Error Alert */}
      {error && (
        <Fade in>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={clearError}
          >
            {error.message || "Authentication failed. Please try again."}
          </Alert>
        </Fade>
      )}

      {/* Social Login */}
      {renderSocialButtons()}

      {/* Auth Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
            },
          }}
        >
          <Tab
            label="Sign In"
            id="auth-tab-0"
            aria-controls="auth-tabpanel-0"
          />
          <Tab
            label="Create Account"
            id="auth-tab-1"
            aria-controls="auth-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {renderLoginForm()}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setActiveTab(1)}
              color="primary"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Create one now
            </Link>
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderRegisterForm()}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setActiveTab(0)}
              color="primary"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Sign in instead
            </Link>
          </Typography>
        </Box>
      </TabPanel>

      {/* Footer Links */}
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          pt: 3,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Need help?{" "}
          <Link href="/support" color="primary" underline="hover">
            Contact Support
          </Link>
          {" · "}
          <Link href="/api-overview" color="primary" underline="hover">
            API Documentation
          </Link>
        </Typography>
      </Box>
    </AuthFormLayout>
  );
};

export default AuthPage;
