import React from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

interface ScrollIndicatorProps {
  activeSection: number;
  totalSections: number;
  onScrollToSection: (index: number) => void;
  isScrolling?: boolean;
  position?: 'left' | 'right';
  showArrows?: boolean;
  showDots?: boolean;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  activeSection,
  totalSections,
  onScrollToSection,
  isScrolling = false,
  position = 'right',
  showArrows = true,
  showDots = true,
}) => {
  const theme = useTheme();

  const handlePrevious = () => {
    if (activeSection > 0) {
      onScrollToSection(activeSection - 1);
    }
  };

  const handleNext = () => {
    if (activeSection < totalSections - 1) {
      onScrollToSection(activeSection + 1);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        [position]: 24,
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        opacity: isScrolling ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Previous Arrow */}
      {showArrows && (
        <IconButton
          onClick={handlePrevious}
          disabled={activeSection === 0 || isScrolling}
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main,
            boxShadow: theme.shadows[4],
            width: 40,
            height: 40,
            mb: 1,
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              transform: 'scale(1.1)',
            },
            '&:disabled': {
              opacity: 0.3,
            },
            transition: 'all 0.3s ease',
          }}
        >
          <KeyboardArrowUp />
        </IconButton>
      )}

      {/* Dots Indicator */}
      {showDots && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            py: 2,
            px: 1,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          {Array.from({ length: totalSections }, (_, index) => (
            <Box
              key={index}
              onClick={() => onScrollToSection(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor:
                  index === activeSection
                    ? theme.palette.primary.main
                    : theme.palette.grey[400],
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'scale(1.2)',
                  backgroundColor: theme.palette.primary.main,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: index === activeSection ? 16 : 0,
                  height: index === activeSection ? 16 : 0,
                  borderRadius: '50%',
                  border: `2px solid ${theme.palette.primary.main}`,
                  opacity: index === activeSection ? 1 : 0,
                  transition: 'all 0.3s ease',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Next Arrow */}
      {showArrows && (
        <IconButton
          onClick={handleNext}
          disabled={activeSection === totalSections - 1 || isScrolling}
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main,
            boxShadow: theme.shadows[4],
            width: 40,
            height: 40,
            mt: 1,
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              transform: 'scale(1.1)',
            },
            '&:disabled': {
              opacity: 0.3,
            },
            transition: 'all 0.3s ease',
          }}
        >
          <KeyboardArrowDown />
        </IconButton>
      )}
    </Box>
  );
};

// Минимальный индикатор только с точками
export const ScrollDots: React.FC<
  Pick<ScrollIndicatorProps, 'activeSection' | 'totalSections' | 'onScrollToSection'>
> = ({ activeSection, totalSections, onScrollToSection }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 3,
        boxShadow: theme.shadows[4],
      }}
    >
      {Array.from({ length: totalSections }, (_, index) => (
        <Box
          key={index}
          onClick={() => onScrollToSection(index)}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor:
              index === activeSection
                ? theme.palette.primary.main
                : theme.palette.grey[400],
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.3)',
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
      ))}
    </Box>
  );
};

// Прогресс-бар для скроллинга
export const ScrollProgress: React.FC<{
  activeSection: number;
  totalSections: number;
}> = ({ activeSection, totalSections }) => {
  const theme = useTheme();
  const progress = totalSections > 1 ? (activeSection / (totalSections - 1)) * 100 : 0;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: theme.palette.grey[200],
        zIndex: 1001,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: theme.palette.primary.main,
          transition: 'width 0.5s ease',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      />
    </Box>
  );
}; 