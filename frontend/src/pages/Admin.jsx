import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminApi } from '../api/admin';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    systemName: '',
    emailNotifications: false,
    defaultRole: 'user',
    maxFileSize: 5,
    allowedFileTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUserForm, setOpenUserForm] = useState(false);
  const [openSettingsForm, setOpenSettingsForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, settingsData] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getSettings(),
      ]);
      setUsers(usersData);
      setSettings(settingsData);
    } catch (err) {
      setError(err.message);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await adminApi.updateUser(selectedUser.id, formData);
        toast.success('Пользователь обновлен');
      } else {
        await adminApi.createUser(formData);
        toast.success('Пользователь создан');
      }
      setOpenUserForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSettingsFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateSettings(settings);
      toast.success('Настройки обновлены');
      setOpenSettingsForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminApi.deleteUser(selectedUser.id);
      toast.success('Пользователь удален');
      setOpenDeleteDialog(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setOpenUserForm(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'user',
      status: 'active',
    });
    setOpenUserForm(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Секция пользователей */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Пользователи</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddUser}
                >
                  Добавить
                </Button>
              </Box>
              <List>
                {users.map((user) => (
                  <ListItem key={user.id}>
                    <ListItemText
                      primary={user.username}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={user.role}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={user.status}
                              size="small"
                              color={user.status === 'active' ? 'success' : 'error'}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditUser(user)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Секция настроек */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Настройки системы</Typography>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenSettingsForm(true)}
                >
                  Изменить
                </Button>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Название системы"
                    secondary={settings.systemName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email уведомления"
                    secondary={settings.emailNotifications ? 'Включены' : 'Выключены'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Роль по умолчанию"
                    secondary={settings.defaultRole}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Максимальный размер файла"
                    secondary={`${settings.maxFileSize} МБ`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Разрешенные типы файлов"
                    secondary={settings.allowedFileTypes.join(', ')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Форма пользователя */}
      <Dialog open={openUserForm} onClose={() => setOpenUserForm(false)}>
        <DialogTitle>
          {selectedUser ? 'Редактировать пользователя' : 'Новый пользователь'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUserFormSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Роль"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="admin">Администратор</MenuItem>
              <MenuItem value="manager">Менеджер</MenuItem>
              <MenuItem value="user">Пользователь</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Статус"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="active">Активен</MenuItem>
              <MenuItem value="inactive">Неактивен</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserForm(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleUserFormSubmit}
            startIcon={<SaveIcon />}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Форма настроек */}
      <Dialog open={openSettingsForm} onClose={() => setOpenSettingsForm(false)}>
        <DialogTitle>Настройки системы</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSettingsFormSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Название системы"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Email уведомления"
              value={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value={true}>Включены</MenuItem>
              <MenuItem value={false}>Выключены</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Роль по умолчанию"
              value={settings.defaultRole}
              onChange={(e) => setSettings({ ...settings, defaultRole: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="admin">Администратор</MenuItem>
              <MenuItem value="manager">Менеджер</MenuItem>
              <MenuItem value="user">Пользователь</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Максимальный размер файла (МБ)"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: Number(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Разрешенные типы файлов"
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) => setSettings({
                ...settings,
                allowedFileTypes: e.target.value.split(',').map(type => type.trim()),
              })}
              margin="normal"
              required
              helperText="Введите типы файлов через запятую (например: .pdf, .doc, .docx)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsForm(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSettingsFormSubmit}
            startIcon={<SaveIcon />}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя {selectedUser?.username}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            startIcon={<DeleteIcon />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin; 