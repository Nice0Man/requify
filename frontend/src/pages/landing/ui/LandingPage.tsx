import React from "react";
import { Box } from "@mui/material";
import {
  useScrollNavigation,
  type ScrollSection,
} from "@/features/scroll-navigation";
import { ScrollNavigationWidget } from "@/widgets/scroll-navigation";
import { LandingHeader } from "./LandingHeader";
import {
  HeroSection,
  FeaturesSection,
  IntegrationsSection,
  AdvancedFeaturesSection,
  PricingSection,
  FooterSection,
} from "./";

const BASE_LANDING_SECTIONS: Omit<ScrollSection, "title">[] = [
  { id: "hero", hash: "hero", order: 0 },
  { id: "features", hash: "features", order: 1 },
  { id: "integrations", hash: "integrations", order: 2 },
  { id: "advanced", hash: "advanced", order: 3 },
  { id: "pricing", hash: "pricing", order: 4 },
  { id: "footer", hash: "footer", order: 5 },
];

const SECTION_COMPONENTS = [
  HeroSection,
  FeaturesSection,
  IntegrationsSection,
  AdvancedFeaturesSection,
  PricingSection,
  FooterSection,
];

export const LandingPage: React.FC = () => {
  const { sections, activeSection, navigateToHash } = useScrollNavigation({
    sections: BASE_LANDING_SECTIONS.map((section) => ({
      ...section,
      title: section.id.charAt(0).toUpperCase() + section.id.slice(1),
    })),
  });

  const currentActiveSection = React.useMemo(() => {
    return sections[activeSection]?.hash || "hero";
  }, [sections, activeSection]);

  const handleHeaderSectionClick = (hash: string) => {
    navigateToHash(hash);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <LandingHeader
        activeSection={currentActiveSection}
        onSectionClick={handleHeaderSectionClick}
        isScrolled={activeSection > 0}
      />

      <ScrollNavigationWidget
        sections={sections}
        onSectionChange={(_sectionIndex: number, sectionId: string) =>
          navigateToHash(sectionId)
        }
      >
        {SECTION_COMPONENTS.map((SectionComponent, index) => (
          <Box key={index} id={sections[index]?.id}>
            <SectionComponent />
          </Box>
        ))}
      </ScrollNavigationWidget>
    </Box>
  );
};
