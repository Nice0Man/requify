import React, { useState } from 'react';
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
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  Notifications,
  LightMode,
  DarkMode,
  Language,
  Help,
  Add,
  Search,
  MoreVert,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface HeaderWidgetProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const HeaderWidget: React.FC<HeaderWidgetProps> = ({ 
  onThemeToggle,
  isDarkMode = false 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const isUserMenuOpen = Boolean(userMenuAnchor);
  const isActionsMenuOpen = Boolean(actionsMenuAnchor);
  const isNotificationsOpen = Boolean(notificationsAnchor);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleActionsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setActionsMenuAnchor(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setUserMenuAnchor(null);
    setActionsMenuAnchor(null);
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  const quickActions = [
    { 
      label: 'Новый проект', 
      icon: Add, 
      action: () => navigate('/projects/new'),
      color: theme.palette.primary.main 
    },
    { 
      label: 'Добавить требование', 
      icon: Add, 
      action: () => navigate('/requirements/new'),
      color: theme.palette.success.main 
    },
    { 
      label: 'Создать релиз', 
      icon: Add, 
      action: () => navigate('/releases/new'),
      color: theme.palette.info.main 
    },
  ];

  const mockNotifications = [
    { id: 1, title: 'Новое требование', message: 'REQ-123 требует вашего внимания' },
    { id: 2, title: 'Обновление проекта', message: 'Проект Alpha обновлен' },
    { id: 3, title: 'Релиз готов', message: 'Релиз v1.2.0 готов к развертыванию' },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Левая часть - поиск */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={{ ml: 10 }}> {/* Отступ для кнопки меню сайдбара */}
            <Button
              startIcon={<Search />}
              variant="outlined"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                color: theme.palette.text.secondary,
                borderColor: alpha(theme.palette.divider, 0.3),
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                minWidth: 250,
                justifyContent: 'flex-start',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.default, 0.8),
                },
              }}
            >
              Поиск...
            </Button>
          </Box>
        </Box>

        {/* Правая часть - действия */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Переключатель темы */}
          <Tooltip title={isDarkMode ? 'Светлая тема' : 'Темная тема'}>
            <IconButton 
              onClick={onThemeToggle}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                },
              }}
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Быстрые действия */}
          <Tooltip title="Быстрые действия">
            <IconButton
              onClick={handleActionsMenuOpen}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                },
              }}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>

          {/* Уведомления */}
          <Tooltip title="Уведомления">
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                },
              }}
            >
              <Badge badgeContent={mockNotifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Аватар пользователя */}
          <Tooltip title="Профиль">
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
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
            elevation: 8,
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Информация о пользователе */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.username || 'Пользователь'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role || 'Роль не определена'}
            </Typography>
          </Box>
          
          <Divider />
          
          <MenuItem onClick={() => navigate('/settings/profile')}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Профиль</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Настройки</ListItemText>
          </MenuItem>
          
          <MenuItem>
            <ListItemIcon>
              <Language fontSize="small" />
            </ListItemIcon>
            <ListItemText>Язык</ListItemText>
          </MenuItem>
          
          <MenuItem>
            <ListItemIcon>
              <Help fontSize="small" />
            </ListItemIcon>
            <ListItemText>Помощь</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: theme.palette.error.main }} />
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
            elevation: 8,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {quickActions.map((action, index) => (
            <MenuItem 
              key={index} 
              onClick={() => {
                action.action();
                handleMenuClose();
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
            elevation: 8,
            sx: {
              mt: 1.5,
              minWidth: 320,
              maxWidth: 400,
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="h6" fontWeight={600}>
              Уведомления
            </Typography>
          </Box>
          <Divider />
          
          {mockNotifications.map((notification) => (
            <MenuItem key={notification.id} sx={{ py: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.message}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          
          <Divider />
          <MenuItem sx={{ justifyContent: 'center' }}>
            <Typography variant="button" color="primary">
              Показать все
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}; 