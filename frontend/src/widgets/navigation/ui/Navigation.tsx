import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Paper,
  Stack,
  Chip,
  Switch,
  Menu,
  MenuItem,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
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
  LightMode,
  DarkMode,
  Person,
  Email,
  Business,
  AccountCircle,
  Logout,
  MoreVert,
  Home,
  FiberManualRecord,
  KeyboardArrowRight,
  Star,
  Bookmark,
  History,
  Search,
  Help,
  Feedback,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Using features according to FSD
import { useAuth } from '@/features/auth';

// Using shared utilities
import { getUserInitials } from '@/shared/utils';

// Local interfaces to avoid external dependencies
interface NavigationProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  activeItem?: string;
  variant?: 'permanent' | 'temporary';
  open?: boolean;
  onClose?: () => void;
  showUserProfile?: boolean;
  showNotifications?: boolean;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number;
  permission?: string;
  isNew?: boolean;
  description?: string;
  category?: string;
  color?: string;
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    description: 'Project overview and statistics',
    category: 'main',
  },
  {
    label: 'Kanban Board',
    icon: <ViewColumn />,
    path: '/kanban',
    description: 'Visual task management',
    category: 'main',
  },
  {
    label: 'Projects',
    icon: <RocketLaunch />,
    path: '/projects',
    description: 'Manage your projects',
    category: 'main',
    badge: 3,
  },
  {
    label: 'Requirements',
    icon: <Assignment />,
    description: 'Requirements management',
    category: 'main',
    children: [
      { 
        label: 'All Requirements', 
        icon: <Assignment />, 
        path: '/requirements',
        description: 'View all requirements',
        category: 'requirements',
      },
      { 
        label: 'Create Requirement', 
        icon: <Assignment />, 
        path: '/requirements/create',
        description: 'Add new requirement',
        category: 'requirements',
        isNew: true,
      },
    ],
  },
  {
    label: 'Releases',
    icon: <Assessment />,
    description: 'Release management',
    category: 'main',
    children: [
      { 
        label: 'All Releases', 
        icon: <Assessment />, 
        path: '/releases',
        description: 'View all releases',
        category: 'releases',
      },
      { 
        label: 'Create Release', 
        icon: <Assessment />, 
        path: '/releases/create',
        description: 'Plan new release',
        category: 'releases',
      },
    ],
  },
  {
    label: 'Testing',
    icon: <BugReport />,
    path: '/testing',
    description: 'Quality assurance',
    category: 'main',
  },
  {
    label: 'Reports',
    icon: <Assessment />,
    path: '/reports',
    description: 'Analytics and insights',
    category: 'main',
  },
  {
    label: 'Admin',
    icon: <AdminPanelSettings />,
    path: '/admin',
    permission: 'admin:read',
    description: 'System administration',
    category: 'admin',
    color: '#f59e0b',
  },
];

const quickActions = [
  { label: 'Recent', icon: <History />, path: '/recent' },
  { label: 'Favorites', icon: <Star />, path: '/favorites' },
  { label: 'Bookmarks', icon: <Bookmark />, path: '/bookmarks' },
  { label: 'Search', icon: <Search />, path: '/search' },
];

