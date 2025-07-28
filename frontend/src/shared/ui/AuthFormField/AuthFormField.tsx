import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
} from "@mui/icons-material";

export interface AuthFormFieldProps {
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

export const AuthFormField: React.FC<AuthFormFieldProps> = ({
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
