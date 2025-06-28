import React, { useState } from "react";
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
} from "@mui/icons-material";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { authApi } from "../api/auth.api";
import { UserCreate, UserRole } from "../types/auth.types";

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

const steps = ["Account Information", "Personal Details", "Review"];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

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
      role: UserRole.GUEST,
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const userData: UserCreate = {
        email: data.email,
        username: data.username,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        department: data.department || undefined,
        phone: data.phone || undefined,
        role: data.role || UserRole.GUEST,
      };

      await authApi.register(userData);

      toast.success(
        "Registration successful! Please check your email for verification."
      );
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please sign in with your credentials.",
        },
      });
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        // Handle validation errors (array of error objects)
        if (Array.isArray(detail)) {
          errorMessage = detail
            .map((err: any) => {
              if (typeof err === "string") return err;
              if (err.msg) return err.msg;
              if (err.message) return err.message;
              return "Validation error";
            })
            .join(", ");
        }
        // Handle single validation error object
        else if (typeof detail === "object" && detail.msg) {
          errorMessage = detail.msg;
        }
        // Handle string detail
        else if (typeof detail === "string") {
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
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
                      <MenuItem value={UserRole.GUEST}>Guest</MenuItem>
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
              <Typography variant="h6" gutterBottom>
                Review Your Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please review your information before creating your account.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1">{values.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Username:
                    </Typography>
                    <Typography variant="body1">{values.username}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      First Name:
                    </Typography>
                    <Typography variant="body1">{values.first_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Name:
                    </Typography>
                    <Typography variant="body1">{values.last_name}</Typography>
                  </Grid>
                  {values.department && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Department:
                      </Typography>
                      <Typography variant="body1">
                        {values.department}
                      </Typography>
                    </Grid>
                  )}
                  {values.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone:
                      </Typography>
                      <Typography variant="body1">{values.phone}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Role:
                    </Typography>
                    <Typography variant="body1">{values.role}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
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
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{ mr: 1 }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  size="large"
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
                  }}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <PersonAdd />
                    )
                  }
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
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
    </Container>
  );
};

export default RegisterPage;
