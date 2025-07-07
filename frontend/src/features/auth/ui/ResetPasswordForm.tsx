import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface ResetPasswordFormProps {
  token?: string;
  onSubmit?: (password: string, token: string) => void;
  onBackToLogin?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  token = '',
  onSubmit, 
  onBackToLogin 
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError(t('auth.passwordRequired'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    
    onSubmit?.(password, token);
    setIsSubmitted(true);
    setError('');
  };

  if (isSubmitted) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('auth.passwordResetSuccess')}
        </Alert>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={onBackToLogin}
        >
          {t('auth.backToLogin')}
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {t('auth.resetPassword')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.resetPasswordDescription')}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          label={t('auth.newPassword')}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
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
        
        <TextField
          fullWidth
          label={t('auth.confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {t('auth.resetPassword')}
        </Button>
        
        <Button
          fullWidth
          variant="text"
          onClick={onBackToLogin}
        >
          {t('auth.backToLogin')}
        </Button>
      </Box>
    </Paper>
  );
}; 