import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FolderOpen,
  Assignment,
  RocketLaunch,
  BugReport,
  Analytics,
  Settings,
  ChevronLeft,
  Home,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  color?: string;
}

const SIDEBAR_WIDTH = 280;

export const SidebarWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Дашборд',
      icon: Dashboard,
      path: '/dashboard',
      color: theme.palette.primary.main,
    },
    {
      id: 'projects',
      label: 'Проекты',
      icon: FolderOpen,
      path: '/projects',
      color: theme.palette.secondary.main,
    },
    {
      id: 'requirements',
      label: 'Требования',
      icon: Assignment,
      path: '/requirements',
      color: theme.palette.success.main,
    },
    {
      id: 'releases',
      label: 'Релизы',
      icon: RocketLaunch,
      path: '/releases',
      color: theme.palette.info.main,
    },
    {
      id: 'testing',
      label: 'Тестирование',
      icon: BugReport,
      path: '/testing',
      color: theme.palette.warning.main,
    },
    {
      id: 'reports',
      label: 'Отчеты',
      icon: Analytics,
      path: '/reports',
      color: theme.palette.error.main,
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: Settings,
      path: '/settings',
      color: theme.palette.grey[600],
    },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isItemActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Кнопка открытия меню */}
      <Tooltip title="Открыть меню" placement="right">
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: theme.zIndex.fab,
            backgroundColor: alpha(theme.palette.primary.main, 0.9),
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: theme.shadows[8],
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      {/* Popup Sidebar */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            background: `linear-gradient(180deg, 
              ${alpha(theme.palette.background.paper, 0.98)} 0%, 
              ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            backdropFilter: 'blur(20px)',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.shadows[24],
          },
        }}
        ModalProps={{
          sx: {
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Home sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Requify
              </Typography>
            </Box>
            <IconButton onClick={() => setIsOpen(false)}>
              <ChevronLeft />
            </IconButton>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List sx={{ p: 1 }}>
              {sidebarItems.map((item) => {
                const isActive = isItemActive(item.path);
                const Icon = item.icon;

                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleItemClick(item.path)}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        minHeight: 48,
                        backgroundColor: isActive
                          ? alpha(item.color || theme.palette.primary.main, 0.1)
                          : 'transparent',
                        border: isActive
                          ? `1px solid ${alpha(item.color || theme.palette.primary.main, 0.2)}`
                          : '1px solid transparent',
                        '&:hover': {
                          backgroundColor: alpha(item.color || theme.palette.primary.main, 0.08),
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive
                            ? item.color || theme.palette.primary.main
                            : theme.palette.text.secondary,
                          minWidth: 40,
                        }}
                      >
                        <Icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? item.color || theme.palette.primary.main
                            : theme.palette.text.primary,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              p: 1,
            }}
          >
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  minHeight: 48,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.error.main,
                    minWidth: 40,
                  }}
                >
                  <Logout />
                </ListItemIcon>
                <ListItemText
                  primary="Выход"
                  primaryTypographyProps={{
                    color: theme.palette.error.main,
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}; 