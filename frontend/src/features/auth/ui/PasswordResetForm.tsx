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
} from '@mui/material';
import { useAuth } from '../model/auth.context';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Check Your Email
          </Typography>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            We've sent password reset instructions to your email address.
          </Alert>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            If you don't see the email, check your spam folder or try again.
          </Typography>

          <Box textAlign="center">
            <Button
              variant="outlined"
              onClick={onSwitchToLogin}
              size="large"
            >
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Reset Password
        </Typography>
        
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !email.trim()}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
          </Button>

          <Box textAlign="center" sx={{ mt: 2 }}>
            <Button
              variant="text"
              onClick={onSwitchToLogin}
            >
              Back to Login
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}; 