import React, { ReactNode } from "react";
import { ScrollContainer, ScrollNavigator } from "@/shared/ui/Scroll";
import {
  useScrollNavigation,
  ScrollSection,
  type ScrollNavigationConfig,
} from "@/features/scroll-navigation";

interface ScrollNavigationWidgetProps {
  children: ReactNode[];
  sections: ScrollSection[];
  config?: Partial<ScrollNavigationConfig>;
  showNavigator?: boolean;
  navigatorPosition?: "left" | "right";
  className?: string;
  onSectionChange?: (sectionIndex: number, sectionId: string) => void;
}

export const ScrollNavigationWidget: React.FC<ScrollNavigationWidgetProps> = ({
  children,
  sections,
  config = {},
  showNavigator = true,
  navigatorPosition = "right",
  className,
  onSectionChange,
}) => {
  const {
    enableHashSync = true,
    enableKeyboard = true,
    enableWheel = true,
    enableTouch = true,
    animationDuration = 600,
    autoScrollToHash = true,
  } = config;

  const { activeSection, totalSections, navigateToSection } =
    useScrollNavigation({
      sections,
      enableHashSync,
      autoScrollToHash,
      onSectionChange,
    });

  // Проверяем, что количество детей соответствует количеству секций
  if (children.length !== sections.length) {
    console.warn(
      `ScrollNavigationWidget: Количество children (${children.length}) не соответствует количеству sections (${sections.length})`
    );
  }

  // Получаем названия секций для навигатора
  const sectionIds = sections.map((section) => section.title || section.id);

  return (
    <>
      <ScrollContainer
        activeSection={activeSection}
        onSectionChange={navigateToSection}
        totalSections={totalSections}
        enableKeyboard={enableKeyboard}
        enableWheel={enableWheel}
        enableTouch={enableTouch}
        animationDuration={animationDuration}
        className={className}
      >
        {children}
      </ScrollContainer>

      {showNavigator && totalSections > 1 && (
        <ScrollNavigator
          activeSection={activeSection}
          totalSections={totalSections}
          sectionIds={sectionIds}
          onNavigate={navigateToSection}
          position={navigatorPosition}
        />
      )}
    </>
  );
};
