import React, { useState, useCallback, useMemo, memo } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
  Button,
  useTheme,
  alpha,
  Tooltip,
  InputBase,
} from "@mui/material";
import {
  AccountCircle,
  Settings,
  Logout,
  Notifications,
  LightMode,
  DarkMode,
  Help,
  Add,
  Search,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/model/useAuth";
import { useNavigate } from "react-router-dom";
import {
  useTheme as useThemeMode,
  useLoadingState,
} from "@/shared/contexts/PerformanceContext";
import {
  useRenderTracker,
  usePerformanceMeasure,
  useDebounced,
} from "@/shared/hooks/usePerformanceOptimizations";
import i18n from "@/shared/lib/i18n";

interface HeaderWidgetProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

// Optimized Header Widget with performance monitoring
export const HeaderWidget: React.FC<HeaderWidgetProps> = memo(
  ({ onThemeToggle, isDarkMode = false }) => {
    // Performance monitoring
    useRenderTracker("HeaderWidget");
    usePerformanceMeasure("HeaderWidget");

    // Theme and state management
    const muiTheme = useTheme();
    const themeMode = useThemeMode();
    const { t } = i18n;
    const { isLoading } = useLoadingState();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State management with memoized values
    const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
      null
    );
    const [actionsMenuAnchor, setActionsMenuAnchor] =
      useState<null | HTMLElement>(null);
    const [notificationsAnchor, setNotificationsAnchor] =
      useState<null | HTMLElement>(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    // Memoized computed values
    const isUserMenuOpen = useMemo(
      () => Boolean(userMenuAnchor),
      [userMenuAnchor]
    );
    const isActionsMenuOpen = useMemo(
      () => Boolean(actionsMenuAnchor),
      [actionsMenuAnchor]
    );
    const isNotificationsOpen = useMemo(
      () => Boolean(notificationsAnchor),
      [notificationsAnchor]
    );

    // Debounced search value for performance
    const debouncedSearchValue = useDebounced(searchValue, 300);

    // Memoized event handlers
    const handleUserMenuOpen = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchor(event.currentTarget);
      },
      []
    );

    const handleActionsMenuOpen = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        setActionsMenuAnchor(event.currentTarget);
      },
      []
    );

    const handleNotificationsOpen = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        setNotificationsAnchor(event.currentTarget);
      },
      []
    );

    const handleMenuClose = useCallback(() => {
      setUserMenuAnchor(null);
      setActionsMenuAnchor(null);
      setNotificationsAnchor(null);
    }, []);

    const handleLogout = async () => {
      try {
        await logout();
        navigate("/auth");
      } catch (error) {
        console.error("Logout failed:", error);
      }
      handleMenuClose();
    };

    const quickActions = [
      {
        label: t("actions.newProject", "Новый проект"),
        icon: Add,
        action: () => navigate("/projects/new"),
        color: muiTheme.palette.primary.main,
      },
      {
        label: t("actions.addRequirement", "Добавить требование"),
        icon: Add,
        action: () => navigate("/requirements/new"),
        color: muiTheme.palette.success.main,
      },
      {
        label: t("actions.createRelease", "Создать релиз"),
        icon: Add,
        action: () => navigate("/releases/new"),
        color: muiTheme.palette.info.main,
      },
    ];

    const mockNotifications = [
      {
        id: 1,
          title: "Новое требование",
        message: "REQ-123 требует вашего внимания",
        time: "5 мин назад",
      },
      {
        id: 2,
        title: "Обновление проекта",
        message: "Проект Alpha обновлен",
        time: "1 час назад",
      },
      {
        id: 3,
        title: "Релиз готов",
        message: "Релиз v1.2.0 готов к развертыванию",
        time: "2 часа назад",
      },
    ];

    return (
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: alpha(muiTheme.palette.background.paper, 0.95),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
          color: muiTheme.palette.text.primary,
          // Убираем zIndex так как теперь header часть layout flow
          transition: "all 0.3s ease",
          boxShadow: `0 4px 20px ${alpha(muiTheme.palette.common.black, 0.06)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 3, minHeight: 64 }}>
          {/* Левая часть - поиск */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              maxWidth: 500,
            }}
          >
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: 400,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  backgroundColor: alpha(
                    muiTheme.palette.background.default,
                    0.6
                  ),
                  border: `1px solid ${alpha(
                    muiTheme.palette.divider,
                    searchFocused ? 0.3 : 0.1
                  )}`,
                  "&:hover": {
                    backgroundColor: alpha(
                      muiTheme.palette.background.default,
                      0.8
                    ),
                  },
                  transition: "all 0.2s ease",
                  width: "100%",
                  minWidth: 300,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    color: muiTheme.palette.text.secondary,
                    zIndex: 1,
                  }}
                >
                  <Search fontSize="small" />
                </Box>
                <InputBase
                  placeholder="Поиск проектов, требований, релизов..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-input": {
                      padding: "12px 16px 12px 48px",
                      fontSize: "0.95rem",
                      color: muiTheme.palette.text.primary,
                      "&::placeholder": {
                        color: muiTheme.palette.text.secondary,
                        opacity: 0.8,
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Правая часть - действия */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Быстрое создание */}
            <Tooltip title="Создать">
              <IconButton
                onClick={handleActionsMenuOpen}
                sx={{
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
                  color: muiTheme.palette.primary.main,
                  width: 40,
                  height: 40,
                  "&:hover": {
                    backgroundColor: alpha(muiTheme.palette.primary.main, 0.2),
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Переключатель темы */}
            <Tooltip title={isDarkMode ? "Светлая тема" : "Темная тема"}>
              <IconButton
                onClick={onThemeToggle}
                sx={{
                  color: muiTheme.palette.text.secondary,
                  width: 40,
                  height: 40,
                  "&:hover": {
                    backgroundColor: alpha(muiTheme.palette.action.hover, 0.1),
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {isDarkMode ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Уведомления */}
            <Tooltip title="Уведомления">
              <IconButton
                onClick={handleNotificationsOpen}
                sx={{
                  color: muiTheme.palette.text.secondary,
                  width: 40,
                  height: 40,
                  "&:hover": {
                    backgroundColor: alpha(muiTheme.palette.action.hover, 0.1),
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Badge
                  badgeContent={mockNotifications.length}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <Notifications fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Аватар пользователя */}
            <Tooltip title="Профиль">
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5, ml: 1 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    border: `2px solid ${alpha(
                      muiTheme.palette.primary.main,
                      0.1
                    )}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Меню пользователя */}
          <Menu
            anchorEl={userMenuAnchor}
            open={isUserMenuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 12,
              sx: {
                mt: 1.5,
                minWidth: 240,
                borderRadius: 3,
                background: alpha(muiTheme.palette.background.paper, 0.95),
                backdropFilter: "blur(20px)",
                border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
                boxShadow: `0 12px 32px ${alpha(
                  muiTheme.palette.common.black,
                  0.12
                )}`,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* Информация о пользователе */}
            <Box sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user?.username || "Пользователь"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role || "Роль не определена"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            <MenuItem
              onClick={() => navigate("/settings/profile")}
              sx={{
                py: 1.5,
                px: 3,
                "&:hover": {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Профиль</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => navigate("/settings")}
              sx={{
                py: 1.5,
                px: 3,
                "&:hover": {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Настройки</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => navigate("/help")}
              sx={{
                py: 1.5,
                px: 3,
                "&:hover": {
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon>
                <Help fontSize="small" />
              </ListItemIcon>
              <ListItemText>Помощь</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                px: 3,
                color: muiTheme.palette.error.main,
                "&:hover": {
                  backgroundColor: alpha(muiTheme.palette.error.main, 0.04),
                },
              }}
            >
              <ListItemIcon>
                <Logout
                  fontSize="small"
                  sx={{ color: muiTheme.palette.error.main }}
                />
              </ListItemIcon>
              <ListItemText>Выход</ListItemText>
            </MenuItem>
          </Menu>

          {/* Меню быстрых действий */}
          <Menu
            anchorEl={actionsMenuAnchor}
            open={isActionsMenuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 12,
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 3,
                background: alpha(muiTheme.palette.background.paper, 0.95),
                backdropFilter: "blur(20px)",
                border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
                boxShadow: `0 12px 32px ${alpha(
                  muiTheme.palette.common.black,
                  0.12
                )}`,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {quickActions.map((action, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  action.action();
                  handleMenuClose();
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  "&:hover": {
                    backgroundColor: alpha(action.color, 0.04),
                  },
                }}
              >
                <ListItemIcon>
                  <action.icon fontSize="small" sx={{ color: action.color }} />
                </ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>

          {/* Меню уведомлений */}
          <Menu
            anchorEl={notificationsAnchor}
            open={isNotificationsOpen}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 12,
              sx: {
                mt: 1.5,
                minWidth: 360,
                maxWidth: 400,
                maxHeight: 480,
                borderRadius: 3,
                background: alpha(muiTheme.palette.background.paper, 0.95),
                backdropFilter: "blur(20px)",
                border: `1px solid ${alpha(muiTheme.palette.divider, 0.08)}`,
                boxShadow: `0 12px 32px ${alpha(
                  muiTheme.palette.common.black,
                  0.12
                )}`,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${alpha(
                  muiTheme.palette.divider,
                  0.1
                )}`,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Уведомления
              </Typography>
            </Box>

            {mockNotifications.map((notification) => (
              <MenuItem
                key={notification.id}
                sx={{
                  py: 2,
                  px: 3,
                  borderBottom: `1px solid ${alpha(
                    muiTheme.palette.divider,
                    0.05
                  )}`,
                  alignItems: "flex-start",
                  "&:hover": {
                    backgroundColor: alpha(muiTheme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))}

            <Box
              sx={{
                p: 2,
                textAlign: "center",
                borderTop: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
              }}
            >
              <Button
                variant="text"
                color="primary"
                onClick={() => navigate("/notifications")}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Показать все уведомления
              </Button>
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>
    );
  }
);

HeaderWidget.displayName = "HeaderWidget";
