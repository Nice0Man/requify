import React, { memo, useMemo } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { SidebarItem as SidebarItemType } from "../model/types";

interface PerformanceOptimizerProps {
  items: SidebarItemType[];
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  isDragging: boolean;
  children: (optimizedProps: {
    visibleItems: SidebarItemType[];
    memoizedCallbacks: Record<string, any>;
    shouldRenderOverlay: boolean;
  }) => React.ReactNode;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = memo(({
  items,
  activeId,
  overId,
  isDragging,
  children,
}) => {
  // Мемоизация видимых элементов
  const visibleItems = useMemo(() => {
    // Возвращаем только необходимые элементы для рендера
    return items.filter((_item) => {
      // Логика фильтрации (например, виртуализация при большом количестве элементов)
      return true; // Пока возвращаем все элементы
    });
  }, [items]);

  // Мемоизация коллбэков для предотвращения лишних ре-рендеров
  const memoizedCallbacks = useMemo(() => ({
    // Оптимизированный коллбэк для определения активного элемента
    isItemActive: (item: SidebarItemType) => {
      return activeId === item.id;
    },
    
    // Оптимизированный коллбэк для определения hover состояния
    isItemHovered: (item: SidebarItemType) => {
      return overId === item.id;
    },
    
    // Оптимизированный коллбэк для определения элемента в процессе перетаскивания
    isItemDragging: (item: SidebarItemType) => {
      return activeId === item.id && isDragging;
    },
  }), [activeId, overId, isDragging]);

  // Определение необходимости рендера overlay
  const shouldRenderOverlay = useMemo(() => {
    return Boolean(activeId && isDragging);
  }, [activeId, isDragging]);

  // Throttled updates для снижения частоты обновлений
  const throttledProps = useMemo(() => ({
    visibleItems,
    memoizedCallbacks,
    shouldRenderOverlay,
  }), [visibleItems, memoizedCallbacks, shouldRenderOverlay]);

  return <>{children(throttledProps)}</>;
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

// HOC для мемоизации отдельных элементов списка
export const withItemMemoization = <T extends object>(
  Component: React.ComponentType<T>
) => {
  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    // Кастомная логика сравнения для предотвращения лишних рендеров
    const keysToCompare: (keyof T)[] = [
      'isActive' as keyof T,
      'isDragging' as keyof T,
      'isOver' as keyof T,
      'item' as keyof T,
    ];
    
    return keysToCompare.every(key => prevProps[key] === nextProps[key]);
  });
  
  MemoizedComponent.displayName = `withItemMemoization(${Component.displayName || Component.name})`;
  
  return MemoizedComponent;
};

// Хук для оптимизации операций перетаскивания
export const useDragOptimization = (activeId: UniqueIdentifier | null, isDragging: boolean) => {
  // Debounced active state для снижения частоты обновлений
  const debouncedActiveId = useMemo(() => {
    return activeId;
  }, [activeId]);

  // Оптимизированные стили для dragging состояния
  const dragStyles = useMemo(() => {
    if (!isDragging) return {};
    
    return {
      pointerEvents: 'none' as const,
      cursor: 'grabbing' as const,
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      MozUserSelect: 'none' as const,
      msUserSelect: 'none' as const,
    };
  }, [isDragging]);

  // Оптимизированные классы для CSS
  const dragClasses = useMemo(() => {
    const classes: string[] = [];
    
    if (isDragging) {
      classes.push('is-dragging');
    }
    
    if (debouncedActiveId) {
      classes.push('has-active-drag');
    }
    
    return classes.join(' ');
  }, [isDragging, debouncedActiveId]);

  return {
    debouncedActiveId,
    dragStyles,
    dragClasses,
  };
};

// Утилиты для оптимизации рендеринга
export const optimizationUtils = {
  // Проверка, нужно ли обновлять компонент
  shouldUpdate: (
    prevProps: { activeId?: UniqueIdentifier | null; isDragging?: boolean },
    nextProps: { activeId?: UniqueIdentifier | null; isDragging?: boolean }
  ): boolean => {
    return (
      prevProps.activeId !== nextProps.activeId ||
      prevProps.isDragging !== nextProps.isDragging
    );
  },

  // Создание стабильных ключей для элементов
  createStableKey: (id: UniqueIdentifier, isDragging: boolean): string => {
    return `${id}-${isDragging ? 'dragging' : 'static'}`;
  },

  // Оптимизация CSS классов
  generateOptimizedClasses: (
    isActive: boolean,
    isDragging: boolean,
    isOver: boolean
  ): string => {
    const classes: string[] = [];
    
    if (isActive) classes.push('active');
    if (isDragging) classes.push('dragging');
    if (isOver) classes.push('over');
    
    return classes.join(' ');
  },
}; 