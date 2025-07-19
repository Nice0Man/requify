import React from "react";
import {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  memo,
  Ref,
} from "react";

// =============================================================================
// Debouncing and Throttling Hooks
// =============================================================================

/**
 * Debounced value hook - prevents excessive updates
 * Useful for search inputs, form validation, API calls
 */
export const useDebounced = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounced callback hook - prevents excessive function calls
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Throttled callback hook - limits function calls to specific intervals
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const lastRan = useRef<number>(Date.now());

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      }
    },
    [callback, delay, ...deps]
  ) as T;

  return throttledCallback;
};

// =============================================================================
// Intersection Observer Hook for Lazy Loading
// =============================================================================

export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

// =============================================================================
// Virtual Scrolling Helper
// =============================================================================

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  options: VirtualScrollOptions
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleItems = useMemo(() => {
    const totalItems = items.length;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        style: {
          position: "absolute" as const,
          top: i * itemHeight,
          height: itemHeight,
          width: "100%",
        },
      });
    }

    return {
      items: visibleItems,
      totalHeight: totalItems * itemHeight,
      startIndex,
      endIndex,
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const onScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    onScroll,
  };
};

// =============================================================================
// Memoization Helpers
// =============================================================================

/**
 * Deep comparison memoization hook
 * Use sparingly - only when shallow comparison is insufficient
 */
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  if (!ref.current || !areDeepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
};

// Deep equality check (use with caution - expensive operation)
const areDeepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => areDeepEqual(item, b[index]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => areDeepEqual(a[key], b[key]));
  }
  return false;
};

/**
 * Stable reference hook - prevents unnecessary re-renders due to object/array recreation
 */
export const useStableReference = <T extends Record<string, any> | any[]>(
  value: T
): T => {
  const ref = useRef<T>(value);

  if (!areDeepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
};

// =============================================================================
// Component Update Optimization
// =============================================================================

/**
 * Previous value hook - useful for comparison and preventing unnecessary updates
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Update effect hook - only runs when specific value changes
 */
export const useUpdateEffect = (
  effect: React.EffectCallback,
  deps: React.DependencyList
) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
  }, deps);
};

/**
 * Render tracking hook - useful for performance debugging
 */
export const useRenderTracker = (
  componentName: string,
  props?: Record<string, any>
) => {
  const renderCount = useRef(0);
  const previousProps = usePrevious(props);

  renderCount.current += 1;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔄 ${componentName} rendered (${renderCount.current} times)`
      );

      if (previousProps && props) {
        const changedProps = Object.keys(props).filter(
          (key) => props[key] !== previousProps[key]
        );

        if (changedProps.length > 0) {
          console.log(`📝 ${componentName} props changed:`, changedProps);
        }
      }
    }
  });

  return renderCount.current;
};

// =============================================================================
// Performance Measurement Hooks
// =============================================================================

/**
 * Performance measurement hook
 */
export const usePerformanceMeasure = (name: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && performance.mark) {
      performance.mark(`${name}-start`);

      return () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const entries = performance.getEntriesByName(name);
        const lastEntry = entries[entries.length - 1];

        if (lastEntry) {
          console.log(`⏱️ ${name}: ${lastEntry.duration.toFixed(2)}ms`);
        }
      };
    }
  }, [name]);
};

// =============================================================================
// Optimized Component Creator
// =============================================================================

/**
 * Creates a performance-optimized component with automatic memoization
 */
export const createOptimizedComponent = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  displayName?: string,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  const OptimizedComponent = memo(Component, propsAreEqual);

  if (displayName) {
    OptimizedComponent.displayName = displayName;
  }

  return OptimizedComponent;
};

/**
 * HOC for automatic render optimization
 */
export const withPerformanceOptimization = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  options: {
    displayName?: string;
    trackRenders?: boolean;
    measurePerformance?: boolean;
    customCompare?: (prevProps: P, nextProps: P) => boolean;
  } = {}
) => {
  const OptimizedComponent = memo<P>((props: P) => {
    const componentName =
      options.displayName ||
      Component.displayName ||
      Component.name ||
      "Component";

    // Optional render tracking
    if (options.trackRenders) {
      useRenderTracker(componentName, props);
    }

    // Optional performance measurement
    if (options.measurePerformance) {
      usePerformanceMeasure(componentName);
    }

    return React.createElement(Component, props);
  }, options.customCompare);

  OptimizedComponent.displayName = `withPerformanceOptimization(${
    options.displayName || Component.displayName || Component.name
  })`;
  return OptimizedComponent;
};

// =============================================================================
// Batched Updates Hook
// =============================================================================

/**
 * Batched state updates hook - useful for multiple state updates
 */
export const useBatchedUpdates = <T extends Record<string, any>>(
  initialState: T
) => {
  const [state, setState] = useState<T>(initialState);
  const batchedUpdates = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updateBatch = useCallback((updates: Partial<T>) => {
    batchedUpdates.current = { ...batchedUpdates.current, ...updates };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, ...batchedUpdates.current }));
      batchedUpdates.current = {};
    }, 16); // Next frame
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, updateBatch] as const;
};
