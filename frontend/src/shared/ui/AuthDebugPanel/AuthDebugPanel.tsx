import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Stack,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  ExpandMore,
  Refresh,
  Delete,
  Visibility,
  VisibilityOff,
  Security,
} from "@mui/icons-material";
import { oauth2API } from "@/shared/api/oauth2";

interface TokenInfo {
  key: string;
  value: string | null;
  exists: boolean;
  priority: string;
  isMain?: boolean;
}

export const AuthDebugPanel: React.FC = () => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showTokenValues, setShowTokenValues] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTokenData = () => {
    // Получаем только актуальные токены OAuth2
    const tokenList: TokenInfo[] = [
      {
        key: "access_token",
        value: localStorage.getItem("access_token"),
        exists: !!localStorage.getItem("access_token"),
        priority: "Основной токен доступа",
        isMain: true,
      },
      {
        key: "refresh_token",
        value: localStorage.getItem("refresh_token"),
        exists: !!localStorage.getItem("refresh_token"),
        priority: "Токен обновления",
        isMain: true,
      },
      {
        key: "token_expires_at",
        value: localStorage.getItem("token_expires_at"),
        exists: !!localStorage.getItem("token_expires_at"),
        priority: "Время истечения токена",
      },
    ];

    // Проверяем наличие устаревших токенов
    const legacyTokens = ["authToken", "refreshToken", "token", "user_profile"];
    legacyTokens.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        tokenList.push({
          key,
          value,
          exists: true,
          priority: "УСТАРЕВШИЙ - нужно удалить!",
        });
      }
    });

    setTokens(tokenList);
    setDebugInfo(oauth2API.getTokenDebugInfo());
  };

  useEffect(() => {
    loadTokenData();
    const interval = setInterval(loadTokenData, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const handleRefreshTokens = async () => {
    try {
      setIsRefreshing(true);
      await oauth2API.autoRefreshToken();
      loadTokenData();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearTokens = () => {
    oauth2API.clearTokens();
    loadTokenData();
  };

  const formatTokenValue = (value: string | null): string => {
    if (!value) return "Отсутствует";
    if (!showTokenValues) return `${value.substring(0, 20)}...`;
    return value;
  };

  const getTokenStatus = (
    exists: boolean,
    key: string
  ): "success" | "error" | "warning" => {
    if (!exists) return "error";
    if (
      key.includes("authToken") ||
      key.includes("refreshToken") ||
      key === "token"
    ) {
      return "warning"; // Устаревшие токены
    }
    return "success";
  };

  const getExpiryStatus = () => {
    if (!debugInfo?.expiryTime)
      return { color: "error", text: "Не установлено" };

    const minutes = debugInfo.minutesUntilExpiry;
    if (minutes <= 0)
      return { color: "error", text: `Истёк ${Math.abs(minutes)} мин назад` };
    if (minutes <= 5)
      return { color: "warning", text: `Истекает через ${minutes} мин` };
    if (minutes <= 60)
      return { color: "info", text: `Действителен ${minutes} мин` };

    const hours = Math.round(minutes / 60);
    return { color: "success", text: `Действителен ${hours} ч` };
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 2000,
        maxWidth: 450,
        minWidth: 350,
      }}
    >
      <Accordion
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          color: "white",
          "& .MuiAccordionSummary-root": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore sx={{ color: "white" }} />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Security fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              OAuth2 Debug Panel
            </Typography>
            <Chip
              size="small"
              label={
                debugInfo?.isAuthenticated ? "Авторизован" : "Не авторизован"
              }
              color={debugInfo?.isAuthenticated ? "success" : "error"}
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2}>
            {/* Статус аутентификации */}
            <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <Typography variant="subtitle2" gutterBottom>
                Статус аутентификации
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`Токен: ${debugInfo?.hasAccessToken ? "Есть" : "Нет"}`}
                  color={debugInfo?.hasAccessToken ? "success" : "error"}
                />
                <Chip
                  size="small"
                  label={`Refresh: ${
                    debugInfo?.hasRefreshToken ? "Есть" : "Нет"
                  }`}
                  color={debugInfo?.hasRefreshToken ? "success" : "error"}
                />
                {debugInfo?.hasExpiryTime && (
                  <Chip
                    size="small"
                    label={getExpiryStatus().text}
                    color={getExpiryStatus().color as any}
                  />
                )}
                <Chip
                  size="small"
                  label={`Обновить: ${debugInfo?.shouldRefresh ? "Да" : "Нет"}`}
                  color={debugInfo?.shouldRefresh ? "warning" : "default"}
                />
              </Stack>
            </Paper>

            {/* Показать устаревшие токены если есть */}
            {tokens.some((t) => !t.isMain && t.exists) && (
              <Alert
                severity="warning"
                sx={{ bgcolor: "rgba(255, 152, 0, 0.1)" }}
              >
                Обнаружены устаревшие токены! Рекомендуется очистить все токены.
              </Alert>
            )}

            {/* Список токенов */}
            <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2">
                  Токены в localStorage
                </Typography>
                <Tooltip
                  title={
                    showTokenValues ? "Скрыть значения" : "Показать значения"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() => setShowTokenValues(!showTokenValues)}
                    sx={{ color: "white" }}
                  >
                    {showTokenValues ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Stack spacing={1}>
                {tokens.map((token) => (
                  <Box key={token.key}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {token.key}
                      </Typography>
                      <Chip
                        size="small"
                        label={token.exists ? "Валидный" : "Отсутствует"}
                        color={getTokenStatus(token.exists, token.key)}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {formatTokenValue(token.value)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      {token.priority}
                    </Typography>
                    {token.key !== tokens[tokens.length - 1]?.key && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Отладочная информация */}
            {debugInfo && (
              <Paper
                sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Детальная информация
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(
                    {
                      isAuthenticated: debugInfo.isAuthenticated,
                      shouldRefresh: debugInfo.shouldRefresh,
                      expiryTime: debugInfo.expiryTime,
                      minutesUntilExpiry: debugInfo.minutesUntilExpiry,
                      hasAccessToken: debugInfo.hasAccessToken,
                      hasRefreshToken: debugInfo.hasRefreshToken,
                    },
                    null,
                    2
                  )}
                </Typography>
              </Paper>
            )}

            {/* Действия */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={handleRefreshTokens}
                disabled={!debugInfo?.hasRefreshToken || isRefreshing}
                sx={{ color: "white", borderColor: "white" }}
              >
                {isRefreshing ? "Обновление..." : "Обновить токены"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Delete />}
                onClick={handleClearTokens}
                color="error"
                sx={{ borderColor: "red", color: "red" }}
              >
                Очистить всё
              </Button>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
