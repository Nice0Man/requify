import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { Google, GitHub } from "@mui/icons-material";
import { AuthButton } from "@/shared/ui";

export interface SocialLoginButtonsProps {
  onSocialLogin: (provider: "google" | "github") => Promise<void>;
  isLoading?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSocialLogin,
  isLoading = false,
}) => {
  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await onSocialLogin(provider);
    } catch (error) {
      console.error(`Social login with ${provider} failed:`, error);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 2 }}
      >
        Continue with
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <AuthButton
          variant="social"
          socialProvider="google"
          icon={<Google />}
          onClick={() => handleSocialLogin("google")}
          size="medium"
          disabled={isLoading}
        >
          Google
        </AuthButton>
        <AuthButton
          variant="social"
          socialProvider="github"
          icon={<GitHub />}
          onClick={() => handleSocialLogin("github")}
          size="medium"
          disabled={isLoading}
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
};
