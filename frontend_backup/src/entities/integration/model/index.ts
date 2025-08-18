// Types
export type {
  Integration,
  CarouselControlsProps,
  InfiniteCarouselState,
  CarouselConfig,
  IntegrationCardProps,
  InfiniteCarouselProps,
  IntegrationCategory,
} from "./types";

// Constants and Data
export {
  DEFAULT_CAROUSEL_CONFIG,
  INTEGRATIONS,
  BREAKPOINTS,
  ANIMATION_VARIANTS,
} from "./constants";

export {
  INTEGRATION_CATEGORIES,
} from "./data";

// Utils
export {
  getIntegrationById,
  getIntegrationsByCategory,
  getPopularIntegrations,
  getNewIntegrations,
  getCategoryById,
  sortIntegrationsByOrder,
  filterIntegrationsByStatus,
  getActiveIntegrations,
} from "./utils";

// Hooks
export { useInfiniteCarousel } from "./useInfiniteCarousel"; 