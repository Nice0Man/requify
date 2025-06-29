import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
} from '@mui/material';
import {
  AdminPanelSettings,
  Dashboard,
  Group,
  Security,
  Backup,
  Settings,
  Storage,
  Speed,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Download,
  Upload,
  Add,
  Edit,
  Delete,
  Block,
  CheckCircleOutline,
  SettingsBackupRestore,
  SystemUpdateAlt,
  MonitorHeart,
  BugReport,
  Timeline,
  BarChart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth, usePermissions } from '@/features/auth/context/auth.context';
import { UserRole } from '@/features/auth/types/auth.types';
import { 
  adminApi, 
  AdminUserListParams,
  BackupListParams,
  LogListParams,
} from '../api/admin.api';
import {
  SystemInfo,
  SystemMetrics,
  UserManagement,
  SystemLog,
  SystemBackup,
  SystemSettings,
  AdminStats,
  LogLevel,
  BackupStatus,
} from '../types/admin.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Check admin permissions
  const isAdmin = user?.role === UserRole.ADMIN || user?.is_superuser || hasAnyPermission(['admin:read', 'admin:write']);
  const canWrite = hasAnyPermission(['admin:write']) || user?.is_superuser;

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  
  // Users data
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  
  // Logs data
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTotal, setLogsTotal] = useState(0);
  
  // Backups data
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  
  // Settings data
  const [settings, setSettings] = useState<SystemSettings[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Dialog states
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [createBackupDialog, setCreateBackupDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    role: UserRole.VIEWER,
    password: '',
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      toast.error('Access denied. Admin privileges required.');
      return;
    }
  }, [isAdmin, navigate]);

  // Load initial data
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Load data based on active tab
  useEffect(() => {
    if (isAdmin) {
      switch (activeTab) {
        case 1:
          loadUsers();
          break;
        case 2:
          loadLogs();
          break;
        case 3:
          loadBackups();
          break;
        case 4:
          loadSettings();
          break;
      }
    }
  }, [activeTab, isAdmin]);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [systemInfoResponse, adminStatsResponse] = await Promise.all([
        adminApi.getSystemInfo(),
        adminApi.getFullAdminStats(),
      ]);

      setSystemInfo(systemInfoResponse.data);
      setAdminStats(adminStatsResponse.data);

      // Load metrics
      try {
        const metricsResponse = await adminApi.getMetrics();
        setSystemMetrics(metricsResponse.data);
      } catch (err) {
        console.warn('Failed to load metrics:', err);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load users
  const loadUsers = async (page = 0) => {
    try {
      setUsersLoading(true);
      const params: AdminUserListParams = {
        skip: page * 25,
        limit: 25,
        sort_by: 'created_at',
        sort_order: 'desc',
      };
      
      const response = await adminApi.getAdminUsers(params);
      setUsers(response.data.items);
      setUsersTotal(response.data.total);
      setUsersPage(page);
    } catch (err: any) {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Load logs
  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const params: LogListParams = {
        limit: 50,
        sort_by: 'timestamp',
        sort_order: 'desc',
      };
      
      const response = await adminApi.getLogs(params);
      setLogs(response.data.items);
      setLogsTotal(response.data.total);
    } catch (err: any) {
      toast.error('Failed to load logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Load backups
  const loadBackups = async () => {
    try {
      setBackupsLoading(true);
      const params: BackupListParams = {
        limit: 20,
        sort_by: 'started_at',
        sort_order: 'desc',
      };
      
      const response = await adminApi.getBackups(params);
      setBackups(response.data.items);
    } catch (err: any) {
      toast.error('Failed to load backups');
    } finally {
      setBackupsLoading(false);
    }
  };

  // Load settings
  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await adminApi.getSystemSettings();
      setSettings(response.data);
    } catch (err: any) {
      toast.error('Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle create backup
  const handleCreateBackup = async () => {
    try {
      await adminApi.createBackup({
        description: 'Manual backup from admin panel',
        include_files: true,
        compression_level: 6,
      });
      toast.success('Backup started successfully');
      setCreateBackupDialog(false);
      loadBackups();
    } catch (err: any) {
      toast.error('Failed to create backup: ' + err.message);
    }
  };

  // Handle create user
  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (!newUserData.email || !newUserData.password) {
        toast.error('Email and password are required');
        return;
      }

      const response = await adminApi.createUser({
        ...newUserData,
        send_invite_email: true,
      });
      
      toast.success('User created successfully');
      setCreateUserDialog(false);
      setNewUserData({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        role: UserRole.VIEWER,
        password: '',
      });
      loadUsers();
    } catch (err: any) {
      toast.error('Failed to create user: ' + err.message);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'up':
      case 'completed':
      case 'active':
        return theme.palette.success.main;
      case 'warning':
      case 'degraded':
      case 'in_progress':
        return theme.palette.warning.main;
      case 'critical':
      case 'down':
      case 'failed':
      case 'inactive':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get log level icon
  const getLogLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return <Error color="error" />;
      case LogLevel.WARNING:
        return <Warning color="warning" />;
      case LogLevel.INFO:
        return <Info color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  // Get backup status icon
  const getBackupStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case BackupStatus.COMPLETED:
        return <CheckCircle color="success" />;
      case BackupStatus.FAILED:
        return <Error color="error" />;
      case BackupStatus.IN_PROGRESS:
        return <SystemUpdateAlt color="warning" />;
      default:
        return <Info color="info" />;
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <AdminPanelSettings sx={{ fontSize: 32, color: theme.palette.error.main }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            System Administration
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Monitor system health, manage users, and configure settings
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Dashboard />} label="Overview" />
          <Tab icon={<Group />} label="Users" />
          <Tab icon={<Timeline />} label="Logs" />
          <Tab icon={<Backup />} label="Backups" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      
      {/* Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        {/* System Status Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Speed sx={{ 
                  fontSize: 48, 
                  color: systemInfo ? getStatusColor(systemInfo.api_health?.status || 'unknown') : theme.palette.grey[500],
                  mb: 1 
                }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System Health
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: systemInfo ? getStatusColor(systemInfo.api_health?.status || 'unknown') : theme.palette.grey[500],
                    textTransform: 'capitalize',
                    fontWeight: 500 
                  }}
                >
                  {systemInfo?.api_health?.status || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Uptime: {Math.floor((systemInfo?.uptime || 0) / 3600)}h
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Storage sx={{ 
                  fontSize: 48, 
                  color: systemInfo ? getStatusColor(systemInfo.database?.status || 'unknown') : theme.palette.grey[500],
                  mb: 1 
                }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Database
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: systemInfo ? getStatusColor(systemInfo.database?.status || 'unknown') : theme.palette.grey[500],
                    textTransform: 'capitalize',
                    fontWeight: 500 
                  }}
                >
                  {systemInfo?.database?.status || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {systemInfo?.database?.connection_count || 0} connections
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Group sx={{ fontSize: 48, color: theme.palette.info.main, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Users
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
                  {adminStats?.users.total || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {adminStats?.users.active || 0} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Security sx={{ 
                  fontSize: 48, 
                  color: (adminStats?.security.open_security_events || 0) > 0 ? theme.palette.warning.main : theme.palette.success.main,
                  mb: 1 
                }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security Events
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: (adminStats?.security.open_security_events || 0) > 0 ? theme.palette.warning.main : theme.palette.success.main,
                    fontWeight: 700 
                  }}
                >
                  {adminStats?.security.open_security_events || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Open events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* System Metrics */}
        {systemMetrics && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {systemMetrics.cpu_usage?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          CPU Usage
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                          {systemMetrics.memory_usage?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Memory Usage
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                          {systemMetrics.disk_usage?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Disk Usage
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                          {systemMetrics.api_metrics?.avg_response_time?.toFixed(0) || 0}ms
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Response
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    API Metrics
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Requests</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {systemMetrics.api_metrics?.total_requests?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Error Rate</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {systemMetrics.api_metrics?.error_rate?.toFixed(2) || 0}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Active Users</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {systemMetrics.user_metrics?.active_users || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Failed Logins</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {systemMetrics.user_metrics?.failed_logins || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            User Management
          </Typography>
          {canWrite && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateUserDialog(true)}
              sx={{ ml: 'auto' }}
            >
              Create User
            </Button>
          )}
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.is_active ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {canWrite && (
                        <>
                          <Tooltip title="Edit User">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                            <IconButton size="small">
                              {user.is_active ? <Block /> : <CheckCircleOutline />}
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Logs Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            System Logs
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadLogs}
            disabled={logsLoading}
          >
            Refresh
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Level</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logsLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getLogLevelIcon(log.level)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {log.level}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.module}
                    </TableCell>
                    <TableCell>
                      {log.user_email || 'System'}
                    </TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Backups Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            System Backups
          </Typography>
          {canWrite && (
            <Button
              variant="contained"
              startIcon={<Backup />}
              onClick={() => setCreateBackupDialog(true)}
              disabled={backupsLoading}
            >
              Create Backup
            </Button>
          )}
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backupsLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {backup.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getBackupStatusIcon(backup.status)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {backup.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {backup.file_size ? `${(backup.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(backup.started_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {backup.completed_at ? 
                        `${Math.round((new Date(backup.completed_at).getTime() - new Date(backup.started_at).getTime()) / 1000)}s` :
                        '-'
                      }
                    </TableCell>
                    <TableCell align="right">
                      {backup.status === BackupStatus.COMPLETED && backup.file_path && (
                        <Tooltip title="Download Backup">
                          <IconButton size="small">
                            <Download />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={activeTab} index={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          System Settings
        </Typography>

        {settingsLoading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {settings.map((setting) => (
              <Grid item xs={12} md={6} key={setting.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {setting.description || 'No description available'}
                    </Typography>
                    
                    {setting.data_type === 'boolean' ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={setting.value === 'true'}
                            disabled={!canWrite}
                          />
                        }
                        label={setting.value === 'true' ? 'Enabled' : 'Disabled'}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        value={setting.value}
                        disabled={!canWrite}
                        type={setting.data_type === 'password' ? 'password' : 'text'}
                      />
                    )}
                  </CardContent>
                  {canWrite && (
                    <CardActions>
                      <Button size="small">Save</Button>
                      <Button size="small" color="secondary">Reset</Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Create User Dialog */}
      <Dialog open={createUserDialog} onClose={() => setCreateUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={newUserData.username}
                onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newUserData.first_name}
                onChange={(e) => setNewUserData({ ...newUserData, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newUserData.last_name}
                onChange={(e) => setNewUserData({ ...newUserData, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUserData.role}
                  label="Role"
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                >
                  <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
                  <MenuItem value={UserRole.ANALYST}>Analyst</MenuItem>
                  <MenuItem value={UserRole.DEVELOPER}>Developer</MenuItem>
                  <MenuItem value={UserRole.TESTER}>Tester</MenuItem>
                  <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                  {user?.is_superuser && <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Temporary Password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>

      {/* Create Backup Dialog */}
      <Dialog open={createBackupDialog} onClose={() => setCreateBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will create a full system backup including database and uploaded files.
          </Typography>
          <Alert severity="info">
            The backup process may take several minutes to complete. You will be notified when it's ready.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBackupDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBackup} variant="contained">Start Backup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage; 