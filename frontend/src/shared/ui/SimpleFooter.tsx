import React from 'react';
import {
  Box,
  Typography,
  Link,
  useTheme,
  alpha,
} from '@mui/material';

const SimpleFooter: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 3,
        mt: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', px: 2 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          © {currentYear} Requify. Все права защищены.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/privacy"
            color="text.secondary"
            underline="hover"
            sx={{
              fontSize: '0.875rem',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Политика конфиденциальности
          </Link>
          <Link
            href="/terms"
            color="text.secondary"
            underline="hover"
            sx={{
              fontSize: '0.875rem',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Условия использования
          </Link>
          <Link
            href="/support"
            color="text.secondary"
            underline="hover"
            sx={{
              fontSize: '0.875rem',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Поддержка
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default SimpleFooter; 