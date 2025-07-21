export interface ScrollNavigationWidgetProps {
  className?: string;
  sections?: Array<{
    id: string;
    title: string;
    anchor: string;
  }>;
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
} 