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
import { PageLoadingSpinner } from '../LoadingSpinner';

export interface AuthLayoutProps {
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
      <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
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
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
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
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                color: theme.palette.primary.main,
              },
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
                opacity: 0.8,
                transition: 'opacity 0.3s ease-in-out',
                '&:hover': {
                  opacity: 1,
                },
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
              animation: 'progressShimmer 2s ease-in-out infinite',
              '@keyframes progressShimmer': {
                '0%': { opacity: 0.8 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.8 },
              },
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
        #ffffff 0%, 
        #f8fafc 20%, 
        #e3f2fd 40%, 
        #bbdefb 60%, 
        #90caf9 80%, 
        #64b5f6 100%
      )`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, ${alpha('#2196f3', 0.15)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha('#1976d2', 0.1)} 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${alpha('#ffffff', 0.8)} 0%, transparent 50%),
          radial-gradient(circle at 60% 60%, ${alpha('#e3f2fd', 0.6)} 0%, transparent 50%)
        `,
        zIndex: 0,
        animation: 'backgroundFloat 20s ease-in-out infinite',
        '@keyframes backgroundFloat': {
          '0%, 100%': {
            transform: 'translate(0, 0) rotate(0deg)',
          },
          '33%': {
            transform: 'translate(10px, -10px) rotate(1deg)',
          },
          '66%': {
            transform: 'translate(-10px, 10px) rotate(-1deg)',
          },
        },
      },
    };
  };

  const getPaperStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      zIndex: 1,
      width: '100%',
      maxWidth: maxWidth === 'xs' ? 400 : maxWidth === 'sm' ? 480 : 600,
      mx: 'auto',
      borderRadius: { xs: 0, sm: 6 },
      overflow: 'hidden' as const,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      minHeight: { xs: 'auto', sm: '600px' },
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
        ${alpha('#ffffff', 0.95)} 0%, 
        ${alpha('#f8fafc', 0.9)} 50%,
        ${alpha('#ffffff', 0.95)} 100%
      )`,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha('#e3f2fd', 0.3)}`,
      boxShadow: `
        0 10px 25px -5px ${alpha('#1976d2', 0.08)},
        0 4px 12px -2px ${alpha('#1976d2', 0.04)},
        inset 0 1px 0 ${alpha('#ffffff', 0.2)}
      `,
      p: { xs: 3, sm: 5, md: 6 },
    };
  };

  return (
    <Box sx={getContainerStyles()}>
      <Container maxWidth={maxWidth}>
        <Slide in direction="up" timeout={600} style={{ transitionDelay: '100ms' }}>
          <Paper elevation={0} sx={getPaperStyles()}>
            {renderProgress()}
            {renderHeader()}
            <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
              <Box 
                sx={{
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {children}
              </Box>
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