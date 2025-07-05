import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../model/auth.context';
import { UserRole } from '@/entities/user';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'developer',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        confirm_password: formData.confirmPassword,
        terms_accepted: true,
        privacy_accepted: true,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 450, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Create Account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              margin="normal"
              required
            />
          </Box>

          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={handleChange('username')}
            margin="normal"
            required
            autoComplete="username"
          />

          <TextField
            fullWidth
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
            margin="normal"
            required
            autoComplete="email"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={handleChange('role')}
              label="Role"
            >
              <MenuItem value="developer">Developer</MenuItem>
              <MenuItem value="analyst">Analyst</MenuItem>
              <MenuItem value="tester">Tester</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange('password')}
            margin="normal"
            required
            autoComplete="new-password"
          />

          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            margin="normal"
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>

          <Box textAlign="center" sx={{ mt: 2 }}>
            <Button
              variant="text"
              onClick={onSwitchToLogin}
            >
              Already have an account? Sign In
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 