import React, { useState, createContext, useContext, useCallback } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  Collapse,
  Badge,
  Avatar,
  Stack,
  Chip,
  Fade,
  Zoom,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard,
  FolderOpen,
  Assignment,
  RocketLaunch,
  BugReport,
  Analytics,
  Settings,
  ExpandLess,
  ExpandMore,
  People,
  AdminPanelSettings,
  Notifications,
  AddCircle,
  MenuOpen,
  Menu,
  LogoutOutlined,
  PersonOutlined,
  HomeOutlined,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  color?: string;
  badge?: number;
  children?: SidebarItem[];
  divider?: boolean;
}

// Константы размеров
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 80;

// Контекст для управления состоянием сайдбара
interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

// Провайдер контекста сайдбара
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapse,
        isMobileOpen,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

const SidebarContent: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, toggleCollapse, closeMobile } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>(["projects"]);

  // Определяем showText на уровне компонента
  const showText = !isCollapsed || mobile;

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Панель управления",
      icon: Dashboard,
      path: "/dashboard",
      color: theme.palette.primary.main,
    },
    {
      id: "projects",
      label: "Проекты",
      icon: FolderOpen,
      color: theme.palette.secondary.main,
      badge: 3,
      children: [
        {
          id: "projects-all",
          label: "Все проекты",
          icon: FolderOpen,
          path: "/projects",
          color: theme.palette.secondary.main,
        },
        {
          id: "projects-new",
          label: "Создать проект",
          icon: AddCircle,
          path: "/projects/new",
          color: theme.palette.success.main,
        },
      ],
    },
    {
      id: "requirements",
      label: "Требования",
      icon: Assignment,
      path: "/requirements",
      color: theme.palette.success.main,
      badge: 12,
    },
    {
      id: "releases",
      label: "Релизы",
      icon: RocketLaunch,
      path: "/releases",
      color: theme.palette.info.main,
    },
    {
      id: "testing",
      label: "Тестирование",
      icon: BugReport,
      path: "/testing",
      color: theme.palette.warning.main,
      badge: 2,
    },
    {
      id: "reports",
      label: "Отчеты",
      icon: Analytics,
      path: "/reports",
      color: theme.palette.error.main,
    },
    {
      id: "divider-1",
      label: "",
      icon: () => null,
      divider: true,
    },
    {
      id: "admin",
      label: "Администрирование",
      icon: AdminPanelSettings,
      path: "/admin",
      color: theme.palette.warning.main,
    },
    {
      id: "settings",
      label: "Настройки",
      icon: Settings,
      path: "/settings",
      color: theme.palette.grey[600],
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.divider) return;

    if (item.children && (!isCollapsed || mobile)) {
      const isExpanded = expandedItems.includes(item.id);
      setExpandedItems((prev) =>
        isExpanded ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
      if (mobile) {
        closeMobile();
      }
    } else if (item.children && isCollapsed && !mobile) {
      // В свернутом режиме переходим к первому дочернему элементу
      const firstChild = item.children[0];
      if (firstChild?.path) {
        navigate(firstChild.path);
      }
    }
  };

  const isItemActive = (path?: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const isParentActive = (item: SidebarItem) => {
    if (item.path && isItemActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isItemActive(child.path));
    }
    return false;
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    if (item.divider) {
      return (
        <Divider
          key={item.id}
          sx={{
            my: 2,
            mx: 2,
            opacity: isCollapsed && !mobile ? 0 : 0.6,
            transition: "opacity 0.3s ease",
          }}
        />
      );
    }

    const Icon = item.icon;
    const hasChildren = Boolean(item.children);
    const isExpanded = expandedItems.includes(item.id);
    const isActive = isParentActive(item);

    return (
      <Box key={item.id}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <Tooltip
            title={isCollapsed && !mobile ? item.label : ""}
            placement="right"
            disableHoverListener={showText}
            arrow
          >
            <ListItemButton
              onClick={() => handleItemClick(item)}
              sx={{
                mx: isCollapsed && !mobile ? 1.5 : 2,
                borderRadius: 2.5,
                minHeight: 48,
                px: isCollapsed && !mobile ? 1.5 : 2,
                py: 1,
                position: "relative",
                overflow: "hidden",
                backgroundColor: isActive
                  ? alpha(item.color || theme.palette.primary.main, 0.15)
                  : "transparent",
                border: isActive
                  ? `2px solid ${alpha(
                      item.color || theme.palette.primary.main,
                      0.3
                    )}`
                  : "2px solid transparent",
                "&:hover": {
                  backgroundColor: alpha(
                    item.color || theme.palette.primary.main,
                    0.1
                  ),
                  transform: "translateX(4px)",
                  "&::before": {
                    opacity: 1,
                  },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  backgroundColor: item.color || theme.palette.primary.main,
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.2s ease",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isCollapsed && !mobile ? 0 : 40,
                  mr: isCollapsed && !mobile ? 0 : 2,
                  color: isActive
                    ? item.color || theme.palette.primary.main
                    : theme.palette.text.secondary,
                  transition: "all 0.3s ease",
                }}
              >
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  invisible={!item.badge}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      height: 18,
                      minWidth: 18,
                      transform:
                        isCollapsed && !mobile
                          ? "scale(0.8) translate(50%, -50%)"
                          : "scale(1) translate(50%, -50%)",
                      transition: "transform 0.3s ease",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: isCollapsed && !mobile ? 24 : 22 }} />
                </Badge>
              </ListItemIcon>

              <Fade in={showText} timeout={300}>
                <ListItemText
                  primary={item.label}
                  sx={{
                    opacity: showText ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    "& .MuiTypography-root": {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.875rem",
                      color: isActive
                        ? item.color || theme.palette.primary.main
                        : theme.palette.text.primary,
                    },
                  }}
                />
              </Fade>

              {hasChildren && showText && (
                <Zoom in={showText} timeout={300}>
                  <Box
                    sx={{
                      color: theme.palette.text.secondary,
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <ExpandMore sx={{ fontSize: 20 }} />
                  </Box>
                </Zoom>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Дочерние элементы */}
        {hasChildren && showText && (
          <Collapse in={isExpanded} timeout={300} unmountOnExit>
            <List disablePadding sx={{ pl: 1 }}>
              {item.children?.map((child) =>
                renderSidebarItem(child, level + 1)
              )}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <>
      {/* Header с логотипом и кнопкой сворачивания */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          minHeight: 80,
        }}
      >
        <Fade in={showText} timeout={300}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              R
            </Avatar>
            {showText && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: theme.palette.text.primary,
                    lineHeight: 1.2,
                  }}
                >
                  Requify
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                  }}
                >
                  Управление проектами
                </Typography>
              </Box>
            )}
          </Stack>
        </Fade>

        {!mobile && (
          <IconButton
            onClick={toggleCollapse}
            size="small"
            sx={{
              width: 36,
              height: 36,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {isCollapsed ? (
              <ChevronRight fontSize="small" />
            ) : (
              <ChevronLeft fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>

      {/* Основная навигация */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden auto",
          py: 2,
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(theme.palette.text.secondary, 0.2),
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: alpha(theme.palette.text.secondary, 0.3),
          },
        }}
      >
        <List disablePadding>
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </List>
      </Box>

      {/* Профиль пользователя */}
      <Box
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: 2,
        }}
      >
        <ListItemButton
          sx={{
            borderRadius: 2.5,
            px: isCollapsed && !mobile ? 1.5 : 2,
            py: 1.5,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isCollapsed && !mobile ? 0 : 40,
              mr: isCollapsed && !mobile ? 0 : 2,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: theme.palette.primary.main,
                fontSize: "0.875rem",
              }}
            >
              AB
            </Avatar>
          </ListItemIcon>
          <Fade in={showText} timeout={300}>
            <ListItemText
              primary="Admin User"
              secondary="admin@requify.dev"
              sx={{
                opacity: showText ? 1 : 0,
                "& .MuiTypography-root": {
                  fontSize: "0.875rem",
                },
                "& .MuiTypography-body2": {
                  fontSize: "0.75rem",
                },
              }}
            />
          </Fade>
        </ListItemButton>
      </Box>
    </>
  );
};

export const SidebarWidget: React.FC = () => {
  const theme = useTheme();
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showText = !isCollapsed || isMobile;

  if (isMobile) {
    // Мобильная версия как Drawer
    return (
      <Drawer
        anchor="left"
        open={isMobileOpen}
        onClose={closeMobile}
        ModalProps={{
          keepMounted: true, // Лучшая производительность на мобильных
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            background: `linear-gradient(180deg, 
              ${theme.palette.background.paper} 0%, 
              ${alpha(theme.palette.background.default, 0.98)} 100%)`,
            backdropFilter: "blur(20px)",
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <SidebarContent mobile />
      </Drawer>
    );
  }

  // Десктопная версия
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        background: `linear-gradient(180deg, 
          ${theme.palette.background.paper} 0%, 
          ${alpha(theme.palette.background.default, 0.98)} 100%)`,
        backdropFilter: "blur(20px)",
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        boxShadow: `8px 0 32px ${alpha(theme.palette.common.black, 0.08)}`,
        zIndex: theme.zIndex.drawer,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <SidebarContent />
    </Box>
  );
};

// Экспорт констант для использования в layout
export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
