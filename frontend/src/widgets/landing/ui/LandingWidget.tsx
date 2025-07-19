import React from "react";
import { Box } from "@mui/material";
import { HeroSection } from "./HeroSection";
import { SystemFeaturesSection } from "./SystemFeatures";
import { IndustrySolutions } from "./IndustrySolutions";
import { IntegrationsShowcase } from "./IntegrationsShowcase";
import { CTASection } from "./CTASection";
import { FooterSection } from "./FooterSection";
import { LandingHeader } from "./LandingHeader";
import { ScrollNavigationWidget } from "@/widgets/scroll-navigation";
import {
  ScrollSection,
  useScrollNavigation,
} from "@/features/scroll-navigation";
import { useState } from "react";

// Базовая конфигурация секций без переводов
const BASE_LANDING_SECTIONS: Omit<ScrollSection, "title">[] = [
  {
    id: "hero",
    hash: "hero",
    order: 0,
  },
  {
    id: "features",
    hash: "features",
    order: 1,
  },
  {
    id: "solutions",
    hash: "solutions",
    order: 2,
  },
  {
    id: "integrations",
    hash: "integrations",
    order: 3,
  },
  {
    id: "cta",
    hash: "contact",
    order: 4,
  },
  {
    id: "footer",
    hash: "footer",
    order: 5,
  },
];

// Компоненты секций в том же порядке
const SECTION_COMPONENTS = [
  HeroSection,
  SystemFeaturesSection,
  IndustrySolutions,
  IntegrationsShowcase,
  CTASection,
  FooterSection,
];

export const LandingWidget: React.FC = () => {
  // Создаем полные секции с заголовками по умолчанию внутри компонента
  const LANDING_SECTIONS: ScrollSection[] = React.useMemo(
    () =>
      BASE_LANDING_SECTIONS.map((section) => ({
        ...section,
        title: section.id.charAt(0).toUpperCase() + section.id.slice(1), // Простые заголовки
      })),
    []
  );

  // Состояние для отслеживания активной секции в header
  const [headerActiveSection, setHeaderActiveSection] = useState("hero");
  const [_isScrolled, _setIsScrolled] = useState(false);

  // Используем хук scroll navigation для получения текущей секции
  const { activeSection, navigateToHash } = useScrollNavigation({
    sections: LANDING_SECTIONS,
    enableHashSync: true,
    autoScrollToHash: true,
  });

  // Обновление активной секции при скролле
  const updateActiveSection = () => {
    const currentHash = window.location.hash.slice(1);

    if (!currentHash) {
      setHeaderActiveSection("hero");
      return;
    }

    // Находим секцию по hash
    const section = LANDING_SECTIONS.find((s) => s.hash === currentHash);
    if (section) {
      setHeaderActiveSection(section.id);
    } else {
      // Fallback: ищем по прямому соответствию
      const directSection = LANDING_SECTIONS.find((s) => s.id === currentHash);
      setHeaderActiveSection(directSection?.id || "hero");
    }
  };

  // Обновляем при загрузке
  React.useEffect(() => {
    updateActiveSection();

    // Слушаем изменения hash
    window.addEventListener("hashchange", updateActiveSection);

    return () => {
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [LANDING_SECTIONS]);

  // Обработчик изменения секции для обновления header
  const handleSectionChange = React.useCallback(
    (sectionIndex: number, sectionId: string) => {
      console.log(
        `Landing: Переключение на секцию ${sectionIndex} (${sectionId})`
      );

      // Обновляем header активную секцию
      setHeaderActiveSection(sectionId);

      // Можно добавить дополнительную логику, например аналитику
      // analytics.track('landing_section_viewed', { section: sectionId, index: sectionIndex });
    },
    []
  );

  // Обработчик навигации из header
  const handleHeaderSectionClick = React.useCallback(
    (hashOrId: string) => {
      console.log("Header navigation clicked:", hashOrId);

      // Прямая навигация через scrollIntoView для тестирования
      const element =
        document.getElementById(hashOrId) ||
        document.querySelector(`[id="${hashOrId}"]`);
      if (element) {
        console.log("Found element, scrolling to:", element);
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Обновляем hash в URL
        window.history.replaceState(null, "", `#${hashOrId}`);

        // Сразу обновляем активную секцию в header
        const section = LANDING_SECTIONS.find(
          (s) => s.hash === hashOrId || s.id === hashOrId
        );
        if (section) {
          setHeaderActiveSection(section.id);
        }
        return;
      }

      // Если это уже hash, используем его напрямую
      // Иначе ищем hash по id секции
      const section = LANDING_SECTIONS.find(
        (s) => s.hash === hashOrId || s.id === hashOrId
      );
      console.log("Found section:", section);

      if (section) {
        // Ищем элемент по hash или id секции
        const sectionElement =
          document.getElementById(section.id) ||
          document.getElementById(section.hash);
        if (sectionElement) {
          console.log("Found section element, scrolling to:", sectionElement);
          sectionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Обновляем hash в URL
          window.history.replaceState(null, "", `#${section.hash}`);

          // Сразу обновляем активную секцию в header
          setHeaderActiveSection(section.id);
        } else {
          console.log("Section element not found for:", section);
          // Fallback к scroll navigation
          console.log("Navigating to hash:", section.hash);
          navigateToHash(section.hash);
        }
      } else {
        // Fallback: используем переданное значение как hash
        console.log("Fallback navigation to:", hashOrId);
        navigateToHash(hashOrId);
      }
    },
    [navigateToHash, LANDING_SECTIONS, setHeaderActiveSection]
  );

  return (
    <>
      {/* Фиксированный заголовок с автоскрытием */}
      <LandingHeader
        activeSection={headerActiveSection}
        onSectionClick={handleHeaderSectionClick}
        isScrolled={activeSection > 0}
      />

      {/* Основной scroll контейнер с навигацией */}
      <ScrollNavigationWidget
        sections={LANDING_SECTIONS}
        config={{
          enableHashSync: true,
          enableKeyboard: true,
          enableWheel: true,
          enableTouch: true,
          animationDuration: 800,
          autoScrollToHash: true,
        }}
        showNavigator={true}
        navigatorPosition="right"
        onSectionChange={handleSectionChange}
      >
        {SECTION_COMPONENTS.map((Component, index) => {
          const isFooter = LANDING_SECTIONS[index].id === "footer";

          return (
            <Box
              key={LANDING_SECTIONS[index].id}
              id={LANDING_SECTIONS[index].id}
              sx={{
                height: "100%",
                minHeight: isFooter ? "auto" : "100vh",
                // Поддержка новых viewport units для мобильных устройств
                "@supports (height: 100dvh)": {
                  minHeight: isFooter ? "auto" : "100dvh",
                },
                // Fallback для старых браузеров
                "@supports not (height: 100dvh)": {
                  minHeight: isFooter ? "auto" : "calc(var(--vh, 1vh) * 100)",
                },
                display: "flex",
                flexDirection: "column",
                position: "relative",
                // Компенсируем высоту фиксированного header для первой секции
                paddingTop: index === 0 ? "80px" : 0,
                // Footer занимает только необходимое пространство
                ...(isFooter && {
                  minHeight: "auto",
                  height: "auto",
                }),
              }}
            >
              <Component />
            </Box>
          );
        })}
      </ScrollNavigationWidget>
    </>
  );
};
