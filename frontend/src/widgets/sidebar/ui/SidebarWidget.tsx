import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Dashboard,
  FolderOpen,
  Assignment,
  RocketLaunch,
  BugReport,
  Analytics,
  Settings,
  Home,
  ExpandLess,
  ExpandMore,
  People,
  AdminPanelSettings,
  Notifications,
  AddCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  color?: string;
  badge?: number;
  children?: SidebarItem[];
}

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export const SidebarWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['projects']);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Панель управления',
      icon: Dashboard,
      path: '/dashboard',
      color: theme.palette.primary.main,
    },
    {
      id: 'projects',
      label: 'Проекты',
      icon: FolderOpen,
      color: theme.palette.secondary.main,
      badge: 3,
      children: [
        {
          id: 'projects-all',
          label: 'Все проекты',
          icon: FolderOpen,
          path: '/projects',
          color: theme.palette.secondary.main,
        },
        {
          id: 'projects-new',
          label: 'Создать проект',
          icon: AddCircle,
          path: '/projects/new',
          color: theme.palette.secondary.main,
        },
      ],
    },
    {
      id: 'requirements',
      label: 'Требования',
      icon: Assignment,
      path: '/requirements',
      color: theme.palette.success.main,
      badge: 12,
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
      badge: 2,
    },
    {
      id: 'reports',
      label: 'Отчеты',
      icon: Analytics,
      path: '/reports',
      color: theme.palette.error.main,
    },
  ];

  const bottomItems: SidebarItem[] = [
    {
      id: 'admin',
      label: 'Администрирование',
      icon: AdminPanelSettings,
      path: '/admin',
      color: theme.palette.warning.main,
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: Settings,
      path: '/settings',
      color: theme.palette.grey[600],
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.id);
      setExpandedItems(prev => 
        isExpanded 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isItemActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (item: SidebarItem) => {
    if (item.path && isItemActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isItemActive(child.path));
    }
    return false;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children);
    const isExpanded = expandedItems.includes(item.id);
    const isActive = isParentActive(item);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <Tooltip 
            title={isCollapsed ? item.label : ''}
            placement="right"
            disableHoverListener={!isCollapsed}
          >
            <ListItemButton
              onClick={() => handleItemClick(item)}
              sx={{
                mx: 1,
                borderRadius: 2,
                minHeight: 48,
                pl: level === 0 ? 2 : 4,
                backgroundColor: isActive 
                  ? alpha(item.color || theme.palette.primary.main, 0.12)
                  : 'transparent',
                border: isActive 
                  ? `1px solid ${alpha(item.color || theme.palette.primary.main, 0.2)}`
                  : '1px solid transparent',
                '&:hover': {
                  backgroundColor: alpha(item.color || theme.palette.primary.main, 0.08),
                  transform: 'translateX(2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive 
                    ? item.color || theme.palette.primary.main
                    : theme.palette.text.secondary,
                  transition: 'color 0.2s ease',
                }}
              >
                <Badge 
                  badgeContent={item.badge} 
                  color="error" 
                  invisible={!item.badge || isCollapsed}
                >
                  <Icon />
                </Badge>
              </ListItemIcon>
              
              {!isCollapsed && (
                <>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: level === 0 ? '0.95rem' : '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive
                        ? item.color || theme.palette.primary.main
                        : theme.palette.text.primary,
                    }}
                  />
                  {hasChildren && (
                    <IconButton size="small" sx={{ p: 0.5 }}>
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                </>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Вложенные элементы */}
        {hasChildren && !isCollapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderSidebarItem(child, 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.background.paper, 0.98)} 0%, 
          ${alpha(theme.palette.background.default, 0.95)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `4px 0 20px ${alpha(theme.palette.common.black, 0.05)}`,
        zIndex: theme.zIndex.drawer,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header с логотипом */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          minHeight: 64,
        }}
      >
        {!isCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Иконка логотипа */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '32%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                R
              </Typography>
            </Box>

            {/* Текст логотипа */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  fontSize: '1.3rem',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                Requify
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem',
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                Requirements Platform
              </Typography>
            </Box>
          </Box>
        )}

        {/* Кнопка сворачивания */}
        <IconButton
          onClick={toggleCollapse}
          size="small"
          sx={{
            width: 32,
            height: 32,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <Home fontSize="small" />
        </IconButton>
      </Box>

      {/* Основная навигация */}
      <Box sx={{ flex: 1, overflow: 'hidden auto', py: 1 }}>
        <List disablePadding>
          {sidebarItems.map(item => renderSidebarItem(item))}
        </List>
      </Box>

      {/* Нижняя секция */}
      <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <List disablePadding sx={{ py: 1 }}>
          {bottomItems.map(item => renderSidebarItem(item))}
        </List>
      </Box>
    </Box>
  );
}; 