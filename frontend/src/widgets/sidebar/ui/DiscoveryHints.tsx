import React from "react";
import {
  Box,
  Typography,
  Fade,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import { TouchApp, DragIndicator } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface DiscoveryHintsProps {
  show: boolean;
  onHide: () => void;
  isCollapsed: boolean;
}

/**
 * Компонент для показа подсказок о возможности перетаскивания
 * Реализует Phase 1: Initiation (Discoverability & Activation)
 */
export const DiscoveryHints: React.FC<DiscoveryHintsProps> = ({
  show,
  onHide,
  isCollapsed,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!show) return null;

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
          backdropFilter: "blur(1px)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          animation: "pulseGlow 2s ease-in-out",
          "@keyframes pulseGlow": {
            "0%, 100%": {
              boxShadow: `inset 0 0 20px ${alpha(
                theme.palette.primary.main,
                0.1
              )}`,
            },
            "50%": {
              boxShadow: `inset 0 0 30px ${alpha(
                theme.palette.primary.main,
                0.2
              )}`,
            },
          },
        }}
      >
        {/* Центральная подсказка */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            maxWidth: isCollapsed ? 200 : 300,
            textAlign: "center",
            background: alpha(theme.palette.background.paper, 0.95),
            borderRadius: 3,
            padding: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          {/* Анимированная иконка */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              animation: "bounce 1.5s ease-in-out",
              "@keyframes bounce": {
                "0%, 20%, 50%, 80%, 100%": {
                  transform: "translateY(0)",
                },
                "40%": {
                  transform: "translateY(-10px)",
                },
                "60%": {
                  transform: "translateY(-5px)",
                },
              },
            }}
          >
            <TouchApp
              sx={{
                fontSize: 32,
                color: theme.palette.primary.main,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </Box>

          {/* Текстовые подсказки */}
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              mb: 1,
            }}
          >
            {t("sidebar.discoverTitle", "Управление порядком")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            {t(
              "sidebar.discoverDescription",
              "Удерживайте элемент для изменения порядка"
            )}
          </Typography>

          {/* Визуальные подсказки жестов */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Tooltip title={t("sidebar.longPressHint", "Длинное нажатие")}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: 1,
                  borderRadius: 2,
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  animation: "shimmer 2s linear",
                  "@keyframes shimmer": {
                    "0%": { opacity: 0.7 },
                    "50%": { opacity: 1 },
                    "100%": { opacity: 0.7 },
                  },
                }}
              >
                <TouchApp
                  sx={{ fontSize: 16, color: theme.palette.primary.main }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t("sidebar.hold", "Удерживать")}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title={t("sidebar.dragHint", "Перетаскивание")}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: 1,
                  borderRadius: 2,
                  background: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(
                    theme.palette.secondary.main,
                    0.2
                  )}`,
                  animation: "shimmer 2s linear 0.5s",
                }}
              >
                <DragIndicator
                  sx={{ fontSize: 16, color: theme.palette.secondary.main }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t("sidebar.drag", "Тянуть")}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* Кнопка скрытия */}
          <IconButton
            onClick={onHide}
            size="small"
            sx={{
              mt: 1,
              backgroundColor: alpha(theme.palette.action.hover, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.action.hover, 0.2),
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              {t("common.close", "Закрыть")}
            </Typography>
          </IconButton>
        </Box>

        {/* Фоновые декоративные элементы */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `radial-gradient(circle, 
              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
              transparent 70%)`,
            animation: "float 3s ease-in-out",
            "@keyframes float": {
              "0%, 100%": { transform: "translate(0, 0)" },
              "50%": { transform: "translate(10px, -10px)" },
            },
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `radial-gradient(circle, 
              ${alpha(theme.palette.secondary.main, 0.1)} 0%, 
              transparent 70%)`,
            animation: "float 3s ease-in-out 1s",
          }}
        />
      </Box>
    </Fade>
  );
};
