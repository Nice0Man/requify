/**
 * Performance Context
 * Контекст для мониторинга производительности
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
}

interface PerformanceContextValue {
  metrics: PerformanceMetrics;
  startMeasurement: (name: string) => void;
  endMeasurement: (name: string) => void;
  logMetrics: () => void;
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const [metrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
  });

  const startMeasurement = useCallback((name: string) => {
    performance.mark(`${name}-start`);
  }, []);

  const endMeasurement = useCallback((name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }, []);

  const logMetrics = useCallback(() => {
    console.log('Performance Metrics:', metrics);
  }, [metrics]);

  const value: PerformanceContextValue = {
    metrics,
    startMeasurement,
    endMeasurement,
    logMetrics,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

const usePerformance = (): PerformanceContextValue => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export { PerformanceContext, PerformanceProvider, usePerformance };
