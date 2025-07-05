import React, { ReactNode } from 'react';
import { Box, Fade, Slide, Zoom, Grow, Collapse } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface PageTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'zoom' | 'grow' | 'collapse';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  in?: boolean;
  unmountOnExit?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 300,
  delay = 0,
  in: inProp = true,
  unmountOnExit = false,
}) => {
  const theme = useTheme();

  const transitionProps = {
    in: inProp,
    timeout: duration,
    unmountOnExit,
    style: {
      transitionDelay: `${delay}ms`,
    },
  };

  const renderTransition = () => {
    switch (type) {
      case 'slide':
        return (
          <Slide direction={direction} {...transitionProps}>
            <Box>{children}</Box>
          </Slide>
        );
      case 'zoom':
        return (
          <Zoom {...transitionProps}>
            <Box>{children}</Box>
          </Zoom>
        );
      case 'grow':
        return (
          <Grow {...transitionProps}>
            <Box>{children}</Box>
          </Grow>
        );
      case 'collapse':
        return (
          <Collapse {...transitionProps}>
            <Box>{children}</Box>
          </Collapse>
        );
      default:
        return (
          <Fade {...transitionProps}>
            <Box>{children}</Box>
          </Fade>
        );
    }
  };

  return renderTransition();
};

// Specialized page transition for route changes
export const RouteTransition: React.FC<{
  children: ReactNode;
  isLoading?: boolean;
}> = ({ children, isLoading = false }) => {
  return (
    <PageTransition
      type="fade"
      duration={200}
      in={!isLoading}
    >
      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        {children}
      </Box>
    </PageTransition>
  );
};

// Staggered animation for lists
export const StaggeredTransition: React.FC<{
  children: ReactNode[];
  staggerDelay?: number;
  type?: 'fade' | 'slide' | 'zoom' | 'grow';
}> = ({ children, staggerDelay = 100, type = 'fade' }) => {
  return (
    <>
      {children.map((child, index) => (
        <PageTransition
          key={index}
          type={type}
          delay={index * staggerDelay}
          direction="up"
        >
          {child}
        </PageTransition>
      ))}
    </>
  );
};

// Page section transition
export const SectionTransition: React.FC<{
  children: ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  return (
    <PageTransition
      type="slide"
      direction="up"
      duration={400}
      delay={delay}
    >
      <Box
        sx={{
          py: 2,
        }}
      >
        {children}
      </Box>
    </PageTransition>
  );
}; 