export const Navigation: React.FC<NavigationProps> = ({
  collapsed = false,
  onToggleCollapse,
  className,
  activeItem,
  variant = 'permanent',
  open = true,
  onClose,
  showUserProfile = true,
  showNotifications = true,
  theme: themeMode,
  onThemeToggle,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expandedItems, setExpandedItems] = useState<string[]>(['Requirements', 'Releases']);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = useState(5);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && onToggleCollapse && !collapsed) {
      onToggleCollapse();
    }
  }, [isMobile]);

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
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUserMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const isItemActive = (path?: string) => {
    if (activeItem) {
      return path === activeItem;
    }
    if (!path) return false;
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
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
    const hasActiveChild = hasChildren && item.children?.some(child => isItemActive(child.path));

    const itemContent = (
      <ListItemButton
        onClick={() => handleItemClick(item)}
        sx={{
          minHeight: 52,
          justifyContent: collapsed ? 'center' : 'initial',
          px: collapsed ? 1 : 2,
          pl: level > 0 ? (collapsed ? 1 : 3.5) : (collapsed ? 1 : 2),
          py: 1,
          mb: 0.5,
          mx: collapsed ? 0.5 : 1,
          borderRadius: 3,
          background: isActive 
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`
            : hasActiveChild
            ? alpha(theme.palette.primary.main, 0.04)
            : 'transparent',
          border: isActive 
            ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` 
            : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            background: isActive 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.08)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.04)})`,
            borderColor: alpha(theme.palette.primary.main, 0.2),
            transform: 'translateX(2px)',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
          '&:before': isActive ? {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: '60%',
            background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '0 2px 2px 0',
          } : {},
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed ? 'auto' : 2,
            justifyContent: 'center',
            color: isActive 
              ? theme.palette.primary.main 
              : hasActiveChild
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            transition: 'all 0.3s ease',
            '& .MuiSvgIcon-root': {
              fontSize: level > 0 ? 20 : 22,
              filter: isActive ? `drop-shadow(0 0 4px ${alpha(theme.palette.primary.main, 0.3)})` : 'none',
            },
          }}
        >
          {item.badge ? (
            <Badge 
              badgeContent={item.badge} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                    '100%': { opacity: 1 },
                  },
                },
              }}
            >
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        
        {!collapsed && (
          <>
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive 
                        ? theme.palette.primary.main 
                        : hasActiveChild
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                      fontSize: level > 0 ? '0.8rem' : '0.875rem',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.label}
                  </Typography>
                  {item.isNew && (
                    <Chip
                      label="NEW"
                      size="small"
                      color="secondary"
                      sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  )}
                </Stack>
              }
              sx={{ my: 0 }}
            />
            
            {hasChildren && (
              <IconButton
                size="small"
                sx={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  color: 'text.secondary',
                }}
              >
                <ExpandMore sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </>
        )}
      </ListItemButton>
    );

    return (
      <React.Fragment key={item.label}>
        <Grow in timeout={300 + level * 100}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {collapsed && item.description ? (
              <Tooltip 
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption">
                      {item.description}
                    </Typography>
                  </Box>
                }
                placement="right"
                arrow
              >
                {itemContent}
              </Tooltip>
            ) : (
              itemContent
            )}
          </ListItem>
        </Grow>

        {hasChildren && !collapsed && (
          <Collapse 
            in={isExpanded} 
            timeout={300}
            unmountOnExit
          >
            <List component="div" disablePadding sx={{ pl: 0.5 }}>
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Stack sx={{ height: '100%' }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            m: 1,
            mt: 1.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {!collapsed && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                R
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: -0.5,
                }}
              >
                Requify
              </Typography>
            </Stack>
          )}
          
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {showNotifications && (
              <Tooltip title="Notifications">
                <IconButton 
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <Notifications sx={{ fontSize: 18 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            {onToggleCollapse && (
              <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <IconButton 
                  onClick={onToggleCollapse} 
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {collapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : <ChevronLeft sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Paper>
      </Fade>

      {/* Quick Actions */}
      {!collapsed && (
        <Fade in timeout={700}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                px: 1,
              }}
            >
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
              {quickActions.map((action) => (
                <Tooltip key={action.label} title={action.label}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(action.path)}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Box>
        </Fade>
      )}

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              px: 2,
              py: 1,
              display: 'block',
            }}
          >
            Navigation
          </Typography>
        )}
        
        <List sx={{ py: 0 }}>
          {filterItemsByPermission(navigationItems).map((item, index) => (
            <Slide 
              key={item.label}
              direction="right" 
              in 
              timeout={400 + index * 100}
            >
              <div>{renderNavItem(item)}</div>
            </Slide>
          ))}
        </List>
      </Box>

      {/* User Section */}
      {showUserProfile && user && (
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              m: 1,
              mb: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.8)})`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            {!collapsed ? (
              <Stack>
                <Box
                  onClick={handleUserMenuOpen}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      {getUserInitials(user.first_name, user.last_name) || user.username?.[0]?.toUpperCase()}
                    </Avatar>
                    
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
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
                        }}
                      >
                        {user.email}
                      </Typography>
                    </Stack>
                    
                    <MoreVert sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Stack>
                </Box>

                <Divider sx={{ mx: 2, opacity: 0.3 }} />

                <Stack direction="row" sx={{ p: 1 }}>
                  <Tooltip title="Settings">
                    <IconButton
                      size="small"
                      onClick={() => navigate('/settings')}
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <Settings sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  
                  {onThemeToggle && (
                    <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
                      <IconButton
                        size="small"
                        onClick={onThemeToggle}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        {themeMode === 'dark' ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Logout">
                    <IconButton
                      size="small"
                      onClick={handleLogout}
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.04),
                        },
                      }}
                    >
                      <ExitToApp sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            ) : (
              <Stack sx={{ p: 1 }}>
                <Tooltip title="User menu">
                  <IconButton onClick={handleUserMenuOpen} sx={{ borderRadius: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {getUserInitials(user.first_name, user.last_name) || user.username?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Paper>
        </Fade>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 3,
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              borderRadius: 2,
              mx: 1,
              my: 0.5,
            },
          },
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
          <ListItemIcon><Person /></ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleUserMenuClose(); }}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => { navigate('/help'); handleUserMenuClose(); }}>
          <ListItemIcon><Help /></ListItemIcon>
          <ListItemText primary="Help" />
        </MenuItem>
        <MenuItem onClick={() => { navigate('/feedback'); handleUserMenuClose(); }}>
          <ListItemIcon><Feedback /></ListItemIcon>
          <ListItemText primary="Feedback" />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Stack>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        className={className}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: theme.palette.background.paper,
            borderRight: 'none',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

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
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: theme.palette.background.paper,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}; 