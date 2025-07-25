export interface Integration {
  id: string;
  title: string;
  description: string;
  icon: string;
  connections: string;
  category: "popular" | "new" | "enterprise" | "featured";
  color: string;
  gradient: string;
  isPopular?: boolean;
  isNew?: boolean;
  order: number;
}

export interface CarouselControlsProps {
  currentIndex: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  onGoToSlide: (index: number) => void;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  isTransitioning?: boolean;
  zIndex?: number;
  disabled?: boolean;
  showProgress?: boolean;
  className?: string;
}

export interface InfiniteCarouselState {
  currentIndex: number;
  isTransitioning: boolean;
  isDragging: boolean;
  isHovering: boolean;
  isAutoPlay: boolean;
  containerWidth: number;
  dragOffset: number;
}

export interface CarouselConfig {
  visibleCards: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  cardSpacing: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  autoPlayInterval: number;
  transitionDuration: number;
  dragThreshold: number;
  blurRadius: number;
  cloneCount: number;
}

export interface IntegrationCardProps {
  integration: Integration;
  onClick?: (integration: Integration) => void;
  isVisible?: boolean;
  blurLevel?: number;
  scale?: number;
  isDragging?: boolean;
  className?: string;
}

export interface InfiniteCarouselProps {
  items: Integration[];
  onItemClick?: (item: Integration) => void;
  autoPlay?: boolean;
  showControls?: boolean;
  config?: Partial<CarouselConfig>;
  className?: string;
}

export interface IntegrationCategory {
  id: string;
  name: string;
  description: string;
}