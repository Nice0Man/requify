import React, { memo, useMemo, useCallback } from "react";
import {
  ListItemButton,
  ListItemIcon,
  Avatar,
  Badge,
  Box,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import type { User } from "@/entities/user";

// Мемоизированные цвета для предотвращения пересоздания
const SIDEBAR_COLORS = {
  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    hover: "#f1f5f9",
  },
  text: {
    primary: "#1e293b",
    secondary: "#475569",
    muted: "#64748b",
  },
  border: {
    light: "#e2e8f0",
    medium: "#cbd5e1",
  },
  accent: {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
} as const;

// Мемоизированные функции для роли пользователя
const getRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: "Администратор",
    project_manager: "Руководитель проекта",
    analyst: "Аналитик",
    developer: "Разработчик",
    tester: "Тестировщик",
    viewer: "Наблюдатель",
  };
  return roleLabels[role] || role;
};

const getRoleColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    admin: "#dc2626", // red-600
    project_manager: "#7c3aed", // violet-600
    analyst: "#059669", // emerald-600
    developer: "#2563eb", // blue-600
    tester: "#ea580c", // orange-600
    viewer: "#64748b", // slate-500
  };
  return roleColors[role] || SIDEBAR_COLORS.text.muted;
};

export interface UserProfileProps {
  user: User;
  isCollapsed: boolean;
  onSettings?: () => void;
  className?: string;
  sx?: any;
}

/**
 * Оптимизированный UserProfile с React.memo
 * Предотвращает ненужные ре-рендеры профиля пользователя
 */
export const UserProfile: React.FC<UserProfileProps> = memo(
  ({ user, isCollapsed, onSettings, className, sx }) => {
    const theme = useTheme();

    // Мемоизированное имя для отображения
    const displayName = useMemo(
      () => user.full_name || user.username || "Пользователь",
      [user.full_name, user.username]
    );

    // Мемоизированные данные роли
    const roleData = useMemo(
      () => ({
        label: getRoleLabel(user.role),
        color: getRoleColor(user.role),
      }),
      [user.role]
    );

    // Мемоизированный статус активности
    const isOnline = useMemo(() => user.is_active, [user.is_active]);

    // Мемоизированный обработчик клика по аватару - открывает настройки
    const handleAvatarClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        onSettings?.();
      },
      [onSettings]
    );

    // Мемоизированные стили основного контейнера
    const containerStyles = useMemo(
      () => ({
        px: isCollapsed ? 0 : 2,
        py: isCollapsed ? 1 : 2,
        mx: isCollapsed ? 0 : 0,
        width: isCollapsed ? 44 : "auto",
        maxWidth: isCollapsed ? 44 : "none",
        minHeight: isCollapsed ? 44 : 64,
        background: `linear-gradient(135deg, ${alpha(
          SIDEBAR_COLORS.background.secondary,
          0.3
        )} 0%, ${alpha(SIDEBAR_COLORS.background.primary, 0.8)} 100%)`,
        backdropFilter: "blur(10px)",
        boxShadow: `0 2px 8px ${alpha(SIDEBAR_COLORS.text.primary, 0.04)}`,
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "flex-start",
        ...sx,
      }),
      [isCollapsed, roleData.color, sx]
    );

    // Мемоизированные стили аватара
    const avatarStyles = useMemo(
      () => ({
        width: isCollapsed ? 32 : 40,
        height: isCollapsed ? 32 : 40,
        fontSize: isCollapsed ? "1rem" : "1.2rem",
        fontWeight: 600,
        background: user.avatar_url
          ? "transparent"
          : `linear-gradient(135deg, ${roleData.color} 0%, ${alpha(
              roleData.color,
              0.7
            )} 100%)`,
        color: user.avatar_url ? "inherit" : "white",
        border: `2px solid ${alpha(roleData.color, 0.2)}`,
        transition: "all 0.2s ease",
      }),
      [isCollapsed, user.avatar_url, roleData.color]
    );

    // Мемоизированный контент для расширенного режима
    const expandedContent = useMemo(
      () =>
        !isCollapsed && (
          <Box sx={{ flex: 1, minWidth: 0, m: 0 }}>
            {/* Primary content - имя пользователя */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: SIDEBAR_COLORS.text.primary,
                  fontSize: "0.9rem",
                  lineHeight: 1.2,
                  fontFamily: "inherit",
                }}
              >
                {displayName}
              </Box>
            </Box>
            
            {/* Secondary content - роль */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={roleData.label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.7rem",
                  bgcolor: alpha(roleData.color, 0.1),
                  color: roleData.color,
                  fontWeight: 500,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>
          </Box>
        ),
      [isCollapsed, displayName, roleData]
    );

    // Мемоизированная подсказка для клика
    const tooltipTitle = useMemo(
      () => isCollapsed ? "Открыть настройки" : "Настройки профиля",
      [isCollapsed]
    );

    // Контейнер с Paper для лучшего визуального отделения
    return (
      <Paper
        elevation={0}
        sx={{
          borderTop: `1px solid ${SIDEBAR_COLORS.border.light}`,
          mt: "auto",
          background: alpha(SIDEBAR_COLORS.background.secondary, 0.5),
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: isCollapsed ? "center" : "stretch",
          alignItems: "center",
          px: isCollapsed ? 0 : 0,
          py: isCollapsed ? 1 : 0,
        }}
      >
        <Tooltip title={tooltipTitle} placement="right">
          <ListItemButton className={className} sx={containerStyles} onClick={handleAvatarClick}>
            <ListItemIcon sx={{ minWidth: "auto", mr: isCollapsed ? 0 : 1.5 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: isOnline ? SIDEBAR_COLORS.accent.success : SIDEBAR_COLORS.text.muted,
                      border: `2px solid ${SIDEBAR_COLORS.background.primary}`,
                      boxShadow: SIDEBAR_COLORS.shadow.sm,
                    }}
                  />
                }
              >
                <Avatar src={user.avatar_url} sx={avatarStyles}>
                  {!user.avatar_url && (displayName.charAt(0).toUpperCase() || "U")}
                </Avatar>
              </Badge>
            </ListItemIcon>

            {expandedContent}
          </ListItemButton>
        </Tooltip>
      </Paper>
    );
  }
);

UserProfile.displayName = "UserProfile";
