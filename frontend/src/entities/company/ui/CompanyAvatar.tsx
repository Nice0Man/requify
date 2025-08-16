/**
 * CompanyAvatar - Аватар компании (MUI версия)
 * UI компонент для отображения логотипа/аватара компании
 */

import React from "react";
import { Avatar, Box, Badge, Tooltip, alpha, useTheme } from "@mui/material";
import {
  Business as BusinessIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { Company, isCompanyActive, CompanyWithDetails } from "../model";
import {
  APP_COLORS,
  createGradientBackground,
  createGlowEffect,
} from "@/shared/styles/commonStyles";

// =============================================================================
// Types
// =============================================================================

export interface CompanyAvatarProps {
  company: CompanyWithDetails;
  size?: "small" | "medium" | "large" | "xl";
  variant?: "circular" | "rounded" | "square";
  showStatus?: boolean;
  showVerified?: boolean;
  showTooltip?: boolean;
  onClick?: (company: Company) => void;
  className?: string;
}

// =============================================================================
// Size configurations
// =============================================================================

const SIZE_CONFIG = {
  small: {
    width: 32,
    height: 32,
    fontSize: "0.875rem",
    borderRadius: 1,
    badgeSize: 12,
  },
  medium: {
    width: 48,
    height: 48,
    fontSize: "1rem",
    borderRadius: 2,
    badgeSize: 16,
  },
  large: {
    width: 64,
    height: 64,
    fontSize: "1.25rem",
    borderRadius: 2,
    badgeSize: 20,
  },
  xl: {
    width: 80,
    height: 80,
    fontSize: "1.5rem",
    borderRadius: 3,
    badgeSize: 24,
  },
} as const;

// =============================================================================
// Component
// =============================================================================

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({
  company,
  size = "medium",
  variant = "rounded",
  showStatus = true,
  showVerified = true,
  showTooltip = true,
  onClick,
  className,
}) => {
  const theme = useTheme();
  const isActive = isCompanyActive(company);
  const sizeConfig = SIZE_CONFIG[size];

  // Генерация инициалов компании
  const companyInitials = company.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Определение радиуса скругления
  const getBorderRadius = () => {
    switch (variant) {
      case "circular":
        return "50%";
      case "square":
        return "4px";
      case "rounded":
      default:
        return `${sizeConfig.borderRadius * 4}px`;
    }
  };

  // Стили аватара
  const avatarStyles = {
    width: sizeConfig.width,
    height: sizeConfig.height,
    fontSize: sizeConfig.fontSize,
    fontWeight: 700,
    borderRadius: getBorderRadius(),
    background: company.branding?.logo_url
      ? "transparent"
      : createGradientBackground(
          APP_COLORS.accent.primary,
          APP_COLORS.accent.purple
        ),
    border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
    cursor: onClick ? "pointer" : "default",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ...(onClick && {
      "&:hover": {
        transform: "translateY(-2px)",
        ...createGlowEffect(APP_COLORS.accent.primary),
      },
    }),
    opacity: isActive ? 1 : 0.6,
  };

  // Элемент аватара
  const avatarElement = (
    <Avatar
      src={company.branding?.logo_url}
      sx={avatarStyles}
      onClick={onClick ? () => onClick(company) : undefined}
      className={className}
    >
      {!company.branding?.logo_url &&
        (company.name.length > 0 ? companyInitials : <BusinessIcon />)}
    </Avatar>
  );

  // Обертка с бейджами
  let wrappedAvatar = avatarElement;

  // Добавление статусного бейджа
  if (showStatus) {
    const statusColor = isActive
      ? APP_COLORS.status.active
      : APP_COLORS.status.inactive;

    wrappedAvatar = (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <Box
            sx={{
              width: sizeConfig.badgeSize,
              height: sizeConfig.badgeSize,
              borderRadius: "50%",
              backgroundColor: statusColor,
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: APP_COLORS.shadow.sm,
            }}
          />
        }
      >
        {wrappedAvatar}
      </Badge>
    );
  }

  // Добавление бейджа верификации
  if (showVerified && company.subscription?.status === "active") {
    wrappedAvatar = (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        badgeContent={
          <Box
            sx={{
              width: sizeConfig.badgeSize,
              height: sizeConfig.badgeSize,
              borderRadius: "50%",
              backgroundColor: APP_COLORS.accent.success,
              border: `2px solid ${theme.palette.background.paper}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: APP_COLORS.shadow.sm,
            }}
          >
            <VerifiedIcon
              sx={{
                fontSize: sizeConfig.badgeSize * 0.6,
                color: "white",
              }}
            />
          </Box>
        }
      >
        {wrappedAvatar}
      </Badge>
    );
  }

  // Добавление тултипа
  if (showTooltip) {
    const tooltipContent = (
      <Box>
        <Box sx={{ fontWeight: 600, mb: 0.5 }}>{company.name}</Box>
        {company.description && (
          <Box sx={{ fontSize: "0.75rem", opacity: 0.9, maxWidth: 200 }}>
            {company.description}
          </Box>
        )}
        <Box sx={{ fontSize: "0.75rem", opacity: 0.7, mt: 0.5 }}>
          Статус: {isActive ? "Активная" : "Неактивная"}
          {company.subscription?.status === "active" && " • Верифицирована"}
        </Box>
      </Box>
    );

    return (
      <Tooltip
        title={tooltipContent}
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: theme.palette.grey[900],
              borderRadius: 2,
              boxShadow: APP_COLORS.shadow.lg,
              p: 1.5,
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
          {wrappedAvatar}
        </Box>
      </Tooltip>
    );
  }

  return wrappedAvatar;
};
