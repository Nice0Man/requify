import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { Box, useTheme, alpha } from "@mui/material";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  hue: number;
}

interface BubblesEffectProps {
  count?: number;
  maxSize?: number;
  minSize?: number;
  speed?: number;
  color?: string;
  zIndex?: number;
}

const BubblesEffect: React.FC<BubblesEffectProps> = ({
  count = 15,
  maxSize = 60,
  minSize = 10,
  speed = 1,
  color,
  zIndex = -999, // Much lower z-index to ensure background position
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationRef = useRef<number | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Memoized bubble color to prevent recalculation
  const bubbleColor = useMemo(() => {
    if (!color) return theme.palette.primary.main;

    const themeColors: Record<string, string> = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      error: theme.palette.error.main,
      warning: theme.palette.warning.main,
      info: theme.palette.info.main,
      success: theme.palette.success.main,
    };

    return themeColors[color] || color;
  }, [color, theme.palette]);

  // Pure function to create initial bubbles
  const createBubbles = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    if (width === 0 || height === 0) return [];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: height + Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      speed: (Math.random() * 0.5 + 0.5) * speed,
      opacity: Math.random() * 0.3 + 0.05, // Reduced opacity for better background effect
      hue: Math.random() * 30 - 15,
    }));
  }, [count, maxSize, minSize, speed]);

  // Animation function with proper cleanup
  const animateBubbles = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = dimensionsRef.current;
    const bubbleElements = container.children;

    bubblesRef.current.forEach((bubble, index) => {
      // Update bubble position
      bubble.y -= bubble.speed;
      bubble.x += Math.sin(Date.now() * 0.001 + bubble.id) * 0.3;

      // Reset bubble if it goes off screen
      if (bubble.y < -bubble.size) {
        bubble.y = height + bubble.size;
        bubble.x = Math.random() * width;
        bubble.size = Math.random() * (maxSize - minSize) + minSize;
        bubble.speed = (Math.random() * 0.5 + 0.5) * speed;
        bubble.opacity = Math.random() * 0.3 + 0.05;
      }

      // Wrap horizontally
      if (bubble.x < -bubble.size) bubble.x = width + bubble.size;
      if (bubble.x > width + bubble.size) bubble.x = -bubble.size;

      // Update DOM element
      const element = bubbleElements[index] as HTMLElement;
      if (element) {
        element.style.transform = `translate(${bubble.x}px, ${bubble.y}px)`;
        element.style.width = `${bubble.size}px`;
        element.style.height = `${bubble.size}px`;
        element.style.opacity = bubble.opacity.toString();
      }
    });

    animationRef.current = requestAnimationFrame(animateBubbles);
  }, [maxSize, minSize, speed]);

  // Update dimensions safely
  const updateDimensions = useCallback(() => {
    if (typeof window !== 'undefined') {
      dimensionsRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
  }, []);

  // Initialize and start animation
  useEffect(() => {
    updateDimensions();
    bubblesRef.current = createBubbles();

    // Start animation with delay
    const startTimer = setTimeout(() => {
      if (bubblesRef.current.length > 0) {
        animateBubbles();
      }
    }, 1000);

    // Handle resize
    const handleResize = () => {
      updateDimensions();
      bubblesRef.current = createBubbles();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Cleanup function - Critical for StrictMode
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      clearTimeout(startTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [createBubbles, animateBubbles, updateDimensions]);

  // Memoized bubble elements to prevent unnecessary rerenders
  const bubbleElements = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => (
      <Box
        key={index}
        sx={{
          position: "absolute",
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${alpha(
            bubbleColor,
            0.4
          )}, ${alpha(bubbleColor, 0.08)})`, // Reduced opacity for background effect
          backdropFilter: "blur(0.5px)",
          border: `1px solid ${alpha(bubbleColor, 0.1)}`,
          boxShadow: `inset 0 0 6px ${alpha(bubbleColor, 0.08)}`,
          willChange: "transform, opacity",
          pointerEvents: "none",
        }}
      />
    ));
  }, [count, bubbleColor]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: zIndex,
        overflow: "hidden",
        // Ensure this is behind everything
        isolation: "isolate",
      }}
    >
      {bubbleElements}
    </Box>
  );
};

export { BubblesEffect }; 