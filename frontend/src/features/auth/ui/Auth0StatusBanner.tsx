import React from "react";
import { Alert, AlertTitle, Box, Typography, Link } from "@mui/material";
import { Warning, CheckCircle, Error } from "@mui/icons-material";
import { useAuth0Status } from "../model/useAuthQuery";
import { hasRealAuth0Credentials, isDemoMode } from "@/app/config/auth0.config";
import { useTranslation } from "react-i18next";

export const Auth0StatusBanner: React.FC = () => {
  const hasRealCredentials = hasRealAuth0Credentials();
  const isDemo = isDemoMode();
  const { data: backendStatus, isLoading, error } = useAuth0Status();
  const { t } = useTranslation();
  
  // Если работаем в демо-режиме, показываем соответствующее сообщение
  if (isDemo) {
    return (
      <Alert severity="info" icon={<Warning />}>
        <AlertTitle>{t("💡 Auth0 в демо-режиме")}</AlertTitle>
        <Typography variant="body2">
          {t("Приложение работает с тестовыми данными Auth0.")}
          <br />
          {t("Для полной функциональности настройте реальные учетные данные Auth0.")}
        </Typography>
      </Alert>
    );
  }
  
  // Если есть реальные учетные данные, проверяем бэкенд
  if (hasRealCredentials) {
    if (isLoading) {
      return (
        <Alert severity="info" icon={<Warning />}>
          <AlertTitle>{t("Проверка Auth0...")}</AlertTitle>
          {t("Проверяется статус Auth0 на сервере...")}
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert severity="error" icon={<Error />}>
          <AlertTitle>{t("Ошибка проверки Auth0")}</AlertTitle>
          {t(
            "Не удалось проверить статус Auth0 на сервере. Проверьте подключение к API."
          )}
        </Alert>
      );
    }

    if (backendStatus?.enabled) {
      return (
        <Alert severity="success" icon={<CheckCircle />}>
          <AlertTitle>{t("✅ Auth0 настроен")}</AlertTitle>
          <Typography variant="body2">
            {t("Фронтенд и бэкенд готовы к работе с Auth0")}
            <br />
            Domain: <strong>{backendStatus.domain}</strong>
            <br />
            Audience: <strong>{backendStatus.audience}</strong>
          </Typography>
        </Alert>
      );
    } else {
      return (
        <Alert severity="warning" icon={<Warning />}>
          <AlertTitle>{t("⚠️ Auth0 отключен на сервере")}</AlertTitle>
          <Typography variant="body2">
            {t(
              "Фронтенд настроен, но бэкенд сообщает что Auth0 отключен. Проверьте настройки сервера."
            )}
          </Typography>
        </Alert>
      );
    }
  }

  // Этот случай не должен произойти при правильной настройке
  return null;
};
