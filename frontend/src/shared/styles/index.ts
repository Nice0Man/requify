//  Dashboard Design System - Unified exports

// Design tokens and types
export * from "./dashboard-tokens";

// Performance-optimized hooks
export * from "./dashboard-hooks";

// Optimized animations system
export * from "./dashboard-animations";

// Widget utility exports
export const useWidgetStyles = (variant: string = "default") => ({
  elevation: variant === "elevated" ? 4 : 1,
  borderRadius: 8,
  padding: 16,
});

export const getShadowForState = (
  state: "normal" | "hover" | "active" = "normal"
) => {
  const shadows = {
    normal: "0 2px 4px rgba(0,0,0,0.1)",
    hover: "0 4px 8px rgba(0,0,0,0.15)",
    active: "0 1px 2px rgba(0,0,0,0.05)",
  };
  return shadows[state];
};
