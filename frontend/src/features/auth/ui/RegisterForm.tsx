import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../model/hooks";
import { RegisterData } from "../model/types";
import { useTranslation } from "react-i18next";

const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const { register, isPending, error } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    await register(formData);
  };

  const handleChange =
    (field: keyof RegisterData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: "auto" }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        {t("auth.register")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label={t("auth.name")}
        value={formData.name}
        onChange={handleChange("name")}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label={t("auth.email")}
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label={t("auth.password")}
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label={t("auth.confirmPassword")}
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange("confirmPassword")}
        margin="normal"
        required
        error={
          formData.password !== formData.confirmPassword &&
          formData.confirmPassword !== ""
        }
        helperText={
          formData.password !== formData.confirmPassword &&
          formData.confirmPassword !== ""
            ? t("auth.passwordsDoNotMatch")
            : ""
        }
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isPending}
      >
        {isPending ? <CircularProgress size={24} /> : t("auth.registerButton")}
      </Button>
    </Box>
  );
};

export { RegisterForm };
