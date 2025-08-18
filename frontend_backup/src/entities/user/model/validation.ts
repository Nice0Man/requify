import type { UserRole } from "./types";
import { USER_ROLES } from "./types";
import { useTranslation } from "react-i18next";

// Функции валидации для пользователя
export const validateUserName = (name: string): string | null => {
  const { t } = useTranslation();
  if (!name || name.length < 2) {
    return t("user.validation.nameTooShort");
  }
  if (name.length > 50) {
    return t("user.validation.nameTooLong");
  }
  return null;
};

export const validateUserEmail = (email: string): string | null => {
  const { t } = useTranslation();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return t("user.validation.invalidEmail");
  }
  return null;
};

export const validateUserRole = (role: string): string | null => {
  const { t } = useTranslation();
  if (!USER_ROLES.includes(role as UserRole)) {
    return t("user.validation.invalidRole");
  }
  return null;
};

export const validateUserPassword = (password: string): string | null => {
  const { t } = useTranslation();
  if (!password || password.length < 6) {
    return t("user.validation.invalidPassword");
  }
  return null;
};

// Валидация создания пользователя
export const validateUserCreate = (data: {
  name: string;
  email: string;
  role: string;
  password: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const nameError = validateUserName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateUserEmail(data.email);
  if (emailError) errors.email = emailError;

  const roleError = validateUserRole(data.role);
  if (roleError) errors.role = roleError;

  const passwordError = validateUserPassword(data.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

// Валидация обновления пользователя
export const validateUserUpdate = (data: {
  name?: string;
  email?: string;
  role?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.name !== undefined) {
    const nameError = validateUserName(data.name);
    if (nameError) errors.name = nameError;
  }

  if (data.email !== undefined) {
    const emailError = validateUserEmail(data.email);
    if (emailError) errors.email = emailError;
  }

  if (data.role !== undefined) {
    const roleError = validateUserRole(data.role);
    if (roleError) errors.role = roleError;
  }

  return errors;
};
