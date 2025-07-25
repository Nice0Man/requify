import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { Email, Lock, Login } from "@mui/icons-material";
import type { LoginRequest } from "@/shared/types/auth";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { FloatingLabelInput } from "@/shared/ui";
import { validateField } from "../model/validation";
import { authApi } from "../api";

interface LoginFormProps {
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onForgotPassword,
  onRegister,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [credentials, setCredentials] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const [touched, setTouched] = useState<{
    username?: boolean;
    password?: boolean;
  }>({});

  // Валидация при изменении полей
  useEffect(() => {
    const newErrors: typeof fieldErrors = {};

    const fieldsToValidate: Array<keyof typeof fieldErrors> = [
      "username",
      "password",
    ];
    fieldsToValidate.forEach((field) => {
      if (touched[field]) {
        const error = validateField(field, credentials[field] || "");
        if (error) newErrors[field] = error;
      }
    });

    setFieldErrors(newErrors);
  }, [credentials, touched, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем все поля
    const newTouched = { username: true, password: true };
    setTouched(newTouched);

    // Валидируем все поля
    const newErrors: typeof fieldErrors = {};
    const fieldsToValidate: Array<keyof typeof fieldErrors> = [
      "username",
      "password",
    ];
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, credentials[field] || "");
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      setIsPending(true);
      setError("");

      // Всегда используем OAuth2API для логина по форме
      // Наши провайдеры подхватят изменения автоматически
      await authApi.login(credentials);

      // Принудительный редирект на dashboard после успешного логина
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login failed:", err);

      // Обрабатываем ошибки
      if (err.response?.status === 401) {
        setError(
          t(
            "auth.errors.invalidCredentials",
            "Неверное имя пользователя или пароль"
          )
        );
      } else if (err.response?.status === 403) {
        setError(t("auth.errors.accountDisabled", "Аккаунт заблокирован"));
      } else if (err.response?.status === 429) {
        setError(
          t(
            "auth.errors.tooManyAttempts",
            "Слишком много попыток входа. Попробуйте позже"
          )
        );
      } else if (err.message?.includes("CORS")) {
        setError(
          t(
            "auth.errors.connectionError",
            "Ошибка подключения к серверу. Проверьте настройки CORS"
          )
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.message ||
            t(
              "auth.errors.loginFailed",
              "Не удалось войти в систему. Попробуйте еще раз"
            )
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleChange = (field: keyof LoginRequest) => (value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field: keyof LoginRequest) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid =
    !Object.keys(fieldErrors).length &&
    credentials.username &&
    credentials.password;

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 480,
        mx: "auto",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.9
        )}, ${alpha(theme.palette.background.paper, 0.95)})`,
        backdropFilter: "blur(20px)",
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              mb: 2,
            }}
          >
            <Login sx={{ color: "white", fontSize: 28 }} />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            {t("auth.login", "Вход в систему")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t("auth.loginSubtitle", "Войдите в свою учетную запись")}
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <FloatingLabelInput
              label={t("auth.username", "Имя пользователя")}
              type="text"
              value={credentials.username || ""}
              onChange={handleChange("username")}
              onBlur={handleBlur("username")}
              error={fieldErrors.username}
              required
              autoComplete="username"
              autoFocus
              startIcon={<Email />}
              placeholder={t(
                "auth.usernamePlaceholder",
                "Введите имя пользователя"
              )}
            />

            <FloatingLabelInput
              label={t("auth.password", "Пароль")}
              type="password"
              value={credentials.password || ""}
              onChange={handleChange("password")}
              onBlur={handleBlur("password")}
              error={fieldErrors.password}
              required
              autoComplete="current-password"
              startIcon={<Lock />}
              placeholder={t("auth.passwordPlaceholder", "Введите пароль")}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: theme.palette.primary.main,
                      "&.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    {t("auth.rememberMe", "Запомнить меня")}
                  </Typography>
                }
              />

              {onForgotPassword && (
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={onForgotPassword}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {t("auth.forgotPassword", "Забыли пароль?")}
                </Link>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isPending || !isFormValid}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1.1rem",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 20px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 6px 24px ${alpha(
                    theme.palette.primary.main,
                    0.5
                  )}`,
                },
                "&:disabled": {
                  background: alpha(theme.palette.action.disabled, 0.3),
                  boxShadow: "none",
                  transform: "none",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              {isPending ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                t("auth.loginButton", "Войти")
              )}
            </Button>

            {onRegister && (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("auth.or", "или")}
                  </Typography>
                </Divider>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  {t("auth.noAccount", "Нет аккаунта?")}{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={onRegister}
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {t("auth.register", "Зарегистрироваться")}
                  </Link>
                </Typography>
              </>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
