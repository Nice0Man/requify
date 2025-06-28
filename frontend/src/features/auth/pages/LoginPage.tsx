import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/auth.context';
import { LoginRequest } from '../types/auth.types';

// Enhanced validation schema
const loginSchema = yup.object({
  username: yup
    .string()
    .required('Email or username is required')
    .test('email-or-username', 'Enter a valid email or username', function(value) {
      if (!value) return false;
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a valid username (alphanumeric, underscore, hyphen, at least 3 chars)
      const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
      return emailRegex.test(value) || usernameRegex.test(value);
    }),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  remember_me: yup.boolean().optional()
});

interface LoginFormData {
  username: string;
  password: string;
  remember_me?: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember_me: false
    }
  });

  const watchedUsername = watch('username');

  // Clear errors when user starts typing
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watchedUsername, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginData: LoginRequest = {
        username: data.username,
        password: data.password,
        grant_type: 'password'
      };
      
      await login(loginData);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by auth context
      console.error('Login failed:', error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputIcon = () => {
    if (!watchedUsername) return <Email />;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(watchedUsername) ? <Email /> : <Email />;
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: { xs: 4, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 3, md: 4 }, 
            width: '100%',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
              <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Requify
              </Typography>
            </Box>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to your requirements management account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={clearError}
            >
              {error.error_description || error.error || 'Login failed. Please check your credentials.'}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Email or Username"
              placeholder="Enter your email or username"
              autoComplete="username"
              autoFocus
              error={!!errors.username}
              helperText={errors.username?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getInputIcon()}
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              {...register('username')}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
              {...register('password')}
            />

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  {...register('remember_me')}
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ mb: 2 }}
            />
            
            {/* Sign In Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 2, 
                mb: 3, 
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                },
                '&:disabled': {
                  background: '#ccc'
                }
              }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Need help?
              </Typography>
            </Divider>

            {/* Links */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Link 
                component={RouterLink} 
                to="/auth/forgot-password" 
                variant="body2"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Forgot password?
              </Link>
              <Link 
                component={RouterLink} 
                to="/auth/register" 
                variant="body2"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Create account
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Requify - Requirements Management System
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {/* TODO: Fetch version info from http://localhost/api/v1/ */}
            Version 1.0.0 | © 2025 Requify
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage; 