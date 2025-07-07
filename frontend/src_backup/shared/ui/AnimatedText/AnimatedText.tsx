import React from 'react';
import { motion } from 'framer-motion';
import { Typography, TypographyProps } from '@mui/material';

interface AnimatedTextProps extends Omit<TypographyProps, 'children'> {
  children: string;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'typewriter';
  delay?: number;
  duration?: number;
  stagger?: boolean;
  once?: boolean;
}

const textVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0
    }
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200
    }
  }
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  stagger = false,
  once = true,
  ...typographyProps
}) => {
  const MotionTypography = motion(Typography);

  if (animation === 'typewriter' || stagger) {
    const letters = children.split('');
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
        transition={{ delay }}
      >
        <Typography {...typographyProps} component="div">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              style={{ display: 'inline-block' }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </Typography>
      </motion.div>
    );
  }

  return (
    <MotionTypography
      {...typographyProps}
      variants={textVariants[animation]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </MotionTypography>
  );
};

// Компонент для анимированного заголовка с подзаголовком
interface AnimatedHeadingProps {
  title: string;
  subtitle?: string;
  titleVariant?: TypographyProps['variant'];
  subtitleVariant?: TypographyProps['variant'];
  align?: 'left' | 'center' | 'right';
  delay?: number;
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  title,
  subtitle,
  titleVariant = 'h2',
  subtitleVariant = 'h6',
  align = 'center',
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      style={{ textAlign: align }}
    >
      <AnimatedText
        variant={titleVariant}
        animation="fadeInUp"
        delay={delay}
        stagger
        sx={{ mb: subtitle ? 2 : 0 }}
      >
        {title}
      </AnimatedText>
      
      {subtitle && (
        <AnimatedText
          variant={subtitleVariant}
          animation="fadeInUp"
          delay={delay + 0.2}
          color="text.secondary"
        >
          {subtitle}
        </AnimatedText>
      )}
    </motion.div>
  );
};

// Компонент для анимированного списка
interface AnimatedListProps {
  items: string[];
  delay?: number;
  staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  delay = 0,
  staggerDelay = 0.1
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay
          }
        }
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Typography variant="body1" sx={{ mb: 1 }}>
            • {item}
          </Typography>
        </motion.div>
      ))}
    </motion.div>
  );
}; 