import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  type?: "text" | "email" | "password";
  error?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  type = "text",
  error,
  required = false,
  autoComplete,
  autoFocus,
  disabled,
  placeholder,
  fullWidth = true,
  startIcon,
  endIcon,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFloating = isFocused || value.length > 0;
  const isPasswordType = type === "password";

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <Box
      sx={{
        position: "relative",
        width: fullWidth ? "100%" : "auto",
        mb: 2,
      }}
    >
      {/* Floating Label */}
      <Typography
        component="label"
        sx={{
          position: "absolute",
          left: startIcon ? 48 : 16,
          top: isFloating ? -8 : 16,
          fontSize: isFloating ? "0.75rem" : "1rem",
          color: error
            ? theme.palette.error.main
            : isFocused
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
          backgroundColor: theme.palette.background.paper,
          px: 1,
          transition: "all 0.2s ease-in-out",
          zIndex: 1,
          transformOrigin: "left top",
          pointerEvents: "none",
          userSelect: "none",
          fontWeight: isFloating ? 500 : 400,
        }}
      >
        {label}
        {required && (
          <Box
            component="span"
            sx={{ color: theme.palette.error.main, ml: 0.5 }}
          >
            *
          </Box>
        )}
      </Typography>

      {/* Input Field */}
      <TextField
        ref={inputRef}
        fullWidth={fullWidth}
        type={isPasswordType ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused ? placeholder : ""}
        autoComplete={autoComplete}
        disabled={disabled}
        error={!!error}
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
          endAdornment: (
            <>
              {isPasswordType && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    sx={{
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        color: theme.palette.text.primary,
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )}
              {endIcon && !isPasswordType && (
                <InputAdornment position="end">{endIcon}</InputAdornment>
              )}
            </>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
            },
            "&.Mui-focused": {
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
            "&.Mui-error": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.error.main,
              },
            },
          },
          "& .MuiInputLabel-root": {
            display: "none", // Скрываем стандартный лейбл
          },
        }}
      />

      {/* Error Message */}
      {error && (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.error.main,
            display: "block",
            mt: 0.5,
            ml: 1,
            fontSize: "0.75rem",
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export { FloatingLabelInput }; 