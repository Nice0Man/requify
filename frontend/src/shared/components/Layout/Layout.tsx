import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FolderOpen,
  Assignment,
  BugReport,
  RocketLaunch,
  AdminPanelSettings,
  Person,
  Notifications,
  Logout,
  Settings,
  Api,
  Home
} from '@mui/icons-material';
import { useAuth, usePermissions } from '@/features/auth/context/auth.context';

interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredPermissions?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Start',
    path: '/start',
    icon: <Home />
  },
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />
  },
  {
    title: 'API Overview',
    path: '/api-overview',
    icon: <Api />
  },
  {
    title: 'Projects',
    path: '/projects',
    icon: <FolderOpen />,
    requiredPermissions: ['projects:read']
  },
  {
    title: 'Requirements',
    path: '/requirements',
    icon: <Assignment />,
    requiredPermissions: ['requirements:read']
  },
  {
    title: 'Testing',
    path: '/testing',
    icon: <BugReport />,
    requiredPermissions: ['testing:read']
  },
  {
    title: 'Releases',
    path: '/releases',
    icon: <RocketLaunch />,
    requiredPermissions: ['releases:read']
  },
  {
    title: 'Administration',
    path: '/admin',
    icon: <AdminPanelSettings />,
    requiredPermissions: ['admin:read'] // Note: Backend should grant this permission to DEVELOPER role
  }
];

const DRAWER_WIDTH = 240;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermissions } = usePermissions();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleProfileMenuClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.requiredPermissions) return true;
    return hasPermissions(item.requiredPermissions);
  });

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Requify
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActiveRoute(item.path)}
              onClick={() => handleNavigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isActiveRoute(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: isActiveRoute(item.path) ? 600 : 400 
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => isActiveRoute(item.path))?.title || 'Requify'}
          </Typography>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{ width: 32, height: 32 }}
                src={user?.avatar}
                alt={user?.first_name || user?.email}
              >
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'grey.50'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}; 