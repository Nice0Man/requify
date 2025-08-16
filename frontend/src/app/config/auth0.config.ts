// Проверяем наличие обязательных переменных окружения
const isDevelopment = process.env.NODE_ENV === "development";
const isAuth0Enabled = process.env.REACT_APP_AUTH0_ENABLED === "true";

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

// Показываем информацию о режиме аутентификации
if (isDevelopment) {
  if (isAuth0Enabled) {
    if (!domain || !clientId) {
      console.info(
        "💡 Auth0 включен, но не настроен. Для настройки создайте .env.local файл с:\n" +
          "REACT_APP_AUTH0_ENABLED=true\n" +
          "REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com\n" +
          "REACT_APP_AUTH0_CLIENT_ID=your-client-id\n" +
          "REACT_APP_AUTH0_AUDIENCE=https://api.requify.com"
      );
    } else {
      console.info("✅ Auth0 включен и настроен");
    }
  } else {
    console.info("🔐 Используется базовый OAuth2 (Auth0 отключен)");
  }
}

export const auth0Config = {
  domain: domain || "localhost", // Fallback для локального демо
  clientId: clientId || "demo-local-client-id", // Fallback для локального демо
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || "https://api.requify.com",
  redirectUri: window.location.origin,
  scope: "openid profile email read:users",
};

export type Auth0Config = typeof auth0Config;

// Функция для проверки, следует ли использовать Auth0
export const shouldUseAuth0 = (): boolean => {
  return isAuth0Enabled;
};

// Функция для проверки корректности конфигурации (исправленная версия)
export const isAuth0Configured = (): boolean => {
  // Проверяем, что переменные окружения установлены и это НЕ демо-значения
  const hasRealEnvironmentVars = !!(
    process.env.REACT_APP_AUTH0_DOMAIN && 
    process.env.REACT_APP_AUTH0_CLIENT_ID &&
    process.env.REACT_APP_AUTH0_DOMAIN !== "localhost" &&
    process.env.REACT_APP_AUTH0_CLIENT_ID !== "demo-local-client-id"
  );

  // Auth0 настроен только если есть реальные значения (не демо)
  return hasRealEnvironmentVars;
};

// Функция для проверки, работает ли приложение с реальными учетными данными Auth0
export const hasRealAuth0Credentials = (): boolean => {
  const hasEnvironmentVars = !!(
    process.env.REACT_APP_AUTH0_DOMAIN && process.env.REACT_APP_AUTH0_CLIENT_ID
  );
  
  return (
    hasEnvironmentVars &&
    auth0Config.domain !== "localhost" &&
    auth0Config.clientId !== "demo-local-client-id"
  );
};

// Функция для проверки, работает ли приложение в демо-режиме
export const isDemoMode = (): boolean => {
  return !hasRealAuth0Credentials();
};

// Функция для проверки доступности Auth0 на бэкенде (будет использоваться с React Query)
export const shouldCheckAuth0Backend = (): boolean => {
  return hasRealAuth0Credentials();
};
