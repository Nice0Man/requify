/**
 * RoleBadge - Бейдж роли (MUI версия)
 * UI компонент для отображения роли пользователя с цветовой индикацией по scope
 */

import React from "react";
import {
  Chip,
  Box,
  Tooltip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AdminPanelSettings as SystemIcon,
  Business as CompanyIcon,
  Domain as DepartmentIcon,
  Group as TeamIcon,
  Assignment as ProjectIcon,
  Person as UserIcon,
} from "@mui/icons-material";
import { Role, RoleScope, Permission } from "../model";
import { APP_COLORS, badgeStyles } from "@/shared/styles/commonStyles";

// =============================================================================
// Types
// =============================================================================

export interface RoleBadgeProps {
  role: Role & {
    permissions?: Permission[];
  };
  variant?: "filled" | "outlined" | "minimal";
  size?: "small" | "medium";
  showIcon?: boolean;
  showScope?: boolean;
  showTooltip?: boolean;
  className?: string;
}

// =============================================================================
// Configurations
// =============================================================================

const SCOPE_CONFIG = {
  system: {
    icon: SystemIcon,
    color: APP_COLORS.accent.error,
    label: "Система",
    description: "Системная роль с глобальными правами",
  },
  company: {
    icon: CompanyIcon,
    color: APP_COLORS.accent.primary,
    label: "Компания",
    description: "Роль в рамках компании",
  },
  department: {
    icon: DepartmentIcon,
    color: APP_COLORS.accent.purple,
    label: "Департамент",
    description: "Роль в рамках департамента",
  },
  team: {
    icon: TeamIcon,
    color: APP_COLORS.accent.success,
    label: "Команда",
    description: "Роль в рамках команды",
  },
  project: {
    icon: ProjectIcon,
    color: APP_COLORS.accent.info,
    label: "Проект",
    description: "Роль в рамках проекта",
  },
} as const;

const ROLE_NAMES = {
  // System roles
  super_admin: "Супер Администратор",
  system_admin: "Системный Администратор",
  system_auditor: "Системный Аудитор",

  // Company roles
  company_owner: "Владелец Компании",
  company_admin: "Администратор Компании",
  company_manager: "Менеджер Компании",
  company_user: "Пользователь Компании",

  // Department roles
  department_head: "Руководитель Департамента",
  department_manager: "Менеджер Департамента",
  department_member: "Сотрудник Департамента",

  // Team roles
  team_lead: "Лидер Команды",
  team_member: "Участник Команды",

  // Project roles
  project_manager: "Менеджер Проекта",
  project_lead: "Ведущий Проекта",
  project_member: "Участник Проекта",
  project_viewer: "Наблюдатель Проекта",
} as const;

// =============================================================================
// Component
// =============================================================================

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  variant = "filled",
  size = "small",
  showIcon = true,
  showScope = true,
  showTooltip = true,
  className,
}) => {
  const theme = useTheme();
  const scopeConfig =
    SCOPE_CONFIG[role.scope as keyof typeof SCOPE_CONFIG] ||
    SCOPE_CONFIG.company;
  const IconComponent = scopeConfig.icon;

  // Получение читаемого названия роли
  const getRoleDisplayName = (roleName: string): string => {
    return ROLE_NAMES[roleName as keyof typeof ROLE_NAMES] || roleName;
  };

  const roleDisplayName = getRoleDisplayName(role.name);

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
          backgroundColor: alpha(scopeConfig.color, 0.12),
          color: scopeConfig.color,
          border: `1px solid ${alpha(scopeConfig.color, 0.2)}`,
          "& .MuiChip-icon": {
            ...baseStyles["& .MuiChip-icon"],
            color: scopeConfig.color,
          },
        };

      case "outlined":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          color: scopeConfig.color,
          border: `1px solid ${alpha(scopeConfig.color, 0.3)}`,
          "& .MuiChip-icon": {
            ...baseStyles["& .MuiChip-icon"],
            color: scopeConfig.color,
          },
        };

      case "minimal":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          color: scopeConfig.color,
          border: "none",
          "& .MuiChip-icon": {
            ...baseStyles["& .MuiChip-icon"],
            color: scopeConfig.color,
          },
        };

      default:
        return baseStyles;
    }
  };

  // Формирование лейбла
  const getLabel = () => {
    if (showScope) {
      return `${roleDisplayName} • ${scopeConfig.label}`;
    }
    return roleDisplayName;
  };

  const chipElement = (
    <Chip
      icon={showIcon ? <IconComponent /> : undefined}
      label={getLabel()}
      size={size}
      sx={getChipStyles()}
      className={className}
    />
  );

  if (showTooltip) {
    const tooltipContent = (
      <Box>
        <Stack spacing={1}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "white" }}
            >
              {roleDisplayName}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha("white", 0.8) }}>
              {scopeConfig.description}
            </Typography>
          </Box>

          {role.description && (
            <Typography
              variant="body2"
              sx={{ color: alpha("white", 0.9), fontSize: "0.75rem" }}
            >
              {role.description}
            </Typography>
          )}

          {role.permissions && role.permissions.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ color: alpha("white", 0.7) }}>
                Права:{" "}
                {role.permissions
                  .slice(0, 3)
                  .map((p: Permission) => p.name)
                  .join(", ")}
                {role.permissions.length > 3 &&
                  ` и еще ${role.permissions.length - 3}`}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconComponent
              sx={{ fontSize: "0.875rem", color: alpha("white", 0.7) }}
            />
            <Typography variant="caption" sx={{ color: alpha("white", 0.7) }}>
              Область: {scopeConfig.label}
            </Typography>
          </Box>
        </Stack>
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
              maxWidth: 300,
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
};
