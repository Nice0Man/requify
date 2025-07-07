// Базовые типы для scroll navigation
export interface ScrollSection {
  id: string;
  hash: string;
  title: string;
  order: number;
}

export interface ScrollNavigationConfig {
  sections: ScrollSection[];
  enableHashSync: boolean;
  enableKeyboard: boolean;
  enableWheel: boolean;
  enableTouch: boolean;
  animationDuration: number;
  autoScrollToHash: boolean;
}

// Утилиты для работы с hash
export const hashUtils = {
  // Получить текущий hash из URL
  getCurrentHash: (): string => {
    return window.location.hash.slice(1) || "";
  },

  // Установить hash в URL
  setHash: (hash: string): void => {
    if (hash) {
      window.history.replaceState(null, "", `#${hash}`);
    } else {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  },

  // Найти индекс секции по hash
  findSectionByHash: (sections: ScrollSection[], hash: string): number => {
    const sectionIndex = sections.findIndex((section) => section.hash === hash);
    return sectionIndex; // Возвращаем -1 если не найдено, иначе реальный индекс
  },

  // Получить hash по индексу секции
  getHashByIndex: (sections: ScrollSection[], index: number): string => {
    return sections[index]?.hash || "";
  },

  // Валидация hash
  isValidHash: (sections: ScrollSection[], hash: string): boolean => {
    return sections.some((section) => section.hash === hash);
  },

  // Очистить hash
  clearHash: (): void => {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  },
};

// События для scroll navigation
export const scrollEvents = {
  // Создать событие изменения секции
  createSectionChangeEvent: (sectionIndex: number, sectionId: string) => {
    return new CustomEvent("scrollSectionChange", {
      detail: { sectionIndex, sectionId },
    });
  },

  // Создать событие изменения hash
  createHashChangeEvent: (hash: string, sectionIndex: number) => {
    return new CustomEvent("scrollHashChange", {
      detail: { hash, sectionIndex },
    });
  },

  // Диспатч события
  dispatch: (event: CustomEvent) => {
    window.dispatchEvent(event);
  },
};
