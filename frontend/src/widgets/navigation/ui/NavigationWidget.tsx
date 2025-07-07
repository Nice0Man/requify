import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FolderOpen,
  Assignment,
  RocketLaunch,
  BugReport,
  Analytics,
  Notifications,
  Settings,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageSwitch } from '../../../shared/ui/LanguageSwitch';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
}

const NavigationWidget: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: Dashboard, path: '/dashboard' },
    { id: 'projects', label: t('navigation.projects'), icon: FolderOpen, path: '/projects' },
    { id: 'requirements', label: t('navigation.requirements'), icon: Assignment, path: '/requirements' },
    { id: 'releases', label: t('navigation.releases'), icon: RocketLaunch, path: '/releases' },
    { id: 'testing', label: t('navigation.testing'), icon: BugReport, path: '/testing' },
    { id: 'reports', label: t('navigation.reports'), icon: Analytics, path: '/reports' },
    { id: 'notifications', label: t('navigation.notifications'), icon: Notifications, path: '/notifications' },
    { id: 'settings', label: t('navigation.settings'), icon: Settings, path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const NavigationList = () => (
    <List sx={{ pt: 0 }}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <ListItem
            button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 0.5,
              mx: 1,
              borderRadius: 2,
              backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: active ? theme.palette.primary.main : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: active 
                  ? alpha(theme.palette.primary.main, 0.15) 
                  : alpha(theme.palette.text.primary, 0.05),
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <Icon />
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{ 
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem',
              }} 
            />
          </ListItem>
        );
      })}
    </List>
  );

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center', backgroundColor: theme.palette.primary.main }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
          Requify
        </Typography>
      </Toolbar>
      <NavigationList />
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Requify
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageSwitch />
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          {t('navigation.profile')}
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          {t('navigation.settings')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          {t('navigation.logout')}
        </MenuItem>
      </Menu>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default NavigationWidget; 