import React, { useState, useRef, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { Box, IconButton, useTheme, alpha } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

interface FullPageScrollProps {
  children: ReactNode[];
  onSectionChange?: (index: number) => void;
  showNavigation?: boolean;
  showProgress?: boolean;
  threshold?: number;
  animationDuration?: number;
}

interface ScrollIndicatorProps {
  activeSection: number;
  totalSections: number;
  onScrollTo: (index: number) => void;
  isScrolling: boolean;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  activeSection,
  totalSections,
  onScrollTo,
  isScrolling,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <Box
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          opacity: isScrolling ? 0.5 : 1,
          transition: "opacity 0.3s ease",
          // Responsive positioning to avoid AppBar
          "@media (max-width: 600px)": {
            right: 12,
            transform: "translateY(-50%) scale(0.8)",
          },
        }}
      >
        {/* Previous Arrow */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconButton
            onClick={() => activeSection > 0 && onScrollTo(activeSection - 1)}
            disabled={activeSection === 0 || isScrolling}
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              color: theme.palette.primary.main,
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              mb: 1,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                opacity: 0.3,
                cursor: "not-allowed",
              },
              transition: "all 0.3s ease",
              backdropFilter: "blur(15px)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
            }}
          >
            <KeyboardArrowUp />
          </IconButton>
        </motion.div>

        {/* Dots */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            py: 2.5,
            px: 1.5,
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            borderRadius: 3,
            backdropFilter: "blur(15px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            // Better mobile responsiveness
            "@media (max-width: 600px)": {
              py: 2,
              px: 1,
              gap: 1,
            },
          }}
        >
          {Array.from({ length: totalSections }, (_, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <motion.div
                onClick={() => onScrollTo(index)}
                style={{
                  width: index === activeSection ? 14 : 10,
                  height: index === activeSection ? 14 : 10,
                  borderRadius: "50%",
                  backgroundColor: index === activeSection
                    ? theme.palette.primary.main
                    : alpha(theme.palette.grey[400], 0.6),
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: index === activeSection 
                    ? `0 0 20px ${alpha(theme.palette.primary.main, 0.8)}`
                    : `0 2px 8px ${alpha(theme.palette.grey[400], 0.3)}`,
                  border: index === activeSection 
                    ? `2px solid ${alpha(theme.palette.primary.light, 0.5)}`
                    : `1px solid ${alpha(theme.palette.grey[300], 0.4)}`,
                }}
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: theme.palette.primary.light,
                  boxShadow: `0 0 25px ${alpha(theme.palette.primary.main, 0.9)}`,
                }}
                whileTap={{ scale: 0.8 }}
                animate={{
                  scale: index === activeSection ? 1.1 : 1,
                  rotate: index === activeSection ? 0 : 0, // Remove rotation for better stability
                }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                }}
              >
                {/* Outer ring for active dot */}
                {index === activeSection && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: "-50%",
                      left: "-50%",  
                      transform: "translate(-50%, -50%)",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                      zIndex: -1,
                    }}
                    animate={{  
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          ))}
        </Box>

        {/* Next Arrow */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconButton
            onClick={() =>
              activeSection < totalSections - 1 && onScrollTo(activeSection + 1)
            }
            disabled={activeSection === totalSections - 1 || isScrolling}
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              color: theme.palette.primary.main,
              width: 40,
              height: 40,
              mt: 1,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              },
              "&:disabled": {
                opacity: 0.3,
              },
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <KeyboardArrowDown />
          </IconButton>
        </motion.div>
      </Box>
    </motion.div>
  );
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 64, // Position below AppBar
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: alpha(theme.palette.grey[300], 0.3),
        zIndex: 1001,
        overflow: "hidden",
        // Responsive positioning
        "@media (max-width: 600px)": {
          top: 56, // Mobile AppBar height
        },
      }}
    >
      <motion.div
        style={{
          height: "100%",
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
          borderRadius: "0 2px 2px 0",
          position: "relative",
          boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
        }}
        initial={{ width: 0, scale: 0.8 }}
        animate={{ 
          width: `${progress}%`,
          scale: 1,
        }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 80,
          damping: 15,
        }}
      >
        {/* Animated glow effect */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "30px",
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.8)}, transparent)`,
          }}
          animate={{ x: [-30, 30] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Pulsing effect */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.3)}, ${alpha(theme.palette.secondary.light, 0.3)})`,
            borderRadius: "0 2px 2px 0",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </Box>
  );
};

