/**
 * CompanyStatusBadge - Бейдж статуса компании (MUI версия)
 * UI компонент для отображения статуса компании с цветовой индикацией
 */

import { memo } from "react";
import { Chip, Box, Tooltip, alpha, useTheme } from "@mui/material";
import {
  CheckCircle as ActiveIcon,
  Block as InactiveIcon,
  Warning as SuspendedIcon,
  Schedule as PendingIcon,
} from "@mui/icons-material";
import { CompanyStatus } from "../model";
import { APP_COLORS } from "@/shared/styles/commonStyles";

// =============================================================================
// Types
// =============================================================================

export interface CompanyStatusBadgeProps {
  status: CompanyStatus;
  variant?: "filled" | "outlined" | "minimal";
  size?: "small" | "medium";
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

// =============================================================================
// Configurations
// =============================================================================

const STATUS_CONFIG = {
  active: {
    label: "Активная",
    icon: ActiveIcon,
    color: APP_COLORS.status.active,
    description: "Компания активна и функционирует",
  },
  inactive: {
    label: "Неактивная",
    icon: InactiveIcon,
    color: APP_COLORS.status.inactive,
    description: "Компания временно неактивна",
  },
  suspended: {
    label: "Заблокирована",
    icon: SuspendedIcon,
    color: APP_COLORS.status.failed,
    description: "Компания заблокирована администратором",
  },
  trial: {
    label: "Пробная",
    icon: PendingIcon,
    color: APP_COLORS.status.pending,
    description: "Компания в пробном периоде",
  },
  archived: {
    label: "Архивирована",
    icon: InactiveIcon,
    color: APP_COLORS.status.inactive,
    description: "Компания архивирована",
  },
} as const;

// =============================================================================
// Component
// =============================================================================

export const CompanyStatusBadge = memo(
  ({
    status,
    variant = "filled",
    size = "small",
    showIcon = true,
    showTooltip = true,
    className,
  }: CompanyStatusBadgeProps) => {
    const theme = useTheme();
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
    const IconComponent = config.icon;

    const getChipStyles = () => {
      const baseStyles = {
        fontWeight: 600,
        textTransform: "none" as const,
        height: size === "small" ? 24 : 32,
        fontSize: size === "small" ? "0.75rem" : "0.875rem",
        borderRadius: 2,
        "& .MuiChip-icon": {
          fontSize: size === "small" ? "0.875rem" : "1rem",
          marginLeft: "6px",
        },
      };

      switch (variant) {
        case "filled":
          return {
            ...baseStyles,
            backgroundColor: alpha(config.color, 0.12),
            color: config.color,
            border: `1px solid ${alpha(config.color, 0.2)}`,
            "& .MuiChip-icon": {
              ...baseStyles["& .MuiChip-icon"],
              color: config.color,
            },
          };

        case "outlined":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: config.color,
            border: `1px solid ${alpha(config.color, 0.3)}`,
            "& .MuiChip-icon": {
              ...baseStyles["& .MuiChip-icon"],
              color: config.color,
            },
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: config.color,
            border: "none",
            "& .MuiChip-icon": {
              ...baseStyles["& .MuiChip-icon"],
              color: config.color,
            },
          };

        default:
          return baseStyles;
      }
    };

    const chipElement = (
      <Chip
        icon={showIcon ? <IconComponent /> : undefined}
        label={config.label}
        size={size}
        sx={getChipStyles()}
        className={className}
      />
    );

    if (showTooltip) {
      return (
        <Tooltip
          title={config.description}
          arrow
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: theme.palette.grey[900],
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: 2,
                boxShadow: APP_COLORS.shadow.lg,
              },
            },
            arrow: {
              sx: {
                color: theme.palette.grey[900],
              },
            },
          }}
        >
          <Box component="span" sx={{ display: "inline-block" }}>
            {chipElement}
          </Box>
        </Tooltip>
      );
    }

    return chipElement;
  }
);
