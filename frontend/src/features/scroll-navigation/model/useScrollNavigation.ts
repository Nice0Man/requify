import { useState, useCallback, useEffect, useRef } from "react";
import {
  ScrollSection,
  hashUtils,
  scrollEvents,
} from "../api/scrollNavigationApi";

interface UseScrollNavigationOptions {
  sections: ScrollSection[];
  enableHashSync?: boolean;
  autoScrollToHash?: boolean;
  onSectionChange?: (sectionIndex: number, sectionId: string) => void;
}

export const useScrollNavigation = ({
  sections,
  enableHashSync = true,
  autoScrollToHash = true,
  onSectionChange,
}: UseScrollNavigationOptions) => {
  const [activeSection, setActiveSection] = useState(0);
  const isNavigatingRef = useRef(false);
  const sectionsRef = useRef(sections);

  // Обновляем ref при изменении секций
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Инициализация - проверяем hash при загрузке
  useEffect(() => {
    if (!enableHashSync || !autoScrollToHash) return;

    const currentHash = hashUtils.getCurrentHash();
    if (currentHash && hashUtils.isValidHash(sections, currentHash)) {
      const sectionIndex = hashUtils.findSectionByHash(sections, currentHash);
      setActiveSection(sectionIndex);
    }
  }, [sections, enableHashSync, autoScrollToHash]);

  // Обработчик изменения секции
  const handleSectionChange = useCallback(
    (newSectionIndex: number) => {
      if (
        newSectionIndex < 0 ||
        newSectionIndex >= sectionsRef.current.length ||
        newSectionIndex === activeSection
      ) {
        return;
      }

      // Предотвращаем циклы при навигации
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      setActiveSection(newSectionIndex);

      const section = sectionsRef.current[newSectionIndex];

      // Обновляем hash если включена синхронизация
      if (enableHashSync && section?.hash) {
        hashUtils.setHash(section.hash);

        // Диспатчим событие изменения hash
        scrollEvents.dispatch(
          scrollEvents.createHashChangeEvent(section.hash, newSectionIndex)
        );
      }

      // Диспатчим событие изменения секции
      scrollEvents.dispatch(
        scrollEvents.createSectionChangeEvent(
          newSectionIndex,
          section?.id || ""
        )
      );

      // Вызываем callback если есть
      if (onSectionChange) {
        onSectionChange(newSectionIndex, section?.id || "");
      }

      // Сбрасываем флаг навигации
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    },
    [activeSection, enableHashSync, onSectionChange]
  );

  // Слушаем изменения hash в браузере (кнопки назад/вперед)
  useEffect(() => {
    if (!enableHashSync) return;

    const handleHashChange = () => {
      // Избегаем циклов при программном изменении hash
      if (isNavigatingRef.current) return;

      const currentHash = hashUtils.getCurrentHash();

      if (
        currentHash &&
        hashUtils.isValidHash(sectionsRef.current, currentHash)
      ) {
        const sectionIndex = hashUtils.findSectionByHash(
          sectionsRef.current,
          currentHash
        );
        if (sectionIndex !== activeSection) {
          isNavigatingRef.current = true;
          setActiveSection(sectionIndex);

          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 100);
        }
      } else if (!currentHash) {
        // Если hash очищен, переходим к первой секции
        if (activeSection !== 0) {
          isNavigatingRef.current = true;
          setActiveSection(0);

          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 100);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [activeSection, enableHashSync]);

  // Навигация к конкретной секции
  const navigateToSection = useCallback(
    (index: number) => {
      handleSectionChange(index);
    },
    [handleSectionChange]
  );

  // Навигация к секции по hash
  const navigateToHash = useCallback(
    (hash: string) => {
      if (!enableHashSync) return;

      const sectionIndex = hashUtils.findSectionByHash(
        sectionsRef.current,
        hash
      );
      if (sectionIndex >= 0) {
        handleSectionChange(sectionIndex);
      }
    },
    [enableHashSync, handleSectionChange]
  );

  // Навигация к следующей секции
  const navigateNext = useCallback(() => {
    if (activeSection < sectionsRef.current.length - 1) {
      handleSectionChange(activeSection + 1);
    }
  }, [activeSection, handleSectionChange]);

  // Навигация к предыдущей секции
  const navigatePrevious = useCallback(() => {
    if (activeSection > 0) {
      handleSectionChange(activeSection - 1);
    }
  }, [activeSection, handleSectionChange]);

  // Получить данные текущей секции
  const getCurrentSection = useCallback(() => {
    return sectionsRef.current[activeSection] || null;
  }, [activeSection]);

  // Получить hash текущей секции
  const getCurrentHash = useCallback(() => {
    const section = getCurrentSection();
    return section?.hash || "";
  }, [getCurrentSection]);

  return {
    activeSection,
    totalSections: sections.length,
    sections,
    currentSection: getCurrentSection(),
    currentHash: getCurrentHash(),
    navigateToSection,
    navigateToHash,
    navigateNext,
    navigatePrevious,
    isNavigating: isNavigatingRef.current,
  };
};
