import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Api,
  Security,
  CloudSync,
  GitHub,
  Chat,
  Assignment,
  Groups,
  Description,
} from "@mui/icons-material";
import type { IntegrationCardProps } from "../model/types";

const MotionCard = motion(Card);

// Мапинг иконок
const ICON_MAP = {
  Api,
  Security,
  CloudSync,
  GitHub,
  Chat,
  Assignment,
  Groups,
  Description,
} as const;

export const IntegrationCard: React.FC<IntegrationCardProps> = React.memo(
  ({
    integration,
    onClick,
    isVisible = true,
    blurLevel = 0,
    scale = 1,
    isDragging = false,
    className,
  }) => {
    const theme = useTheme();
    const IconComponent =
      ICON_MAP[integration.icon as keyof typeof ICON_MAP] || Api;

    const handleClick = () => {
      // Не обрабатываем клик во время drag или если карточка не видимая
      if (onClick && isVisible && !isDragging) {
        onClick(integration);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        onClick &&
        isVisible &&
        !isDragging
      ) {
        event.preventDefault();
        onClick(integration);
      }
    };

    // Динамические цвета на основе темы и категории
    const getCardColors = () => {
      const baseColor = integration.color || theme.palette.primary.main;

      return {
        // Простой градиентный фон как в AdvancedFeaturesSection - делаем светлее
        background: `linear-gradient(135deg, ${baseColor}08, ${baseColor}04)`,

        // Простая граница с цветом интеграции - делаем светлее
        border: `1px solid ${baseColor}20`,

        // Цвет для иконки и акцентов
        accentColor: baseColor,

        // Декоративный элемент blur - делаем светлее
        decorationBlur: `radial-gradient(circle, ${baseColor}12 0%, transparent 70%)`,
      };
    };

    const colors = getCardColors();

    // Цвета для бейджей
    const getBadgeColors = () => {
      if (integration.isPopular) {
        return {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: theme.palette.common.white,
        };
      }
      if (integration.isNew) {
        return {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: theme.palette.common.white,
        };
      }
      return {};
    };

    const badgeColors = getBadgeColors();

    // Определяем активность карточки (центральная или близкая к центру)
    const isActive = blurLevel === 0;
    const isNearActive = blurLevel < 1;

    return (
      <MotionCard
        className={className}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={isVisible ? 0 : -1}
        role="button"
        aria-label={`Интеграция с ${integration.title}: ${integration.description}`}
        whileHover={
          isVisible && isNearActive
            ? {
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 },
              }
            : {}
        }
        whileTap={
          isVisible && isNearActive
            ? {
                scale: 0.98,
                transition: { duration: 0.15 },
              }
            : {}
        }
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        sx={{
          height: 320,
          width: "100%",
          cursor: isVisible && isNearActive ? "pointer" : "default",
          borderRadius: 4, // Такой же как в AdvancedFeaturesSection
          background: colors.background,
          border: colors.border,
          position: "relative",
          overflow: "hidden",

          // Простые тени без glassmorphism - делаем светлее
          boxShadow: isActive
            ? `0 8px 25px ${colors.accentColor}25` // Уменьшаем прозрачность
            : isNearActive
            ? `0 4px 15px ${colors.accentColor}15` // Уменьшаем прозрачность
            : `0 2px 8px rgba(0,0,0,0.05)`, // Делаем светлее

          // Убираем агрессивное размытие, оставляем только opacity
          opacity: isActive ? 1 : isNearActive ? 0.9 : 0.7,
          transition: "all 0.3s ease",

          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: colors.accentColor,
            outlineOffset: 2,
          },

          "&:hover": {
            boxShadow: `0 12px 35px ${colors.accentColor}30`, // Делаем светлее
            border: `1px solid ${colors.accentColor}40`, // Делаем светлее
          },
        }}
      >
        {/* Декоративный blur элемент как в AdvancedFeaturesSection */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: colors.decorationBlur,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Enhanced Popular Badge */}
        {integration.isPopular && (
          <Chip
            label="🔥 Популярно"
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 3,
              background: badgeColors.background,
              color: badgeColors.color,
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 28,
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: `0 4px 12px ${colors.accentColor}20`, // Делаем светлее
              "& .MuiChip-label": {
                px: 1.5,
              },
            }}
          />
        )}

        {/* Enhanced New Badge */}
        {integration.isNew && (
          <Chip
            label="✨ Новое"
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 3,
              background: badgeColors.background,
              color: badgeColors.color,
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 28,
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: `0 4px 12px ${colors.accentColor}20`, // Делаем светлее
              "& .MuiChip-label": {
                px: 1.5,
              },
            }}
          />
        )}

        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 4,
            position: "relative",
            zIndex: 2,
            "&:last-child": { pb: 4 },
          }}
        >
          {/* Enhanced Icon Container */}
          <Box
            component={motion.div}
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${colors.accentColor}15 0%, ${colors.accentColor}25 100%)`, // Делаем светлее
              border: `1px solid ${colors.accentColor}20`, // Делаем светлее
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              position: "relative",
              boxShadow: `0 8px 20px ${colors.accentColor}20`, // Делаем светлее
            }}
          >
            <IconComponent
              sx={{
                fontSize: 36,
                color: colors.accentColor,
                position: "relative",
                zIndex: 2,
              }}
            />
          </Box>

          {/* Enhanced Content */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                fontSize: "1.3rem",
                lineHeight: 1.3,
                mb: 2,
                color: "text.primary",
              }}
            >
              {integration.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                mb: "auto",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {integration.description}
            </Typography>

            {/* Enhanced Connections Stats */}
            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: `1px solid ${colors.accentColor}15`, // Делаем светлее
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderRadius: 2,
                background: `${colors.accentColor}04`, // Делаем светлее
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: colors.accentColor,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {integration.connections}
              </Typography>

              {/* Enhanced connection indicator */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: colors.accentColor,
                  boxShadow: `0 0 8px ${colors.accentColor}40`, // Делаем светлее
                  position: "relative",

                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: theme.palette.common.white,
                    animation: "pulse 2s infinite",
                  },

                  "@keyframes pulse": {
                    "0%, 100%": {
                      opacity: 1,
                      transform: "translate(-50%, -50%) scale(1)",
                    },
                    "50%": {
                      opacity: 0.7,
                      transform: "translate(-50%, -50%) scale(1.2)",
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </MotionCard>
    );
  }
);

IntegrationCard.displayName = "IntegrationCard";
