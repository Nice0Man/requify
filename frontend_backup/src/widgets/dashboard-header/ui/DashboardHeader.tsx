import React, { memo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Box,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import {
  useDashboardStyleSystem,
  DASHBOARD_TOKENS,
} from "@/shared/styles";
import { ErrorBoundary } from "@/shared/ui";
import type { DashboardHeaderProps } from "../model/types";

/**
 * DashboardHeader - шапка дашборда
 * Полная поддержка Context7 и всех режимов дашборда
 */
export const DashboardHeader = memo<DashboardHeaderProps>(({
  mode = "detailed",
  layout = "grid",
  density = "comfortable",
  title = "Dashboard",
  showRefresh = true,
  isRefreshing = false,
  onRefresh,
  showNotifications = true,
  notificationCount = 0,
  onNotificationsClick,
  showSettings = true,
  onSettingsClick,
  showUserProfile = true,
  user,
  onUserProfileClick,
  actions = [],
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const styleSystem = useDashboardStyleSystem(mode, layout, density);
  
  const isCompact = mode === "minimal" || mode === "compact";

  return (
    <ErrorBoundary>
      <AppBar
        position="static"
        elevation={0}
        className={className}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          color: theme.palette.text.primary,
          ...sx,
        }}  
      >
        <Toolbar
          variant={isCompact ? "dense" : "regular"}
          sx={{
            minHeight: isCompact ? 48 : 64,
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {/* Логотип и заголовок */}
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Avatar
              sx={{
                bgcolor: DASHBOARD_TOKENS.colors.dashboard.primary,
                width: isCompact ? 32 : 40,
                height: isCompact ? 32 : 40,
              }}
            >
              <DashboardIcon fontSize={isCompact ? "small" : "medium"} />
            </Avatar>
            
            <Typography
              variant={isCompact ? "h6" : "h5"}
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Действия */}
          <Box display="flex" alignItems="center" gap={0.5}>
            {/* Кастомные действия */}
            {actions.map((action) => (
              <Tooltip key={action.id} title={action.label}>
                <IconButton
                  size={isCompact ? "small" : "medium"}
                  onClick={action.onClick}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    },
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}

            {/* Обновление */}
            {showRefresh && onRefresh && (
              <Tooltip title="Обновить">
                <IconButton
                  size={isCompact ? "small" : "medium"}
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    },
                  }}
                >
                  <RefreshIcon 
                    sx={{
                      animation: isRefreshing ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}

            {/* Уведомления */}
            {showNotifications && onNotificationsClick && (
              <Tooltip title="Уведомления">
                <IconButton
                  size={isCompact ? "small" : "medium"}
                  onClick={onNotificationsClick}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    },
                  }}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Настройки */}
            {showSettings && onSettingsClick && (
              <Tooltip title="Настройки">
                <IconButton
                  size={isCompact ? "small" : "medium"}
                  onClick={onSettingsClick}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    },
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Профиль пользователя */}
            {showUserProfile && user && (
              <Tooltip title={user.name}>
                <IconButton
                  size={isCompact ? "small" : "medium"}
                  onClick={onUserProfileClick}
                  sx={{
                    ml: 1,
                    p: 0,
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    sx={{
                      width: isCompact ? 28 : 32,
                      height: isCompact ? 28 : 32,
                      fontSize: isCompact ? "0.75rem" : "0.875rem",
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </ErrorBoundary>
  );
});

DashboardHeader.displayName = "DashboardHeader"; 