export const FullPageScroll: React.FC<FullPageScrollProps> = ({
  children,
  onSectionChange,
  showNavigation = true,
  showProgress = true,
  threshold = 50,
  animationDuration = 1.2,
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);

  const totalSections = children.length;

  // Calculate progress
  const progress = ((currentSection + 1) / totalSections) * 100;

  // Scroll to specific section
  const scrollToSection = (index: number) => {
    if (index < 0 || index >= totalSections || isScrolling) return;

    setIsScrolling(true);
    setCurrentSection(index);

    // Add section change callback
    onSectionChange?.(index);

    // Reset scrolling state with delay
    setTimeout(() => {
      setIsScrolling(false);
    }, animationDuration * 1000);
  };

  // Enhanced wheel handler with momentum
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const now = Date.now();
    
    if (now - lastScrollTime.current < 100 || isScrolling) return;
    
    lastScrollTime.current = now;
    const delta = e.deltaY;
    
    if (Math.abs(delta) > threshold) {
      if (delta > 0 && currentSection < totalSections - 1) {
        scrollToSection(currentSection + 1);
      } else if (delta < 0 && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    }
  };

  // Enhanced touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isScrolling) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    
    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0 && currentSection < totalSections - 1) {
        scrollToSection(currentSection + 1);
      } else if (deltaY < 0 && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    }
  };

  // Enhanced keyboard handler
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isScrolling) return;
    
    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault();
        if (currentSection < totalSections - 1) {
          scrollToSection(currentSection + 1);
        }
        break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        if (currentSection > 0) {
          scrollToSection(currentSection - 1);
        }
        break;
      case "Home":
        e.preventDefault();
        scrollToSection(0);
        break;
      case "End":
        e.preventDefault();
        scrollToSection(totalSections - 1);
        break;
    }
  };

  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSection, isScrolling, totalSections, threshold]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        cursor: isScrolling ? "wait" : "default",
        // Hide scrollbar completely
        "&::-webkit-scrollbar": {
          display: "none",
          width: 0,
          height: 0,
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "transparent",
        },
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE and Edge
      }}
    >
      {/* Progress Bar */}
      {showProgress && <ProgressBar progress={progress} />}

      {/* Navigation */}
      {showNavigation && (
        <ScrollIndicator
          activeSection={currentSection}
          totalSections={totalSections}
          onScrollTo={scrollToSection}
          isScrolling={isScrolling}
        />
      )}

      {/* Sections - Only render current section */}
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        {children.map((child, index) => (
          <motion.div
            key={index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: index === currentSection ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
            initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 15 }}
            animate={{ 
              opacity: index === currentSection ? 1 : 0,
              y: index === currentSection ? 0 : (index < currentSection ? -50 : 100),
              scale: index === currentSection ? 1 : 0.95,
              rotateX: index === currentSection ? 0 : (index < currentSection ? -10 : 15),
              filter: index === currentSection ? "blur(0px)" : "blur(3px)",
            }}
            transition={{
              duration: animationDuration,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          >
            {/* Background gradient effect */}
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.05) 0%, transparent 70%)`,
                zIndex: -1,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: index === currentSection ? 1 : 0,
                scale: index === currentSection ? 1.2 : 0.8,
              }}
              transition={{
                duration: animationDuration * 1.5,
                ease: "easeOut",
              }}
            />
            
            {/* Content with stagger animation */}
            <motion.div
              style={{ width: "100%", height: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSection ? 1 : 0 }}
              transition={{
                duration: animationDuration * 0.8,
                delay: index === currentSection ? 0.2 : 0,
                ease: "easeOut",
              }}
            >
              {child}
            </motion.div>
            
            {/* Floating particles for active section */}
            {index === currentSection && (
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: "absolute",
                      width: "6px",
                      height: "6px",
                      backgroundColor: `rgba(25, 118, 210, ${0.2 + Math.random() * 0.3})`,
                      borderRadius: "50%",
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [-30, 30],
                      x: [-20, 20],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};
