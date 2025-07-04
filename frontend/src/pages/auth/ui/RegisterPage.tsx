import React, { useState, useTransition, useRef } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Fade,
  Chip,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Business,
  PersonAdd,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Send,
  Warning,
  Info,
} from "@mui/icons-material";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/api/auth.api";
import { UserCreate } from '@/shared/api/types';
import { UserRole } from '@/entities/user/model/types';

// Validation schema
const registerSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  first_name: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .required("First name is required"),
  last_name: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .required("Last name is required"),
  department: yup
    .string()
    .max(100, "Department must be less than 100 characters")
    .optional(),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional(),
  role: yup
    .string()
    .oneOf(Object.values(UserRole), "Please select a valid role")
    .optional(),
});

interface RegisterFormData extends Omit<UserCreate, "password"> {
  password: string;
  confirmPassword: string;
}

type RegistrationStatus = "idle" | "submitting" | "success" | "error";

interface RegistrationState {
  status: RegistrationStatus;
  message?: string;
  data?: RegisterFormData;
}

const steps = ["Account Information", "Personal Details", "Review & Submit"];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  // New states for confirmation
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Replace useOptimistic with regular state
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    {
      status: "idle",
    }
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as Resolver<RegisterFormData>,
    mode: "onChange",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      department: "",
      phone: "",
      role: UserRole.VIEWER,
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    switch (activeStep) {
      case 0:
        fieldsToValidate = ["email", "username", "password", "confirmPassword"];
        break;
      case 1:
        fieldsToValidate = ["first_name", "last_name", "department", "phone"];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRegistration = async (data: RegisterFormData) => {
    try {
      setError(null);
      setRegistrationState({
        status: "submitting",
        data,
        message: "Creating your account...",
      });

      const userToCreate: UserCreate = {
        email: data.email,
        username: data.username,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        department: data.department,
        phone: data.phone,
      };

      const response = await authApi.register(userToCreate);

      setRegistrationState({
        status: "success",
        data,
        message:
          "Account created successfully! Please check your email for verification.",
      });

      toast.success(
        "Registration successful! Please check your email for verification."
      );

      // Redirect to login after a delay
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Account created successfully! Please verify your email and then log in.",
            email: data.email,
          },
        });
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      setRegistrationState({
        status: "error",
        message: errorMessage,
      });

      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    const formData = getValues();
    startTransition(() => {
      handleRegistration(formData);
    });
  };

  const handleSubmitRequest = () => {
    // Show confirmation dialog instead of submitting directly
    setShowConfirmDialog(true);
  };

  // Prevent default form submission
  const onSubmit = (data: RegisterFormData) => {
    // This will not be called anymore as we're not using type="submit"
    console.log("Form submitted:", data);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                Account Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose your login credentials
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                placeholder="Enter your email address"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                {...register("email")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                placeholder="Choose a unique username"
                autoComplete="username"
                error={!!errors.username}
                helperText={errors.username?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                {...register("username")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Password"
                placeholder="Create a strong password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register("password")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Confirm Password"
                placeholder="Confirm your password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
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
                {...register("confirmPassword")}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                Personal Details
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Tell us more about yourself
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="first_name"
                label="First Name"
                placeholder="Enter your first name"
                autoComplete="given-name"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                {...register("first_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="last_name"
                label="Last Name"
                placeholder="Enter your last name"
                autoComplete="family-name"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                {...register("last_name")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="department"
                label="Department"
                placeholder="Enter your department (optional)"
                error={!!errors.department}
                helperText={errors.department?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business />
                    </InputAdornment>
                  ),
                }}
                {...register("department")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phone"
                label="Phone Number"
                placeholder="Enter your phone number (optional)"
                autoComplete="tel"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                {...register("phone")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="role-label">Role</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select labelId="role-label" label="Role" {...field}>
                      <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
                      <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
                      <MenuItem value={UserRole.ANALYST}>Analyst</MenuItem>
                      <MenuItem value={UserRole.TESTER}>Tester</MenuItem>
                      <MenuItem value={UserRole.DEVELOPER}>Developer</MenuItem>
                    </Select>
                  )}
                />
                {errors.role && (
                  <FormHelperText>{errors.role.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        const values = getValues();
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please review your information before creating your account.
              </Typography>
            </Grid>

            {/* Registration Status */}
            {registrationState.status !== "idle" && (
              <Grid item xs={12}>
                <Fade in={true}>
                  <Alert
                    severity={
                      registrationState.status === "success"
                        ? "success"
                        : registrationState.status === "error"
                        ? "error"
                        : "info"
                    }
                    sx={{ mb: 2, borderRadius: 2 }}
                    icon={
                      registrationState.status === "submitting" ? (
                        <CircularProgress size={20} />
                      ) : undefined
                    }
                  >
                    {registrationState.message}
                  </Alert>
                </Fade>
              </Grid>
            )}

            <Grid item xs={12}>
              <Paper sx={{ p: 3, backgroundColor: "grey.50", borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Email sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="h6" color="primary">
                        Account Details
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email Address:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {values.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Username:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {values.username}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        mt: 2,
                      }}
                    >
                      <Person sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="h6" color="primary">
                        Personal Information
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      First Name:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {values.first_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Name:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {values.last_name}
                    </Typography>
                  </Grid>
                  {values.department && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Department:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {values.department}
                      </Typography>
                    </Grid>
                  )}
                  {values.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {values.phone}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Role:
                    </Typography>
                    <Chip
                      label={values.role}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Confirmation Section */}
            {registrationState.status === "idle" && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Before Creating Account
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 3,
                      backgroundColor: "warning.main",
                      color: "warning.contrastText",
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Info sx={{ color: "warning.contrastText", mt: 0.5 }} />
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Important Information
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • A verification email will be sent to your email
                          address
                        </Typography>
                        <Typography variant="body2" paragraph>
                          • You must verify your email before you can log in
                        </Typography>
                        <Typography variant="body2">
                          • Please check your email (including spam folder)
                          after registration
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        name="termsAccepted"
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the Terms of Service and Privacy Policy
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={confirmationChecked}
                        onChange={(e) =>
                          setConfirmationChecked(e.target.checked)
                        }
                        name="confirmationChecked"
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I confirm that all the information provided is accurate
                        and I understand that I will need to verify my email
                        address
                      </Typography>
                    }
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: { xs: 4, md: 8 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
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
              <PersonAdd sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
              <Typography
                component="h1"
                variant="h3"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Requify
              </Typography>
            </Box>
            <Typography
              variant="h5"
              color="text.primary"
              sx={{ fontWeight: 500 }}
            >
              Create Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Join the requirements management platform
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && registrationState.status === "idle" && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box
            component="form"
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={
                  activeStep === 0 || registrationState.status === "submitting"
                }
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{ mr: 1 }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="button"
                  variant="contained"
                  disabled={
                    isPending ||
                    registrationState.status === "submitting" ||
                    registrationState.status === "success" ||
                    !termsAccepted ||
                    !confirmationChecked
                  }
                  size="large"
                  onClick={handleSubmitRequest}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                    },
                    "&:disabled": {
                      background: "#ccc",
                    },
                  }}
                  startIcon={
                    registrationState.status === "submitting" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : registrationState.status === "success" ? (
                      <CheckCircle />
                    ) : (
                      <Send />
                    )
                  }
                >
                  {registrationState.status === "submitting"
                    ? "Creating Account..."
                    : registrationState.status === "success"
                    ? "Account Created!"
                    : "Create Account"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
          </Divider>

          {/* Login Link */}
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
              Sign in to your account
            </Link>
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

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Warning sx={{ color: "warning.main" }} />
            Confirm Account Creation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" paragraph>
              You are about to create an account with the following email:
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: "grey.50", mb: 2 }}>
              <Typography variant="h6" color="primary">
                {getValues().email}
              </Typography>
            </Paper>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Next Steps:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                1. We'll send a verification email to your address
                <br />
                2. Check your email (including spam folder)
                <br />
                3. Click the verification link
                <br />
                4. Return to log in with your credentials
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Are you ready to proceed with account creation?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
              },
            }}
          >
            Yes, Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegisterPage;
