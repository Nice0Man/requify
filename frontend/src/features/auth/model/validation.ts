import { useTranslation } from "@/shared/hooks/useTranslation";
import { LoginRequest } from "../api";

export const validateField = (field: keyof LoginRequest, value: string) => {
  const { t } = useTranslation();
  switch (field) {
    case "username":
      if (!value)
        return t(
          "auth.validation.usernameRequired",
          "Имя пользователя обязательно"
        );
      if (value.length < 3)
        return t(
          "auth.validation.usernameMinLength",
          "Имя пользователя должно содержать не менее 3 символов"
        );
      return "";
    case "password":
      if (!value)
        return t("auth.validation.passwordRequired", "Пароль обязателен");
      if (value.length < 6)
        return t(
          "auth.validation.passwordMinLength",
          "Пароль должен содержать не менее 6 символов"
        );
      return "";
    default:
      return "";
  }
};
