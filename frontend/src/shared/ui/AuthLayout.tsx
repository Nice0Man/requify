import React, { ReactNode } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  alpha,
  LinearProgress,
  Fade,
  Slide,
} from '@mui/material';
import { useAuth } from '@/features/auth/model/auth.context';
import { PageLoadingSpinner } from './LoadingSpinner';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  maxWidth?: 'xs' | 'sm' | 'md';
  showProgress?: boolean;
  variant?: 'default' | 'minimal' | 'branded';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 'sm',
  showProgress = false,
  variant = 'default',
}) => {
  const theme = useTheme();
  const { isLoading } = useAuth();

  if (isLoading && variant !== 'minimal') {
    return <PageLoadingSpinner message="Authenticating..." />;
  }

  const renderHeader = () => {
    if (variant === 'minimal') return null;

    return (
      <Fade in timeout={600}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Brand Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
                fontWeight: 700,
                boxShadow: theme.shadows[8],
                animation: 'logoFloat 3s ease-in-out infinite',
                '@keyframes logoFloat': {
                  '0%, 100%': {
                    transform: 'translateY(0px) rotate(0deg)',
                  },
                  '50%': {
                    transform: 'translateY(-5px) rotate(2deg)',
                  },
                },
              }}
            >
              R
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', sm: '2.5rem' },
              }}
            >
              Requify
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {title}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                maxWidth: 400,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  };

  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        />
      </Box>
    );
  };

  const getContainerStyles = () => {
    const baseStyles = {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    };

    if (variant === 'minimal') {
      return {
        ...baseStyles,
        background: theme.palette.background.default,
      };
    }

    return {
      ...baseStyles,
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.05)} 0%, 
        ${alpha(theme.palette.background.default, 0.8)} 35%, 
        ${alpha(theme.palette.secondary.main, 0.05)} 100%
      )`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%)
        `,
        zIndex: 0,
      },
    };
  };

  const getPaperStyles = () => {
    const baseStyles = {
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: { xs: 400, sm: 480, md: 600 }[maxWidth],
      mx: 'auto',
      borderRadius: { xs: 0, sm: 4 },
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
    };

    if (variant === 'minimal') {
      return {
        ...baseStyles,
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        p: { xs: 3, sm: 4 },
      };
    }

    return {
      ...baseStyles,
      background: `linear-gradient(145deg, 
        ${alpha(theme.palette.background.paper, 0.95)} 0%, 
        ${alpha(theme.palette.background.paper, 0.9)} 100%
      )`,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      boxShadow: `
        0 20px 25px -5px ${alpha(theme.palette.common.black, 0.1)},
        0 10px 10px -5px ${alpha(theme.palette.common.black, 0.04)},
        inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
      `,
      p: { xs: 3, sm: 5, md: 6 },
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `
          0 25px 30px -5px ${alpha(theme.palette.common.black, 0.15)},
          0 15px 15px -5px ${alpha(theme.palette.common.black, 0.06)},
          inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
        `,
      },
    };
  };

  return (
    <Box sx={getContainerStyles()}>
      <Container maxWidth={maxWidth}>
        <Slide in direction="up" timeout={500}>
          <Paper elevation={0} sx={getPaperStyles()}>
            {renderProgress()}
            {renderHeader()}
            <Fade in timeout={800}>
              <Box>{children}</Box>
            </Fade>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

// Specialized layouts for different auth scenarios
export const AuthFormLayout: React.FC<Omit<AuthLayoutProps, 'variant'>> = (props) => (
  <AuthLayout {...props} variant="default" />
);

export const MinimalAuthLayout: React.FC<Omit<AuthLayoutProps, 'variant'>> = (props) => (
  <AuthLayout {...props} variant="minimal" />
);

export const BrandedAuthLayout: React.FC<Omit<AuthLayoutProps, 'variant'>> = (props) => (
  <AuthLayout {...props} variant="branded" />
); 