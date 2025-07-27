export interface Integration {
  id: string;
  title: string; // Основной заголовок
  description: string;
  icon: string; // Название иконки как строка для гибкости
  connections: string; // Количество подключений как строка для отображения
  category:
    | "popular"
    | "new"
    | "enterprise"
    | "featured"
    | "development"
    | "communication"
    | "management"
    | "security";
  color: string;
  gradient?: string; // Опциональный градиент
  isPopular?: boolean;
  isNew?: boolean;
  order: number;
  features: string[];
  status?: "active" | "inactive" | "beta"; // Статус интеграции
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
  color: string;
}
