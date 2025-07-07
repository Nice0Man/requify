import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

interface UseFullPageScrollOptions {
  totalSections: number;
  initialSection?: number;
  enableHashSync?: boolean;
  sectionIds?: string[];
  onSectionChange?: (section: number) => void;
  disabled?: boolean;
}

interface UseFullPageScrollReturn {
  activeSection: number;
  navigateToSection: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstSection: boolean;
  isLastSection: boolean;
  progress: number;
  setActiveSection: (index: number) => void;
}

export const useFullPageScroll = ({
  totalSections,
  initialSection = 0,
  enableHashSync = false,
  sectionIds = [],
  onSectionChange,
  disabled = false,
}: UseFullPageScrollOptions): UseFullPageScrollReturn => {
  const location = useLocation();
  const lastUpdateRef = useRef<number>(0);
  const [activeSection, setActiveSection] = useState(() => {
    // Инициализация с проверкой hash только один раз
    if (enableHashSync && sectionIds.length > 0) {
      const hash = window.location.hash.replace("#", "");
      const index = sectionIds.findIndex(id => id === hash);
      return index !== -1 ? index : initialSection;
    }
    return initialSection;
  });

  // Валидация секции
  const isValidSection = useCallback((index: number): boolean => {
    return index >= 0 && index < totalSections;
  }, [totalSections]);

  // Основная функция изменения секции с дебаунсингом
  const handleSectionChange = useCallback((newSection: number) => {
    if (!isValidSection(newSection) || newSection === activeSection || disabled) {
      console.log(`⏸️ Hook: Section change blocked - valid=${isValidSection(newSection)}, same=${newSection === activeSection}, disabled=${disabled}`);
      return;
    }

    // Дебаунсинг для предотвращения быстрых изменений
    const now = Date.now();
    if (now - lastUpdateRef.current < 100) {
      console.log(`⏸️ Hook: Section change debounced - ${now - lastUpdateRef.current}ms`);
      return;
    }
    lastUpdateRef.current = now;

    console.log(`🔄 Hook: Changing section from ${activeSection} to ${newSection}`);
    setActiveSection(newSection);
    onSectionChange?.(newSection);

    // Обновление hash при включенной синхронизации
    if (enableHashSync && sectionIds[newSection]) {
      const newHash = `#${sectionIds[newSection]}`;
      if (window.location.hash !== newHash) {
        // Используем replaceState чтобы не добавлять в историю
        window.history.replaceState(null, "", newHash);
      }
    }
  }, [activeSection, isValidSection, disabled, onSectionChange, enableHashSync, sectionIds]);

  // Синхронизация с hash - срабатывает только при изменении location
  useEffect(() => {
    if (!enableHashSync || sectionIds.length === 0) return;

    const hash = location.hash.replace("#", "");
    if (hash) {
      const sectionIndex = sectionIds.findIndex(id => id === hash);
      if (sectionIndex !== -1 && sectionIndex !== activeSection) {
        console.log(`🔗 Hash sync: Navigating to section ${sectionIndex} (${hash})`);
        setActiveSection(sectionIndex);
        onSectionChange?.(sectionIndex);
      }
    }
  }, [location.hash, enableHashSync, sectionIds, activeSection, onSectionChange]);

  // Мемоизированные функции навигации - стабильные ссылки
  const navigateToSection = useCallback((index: number) => {
    console.log(`📍 Hook: Navigate to section ${index} requested`);
    handleSectionChange(index);
  }, [handleSectionChange]);

  const navigateNext = useCallback(() => {
    if (activeSection < totalSections - 1) {
      console.log(`➡️ Hook: Navigate next from ${activeSection} to ${activeSection + 1}`);
      handleSectionChange(activeSection + 1);
    }
  }, [activeSection, totalSections, handleSectionChange]);

  const navigatePrevious = useCallback(() => {
    if (activeSection > 0) {
      console.log(`⬅️ Hook: Navigate previous from ${activeSection} to ${activeSection - 1}`);
      handleSectionChange(activeSection - 1);
    }
  }, [activeSection, handleSectionChange]);

  // Мемоизированные вычисляемые свойства
  const computedProperties = useMemo(() => ({
    canGoNext: activeSection < totalSections - 1,
    canGoPrevious: activeSection > 0,
    isFirstSection: activeSection === 0,
    isLastSection: activeSection === totalSections - 1,
    progress: totalSections > 0 ? ((activeSection + 1) / totalSections) * 100 : 0,
  }), [activeSection, totalSections]);

  return {
    activeSection,
    navigateToSection,
    navigateNext,
    navigatePrevious,
    ...computedProperties,
    setActiveSection: handleSectionChange,
  };
}; 