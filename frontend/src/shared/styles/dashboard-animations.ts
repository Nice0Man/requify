import { keyframes } from "@mui/material/styles";
import { DASHBOARD_TOKENS } from "./dashboard-tokens";

// 🎭 Performance-optimized animations for dashboard components
// Using transform and opacity for GPU acceleration

// ⚡ Base keyframes for reusability
const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.98) translateZ(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateZ(0);
  }
`;

const slideUpKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const slideInLeftKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(-30px, 0, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const scaleInKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9) translateZ(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateZ(0);
  }
`;

const pulseKeyframes = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1) translateZ(0);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02) translateZ(0);
  }
`;

const shimmerKeyframes = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// 🎨 Animation factory with performance optimizations
export const createOptimizedAnimation = (
  animationName: string,
  duration: number = DASHBOARD_TOKENS.animation.duration.standard,
  easing: string = DASHBOARD_TOKENS.animation.easing.standard,
  delay: number = 0,
  fillMode: "forwards" | "backwards" | "both" | "none" = "both"
) => ({
  animation: `${animationName} ${duration}ms ${easing} ${delay}ms ${fillMode}`,
  // Performance optimizations
  willChange: "transform, opacity",
  backfaceVisibility: "hidden" as const,
  perspective: 1000,
});

// 🚀 Pre-built animations with GPU acceleration
export const DASHBOARD_ANIMATIONS = {
  // Widget entrance animations
  fadeIn: createOptimizedAnimation(
    fadeInKeyframes,
    DASHBOARD_TOKENS.animation.duration.standard
  ),
  
  slideUp: createOptimizedAnimation(
    slideUpKeyframes,
    DASHBOARD_TOKENS.animation.duration.standard
  ),
  
  slideInLeft: createOptimizedAnimation(
    slideInLeftKeyframes,
    DASHBOARD_TOKENS.animation.duration.standard
  ),
  
  scaleIn: createOptimizedAnimation(
    scaleInKeyframes,
    DASHBOARD_TOKENS.animation.duration.shorter
  ),
  
  // Loading states
  pulse: createOptimizedAnimation(
    pulseKeyframes,
    1500, // Slower for loading states
    DASHBOARD_TOKENS.animation.easing.standard
  ),
  
  shimmer: createOptimizedAnimation(
    shimmerKeyframes,
    2000, // Shimmer effect for skeletons
    "linear"
  ),
  
  // Stagger animations factory
  stagger: (index: number, speed: "fast" | "normal" | "slow" = "normal") => ({
    ...createOptimizedAnimation(
      slideUpKeyframes,
      DASHBOARD_TOKENS.animation.duration.standard,
      DASHBOARD_TOKENS.animation.easing.decelerated,
      DASHBOARD_TOKENS.animation.stagger[speed] * index
    ),
  }),
  
  // Micro-interactions
  buttonHover: {
    transition: `all ${DASHBOARD_TOKENS.animation.duration.shorter}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,
    willChange: "transform",
    "&:hover": {
      transform: "translateY(-1px) translateZ(0)",
    },
    "&:active": {
      transform: "translateY(0) scale(0.98) translateZ(0)",
      transition: `all ${DASHBOARD_TOKENS.animation.duration.shortest}ms ${DASHBOARD_TOKENS.animation.easing.accelerated}`,
    },
  },
  
  cardHover: {
    transition: `all ${DASHBOARD_TOKENS.animation.duration.standard}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,
    willChange: "transform, box-shadow",
    "&:hover": {
      transform: "translateY(-2px) translateZ(0)",
      boxShadow: DASHBOARD_TOKENS.shadows.widget.hover,
    },
  },
  
  // Layout transitions
  layoutTransition: {
    transition: `all ${DASHBOARD_TOKENS.animation.duration.complex}ms ${DASHBOARD_TOKENS.animation.easing.standard}`,
    willChange: "width, height, transform",
  },
  
  // Responsive animations (disabled on mobile for performance)
  responsiveAnimation: (animation: any, disableOnMobile = true) => ({
    ...animation,
    ...(disableOnMobile && {
      "@media (max-width: 768px)": {
        animation: "none",
        transition: "none",
        transform: "none",
      },
    }),
  }),
} as const;

// 🎯 Animation utilities for conditional application
export const withAnimation = (
  baseStyles: any,
  animationType: keyof typeof DASHBOARD_ANIMATIONS,
  condition = true
) => ({
  ...baseStyles,
  ...(condition && DASHBOARD_ANIMATIONS[animationType]),
});

// 🔧 Performance helpers
export const optimizeForAnimation = (element: HTMLElement) => {
  // Force GPU layer creation for smooth animations
  element.style.transform = "translateZ(0)";
  element.style.willChange = "transform, opacity";
  element.style.backfaceVisibility = "hidden";
};

export const cleanupAnimation = (element: HTMLElement) => {
  // Cleanup after animation to save memory
  element.style.willChange = "auto";
  element.style.transform = "";
  element.style.backfaceVisibility = "visible";
};

// 🎭 Animation context for reduced motion
export const getAnimationStyles = (
  animationType: keyof typeof DASHBOARD_ANIMATIONS,
  reduceMotion = false,
  highPerformanceMode = false
) => {
  if (reduceMotion || highPerformanceMode) {
    return {
      animation: "none",
      transition: "none",
    };
  }
  
  return DASHBOARD_ANIMATIONS[animationType];
};

// 📱 Mobile-optimized animations
export const MOBILE_ANIMATIONS = {
  fadeIn: {
    transition: `opacity ${DASHBOARD_TOKENS.animation.duration.shorter}ms ease-out`,
  },
  
  slideUp: {
    transition: `transform ${DASHBOARD_TOKENS.animation.duration.shorter}ms ease-out`,
  },
  
  // Disabled complex animations on mobile
  none: {
    animation: "none",
    transition: "none",
  },
} as const;

// 🎨 Skeleton animation for loading states
export const createSkeletonAnimation = (width?: string | number) => ({
  background: `linear-gradient(90deg, 
    ${DASHBOARD_TOKENS.colors.surface.card} 25%, 
    rgba(255, 255, 255, 0.4) 50%, 
    ${DASHBOARD_TOKENS.colors.surface.card} 75%)`,
  backgroundSize: "200% 100%",
  animation: `${shimmerKeyframes} 2s ease-in-out infinite`,
  borderRadius: 8,
  width: width || "100%",
  height: "1em",
});

export default DASHBOARD_ANIMATIONS; 