import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Security,
  CheckCircle,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "@/features/auth/model/auth.context";
import { PasswordChangeRequest } from '@/shared/lib/types/api';

// Validation schema
const changePasswordSchema = yup.object({
  current_password: yup.string().required("Current password is required"),
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Please confirm your new password"),
});

const PasswordChangePage: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword, user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PasswordChangeRequest>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = watch("new_password");

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 50) return "error";
    if (strength < 75) return "warning";
    return "success";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 25) return "Very Weak";
    if (strength < 50) return "Weak";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const onSubmit = async (data: PasswordChangeRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      await changePassword(data);

      setSuccess(true);
      toast.success("Password changed successfully");
      reset();

      // Redirect after successful change
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error: any) {
      let errorMessage = "Failed to change password. Please try again.";
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // Handle validation errors (array of error objects)
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg) return err.msg;
            if (err.message) return err.message;
            return 'Validation error';
          }).join(', ');
        } 
        // Handle single validation error object
        else if (typeof detail === 'object' && detail.msg) {
          errorMessage = detail.msg;
        }
        // Handle string detail
        else if (typeof detail === 'string') {
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

  const passwordStrength = getPasswordStrength(newPassword);

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
              <Security sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Change Password
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Update your password for {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Choose a strong password to keep your account secure
            </Typography>
          </Box>

          {/* Success Alert */}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: 2 }}
              icon={<CheckCircle />}
            >
              Password changed successfully! Redirecting to profile...
            </Alert>
          )}

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
            <Grid container spacing={3}>
              {/* Current Password */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Current Password"
                  placeholder="Enter your current password"
                  type={showCurrentPassword ? "text" : "password"}
                  id="current_password"
                  autoComplete="current-password"
                  error={!!errors.current_password}
                  helperText={errors.current_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle current password visibility"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          edge="end"
                          size="small"
                        >
                          {showCurrentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register("current_password")}
                />
              </Grid>

              {/* New Password */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="New Password"
                  placeholder="Enter your new password"
                  type={showNewPassword ? "text" : "password"}
                  id="new_password"
                  autoComplete="new-password"
                  error={!!errors.new_password}
                  helperText={errors.new_password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  {...register("new_password")}
                />

                {/* Password Strength Indicator */}
                {newPassword && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        Strength:
                      </Typography>
                      <Typography
                        variant="body2"
                        color={`${getStrengthColor(passwordStrength)}.main`}
                        sx={{ fontWeight: 500 }}
                      >
                        {getStrengthText(passwordStrength)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: 4,
                        backgroundColor: "grey.300",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${passwordStrength}%`,
                          height: "100%",
                          backgroundColor: `${getStrengthColor(
                            passwordStrength
                          )}.main`,
                          transition:
                            "width 0.3s ease, background-color 0.3s ease",
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  autoComplete="new-password"
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
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
                  {...register("confirm_password")}
                />
              </Grid>
            </Grid>

            {/* Password Requirements */}
            <Box
              sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 2 }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Password Requirements:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="ul"
                sx={{ m: 0, pl: 2 }}
              >
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character (@$!%*?&)</li>
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || success}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                },
                "&:disabled": {
                  background: "#ccc",
                },
              }}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Security />
                )
              }
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>

            {/* Cancel Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={isLoading}
              onClick={() => navigate("/profile")}
              sx={{ mb: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordChangePage;
