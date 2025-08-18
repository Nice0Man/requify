import React from "react";
import { Box, Typography, Stack, useTheme, alpha, Button } from "@mui/material";
import {
  Timeline,
  ErrorOutline,
  Refresh,
  DatasetLinked,
} from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";

interface EmptyStateChartProps {
  variant?: "loading" | "empty" | "error";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  height?: number | string;
  className?: string;
  onRetry?: () => void;
}

export const EmptyStateChart: React.FC<EmptyStateChartProps> = ({
  variant = "empty",
  title,
  description,
  icon,
  action,
  height = 320,
  className,
  onRetry,
}) => {
  const theme = useTheme();
  const t = i18n.t;

  const getDefaultContent = () => {
    switch (variant) {
      case "loading":
        return {
          icon: <DatasetLinked sx={{ fontSize: 48 }} />,
          title: t("chart.loading", "Загрузка данных..."),
          description: t("chart.loading.desc", "Пожалуйста, подождите"),
          color: theme.palette.primary.main,
        };
      case "error":
        return {
          icon: <ErrorOutline sx={{ fontSize: 48 }} />,
          title: t("chart.error", "Ошибка загрузки"),
          description: t(
            "chart.error.desc",
            "Не удалось загрузить данные графика"
          ),
          color: theme.palette.error.main,
        };
      case "empty":
      default:
        return {
          icon: <Timeline sx={{ fontSize: 48 }} />,
          title: t("chart.empty", "Нет данных"),
          description: t(
            "chart.empty.desc",
            "Данные для отображения графика отсутствуют"
          ),
          color: theme.palette.text.secondary,
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height,
        borderRadius: 3,
        border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.3),
        textAlign: "center",
        p: 4,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          borderColor: alpha(defaultContent.color, 0.3),
          backgroundColor: alpha(defaultContent.color, 0.02),
        },
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 280 }}>
        {/* Icon with gradient background */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              defaultContent.color,
              0.1
            )}, ${alpha(defaultContent.color, 0.05)})`,
            border: `1px solid ${alpha(defaultContent.color, 0.15)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: defaultContent.color,
            transition: "all 0.2s ease",
            "& .MuiSvgIcon-root": {
              fontSize: 40,
            },
          }}
        >
          {icon || defaultContent.icon}
        </Box>

        {/* Text Content */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: "1.125rem",
              mb: 1,
              letterSpacing: "0.02em",
            }}
          >
            {title || defaultContent.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              opacity: 0.8,
            }}
          >
            {description || defaultContent.description}
          </Typography>
        </Box>

        {/* Action Button */}
        {(action || (variant === "error" && onRetry)) && (
          <Box>
            {action || (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={onRetry}
                sx={{
                  borderColor: alpha(defaultContent.color, 0.3),
                  color: defaultContent.color,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  "&:hover": {
                    borderColor: defaultContent.color,
                    backgroundColor: alpha(defaultContent.color, 0.05),
                  },
                }}
              >
                {t("chart.retry", "Повторить")}
              </Button>
            )}
          </Box>
        )}

        {/* Loading animation for loading state */}
        {variant === "loading" && (
          <Box
            sx={{
              width: 40,
              height: 4,
              backgroundColor: alpha(defaultContent.color, 0.1),
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: `linear-gradient(90deg, transparent, ${defaultContent.color}, transparent)`,
                animation: "loading 1.5s infinite",
              },
              "@keyframes loading": {
                "0%": { left: "-100%" },
                "100%": { left: "100%" },
              },
            }}
          />
        )}
      </Stack>
    </Box>
  );
};
