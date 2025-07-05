// Existing hooks
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';

// New hooks
export { useApi, useCrudApi } from './useApi';
export { usePagination, useServerPagination } from './usePagination';
export { usePermissions } from './usePermissions';
export { useAuth } from './useAuth';
export type { AuthState, UseAuthReturn, RegisterData } from './useAuth';
export { useResponsiveImage, generateSrcSet, getOptimalImageSize } from './useResponsiveImage';

// Animation hooks
export { 
  useScrollAnimation, 
  useFadeInUp, 
  useFadeInLeft, 
  useFadeInRight, 
  useScaleIn, 
  useStaggerChildren, 
  useParallax,
  ANIMATION_VARIANTS 
} from './useScrollAnimations'; 