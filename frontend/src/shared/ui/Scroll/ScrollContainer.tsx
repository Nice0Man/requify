import React, { useRef, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

interface ScrollContainerProps {
  children: React.ReactNode;
  activeSection: number;
  onSectionChange: (sectionIndex: number) => void;
  totalSections: number;
  disabled?: boolean;
  enableKeyboard?: boolean;
  enableWheel?: boolean;
  enableTouch?: boolean;
  animationDuration?: number;
  className?: string;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  activeSection,
  onSectionChange,
  totalSections,
  disabled = false,
  enableKeyboard = true,
  enableWheel = true,
  enableTouch = true,
  animationDuration = 800,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef(0);
  const lastEventTimeRef = useRef(0);

  // Throttle function to prevent excessive navigation
  const throttle = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastEventTimeRef.current >= delay) {
        lastEventTimeRef.current = now;
        func(...args);
      }
    };
  }, []);

  // Navigation handler
  const navigateToSection = useCallback(
    throttle((direction: "up" | "down" | number) => {
      if (disabled || isAnimatingRef.current) return;

      let targetSection: number;

      if (typeof direction === "number") {
        targetSection = direction;
      } else if (direction === "down" && activeSection < totalSections - 1) {
        targetSection = activeSection + 1;
      } else if (direction === "up" && activeSection > 0) {
        targetSection = activeSection - 1;
      } else {
        return;
      }

      if (targetSection >= 0 && targetSection < totalSections) {
        isAnimatingRef.current = true;
        onSectionChange(targetSection);

        // Reset animation flag after animation completes
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, animationDuration);
      }
    }, 150),
    [activeSection, totalSections, disabled, onSectionChange, animationDuration]
  );

  // Wheel event handler
  useEffect(() => {
    if (!enableWheel || disabled) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? "down" : "up";
      navigateToSection(direction);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [enableWheel, disabled, navigateToSection]);

  // Keyboard event handler
  useEffect(() => {
    if (!enableKeyboard || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          navigateToSection("down");
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          navigateToSection("up");
          break;
        case "Home":
          e.preventDefault();
          navigateToSection(0);
          break;
        case "End":
          e.preventDefault();
          navigateToSection(totalSections - 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboard, disabled, navigateToSection, totalSections]);

  // Touch event handlers
  useEffect(() => {
    if (!enableTouch || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY;
      const threshold = 50;

      if (Math.abs(deltaY) > threshold) {
        const direction = deltaY > 0 ? "down" : "up";
        navigateToSection(direction);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [enableTouch, disabled, navigateToSection]);

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
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <motion.div
        animate={{
          y: `-${activeSection * 100}vh`,
        }}
        transition={{
          duration: animationDuration / 1000,
          ease: [0.25, 0.46, 0.45, 0.94], // Более плавная анимация
        }}
        style={{
          height: `${totalSections * 100}vh`,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          willChange: "transform", // Оптимизация для GPU
        }}
      >
        {React.Children.map(children, (child, index) => (
          <Box
            key={index}
            sx={{
              height: "100vh",
              width: "100%",
              minHeight: "100vh",
              // Поддержка новых viewport units для мобильных устройств
              "@supports (height: 100dvh)": {
                minHeight: "100dvh",
              },
              // Fallback для старых браузеров
              "@supports not (height: 100dvh)": {
                minHeight: "calc(var(--vh, 1vh) * 100)",
              },
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {child}
          </Box>
        ))}
      </motion.div>
    </Box>
  );
};
