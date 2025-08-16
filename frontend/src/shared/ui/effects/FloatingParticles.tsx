import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

// =============================================================================
// Types
// =============================================================================

export interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export interface FloatingParticlesProps {
  particles: FloatingParticle[];
  theme: any;
}

export interface AnimatedGradientProps {
  theme: any;
}

// =============================================================================
// Utility Functions
// =============================================================================

export const generateFloatingParticles = (count: number): FloatingParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 38 + 16,
    duration: Math.random() * 22 + 16,
    delay: Math.random() * 6,
  }));
};

// =============================================================================
// Components
// =============================================================================

const MotionBox = motion(Box);

export const FloatingParticle: React.FC<{
  particle: FloatingParticle;
  theme: any;
}> = ({ particle, theme }) => {
  return (
    <MotionBox
      initial={{
        x: `${particle.x}vw`,
        y: `${particle.y}vh`,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: [`${particle.x}vw`, `${particle.x + 4}vw`, `${particle.x}vw`],
        y: [`${particle.y}vh`, `${particle.y - 6}vh`, `${particle.y}vh`],
        scale: [0, 1, 0.8, 1],
        opacity: [0, 0.28, 0.12, 0.28],
        rotate: [0, 150, 300, 360],
      }}
      transition={{
        duration: particle.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: particle.delay,
      }}
      sx={{
        position: "fixed",
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}18, ${theme.palette.secondary.main}22)`,
        filter: "blur(1.3px)",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  particles,
  theme,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          particle={particle}
          theme={theme}
        />
      ))}
    </Box>
  );
};

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ theme }) => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5 }}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 25% 25%, ${theme.palette.primary.main}10 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, ${theme.palette.secondary.main}10 0%, transparent 50%)
        `,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}; 