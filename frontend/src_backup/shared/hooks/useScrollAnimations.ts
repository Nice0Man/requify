import { useEffect, useRef } from 'react';
import { useAnimation, useInView } from 'framer-motion';

export interface ScrollAnimationConfig {
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
  ease?: string | number[];
}

export const useScrollAnimation = (config: ScrollAnimationConfig = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    threshold: config.threshold || 0.1,
    once: config.triggerOnce || true 
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: config.duration || 0.6,
          ease: config.ease || "easeOut",
          delay: config.delay || 0,
        }
      });
    }
  }, [isInView, controls, config]);

  return {
    ref,
    controls,
    isInView,
    animate: controls,
    initial: { opacity: 0, y: 50, scale: 0.9 }
  };
};

export const useFadeInUp = (delay = 0) => {
  return useScrollAnimation({
    delay,
    duration: 0.8,
    ease: [0.25, 0.46, 0.45, 0.94]
  });
};

export const useFadeInLeft = (delay = 0) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1, once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, delay, ease: "easeOut" }
      });
    }
  }, [isInView, controls, delay]);

  return {
    ref,
    controls,
    animate: controls,
    initial: { opacity: 0, x: -50 }
  };
};

export const useFadeInRight = (delay = 0) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1, once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, delay, ease: "easeOut" }
      });
    }
  }, [isInView, controls, delay]);

  return {
    ref,
    controls,
    animate: controls,
    initial: { opacity: 0, x: 50 }
  };
};

export const useScaleIn = (delay = 0) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1, once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        scale: 1,
        transition: { 
          duration: 0.6, 
          delay, 
          ease: "backOut",
          type: "spring",
          stiffness: 100
        }
      });
    }
  }, [isInView, controls, delay]);

  return {
    ref,
    controls,
    animate: controls,
    initial: { opacity: 0, scale: 0.8 }
  };
};

export const useStaggerChildren = (delay = 0.1) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1, once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        transition: {
          staggerChildren: delay,
          delayChildren: 0.2
        }
      });
    }
  }, [isInView, controls, delay]);

  return {
    ref,
    controls,
    animate: controls,
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delay,
          delayChildren: 0.2
        }
      }
    }
  };
};

export const useParallax = (offset = 50) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0 });
  
  return {
    ref,
    style: {
      transform: isInView ? `translateY(${offset}px)` : 'translateY(0px)',
      transition: 'transform 0.8s ease-out'
    }
  };
};

// Анимационные константы
export const ANIMATION_VARIANTS = {
  fadeInUp: {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "backOut",
        type: "spring",
        stiffness: 100
      }
    }
  },
  slideUp: {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
}; 