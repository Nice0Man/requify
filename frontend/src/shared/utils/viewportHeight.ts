import React from "react";

/**
 * Viewport Height Utility
 * Решает проблему с 100vh на мобильных устройствах
 *
 * На основе статьи: https://www.frontend.fyi/v/finally-a-fix-for-100vh-on-mobile
 */

/**
 * Устанавливает CSS переменную --vh для корректной работы на мобильных устройствах
 */
export const setViewportHeight = (): void => {
  // Проверяем, поддерживает ли браузер новые viewport units
  const supportsDvh = CSS.supports("height", "100dvh");

  if (!supportsDvh) {
    // Если новые units не поддерживаются, используем fallback
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
};

/**
 * Инициализирует обработчики для корректной работы viewport height
 */
export const initViewportHeight = (): (() => void) => {
  // Устанавливаем начальное значение
  setViewportHeight();

  // Обработчик изменения размера окна
  const handleResize = () => {
    setViewportHeight();
  };

  // Обработчик изменения ориентации
  const handleOrientationChange = () => {
    // Задержка для корректной обработки изменения ориентации
    setTimeout(() => {
      setViewportHeight();
    }, 100);
  };

  // Добавляем обработчики событий
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleOrientationChange, {
    passive: true,
  });

  // Возвращаем функцию очистки
  return () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleOrientationChange);
  };
};

/**
 * React хук для управления viewport height
 */
export const useViewportHeight = (): void => {
  React.useEffect(() => {
    const cleanup = initViewportHeight();
    return cleanup;
  }, []);
};

// Для обратной совместимости с react-viewport-height
export default useViewportHeight;
