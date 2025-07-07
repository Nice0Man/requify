import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Paper 
} from '@mui/material';

interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => void;
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onSubmit, 
  onBackToLogin 
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('auth.emailRequired'));
      return;
    }
    
    onSubmit?.(email);
    setIsSubmitted(true);
    setError('');
  };

  if (isSubmitted) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('auth.passwordResetEmailSent')}
        </Alert>
        <Button 
          variant="outlined" 
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
        {t('auth.forgotPassword')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('auth.forgotPasswordDescription')}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {t('auth.sendResetLink')}
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