import React, { useState, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Slide,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import { Google, GitHub, Login, PersonAdd } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

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

const QuickAuth: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Tab management
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    remember_me: false,
  });

  const [registerData, setRegisterData] = useState({
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
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>(
    {}
  );

  // =============================================================================
  // Validation Functions
  // =============================================================================

  const validateLogin = useCallback(
    (data: typeof loginData): Record<string, string> => {
      const errors: Record<string, string> = {};

      if (!data.username.trim()) {
        errors.username = t(
          "auth.validation.usernameRequired",
          "Username is required"
        );
      } else if (data.username.length < 3) {
        errors.username = t(
          "auth.validation.usernameMinLength",
          "Username must be at least 3 characters"
        );
      }

      if (!data.password) {
        errors.password = t(
          "auth.validation.passwordRequired",
          "Password is required"
        );
      } else if (data.password.length < 6) {
        errors.password = t(
          "auth.validation.passwordMinLength",
          "Password must be at least 6 characters"
        );
      }

      return errors;
    },
    [t]
  );

  const validateRegister = useCallback(
    (data: typeof registerData): Record<string, string> => {
      const errors: Record<string, string> = {};

      if (!data.username.trim()) {
        errors.username = t(
          "auth.validation.usernameRequired",
          "Username is required"
        );
      } else if (data.username.length < 3) {
        errors.username = t(
          "auth.validation.usernameMinLength",
          "Username must be at least 3 characters"
        );
      } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.username = t(
          "auth.validation.usernameFormat",
          "Username can only contain letters, numbers and underscores"
        );
      }

      if (!data.email.trim()) {
        errors.email = t("auth.validation.emailRequired", "Email is required");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = t(
          "auth.validation.emailFormat",
          "Please enter a valid email address"
        );
      }

      if (!data.first_name.trim()) {
        errors.first_name = t(
          "auth.validation.firstNameRequired",
          "First name is required"
        );
      }

      if (!data.last_name.trim()) {
        errors.last_name = t(
          "auth.validation.lastNameRequired",
          "Last name is required"
        );
      }

      if (!data.password) {
        errors.password = t(
          "auth.validation.passwordRequired",
          "Password is required"
        );
      } else if (data.password.length < 8) {
        errors.password = t(
          "auth.validation.passwordMinLength8",
          "Password must be at least 8 characters"
        );
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        errors.password = t(
          "auth.validation.passwordStrength",
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        );
      }

      if (!data.confirm_password) {
        errors.confirm_password = t(
          "auth.validation.confirmPasswordRequired",
          "Please confirm your password"
        );
      } else if (data.password !== data.confirm_password) {
        errors.confirm_password = t(
          "auth.validation.passwordMismatch",
          "Passwords do not match"
        );
      }

      if (!data.terms_accepted) {
        errors.terms_accepted = t(
          "auth.validation.termsRequired",
          "You must accept the terms of service"
        );
      }

      if (!data.privacy_accepted) {
        errors.privacy_accepted = t(
          "auth.validation.privacyRequired",
          "You must accept the privacy policy"
        );
      }

      return errors;
    },
    [t]
  );

  // =============================================================================
  // Event Handlers
  // =============================================================================

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
      setError(null);
      setLoginErrors({});
      setRegisterErrors({});
    },
    []
  );

  const handleLoginSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const errors = validateLogin(loginData);
      setLoginErrors(errors);

      if (Object.keys(errors).length > 0) return;

      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Login attempt:", loginData);
        // TODO: Implement actual login logic
      } catch (error) {
        setError(
          t("auth.errors.loginFailed", "Login failed. Please try again.")
        );
        console.error("Login failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [loginData, validateLogin, t]
  );

  const handleRegisterSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const errors = validateRegister(registerData);
      setRegisterErrors(errors);

      if (Object.keys(errors).length > 0) return;

      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Register attempt:", registerData);
        // TODO: Implement actual registration logic
      } catch (error) {
        setError(
          t(
            "auth.errors.registerFailed",
            "Registration failed. Please try again."
          )
        );
        console.error("Registration failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [registerData, validateRegister, t]
  );

  const handleSocialLogin = useCallback(
    async (provider: string) => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Social login with ${provider}`);
        // TODO: Implement actual social login logic
      } catch (error) {
        setError(
          t(
            "auth.errors.socialLoginFailed",
            `Social login with ${provider} failed`
          )
        );
        console.error(`Social login with ${provider} failed:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  // =============================================================================
  // Render Functions
  // =============================================================================

  const renderSocialButtons = () => (
    <Stack spacing={2}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Google />}
        onClick={() => handleSocialLogin("google")}
        disabled={isLoading}
        sx={{
          py: 1.5,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}05`,
          },
        }}
      >
        {t("auth.socialLogin.google", "Continue with Google")}
      </Button>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<GitHub />}
        onClick={() => handleSocialLogin("github")}
        disabled={isLoading}
        sx={{
          py: 1.5,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}05`,
          },
        }}
      >
        {t("auth.socialLogin.github", "Continue with GitHub")}
      </Button>
    </Stack>
  );

  const renderLoginForm = () => (
    <Box component="form" onSubmit={handleLoginSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label={t("auth.fields.username", "Username")}
          value={loginData.username}
          onChange={(e) =>
            setLoginData({ ...loginData, username: e.target.value })
          }
          error={!!loginErrors.username}
          helperText={loginErrors.username}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          type="password"
          label={t("auth.fields.password", "Password")}
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
          error={!!loginErrors.password}
          helperText={loginErrors.password}
          disabled={isLoading}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={loginData.remember_me}
              onChange={(e) =>
                setLoginData({ ...loginData, remember_me: e.target.checked })
              }
              disabled={isLoading}
            />
          }
          label={t("auth.fields.rememberMe", "Remember me")}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{ py: 1.5 }}
        >
          {isLoading
            ? t("auth.buttons.signingIn", "Signing in...")
            : t("auth.buttons.signIn", "Sign In")}
        </Button>
      </Stack>
    </Box>
  );

  const renderRegisterForm = () => (
    <Box component="form" onSubmit={handleRegisterSubmit}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label={t("auth.fields.firstName", "First Name")}
            value={registerData.first_name}
            onChange={(e) =>
              setRegisterData({ ...registerData, first_name: e.target.value })
            }
            error={!!registerErrors.first_name}
            helperText={registerErrors.first_name}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            label={t("auth.fields.lastName", "Last Name")}
            value={registerData.last_name}
            onChange={(e) =>
              setRegisterData({ ...registerData, last_name: e.target.value })
            }
            error={!!registerErrors.last_name}
            helperText={registerErrors.last_name}
            disabled={isLoading}
          />
        </Stack>
        <TextField
          fullWidth
          label={t("auth.fields.username", "Username")}
          value={registerData.username}
          onChange={(e) =>
            setRegisterData({ ...registerData, username: e.target.value })
          }
          error={!!registerErrors.username}
          helperText={registerErrors.username}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          type="email"
          label={t("auth.fields.email", "Email")}
          value={registerData.email}
          onChange={(e) =>
            setRegisterData({ ...registerData, email: e.target.value })
          }
          error={!!registerErrors.email}
          helperText={registerErrors.email}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          type="password"
          label={t("auth.fields.password", "Password")}
          value={registerData.password}
          onChange={(e) =>
            setRegisterData({ ...registerData, password: e.target.value })
          }
          error={!!registerErrors.password}
          helperText={registerErrors.password}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          type="password"
          label={t("auth.fields.confirmPassword", "Confirm Password")}
          value={registerData.confirm_password}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              confirm_password: e.target.value,
            })
          }
          error={!!registerErrors.confirm_password}
          helperText={registerErrors.confirm_password}
          disabled={isLoading}
        />
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={registerData.terms_accepted}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    terms_accepted: e.target.checked,
                  })
                }
                disabled={isLoading}
              />
            }
            label={
              <Typography variant="body2">
                {t("auth.fields.acceptTerms", "I accept the")}{" "}
                <Link href="#">
                  {t("auth.links.terms", "Terms of Service")}
                </Link>
              </Typography>
            }
          />
          {registerErrors.terms_accepted && (
            <Typography variant="body2" color="error">
              {registerErrors.terms_accepted}
            </Typography>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={registerData.privacy_accepted}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    privacy_accepted: e.target.checked,
                  })
                }
                disabled={isLoading}
              />
            }
            label={
              <Typography variant="body2">
                {t("auth.fields.acceptPrivacy", "I accept the")}{" "}
                <Link href="#">
                  {t("auth.links.privacy", "Privacy Policy")}
                </Link>
              </Typography>
            }
          />
          {registerErrors.privacy_accepted && (
            <Typography variant="body2" color="error">
              {registerErrors.privacy_accepted}
            </Typography>
          )}
        </Stack>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{ py: 1.5 }}
        >
          {isLoading
            ? t("auth.buttons.signingUp", "Signing up...")
            : t("auth.buttons.signUp", "Sign Up")}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        mx: "auto",
        borderRadius: 3,
        boxShadow: theme.shadows[8],
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {t("auth.title", "Get Started")}
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: 3,
              }}
            >
              <Tab
                icon={<Login />}
                label={t("auth.tabs.signIn", "Sign In")}
                iconPosition="start"
              />
              <Tab
                icon={<PersonAdd />}
                label={t("auth.tabs.signUp", "Sign Up")}
                iconPosition="start"
              />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              {renderLoginForm()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {renderRegisterForm()}
            </TabPanel>
          </Box>

          <Box>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t("auth.divider.or", "or")}
              </Typography>
            </Divider>
            {renderSocialButtons()}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuickAuth;
