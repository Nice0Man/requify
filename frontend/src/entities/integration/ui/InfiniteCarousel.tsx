import React from "react";
import { Box, useTheme } from "@mui/material";
import { motion, PanInfo, useScroll, useTransform } from "framer-motion";
import { IntegrationCard } from "./IntegrationCard";
import { useInfiniteCarousel } from "../model/useInfiniteCarousel";
import type { InfiniteCarouselProps } from "../model/types";

const MotionBox = motion(Box);

export const InfiniteCarousel: React.FC<InfiniteCarouselProps> = React.memo(
  ({
    items,
    onItemClick,
    autoPlay = true,
    config,
    className,
    pauseOnHover = true,
  }) => {
    const theme = useTheme();
    const carousel = useInfiniteCarousel(items, {
      ...config,
      autoPlayInterval: autoPlay ? config?.autoPlayInterval : undefined,
    });

    // Параллакс эффект на основе скролла страницы
    const { scrollY } = useScroll();
    const parallaxY = useTransform(scrollY, [0, 1000], [0, -100]);
    const parallaxRotate = useTransform(scrollY, [0, 1000], [0, 2]);

    // Состояние для отслеживания drag vs click
    const [dragState, setDragState] = React.useState({
      isDragging: false,
      startTime: 0,
      startX: 0,
      totalDistance: 0,
    });

    const handleDragStart = React.useCallback(
      (event: any, info: PanInfo) => {
        carousel.handleDragStart();
        setDragState({
          isDragging: true,
          startTime: Date.now(),
          startX: info.point.x,
          totalDistance: 0,
        });
      },
      [carousel.handleDragStart]
    );

    // Ref для отслеживания времени последнего события (throttling)
    const lastEventTimeRef = React.useRef(0);

    // Функция throttling для предотвращения избыточной навигации
    const throttle = React.useCallback((func: Function, delay: number) => {
      return (...args: any[]) => {
        const now = Date.now();
        if (now - lastEventTimeRef.current >= delay) {
          lastEventTimeRef.current = now;
          func(...args);
        }
      };
    }, []);

    // Упрощенная навигация карусели с throttling
    const navigateCarousel = React.useCallback(
      throttle((direction: "next" | "previous") => {
        if (carousel.isTransitioning) return;

        if (direction === "next") {
          carousel.goToNext();
        } else {
          carousel.goToPrevious();
        }
      }, 150), // Такая же задержка как в #advanced секции
      [carousel.goToNext, carousel.goToPrevious, carousel.isTransitioning]
    );

    // Упрощенный обработчик wheel (как в #advanced секции)
    const handleWheel = React.useCallback(
      (event: WheelEvent) => {
        // Простая логика как в ScrollContainer
        event.preventDefault();
        const direction = event.deltaY > 0 ? "next" : "previous";
        navigateCarousel(direction);
      },
      [navigateCarousel]
    );

    // Упрощенная обработка drag
    const handleDrag = React.useCallback(
      (event: any, info: PanInfo) => {
        // Простая проверка без сложной логики
        setDragState((prev) => ({
          ...prev,
          totalDistance: Math.abs(info.offset.x),
        }));

        carousel.handleDrag(info.offset.x);
      },
      [carousel.handleDrag]
    );

    const handleDragEnd = React.useCallback(
      (event: any, info: PanInfo) => {
        const dragDistance = Math.abs(info.offset.x);
        const velocity = Math.abs(info.velocity.x);

        // Упрощенная логика определения drag
        const isDragGesture = dragDistance > 10 || velocity > 100;

        if (isDragGesture) {
          // Передаем offset в хук для обработки
          carousel.handleDragEnd(info.offset.x);
        }

        // Сбрасываем состояние drag
        setDragState({
          isDragging: false,
          startTime: 0,
          startX: 0,
          totalDistance: 0,
        });
      },
      [navigateCarousel]
    );

    // Упрощенная обработка клавиатуры
    const handleKeyDown = React.useCallback(
      (event: KeyboardEvent) => {
        if (carousel.isTransitioning) return;

        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            navigateCarousel("previous");
            break;
          case "ArrowRight":
            event.preventDefault();
            navigateCarousel("next");
            break;
          case "Home":
            event.preventDefault();
            carousel.goToSlide(0);
            break;
          case "End":
            event.preventDefault();
            carousel.goToSlide(items.length - 1);
            break;
          default:
            break;
        }
      },
      [
        navigateCarousel,
        carousel.goToSlide,
        carousel.isTransitioning,
        items.length,
      ]
    );

    // Упрощенная обработка touch событий
    const touchStartYRef = React.useRef(0);
    const touchStartXRef = React.useRef(0);

    const handleTouchStart = React.useCallback((event: TouchEvent) => {
      touchStartXRef.current = event.touches[0].clientX;
      touchStartYRef.current = event.touches[0].clientY;
    }, []);

    const handleTouchEnd = React.useCallback(
      (event: TouchEvent) => {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        const deltaX = touchStartXRef.current - touchEndX;
        const deltaY = touchStartYRef.current - touchEndY;
        const threshold = 50; // Такой же порог как в ScrollContainer

        // Проверяем что горизонтальное движение больше вертикального
        if (
          Math.abs(deltaX) > Math.abs(deltaY) &&
          Math.abs(deltaX) > threshold
        ) {
          const direction = deltaX > 0 ? "next" : "previous";
          navigateCarousel(direction);
        }
      },
      [navigateCarousel]
    );

    // Добавляем все обработчики событий
    React.useEffect(() => {
      const container = carousel.containerRef.current;
      if (!container) return;

      // Wheel события с passive: false для preventDefault
      container.addEventListener("wheel", handleWheel, { passive: false });

      // Клавиатурные события
      container.addEventListener("keydown", handleKeyDown);

      // Touch события с passive: true для лучшей производительности
      container.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });

      // Делаем контейнер focusable
      container.setAttribute("tabindex", "0");
      container.setAttribute("role", "region");
      container.setAttribute("aria-label", "Карусель интеграций");

      return () => {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("keydown", handleKeyDown);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchend", handleTouchEnd);
      };
    }, [
      handleWheel,
      handleKeyDown,
      handleTouchStart,
      handleTouchEnd,
      carousel.containerRef,
    ]);

    // Упрощенный обработчик клика
    const handleItemClick = React.useCallback(
      (item: any) => {
        // Простая проверка на drag
        if (dragState.totalDistance > 10 || carousel.isTransitioning) {
          return;
        }

        onItemClick?.(item);
      },
      [onItemClick, dragState.totalDistance, carousel.isTransitioning]
    );

    // Защита от рендеринга пустого списка
    if (!items || items.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
            color: "text.secondary",
          }}
        >
          Нет доступных интеграций
        </Box>
      );
    }

    // Градиенты для размытия краев с улучшенными эффектами
    const gradientBase =
      theme.palette.mode === "dark"
        ? `${theme.palette.background.default}`
        : `${theme.palette.background.default}`;

    const leftGradient = `linear-gradient(to right, 
    ${gradientBase} 0%, 
    ${theme.palette.background.default}FA 25%, 
    ${theme.palette.background.default}E8 50%, 
    ${theme.palette.background.default}CC 70%, 
    transparent 90%)`;

    const rightGradient = `linear-gradient(to left, 
    ${gradientBase} 0%, 
    ${theme.palette.background.default}FA 25%, 
    ${theme.palette.background.default}E8 50%, 
    ${theme.palette.background.default}CC 70%, 
    transparent 90%)`;

    return (
      <MotionBox
        className={className}
        ref={carousel.containerRef}
        onMouseEnter={carousel.handleMouseEnter}
        onMouseLeave={carousel.handleMouseLeave}
        style={{
          y: parallaxY,
          rotateX: parallaxRotate,
        }}
        sx={{
          position: "relative",
          width: "100vw",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          overflow: "hidden",
          transformStyle: "preserve-3d",
          perspective: "1200px",

          // Добавляем визуальные подсказки для скроллинга
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 4,
          },

          // Улучшенные градиенты по краям
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: { xs: "120px", sm: "160px", md: "200px" },
            height: "100%",
            background: leftGradient,
            pointerEvents: "none",
            zIndex: 10,
            opacity: dragState.isDragging ? 0.8 : 1,
            transition: "opacity 0.3s ease",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: { xs: "120px", sm: "160px", md: "200px" },
            height: "100%",
            background: rightGradient,
            pointerEvents: "none",
            zIndex: 10,
            opacity: dragState.isDragging ? 0.8 : 1,
            transition: "opacity 0.3s ease",
          },
        }}
      >
        {/* Enhanced Carousel Container */}
        <MotionBox
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{
            x: carousel.carouselOffset,
          }}
          transition={{
            type: dragState.isDragging ? "spring" : "tween",
            duration: dragState.isDragging
              ? 0.2
              : carousel.isTransitioning
              ? 0.6
              : config?.transitionDuration || 0.8,
            ease: dragState.isDragging
              ? [0.25, 0.46, 0.45, 0.94]
              : [0.16, 1, 0.3, 1],
            stiffness: dragState.isDragging ? 300 : undefined,
            damping: dragState.isDragging ? 30 : undefined,
          }}
          sx={{
            display: "flex",
            cursor: dragState.isDragging ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "pan-y",
            py: { xs: 5, md: 6 },
            px: { xs: 4, md: 6 },
            willChange: "transform",
            transformStyle: "preserve-3d",
            position: "relative",

            // Улучшенный фоновый эффект
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "140%",
              height: "70%",
              background:
                theme.palette.mode === "dark"
                  ? `radial-gradient(ellipse, 
                  ${theme.palette.primary.dark}06 0%, 
                  ${theme.palette.primary.main}04 30%,
                  transparent 70%)`
                  : `radial-gradient(ellipse, 
                  ${theme.palette.primary.main}04 0%, 
                  ${theme.palette.primary.light}03 30%,
                  transparent 70%)`,
              borderRadius: "50%",
              filter: "blur(80px)",
              zIndex: -1,
              opacity: dragState.isDragging ? 0.6 : 1,
              transition: "opacity 0.4s ease",
            },
          }}
        >
          {carousel.extendedItems.map((item, index) => {
            const blurLevel = carousel.getItemBlur(index);
            const scale = carousel.getItemScale(index);
            const isVisible = blurLevel < 3; // Увеличили порог видимости

            // Оптимизация: не рендерим карточки, которые слишком далеко
            const distance = Math.abs(index - carousel.currentIndex);
            const maxRenderDistance =
              Math.ceil(carousel.carouselParams.visibleCards) + 2;

            if (distance > maxRenderDistance) {
              return (
                <Box
                  key={item.id}
                  sx={{
                    flexShrink: 0,
                    width: carousel.carouselParams.cardWidth,
                    marginRight:
                      index < carousel.extendedItems.length - 1
                        ? `${carousel.carouselParams.spacing}px`
                        : 0,
                  }}
                />
              );
            }

            // Более мягкие параллакс эффекты
            const cardParallaxY = distance * 1; // Уменьшили смещение
            const cardParallaxRotate = (index - carousel.currentIndex) * 0.3; // Уменьшили вращение

            return (
              <MotionBox
                key={item.id}
                style={{
                  y: cardParallaxY,
                  rotateZ: cardParallaxRotate,
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 25,
                }}
                sx={{
                  flexShrink: 0,
                  width: carousel.carouselParams.cardWidth,
                  marginRight:
                    index < carousel.extendedItems.length - 1
                      ? `${carousel.carouselParams.spacing}px`
                      : 0,
                  transformStyle: "preserve-3d",

                  // Убираем агрессивные тени, оставляем только subtle эффекты
                  filter:
                    distance === 0
                      ? "drop-shadow(0 8px 25px rgba(0,0,0,0.08))"
                      : distance === 1
                      ? "drop-shadow(0 4px 15px rgba(0,0,0,0.04))"
                      : "none",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <IntegrationCard
                  integration={item}
                  onClick={handleItemClick}
                  isVisible={isVisible}
                  blurLevel={blurLevel}
                  scale={scale}
                  isDragging={dragState.isDragging}
                />
              </MotionBox>
            );
          })}
        </MotionBox>

        {/* Enhanced Progress Indicator with glassmorphism */}
        {autoPlay &&
          carousel.isAutoPlay &&
          !dragState.isDragging &&
          !carousel.isHovering && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                zIndex: 5,
                borderRadius: "0 0 16px 16px",
                overflow: "hidden",
                backdropFilter: "blur(10px) saturate(150%)",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? `inset 0 1px 0 rgba(255,255,255,0.08), 
                 0 0 30px ${theme.palette.primary.main}15`
                    : `inset 0 1px 0 rgba(255,255,255,0.6), 
                 0 0 30px ${theme.palette.primary.main}10`,
              }}
            >
              <MotionBox
                key={`progress-${carousel.currentIndex}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: (config?.autoPlayInterval || 3500) / 1000,
                  ease: "linear",
                }}
                sx={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  backgroundSize: "200% 100%",
                  borderRadius: "inherit",
                  position: "relative",

                  // Более тонкий shimmer эффект
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                    animation: "shimmer 3s ease-in-out infinite",
                    "@keyframes shimmer": {
                      "0%": { transform: "translateX(-100%)" },
                      "100%": { transform: "translateX(100%)" },
                    },
                  },
                }}
              />
            </MotionBox>
          )}
      </MotionBox>
    );
  }
);

InfiniteCarousel.displayName = "InfiniteCarousel";
