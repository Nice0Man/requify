import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import type {
  Integration,
  InfiniteCarouselState,
  CarouselConfig,
} from "./types";
import { DEFAULT_CAROUSEL_CONFIG } from "./constants";

export const useInfiniteCarousel = (
  items: Integration[],
  config: Partial<CarouselConfig> = {}
) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const mergedConfig = useMemo(
    () => ({
      ...DEFAULT_CAROUSEL_CONFIG,
      ...config,
    }),
    [config]
  );

  const [state, setState] = useState<InfiniteCarouselState>({
    currentIndex: mergedConfig.cloneCount,
    isTransitioning: false,
    isDragging: false,
    isHovering: false,
    isAutoPlay: true,
    containerWidth: 0,
    dragOffset: 0,
  });

  // Refs для таймеров и элементов
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragRestoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Создаем массив с клонами для бесконечного цикла
  const extendedItems = useMemo(() => {
    if (items.length === 0) return [];

    const clonesBefore = items.slice(-mergedConfig.cloneCount);
    const clonesAfter = items.slice(0, mergedConfig.cloneCount);

    return [
      ...clonesBefore.map((item) => ({
        ...item,
        id: `clone-before-${item.id}`,
      })),
      ...items,
      ...clonesAfter.map((item) => ({ ...item, id: `clone-after-${item.id}` })),
    ];
  }, [items, mergedConfig.cloneCount]);

  // Получаем текущие параметры карусели
  const carouselParams = useMemo(() => {
    const visibleCards = isMobile
      ? mergedConfig.visibleCards.mobile
      : isTablet
      ? mergedConfig.visibleCards.tablet
      : mergedConfig.visibleCards.desktop;

    const spacing = isMobile
      ? mergedConfig.cardSpacing.mobile
      : isTablet
      ? mergedConfig.cardSpacing.tablet
      : mergedConfig.cardSpacing.desktop;

    const cardWidth =
      state.containerWidth > 0
        ? (state.containerWidth - spacing * (visibleCards - 1)) / visibleCards
        : 280;

    return {
      visibleCards,
      spacing,
      cardWidth,
      totalItemWidth: cardWidth + spacing,
    };
  }, [isMobile, isTablet, mergedConfig, state.containerWidth]);

  // Вычисляем offset для позиционирования карусели
  const getCarouselOffset = useCallback(() => {
    if (state.containerWidth === 0) return 0;

    const { totalItemWidth } = carouselParams;
    const baseOffset = -state.currentIndex * totalItemWidth;
    const centeringOffset =
      (state.containerWidth - carouselParams.cardWidth) / 2;

    return baseOffset + centeringOffset + state.dragOffset;
  }, [
    state.currentIndex,
    state.containerWidth,
    state.dragOffset,
    carouselParams,
  ]);

  // Получаем реальный индекс (без учета клонов)
  const getRealIndex = useCallback(() => {
    const realIndex = state.currentIndex - mergedConfig.cloneCount;
    return ((realIndex % items.length) + items.length) % items.length;
  }, [state.currentIndex, mergedConfig.cloneCount, items.length]);

  // Вычисляем уровень размытия для каждого элемента
  const getItemBlur = useCallback(
    (itemIndex: number) => {
      const distance = Math.abs(itemIndex - state.currentIndex);
      const maxDistance = Math.ceil(carouselParams.visibleCards / 2) + 1;

      // Центральная карточка и ближайшие к ней - без размытия
      if (distance === 0) return 0;
      if (distance === 1) return 0; // Убираем размытие с соседних карточек
      if (distance >= maxDistance)
        return Math.min(mergedConfig.blurRadius * 0.6, 3); // Максимальное размытие 3px

      // Более мягкий градиент размытия
      return Math.min(
        ((distance - 1) / (maxDistance - 1)) * mergedConfig.blurRadius * 0.4,
        2
      );
    },
    [state.currentIndex, carouselParams.visibleCards, mergedConfig.blurRadius]
  );

  // Вычисляем масштаб для каждого элемента
  const getItemScale = useCallback(
    (itemIndex: number) => {
      const distance = Math.abs(itemIndex - state.currentIndex);
      const maxDistance = Math.ceil(carouselParams.visibleCards / 2);

      // Центральная карточка - полный размер
      if (distance === 0) return 1;
      // Соседние карточки - чуть меньше
      if (distance === 1) return 0.95;
      if (distance >= maxDistance) return 0.85;

      // Более плавный переход масштаба
      return 1 - (distance / maxDistance) * 0.15;
    },
    [state.currentIndex, carouselParams.visibleCards]
  );

  // Очистка всех таймеров
  const clearAllTimers = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (dragRestoreTimeoutRef.current) {
      clearTimeout(dragRestoreTimeoutRef.current);
      dragRestoreTimeoutRef.current = null;
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  // Безопасный переход к индексу с проверкой границ
  const safeTransitionTo = useCallback(
    (newIndex: number, shouldReset = true) => {
      if (state.isTransitioning) return;

      setState((prev) => ({
        ...prev,
        currentIndex: newIndex,
        isTransitioning: true,
      }));

      // Обработка переходов с таймаутом
      transitionTimeoutRef.current = setTimeout(() => {
        setState((prev) => {
          let finalIndex = newIndex;

          // Проверка на необходимость reset для бесконечного цикла
          if (shouldReset) {
            if (newIndex >= extendedItems.length - mergedConfig.cloneCount) {
              finalIndex =
                mergedConfig.cloneCount +
                (newIndex - (extendedItems.length - mergedConfig.cloneCount));
            } else if (newIndex < mergedConfig.cloneCount) {
              finalIndex =
                extendedItems.length - mergedConfig.cloneCount + newIndex;
            }
          }

          return {
            ...prev,
            currentIndex: finalIndex,
            isTransitioning: false,
          };
        });
      }, mergedConfig.transitionDuration);
    },
    [state.isTransitioning, extendedItems.length, mergedConfig]
  );

  // Переход к следующему слайду
  const goToNext = useCallback(() => {
    if (state.isTransitioning || items.length === 0) return;
    safeTransitionTo(state.currentIndex + 1);
  }, [
    state.isTransitioning,
    state.currentIndex,
    items.length,
    safeTransitionTo,
  ]);

  // Переход к предыдущему слайду
  const goToPrevious = useCallback(() => {
    if (state.isTransitioning || items.length === 0) return;
    safeTransitionTo(state.currentIndex - 1);
  }, [
    state.isTransitioning,
    state.currentIndex,
    items.length,
    safeTransitionTo,
  ]);

  // Переход к конкретному слайду
  const goToSlide = useCallback(
    (targetIndex: number) => {
      if (state.isTransitioning || items.length === 0) return;

      const clampedIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
      const newIndex = clampedIndex + mergedConfig.cloneCount;

      safeTransitionTo(newIndex, false);
    },
    [
      state.isTransitioning,
      items.length,
      mergedConfig.cloneCount,
      safeTransitionTo,
    ]
  );

  // Переключение автопроигрывания
  const toggleAutoPlay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAutoPlay: !prev.isAutoPlay,
    }));
  }, []);

  // Упрощенные обработчики drag (простая и надежная логика)
  const handleDragStart = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: true }));
    clearAllTimers();
  }, [clearAllTimers]);

  const handleDragEnd = useCallback(
    (offset: number) => {
      setState((prev) => ({ ...prev, isDragging: false, dragOffset: 0 }));

      const threshold = mergedConfig.dragThreshold;
      const shouldMove = Math.abs(offset) > threshold;

      if (shouldMove && !state.isTransitioning) {
        if (offset > 0) {
          goToPrevious();
        } else {
          goToNext();
        }
      }

      // Восстанавливаем автопроигрывание
      if (state.isAutoPlay) {
        dragRestoreTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, isDragging: false }));
        }, 1000);
      }
    },
    [
      goToNext,
      goToPrevious,
      mergedConfig.dragThreshold,
      state.isAutoPlay,
      state.isTransitioning,
    ]
  );

  const handleDrag = useCallback(
    (offset: number) => {
      if (!state.isDragging) return;
      setState((prev) => ({ ...prev, dragOffset: offset }));
    },
    [state.isDragging]
  );

  // Обработчики hover
  const handleMouseEnter = useCallback(() => {
    setState((prev) => ({ ...prev, isHovering: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isHovering: false }));
  }, []);

  // Обновление ширины контейнера с debounce
  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      const newWidth = containerRef.current.offsetWidth;
      setState((prev) => ({
        ...prev,
        containerWidth: newWidth,
      }));
    }
  }, []);

  // Эффект для автопроигрывания с улучшенной логикой
  useEffect(() => {
    clearAllTimers();

    const shouldAutoPlay =
      state.isAutoPlay &&
      !state.isDragging &&
      !state.isTransitioning &&
      !state.isHovering &&
      items.length > 1;

    if (shouldAutoPlay) {
      autoPlayIntervalRef.current = setInterval(() => {
        // Дополнительная проверка перед автопереходом
        setState((currentState) => {
          if (
            !currentState.isDragging &&
            !currentState.isTransitioning &&
            !currentState.isHovering
          ) {
            goToNext();
          }
          return currentState;
        });
      }, mergedConfig.autoPlayInterval);
    }

    return clearAllTimers;
  }, [
    state.isAutoPlay,
    state.isDragging,
    state.isTransitioning,
    state.isHovering,
    items.length,
    goToNext,
    mergedConfig.autoPlayInterval,
    clearAllTimers,
  ]);

  // Эффект для обработки изменения размера окна
  useEffect(() => {
    updateContainerWidth();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateContainerWidth, 150); // debounce
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [updateContainerWidth]);

  // Эффект для обработки изменения количества элементов
  useEffect(() => {
    if (items.length === 0) return;

    // Сброс индекса если элементы изменились
    const currentRealIndex = getRealIndex();
    if (currentRealIndex >= items.length) {
      setState((prev) => ({
        ...prev,
        currentIndex: mergedConfig.cloneCount,
      }));
    }
  }, [items.length, getRealIndex, mergedConfig.cloneCount]);

  // Очистка при размонтировании
  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  return {
    // State
    ...state,
    extendedItems,
    carouselParams,

    // Computed
    carouselOffset: getCarouselOffset(),
    realIndex: getRealIndex(),

    // Methods
    goToNext,
    goToPrevious,
    goToSlide,
    toggleAutoPlay,
    getItemBlur,
    getItemScale,

    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDrag,
    handleMouseEnter,
    handleMouseLeave,

    // Refs
    containerRef,

    // Utils
    updateContainerWidth,
  };
};
