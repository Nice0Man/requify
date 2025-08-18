import React from "react";
import { Box, useTheme } from "@mui/material";
import { motion } from "framer-motion";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface FloatingBubblesProps {
  count?: number;
  colors?: string[];
  blur?: number;
}

const MotionBox = motion(Box);

const generateBubbles = (count: number): Bubble[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 100 + 30,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));
};

const FloatingBubble: React.FC<{ bubble: Bubble; colors: string[] }> = ({ 
  bubble, 
  colors 
}) => {
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <MotionBox
      initial={{
        x: `${bubble.x}%`,
        y: `${bubble.y}%`,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: [
          `${bubble.x}%`,
          `${(bubble.x + 15) % 100}%`,
          `${(bubble.x - 10 + 100) % 100}%`,
          `${bubble.x}%`,
        ],
        y: [
          `${bubble.y}%`,
          `${(bubble.y - 20 + 100) % 100}%`,
          `${(bubble.y + 10) % 100}%`,
          `${bubble.y}%`,
        ],
        scale: [0, 1, 0.8, 1],
        opacity: [0, bubble.opacity, bubble.opacity * 0.7, bubble.opacity],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: bubble.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: bubble.delay,
      }}
      sx={{
        position: "absolute",
        width: bubble.size,
        height: bubble.size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${randomColor}40, ${randomColor}20)`,
        filter: "blur(2px)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export const FloatingBubbles: React.FC<FloatingBubblesProps> = ({
  count = 15,
  colors,
  blur = 2,
}) => {
  const theme = useTheme();
  
  const defaultColors = colors || [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
  ];

  const bubbles = React.useMemo(() => generateBubbles(count), [count]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {bubbles.map((bubble) => (
        <FloatingBubble 
          key={bubble.id} 
          bubble={bubble} 
          colors={defaultColors}
        />
      ))}
      
      {/* Additional gradient overlay for depth */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 25% 25%, ${theme.palette.primary.main}08 0%, transparent 50%),
            radial-gradient(ellipse at 75% 75%, ${theme.palette.secondary.main}08 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};

export default FloatingBubbles; 