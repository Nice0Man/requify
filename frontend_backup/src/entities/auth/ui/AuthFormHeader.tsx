import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

export interface AuthFormHeaderProps {
  isLogin: boolean;
}

export const AuthFormHeader: React.FC<AuthFormHeaderProps> = ({ isLogin }) => {
  const theme = useTheme();

  return (
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
        {isLogin ? "Welcome Back" : "Create Account"}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: { xs: "0.875rem", sm: "0.9rem" },
          lineHeight: 1.5,
        }}
      >
        {isLogin
          ? "Sign in to your account to continue"
          : "Join us today and get started"}
      </Typography>
    </Box>
  );
};
