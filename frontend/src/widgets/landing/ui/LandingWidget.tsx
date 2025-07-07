import React from "react";
import { Box } from "@mui/material";
import { HeroSection } from "./HeroSection";
import { SystemFeatures } from "./SystemFeatures";
import { BusinessMetrics } from "./BusinessMetrics";
import BusinessSolutionsSection from "./BusinessSolutionsSection";
import LandingFooter from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { FullPageScroll, ScrollIndicator, BubblesEffect } from "@/shared/ui";
import { useFullPageScroll } from "@/shared/hooks";

const SECTIONS = [
  { id: "hero", component: HeroSection },
  { id: "features", component: SystemFeatures },
  { id: "metrics", component: BusinessMetrics },
  { id: "cta", component: BusinessSolutionsSection },
  { id: "footer", component: LandingFooter },
] as const;

const SECTION_IDS = SECTIONS.map((section) => section.id);

export const LandingWidget: React.FC = () => {
  const { activeSection, navigateToSection, progress } = useFullPageScroll({
    totalSections: SECTIONS.length,
    initialSection: 0,
    enableHashSync: true,
    sectionIds: SECTION_IDS,
  });

  const handleSectionChange = (sectionIndex: number) => {
    console.log(
      `LandingWidget: Section changed to ${sectionIndex} (${SECTIONS[sectionIndex]?.id})`
    );
  };

  const handleSectionById = (sectionId: string) => {
    const sectionIndex = SECTIONS.findIndex(
      (section) => section.id === sectionId
    );
    if (sectionIndex !== -1) {
      navigateToSection(sectionIndex);
    }
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Header - Fixed position */}
      <LandingHeader
        activeSection={SECTIONS[activeSection]?.id || "hero"}
        onSectionClick={handleSectionById}
        isScrolled={activeSection > 0}
      />

      {/* Background Effects */}
      <BubblesEffect
        count={20}
        maxSize={80}
        speed={1.2}
        color="primary"
        zIndex={-1}
      />

      {/* Main Content with Smooth Scrolling */}
      <FullPageScroll
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        animationDuration={0.8}
        threshold={30}
      >
        {SECTIONS.map(({ id, component: Component }) => (
          <Box key={id} sx={{ height: "100vh", width: "100%" }}>
            <Component />
          </Box>
        ))}
      </FullPageScroll>

      {/* Navigation Indicator */}
      <ScrollIndicator
        activeSection={activeSection}
        totalSections={SECTIONS.length}
        position="right"
        showArrows={true}
        showDots={true}
        onNavigate={navigateToSection}
      />
    </Box>
  );
};
