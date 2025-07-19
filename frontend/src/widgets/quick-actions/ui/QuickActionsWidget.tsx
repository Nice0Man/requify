import React, { memo } from "react";
import { Box } from "@mui/material";

import { 
  QuickActionsWidget as FeatureQuickActionsWidget,
  type QuickAction,
  ActionCategory,
} from "@/features/dashboard";

interface QuickActionsWidgetProps {
  variant?: "minimal" | "detailed" | "compact";
  maxActions?: number;
  showCategories?: boolean;
  showShortcuts?: boolean;
  showFavorites?: boolean;
  category?: ActionCategory;
  className?: string;
  onActionClick?: (action: QuickAction) => void;
}

/**
 * Quick Actions Widget - обёртка над feature компонентом
 * Предоставляет простой интерфейс для использования в страницах
 */
export const QuickActionsWidget = memo<QuickActionsWidgetProps>((props) => {
  return (
    <Box sx={{ 
      border: "none",
      borderRadius: 0,
      boxShadow: "none",
      backgroundColor: "transparent",
    }}>
      <FeatureQuickActionsWidget {...props} />
    </Box>
  );
});

QuickActionsWidget.displayName = "QuickActionsWidget"; 
