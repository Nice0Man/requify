import React from "react";
import { Alert, AlertTitle, Typography } from "@mui/material";
import { Security } from "@mui/icons-material";

/**
 * OAuth2 Authentication Status Banner
 * Отображает информацию о статусе OAuth2 аутентификации
 * Заменил Auth0StatusBanner после перехода на стандартный OAuth2
 */
export const OAuth2StatusBanner: React.FC = () => {
  return (
    <Alert severity="success" icon={<Security />}>
      <AlertTitle>🔐 Secure OAuth2 Authentication</AlertTitle>
      <Typography variant="body2">
        Используется современная OAuth2 аутентификация с автоматическим обновлением токенов.
        <br />
        Ваши данные защищены согласно стандартам безопасности.
      </Typography>
    </Alert>
  );
};

// Backward compatibility export
export const Auth0StatusBanner = OAuth2StatusBanner;
