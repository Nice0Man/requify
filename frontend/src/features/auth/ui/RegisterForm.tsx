import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import type { RegisterFormData } from "../model/types";
import i18n from "@/shared/lib/i18n";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    role: "user", // Значение по умолчанию
    terms_accepted: false,
    privacy_accepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const { register, isLoading, error } = useAuth();
  const { t } = i18n;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Простая валидация
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.email) {
      newErrors.email = t("auth.emailRequired");
    }

    if (!formData.password) {
      newErrors.password = t("auth.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("auth.passwordMinLength");
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = t("auth.passwordsDoNotMatch");
    }

    if (!formData.role) {
      newErrors.role = "Роль обязательна для заполнения";
    }

    if (!formData.terms_accepted) {
      newErrors.terms_accepted = false;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await register(formData);
        onSuccess?.();
      } catch (err) {
        console.error("Registration failed:", err);
      }
    }
  };

  const handleChange =
    (field: keyof RegisterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Очищаем ошибки при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="firstName"
        label="Имя"
        name="firstName"
        autoComplete="given-name"
        value={formData.first_name}
        onChange={handleChange("first_name")}
        error={!!errors.first_name}
        helperText={errors.first_name}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="lastName"
        label="Фамилия"
        name="lastName"
        autoComplete="family-name"
        value={formData.last_name}
        onChange={handleChange("last_name")}
        error={!!errors.last_name}
        helperText={errors.last_name}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange("email")}
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        select
        id="role"
        label="Роль"
        name="role"
        value={formData.role}
        onChange={handleChange("role")}
        error={!!errors.role}
        helperText={errors.role || "Выберите роль в системе"}
        SelectProps={{
          native: true,
        }}
      >
        <option value="">Выберите роль</option>
        <option value="user">Пользователь</option>
        <option value="admin">Администратор</option>
        <option value="moderator">Модератор</option>
        <option value="analyst">Аналитик</option>
      </TextField>

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Пароль"
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange("password")}
        error={!!errors.password}
        helperText={errors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Подтвердите пароль"
        type={showConfirmPassword ? "text" : "password"}
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirm_password}
        onChange={handleChange("confirm_password")}
        error={!!errors.confirm_password}
        helperText={errors.confirm_password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
    </Box>
  );
};
