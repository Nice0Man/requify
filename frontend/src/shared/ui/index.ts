// UI Components
export { BubblesEffect } from "./BubblesEffect";
export { ContainerWrapper } from "./ContainerWrapper";
export { ErrorBoundary, DashboardErrorBoundary } from "./ErrorBoundary";
export { FloatingBubbles } from "./FloatingBubbles";
export { FloatingLabelInput } from "./FloatingLabelInput";
export { LanguageSwitch } from "./LanguageSwitch";
export { LoadingSpinner } from "./LoadingSpinner";
export { NotificationCenter } from "./NotificationCenter";
export { QueryDemo } from "./QueryDemo";
export { ResponsiveImage } from "./ResponsiveImage";
export { TooltipButton } from "./TooltipButton/TooltipButton";

// Effect Components
export {
  FloatingParticles,
  FloatingParticle,
  AnimatedGradient,
  generateFloatingParticles,
} from "./effects/FloatingParticles";
export type {
  FloatingParticle as FloatingParticleType,
  FloatingParticlesProps,
  AnimatedGradientProps,
} from "./effects/FloatingParticles";

// Scroll Components (FSD-compliant)
export { ScrollContainer, ScrollNavigator } from "./Scroll";

// Placeholders
export { EmptyStateChart } from "./placeholders";

// Debug Components
export { AuthDebugPanel } from "./AuthDebugPanel";

// Layout Components
export { PageLayout } from "./PageLayout";
export type { PageLayoutProps } from "./PageLayout";
export { MainLayout } from "../../features/layouts/MainLayout";
export type { MainLayoutProps } from "../../features/layouts/MainLayout";

// Lazy loading
export { LazyWidget } from "./LazyWidget/LazyWidget";

// Auth UI Components
export { AuthFormField } from "./AuthFormField";
export type { AuthFormFieldProps } from "./AuthFormField";

export { AuthButton } from "./AuthButton";
export type { AuthButtonProps } from "./AuthButton";
