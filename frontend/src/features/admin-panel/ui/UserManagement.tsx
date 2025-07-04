import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
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
  Alert,
  LinearProgress,
  Stack,
  useTheme,
  alpha,
  Checkbox,
  TablePagination,
  InputAdornment,
  Grid,
  FormHelperText,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Search,
  Refresh,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  adminApi,
  UserCreateRequest,
  UserUpdateRequest,
} from "../api/admin.api";
import {
  UserManagement as UserManagementType,
  UserRole,
} from "../types/admin.types";

const UserManagementComponent: React.FC = () => {
  const theme = useTheme();

  // State
  const [users, setUsers] = useState<UserManagementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Selection
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Dialogs
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserManagementType | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  // Form states for creating user
  const [createForm, setCreateForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    role: UserRole.VIEWER,
    password: "",
    department: "",
    phone: "",
    send_invite_email: true,
  });

  // Form states for editing user
  const [editForm, setEditForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    role: UserRole.VIEWER,
    password: "",
    department: "",
    phone: "",
  });

  // Form validation errors
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  // Load users
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter]);

  // Update edit form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditForm({
        email: currentUser.email || "",
        username: currentUser.username || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        role: currentUser.role as UserRole || UserRole.VIEWER,
        password: "",
        department: currentUser.department || "",
        phone: currentUser.phone || "",
      });
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        is_active:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
            ? false
            : undefined,
      };

      const response = await adminApi.getAdminUsers(params);
      setUsers(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setError(err.message || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validateUsername = (username: string): string => {
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!username) return "Username is required";
    if (username.length < 2) return "Username must be at least 2 characters";
    if (username.length > 50) return "Username must not exceed 50 characters";
    if (!usernameRegex.test(username)) {
      return "Username can only contain letters, numbers, dots, hyphens and underscores";
    }
    return "";
  };

  const validatePassword = (password: string, isRequired: boolean = true): string => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!password && isRequired) return "Password is required";
    if (password && password.length < 8) return "Password must be at least 8 characters";
    if (password && !passwordRegex.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return "";
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^\+7[0-9]{10}$/;
    if (phone && !phoneRegex.test(phone)) return "Phone must be in format +7XXXXXXXXXX";
    return "";
  };

  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {};

    errors.email = validateEmail(createForm.email);
    errors.username = validateUsername(createForm.username);
    errors.password = validatePassword(createForm.password, true);
    errors.phone = validatePhone(createForm.phone);

    if (createForm.first_name && createForm.first_name.length > 50) {
      errors.first_name = "First name must not exceed 50 characters";
    }
    if (createForm.last_name && createForm.last_name.length > 50) {
      errors.last_name = "Last name must not exceed 50 characters";
    }
    if (createForm.department && createForm.department.length > 100) {
      errors.department = "Department must not exceed 100 characters";
    }
    if (!createForm.role) {
      errors.role = "Role is required";
    }

    // Remove empty errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (editForm.email) errors.email = validateEmail(editForm.email);
    if (editForm.username) errors.username = validateUsername(editForm.username);
    errors.password = validatePassword(editForm.password, false);
    errors.phone = validatePhone(editForm.phone);

    if (editForm.first_name && editForm.first_name.length > 50) {
      errors.first_name = "First name must not exceed 50 characters";
    }
    if (editForm.last_name && editForm.last_name.length > 50) {
      errors.last_name = "Last name must not exceed 50 characters";
    }
    if (editForm.department && editForm.department.length > 100) {
      errors.department = "Department must not exceed 100 characters";
    }

    // Remove empty errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create form submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCreateForm()) return;

    try {
      setSaving(true);

      const userData: UserCreateRequest = {
        email: createForm.email,
        username: createForm.username,
        first_name: createForm.first_name || undefined,
        last_name: createForm.last_name || undefined,
        role: createForm.role,
        password: createForm.password,
        department: createForm.department || undefined,
        phone: createForm.phone || undefined,
        send_invite_email: createForm.send_invite_email,
      };

      await adminApi.createUser(userData);

      toast.success("User created successfully");
      setCreateDialog(false);
      setCreateForm({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        role: UserRole.VIEWER,
        password: "",
        department: "",
        phone: "",
        send_invite_email: true,
      });
      setCreateFormErrors({});
      loadUsers();
    } catch (err: any) {
      console.error("Failed to create user:", err);
      toast.error(err.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !validateEditForm()) return;

    try {
      setSaving(true);

      const userData: UserUpdateRequest = {
        email: editForm.email,
        username: editForm.username,
        first_name: editForm.first_name || undefined,
        last_name: editForm.last_name || undefined,
        role: editForm.role,
        password: editForm.password || undefined,
        department: editForm.department || undefined,
        phone: editForm.phone || undefined,
      };

      await adminApi.updateUser(currentUser.id, userData);

      toast.success("User updated successfully");
      setEditDialog(false);
      setCurrentUser(null);
      setEditForm({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        role: UserRole.VIEWER,
        password: "",
        department: "",
        phone: "",
      });
      setEditFormErrors({});
      loadUsers();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      toast.error(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // Handle user selection
  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  // Handle user actions
  const handleEditUser = (user: UserManagementType) => {
    setCurrentUser(user);
    setEditDialog(true);
  };

  const handleDeleteUser = (user: UserManagementType) => {
    setCurrentUser(user);
    setDeleteDialog(true);
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await adminApi.activateUser(userId);
      toast.success("User activated successfully");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to activate user");
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      await adminApi.deactivateUser(userId);
      toast.success("User deactivated successfully");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate user");
    }
  };

  // Bulk operations
  const handleBulkActivate = async () => {
    try {
      await adminApi.bulkActivateUsers(selectedUsers);
      toast.success("Users activated successfully");
      setSelectedUsers([]);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to activate users");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await adminApi.bulkDeactivateUsers(selectedUsers);
      toast.success("Users deactivated successfully");
      setSelectedUsers([]);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate users");
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedUsers.length} users?`
      )
    ) {
      try {
        await Promise.all(selectedUsers.map((id) => adminApi.deleteUser(id)));
        toast.success("Users deleted successfully");
        setSelectedUsers([]);
        loadUsers();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete users");
      }
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "manager":
        return "warning";
      case "analyst":
        return "info";
      case "developer":
        return "primary";
      case "tester":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" fontWeight={600}>
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            Create User
          </Button>
        </Stack>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="analyst">Analyst</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="tester">Tester</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadUsers}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {selectedUsers.length} user(s) selected
              </Typography>
              <Button
                size="small"
                startIcon={<CheckCircle />}
                onClick={handleBulkActivate}
              >
                Activate
              </Button>
              <Button
                size="small"
                startIcon={<Block />}
                onClick={handleBulkDeactivate}
              >
                Deactivate
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </Stack>
          </Card>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    indeterminate={
                      selectedUsers.length > 0 &&
                      selectedUsers.length < users.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role) as any}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        color={user.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user.is_active ? (
                          <Tooltip title="Deactivate User">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleDeactivateUser(user.id)}
                            >
                              <Block fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate User">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleActivateUser(user.id)}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Create User Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  error={Boolean(createFormErrors.email)}
                  helperText={createFormErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  error={Boolean(createFormErrors.username)}
                  helperText={createFormErrors.username}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                  error={Boolean(createFormErrors.first_name)}
                  helperText={createFormErrors.first_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                  error={Boolean(createFormErrors.last_name)}
                  helperText={createFormErrors.last_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(createFormErrors.role)}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                    label="Role"
                  >
                    <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                    <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                    <MenuItem value={UserRole.ANALYST}>Analyst</MenuItem>
                    <MenuItem value={UserRole.DEVELOPER}>Developer</MenuItem>
                    <MenuItem value={UserRole.TESTER}>Tester</MenuItem>
                    <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
                  </Select>
                  {createFormErrors.role && (
                    <FormHelperText>{createFormErrors.role}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={createForm.department}
                  onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  error={Boolean(createFormErrors.department)}
                  helperText={createFormErrors.department}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  error={Boolean(createFormErrors.phone)}
                  helperText={createFormErrors.phone || "Format: +7XXXXXXXXXX"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  error={Boolean(createFormErrors.password)}
                  helperText={createFormErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={createForm.send_invite_email}
                      onChange={(e) => setCreateForm({ ...createForm, send_invite_email: e.target.checked })}
                    />
                  }
                  label="Send invitation email"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create User"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  error={Boolean(editFormErrors.email)}
                  helperText={editFormErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  error={Boolean(editFormErrors.username)}
                  helperText={editFormErrors.username}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  error={Boolean(editFormErrors.first_name)}
                  helperText={editFormErrors.first_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  error={Boolean(editFormErrors.last_name)}
                  helperText={editFormErrors.last_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    label="Role"
                  >
                    <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                    <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                    <MenuItem value={UserRole.ANALYST}>Analyst</MenuItem>
                    <MenuItem value={UserRole.DEVELOPER}>Developer</MenuItem>
                    <MenuItem value={UserRole.TESTER}>Tester</MenuItem>
                    <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  error={Boolean(editFormErrors.department)}
                  helperText={editFormErrors.department}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  error={Boolean(editFormErrors.phone)}
                  helperText={editFormErrors.phone || "Format: +7XXXXXXXXXX"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password (leave blank to keep current)"
                  type={showPassword ? "text" : "password"}
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  error={Boolean(editFormErrors.password)}
                  helperText={editFormErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{currentUser?.username}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (currentUser) {
                try {
                  await adminApi.deleteUser(currentUser.id);
                  toast.success("User deleted successfully");
                  setDeleteDialog(false);
                  setCurrentUser(null);
                  loadUsers();
                } catch (err: any) {
                  toast.error(err.message || "Failed to delete user");
                }
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementComponent;
