import { useState, useCallback, useEffect, useRef } from "react";
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
  const [activeSection, setActiveSection] = useState(initialSection);
  const callbackRef = useRef(onSectionChange);
  
  // Update callback ref to avoid stale closures
  useEffect(() => {
    callbackRef.current = onSectionChange;
  }, [onSectionChange]);

  // Pure function to validate section index
  const isValidSection = useCallback((index: number): boolean => {
    return index >= 0 && index < totalSections;
  }, [totalSections]);

  // Hash sync effect
  useEffect(() => {
    if (!enableHashSync || sectionIds.length === 0) return;

    const hash = location.hash.replace("#", "");
    if (hash) {
      const sectionIndex = sectionIds.findIndex(id => id === hash);
      if (sectionIndex !== -1 && sectionIndex !== activeSection) {
        setActiveSection(sectionIndex);
        callbackRef.current?.(sectionIndex);
      }
    }
  }, [location.hash, enableHashSync, sectionIds, activeSection]);

  // Pure navigation function
  const navigateToSection = useCallback((index: number) => {
    if (disabled || !isValidSection(index) || index === activeSection) {
      return;
    }

    setActiveSection(index);
    callbackRef.current?.(index);

    // Update hash if sync is enabled
    if (enableHashSync && sectionIds[index]) {
      const newHash = `#${sectionIds[index]}`;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, "", newHash);
      }
    }
  }, [activeSection, disabled, isValidSection, enableHashSync, sectionIds]);

  // Navigation helpers
  const navigateNext = useCallback(() => {
    if (activeSection < totalSections - 1) {
      navigateToSection(activeSection + 1);
    }
  }, [activeSection, totalSections, navigateToSection]);

  const navigatePrevious = useCallback(() => {
    if (activeSection > 0) {
      navigateToSection(activeSection - 1);
    }
  }, [activeSection, navigateToSection]);

  // Computed properties
  const canGoNext = activeSection < totalSections - 1;
  const canGoPrevious = activeSection > 0;
  const isFirstSection = activeSection === 0;
  const isLastSection = activeSection === totalSections - 1;
  const progress = totalSections > 0 ? ((activeSection + 1) / totalSections) * 100 : 0;

  return {
    activeSection,
    navigateToSection,
    navigateNext,
    navigatePrevious,
    canGoNext,
    canGoPrevious,
    isFirstSection,
    isLastSection,
    progress,
    setActiveSection,
  };
}; 