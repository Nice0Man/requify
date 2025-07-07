import React, { useState, useCallback } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  LinearProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Info,
  Person,
  Email,
  Lock,
  Phone,
  Business,
} from "@mui/icons-material";

interface AuthFormFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "url";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  showPasswordStrength?: boolean;
  showCharacterCount?: boolean;
  icon?: React.ReactNode;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    customValidator?: (value: string) => string | null;
  };
}

const getFieldIcon = (type: string, name: string) => {
  if (type === "email") return <Email />;
  if (type === "password") return <Lock />;
  if (type === "tel") return <Phone />;
  if (name.includes("company") || name.includes("organization"))
    return <Business />;
  return <Person />;
};

const calculatePasswordStrength = (
  password: string
): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  const strengthMap = {
    0: { label: "", color: "" },
    1: { label: "Very Weak", color: "#f44336" },
    2: { label: "Weak", color: "#ff9800" },
    3: { label: "Fair", color: "#ffeb3b" },
    4: { label: "Good", color: "#8bc34a" },
    5: { label: "Strong", color: "#4caf50" },
  };

  return {
    score: (score / 5) * 100,
    ...strengthMap[score as keyof typeof strengthMap],
  };
};

export const AuthFormField: React.FC<AuthFormFieldProps> = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  autoFocus = false,
  multiline = false,
  rows = 1,
  maxLength,
  showPasswordStrength = false,
  showCharacterCount = false,
  icon,
  validation,
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const isPassword = type === "password";
  const fieldIcon = icon || getFieldIcon(type, name);

  // Real-time validation
  const validateField = useCallback(
    (val: string): string | null => {
      if (!val && required) return `${label} is required`;
      if (!val) return null;

      if (validation?.minLength && val.length < validation.minLength) {
        return `${label} must be at least ${validation.minLength} characters`;
      }

      if (validation?.maxLength && val.length > validation.maxLength) {
        return `${label} must not exceed ${validation.maxLength} characters`;
      }

      if (validation?.pattern && !validation.pattern.test(val)) {
        if (type === "email") return "Please enter a valid email address";
        return `${label} format is invalid`;
      }

      if (validation?.customValidator) {
        return validation.customValidator(val);
      }

      return null;
    },
    [label, required, validation, type]
  );

  const currentError = error || (touched ? validateField(value) : null);
  const isValid = !currentError && value.length > 0;
  const passwordStrength =
    isPassword && showPasswordStrength
      ? calculatePasswordStrength(value)
      : null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    setFocused(false);
    onBlur?.();
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getFieldState = () => {
    if (currentError) return "error";
    if (isValid) return "success";
    if (focused) return "focused";
    return "default";
  };

  const fieldState = getFieldState();

  const getFieldStyles = () => {
    const baseStyles = {
      "& .MuiOutlinedInput-root": {
        borderRadius: 3,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: focused
          ? alpha(theme.palette.primary.main, 0.03)
          : alpha('#ffffff', 0.9),
        backdropFilter: 'blur(10px)',
        minHeight: '56px', // Fixed height to prevent layout shifts
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
        "&.Mui-focused": {
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: 2,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      "& .MuiInputLabel-root": {
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontWeight: 500,
      },
      "& .MuiInputBase-input": {
        transition: "all 0.3s ease-in-out",
      },
      // Fixed height for helper text area to prevent layout shifts
      "& .MuiFormHelperText-root": {
        minHeight: '20px',
        margin: '4px 14px 0',
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: currentError || helperText ? 1 : 0,
        transform: currentError || helperText ? 'translateY(0)' : 'translateY(-4px)',
      },
    };

    switch (fieldState) {
      case "error":
        return {
          ...baseStyles,
          "& .MuiOutlinedInput-root": {
            ...baseStyles["& .MuiOutlinedInput-root"],
            backgroundColor: alpha(theme.palette.error.main, 0.03),
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.05),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.15)}`,
            },
            "&.Mui-focused": {
              backgroundColor: alpha(theme.palette.error.main, 0.03),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 20px ${alpha(theme.palette.error.main, 0.2)}`,
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            ...baseStyles["& .MuiOutlinedInput-notchedOutline"],
            borderColor: theme.palette.error.main,
            borderWidth: 2,
          },
          "& .MuiInputLabel-root": {
            ...baseStyles["& .MuiInputLabel-root"],
            color: theme.palette.error.main,
          },
          "& .MuiFormHelperText-root": {
            ...baseStyles["& .MuiFormHelperText-root"],
            color: theme.palette.error.main,
            fontWeight: 500,
          },
        };

      case "success":
        return {
          ...baseStyles,
          "& .MuiOutlinedInput-root": {
            ...baseStyles["& .MuiOutlinedInput-root"],
            backgroundColor: alpha(theme.palette.success.main, 0.03),
            "&:hover": {
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}`,
            },
            "&.Mui-focused": {
              backgroundColor: alpha(theme.palette.success.main, 0.03),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 20px ${alpha(theme.palette.success.main, 0.2)}`,
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            ...baseStyles["& .MuiOutlinedInput-notchedOutline"],
            borderColor: theme.palette.success.main,
            borderWidth: 2,
          },
          "& .MuiInputLabel-root": {
            ...baseStyles["& .MuiInputLabel-root"],
            color: theme.palette.success.main,
          },
        };

      case "focused":
        return {
          ...baseStyles,
          "& .MuiOutlinedInput-root": {
            ...baseStyles["& .MuiOutlinedInput-root"],
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            ...baseStyles["& .MuiOutlinedInput-notchedOutline"],
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
          },
          "& .MuiInputLabel-root": {
            ...baseStyles["& .MuiInputLabel-root"],
            color: theme.palette.primary.main,
            fontWeight: 600,
          },
        };

      default:
        return {
          ...baseStyles,
          "& .MuiOutlinedInput-notchedOutline": {
            ...baseStyles["& .MuiOutlinedInput-notchedOutline"],
            borderColor: alpha(theme.palette.divider, 0.3),
          },
          "& .MuiInputLabel-root": {
            ...baseStyles["& .MuiInputLabel-root"],
            color: theme.palette.text.secondary,
          },
        };
    }
  };

  const renderStartAdornment = () => (
    <InputAdornment position="start">
      <Box
        sx={{
          color:
            fieldState === "error"
              ? theme.palette.error.main
              : fieldState === "success"
              ? theme.palette.success.main
              : theme.palette.text.secondary,
          transition: "color 0.3s ease-in-out",
        }}
      >
        {fieldIcon}
      </Box>
    </InputAdornment>
  );

  const renderEndAdornment = () => {
    const elements = [];

    // Password visibility toggle
    if (isPassword) {
      elements.push(
        <Tooltip
          key="password-toggle"
          title={showPassword ? "Hide password" : "Show password"}
        >
          <IconButton
            onClick={togglePasswordVisibility}
            edge="end"
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </Tooltip>
      );
    }

    // Validation status icon
    if (touched && !isPassword) {
      if (currentError) {
        elements.push(
          <Tooltip key="error-icon" title={currentError}>
            <Error sx={{ color: theme.palette.error.main, ml: 1 }} />
          </Tooltip>
        );
      } else if (isValid) {
        elements.push(
          <Tooltip key="success-icon" title="Valid">
            <CheckCircle sx={{ color: theme.palette.success.main, ml: 1 }} />
          </Tooltip>
        );
      }
    }

    return elements.length > 0 ? (
      <InputAdornment position="end">
        <Box sx={{ display: "flex", alignItems: "center" }}>{elements}</Box>
      </InputAdornment>
    ) : null;
  };

  const renderHelperContent = () => {
    const elements = [];

    // Error message
    if (currentError) {
      elements.push(
        <Typography
          key="error"
          variant="body2"
          sx={{
            color: theme.palette.error.main,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontWeight: 500,
          }}
        >
          <Error fontSize="small" />
          {currentError}
        </Typography>
      );
    }

    // Helper text
    if (helperText && !currentError) {
      elements.push(
        <Typography
          key="helper"
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Info fontSize="small" />
          {helperText}
        </Typography>
      );
    }

    // Character count
    if (showCharacterCount && maxLength) {
      const count = value.length;
      const isNearLimit = count > maxLength * 0.8;

      elements.push(
        <Typography
          key="count"
          variant="body2"
          sx={{
            color: isNearLimit
              ? theme.palette.warning.main
              : theme.palette.text.secondary,
            fontWeight: isNearLimit ? 600 : 400,
          }}
        >
          {count}/{maxLength}
        </Typography>
      );
    }

    return elements.length > 0 ? (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 0.5,
        }}
      >
        {elements}
      </Box>
    ) : null;
  };

  const renderPasswordStrength = () => {
    if (!passwordStrength || !value) return null;

    return (
      <Fade in>
        <Box sx={{ mt: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Password Strength
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: passwordStrength.color,
                fontWeight: 600,
              }}
            >
              {passwordStrength.label}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={passwordStrength.score}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.grey[300], 0.3),
              "& .MuiLinearProgress-bar": {
                backgroundColor: passwordStrength.color,
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </Fade>
    );
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        name={name}
        label={label}
        type={isPassword && !showPassword ? "password" : "text"}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        fullWidth
        variant="outlined"
        error={!!currentError}
        InputProps={{
          startAdornment: renderStartAdornment(),
          endAdornment: renderEndAdornment(),
        }}
        sx={getFieldStyles()}
      />
      {renderHelperContent()}
      {renderPasswordStrength()}
    </Box>
  );
};
