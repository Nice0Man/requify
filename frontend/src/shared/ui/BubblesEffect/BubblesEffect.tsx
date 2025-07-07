import React, { useEffect, useRef } from "react";
import { Box, useTheme, alpha } from "@mui/material";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
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
  zIndex = -1,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationRef = useRef<number>();

  // Правильная обработка цветов из темы
  const getBubbleColor = () => {
    if (!color) {
      return theme.palette.primary.main;
    }
    
    // Если цвет - это ключ из темы
    if (color === "primary") {
      return theme.palette.primary.main;
    }
    if (color === "secondary") {
      return theme.palette.secondary.main;
    }
    if (color === "error") {
      return theme.palette.error.main;
    }
    if (color === "warning") {
      return theme.palette.warning.main;
    }
    if (color === "info") {
      return theme.palette.info.main;
    }
    if (color === "success") {
      return theme.palette.success.main;
    }
    
    // Если цвет - это уже hex/rgb строка
    return color;
  };

  const bubbleColor = getBubbleColor();

  // Создание пузырьков
  const createBubbles = () => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      bubbles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 100,
        size: Math.random() * (maxSize - minSize) + minSize,
        speed: (Math.random() * 0.5 + 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.1,
        delay: Math.random() * 2000,
      });
    }
    return bubbles;
  };

  // Анимация пузырьков
  const animateBubbles = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const bubbleElements = container.children;

    bubblesRef.current.forEach((bubble, index) => {
      // Движение вверх
      bubble.y -= bubble.speed;

      // Легкое покачивание по горизонтали
      bubble.x += Math.sin(Date.now() * 0.001 + bubble.id) * 0.5;

      // Если пузырек ушел за экран, создаем новый снизу
      if (bubble.y < -bubble.size) {
        bubble.y = window.innerHeight + bubble.size;
        bubble.x = Math.random() * window.innerWidth;
        bubble.size = Math.random() * (maxSize - minSize) + minSize;
        bubble.speed = (Math.random() * 0.5 + 0.5) * speed;
        bubble.opacity = Math.random() * 0.5 + 0.1;
      }

      // Ограничиваем по горизонтали
      if (bubble.x < -bubble.size) bubble.x = window.innerWidth + bubble.size;
      if (bubble.x > window.innerWidth + bubble.size) bubble.x = -bubble.size;

      // Применяем стили к элементу
      const element = bubbleElements[index] as HTMLElement;
      if (element) {
        element.style.transform = `translate(${bubble.x}px, ${bubble.y}px)`;
        element.style.width = `${bubble.size}px`;
        element.style.height = `${bubble.size}px`;
        element.style.opacity = bubble.opacity.toString();
      }
    });

    animationRef.current = requestAnimationFrame(animateBubbles);
  };

  useEffect(() => {
    bubblesRef.current = createBubbles();

    // Запускаем анимацию с задержкой
    const timer = setTimeout(() => {
      animateBubbles();
    }, 1000);

    const handleResize = () => {
      bubblesRef.current = createBubbles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [count, maxSize, minSize, speed]);

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
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, ${alpha(
              bubbleColor,
              0.8
            )}, ${alpha(bubbleColor, 0.2)})`,
            backdropFilter: "blur(1px)",
            border: `1px solid ${alpha(bubbleColor, 0.3)}`,
            boxShadow: `inset 0 0 10px ${alpha(bubbleColor, 0.2)}`,
            animation: "bubble-float 3s infinite ease-in-out",
            "@keyframes bubble-float": {
              "0%, 100%": {
                transform: "scale(1)",
              },
              "50%": {
                transform: "scale(1.1)",
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export { BubblesEffect }; 