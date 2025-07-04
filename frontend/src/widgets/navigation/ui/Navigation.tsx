import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Avatar,
  IconButton,
  Collapse,
  useTheme,
  alpha,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  RocketLaunch,
  BugReport,
  Assessment,
  Settings,
  People,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Notifications,
  ExitToApp,
  ViewColumn,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Using features according to FSD
import { useAuth } from '@/features/auth';

// Using shared utilities
import { getUserInitials } from '@/shared/utils';

// Widget props from types
import type { NavigationProps } from '../../types';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number;
  permission?: string;
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    label: 'Kanban Board',
    icon: <ViewColumn />,
    path: '/kanban',
  },
  {
    label: 'Projects',
    icon: <RocketLaunch />,
    path: '/projects',
  },
  {
    label: 'Requirements',
    icon: <Assignment />,
    children: [
      { label: 'All Requirements', icon: <Assignment />, path: '/requirements' },
      { label: 'Create Requirement', icon: <Assignment />, path: '/requirements/create' },
    ],
  },
  {
    label: 'Releases',
    icon: <Assessment />,
    children: [
      { label: 'All Releases', icon: <Assessment />, path: '/releases' },
      { label: 'Create Release', icon: <Assessment />, path: '/releases/create' },
    ],
  },
  {
    label: 'Testing',
    icon: <BugReport />,
    path: '/testing',
  },
  {
    label: 'Reports',
    icon: <Assessment />,
    path: '/reports',
  },
  {
    label: 'Admin',
    icon: <AdminPanelSettings />,
    path: '/admin',
    permission: 'admin:read',
  },
];

export const Navigation: React.FC<NavigationProps> = ({
  collapsed = false,
  onToggleCollapse,
  className,
  activeItem,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      const label = item.label;
      setExpandedItems(prev => 
        prev.includes(label) 
          ? prev.filter(l => l !== label)
          : [...prev, label]
      );
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isItemActive = (path?: string) => {
    if (activeItem) {
      return path === activeItem;
    }
    return path === location.pathname;
  };

  const filterItemsByPermission = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }
      return true;
    });
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = isItemActive(item.path);

    return (
      <React.Fragment key={item.label}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'initial',
              px: 2.5,
              pl: level > 0 ? 4 : 2.5,
              backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              borderRadius: collapsed ? 0 : '0 24px 24px 0',
              mr: collapsed ? 0 : 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 'auto' : 3,
                justifyContent: 'center',
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    },
                  }}
                />
                {hasChildren && (
                  isExpanded ? <ExpandLess /> : <ExpandMore />
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Requify
          </Typography>
        )}
        {onToggleCollapse && (
          <IconButton onClick={onToggleCollapse} size="small">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {filterItemsByPermission(navigationItems).map(item => renderNavItem(item))}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      {/* User Section */}
      <Box sx={{ p: 2 }}>
        {!collapsed && user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              mb: 2,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                mr: 2,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
              }}
            >
              {getUserInitials(user.first_name, user.last_name) || user.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username
                }
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}

        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate('/settings')}
              sx={{
                justifyContent: collapsed ? 'center' : 'initial',
                borderRadius: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 56 }}>
                <Settings />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Settings" />}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                justifyContent: collapsed ? 'center' : 'initial',
                borderRadius: 2,
                color: theme.palette.error.main,
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 56, color: 'inherit' }}>
                <ExitToApp />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Logout" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  return (
    <Drawer
      variant="permanent"
      className={className}
      sx={{
        width: collapsed ? 72 : 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 72 : 280,
          boxSizing: 'border-box',
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: theme.palette.background.paper,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}; 