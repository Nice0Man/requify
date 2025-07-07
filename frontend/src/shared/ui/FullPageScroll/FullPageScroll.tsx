import React, { useTransition, useEffect, useRef, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, useTheme, alpha } from "@mui/material";
import { useSpring, animated } from "@react-spring/web";

interface FullPageScrollProps {
  children: ReactNode[];
  activeSection: number;
  onSectionChange: (index: number) => void;
  className?: string;
  animationDuration?: number;
  threshold?: number;
  disabled?: boolean;
}

export const FullPageScroll: React.FC<FullPageScrollProps> = ({
  children,
  activeSection,
  onSectionChange,
  className,
  animationDuration = 0.8,
  threshold = 50,
  disabled = false,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<boolean>(false);
  const lastEventTimeRef = useRef<number>(0);
  const touchStartRef = useRef<number>(0);
  
  // React 18 concurrent features
  const [isPending, startTransition] = useTransition();
  
  const totalSections = children.length;

  // Memoized spring config to prevent recreation
  const springConfig = useMemo(() => ({
    tension: 180,
    friction: 45,
    mass: 0.8,
  }), []);

  // Spring animation - stable reference
  const [springs, springApi] = useSpring(() => ({
    transform: `translateY(-${activeSection * 100}vh)`,
    config: springConfig,
  }));

  // Update spring when activeSection changes
  useEffect(() => {
    if (animationRef.current) return;
    
    animationRef.current = true;
    springApi.start({
      transform: `translateY(-${activeSection * 100}vh)`,
      config: springConfig,
      onRest: () => {
        animationRef.current = false;
      },
    });
  }, [activeSection, springApi, springConfig]);

  // Memoized pure navigation function
  const handleNavigation = useMemo(() => {
    return (direction: 'up' | 'down') => {
      if (disabled || animationRef.current) return;

      const now = Date.now();
      if (now - lastEventTimeRef.current < 100) return;
      lastEventTimeRef.current = now;

      let targetSection: number;
      if (direction === 'down' && activeSection < totalSections - 1) {
        targetSection = activeSection + 1;
      } else if (direction === 'up' && activeSection > 0) {
        targetSection = activeSection - 1;
      } else {
        return;
      }

      // Use startTransition for smooth updates
      startTransition(() => {
        onSectionChange(targetSection);
      });
    };
  }, [activeSection, totalSections, disabled, onSectionChange]);

  // Memoized direct navigation function
  const handleDirectNavigation = useMemo(() => {
    return (targetIndex: number) => {
      if (disabled || animationRef.current || targetIndex < 0 || targetIndex >= totalSections || targetIndex === activeSection) {
        return;
      }

      startTransition(() => {
        onSectionChange(targetIndex);
      });
    };
  }, [activeSection, totalSections, disabled, onSectionChange]);

  // Effect for event listeners with proper cleanup
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    // Wheel handler - Pure function
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      if (Math.abs(event.deltaY) > threshold) {
        handleNavigation(event.deltaY > 0 ? 'down' : 'up');
      }
    };

    // Touch handlers - Pure functions
    const handleTouchStart = (event: TouchEvent) => {
      touchStartRef.current = event.touches[0].clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touchEnd = event.changedTouches[0].clientY;
      const deltaY = touchStartRef.current - touchEnd;

      if (Math.abs(deltaY) > threshold) {
        handleNavigation(deltaY > 0 ? 'down' : 'up');
      }
    };

    // Keyboard handler - Pure function
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          event.preventDefault();
          handleNavigation('down');
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          handleNavigation('up');
          break;
        case "Home":
          event.preventDefault();
          handleDirectNavigation(0);
          break;
        case "End":
          event.preventDefault();
          handleDirectNavigation(totalSections - 1);
          break;
      }
    };

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("keydown", handleKeyDown, { passive: true });

    // Focus for keyboard events
    container.focus();

    // Cleanup function - Critical for StrictMode
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [disabled, threshold, handleNavigation, handleDirectNavigation, totalSections]);

  // Memoized section content to prevent unnecessary rerenders
  const sectionElements = useMemo(() => {
    return children.map((child, index) => {
      const isActive = index === activeSection;
      const distance = Math.abs(index - activeSection);
      
      return (
        <motion.div
          key={index}
          style={{
            height: "100vh",
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
          initial={false}
          animate={{
            opacity: distance <= 1 ? 1 : 0.3,
            scale: isActive ? 1 : 0.98,
            filter: isActive ? "blur(0px)" : distance <= 1 ? "blur(1px)" : "blur(3px)",
          }}
          transition={{
            duration: animationDuration,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {child}
        </motion.div>
      );
    });
  }, [children, activeSection, animationDuration]);

  return (
    <Box
      ref={containerRef}
      className={className}
      tabIndex={0}
      sx={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        outline: "none",
        cursor: isPending ? "wait" : "default",
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <animated.div
        style={{
          ...springs,
          height: `${totalSections * 100}vh`,
          width: "100%",
          willChange: "transform",
        }}
      >
        {sectionElements}
      </animated.div>

      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              background: `linear-gradient(45deg, ${alpha(
                theme.palette.primary.main,
                0.02
              )}, ${alpha(theme.palette.secondary.main, 0.02)})`,
              zIndex: 10,
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}; 