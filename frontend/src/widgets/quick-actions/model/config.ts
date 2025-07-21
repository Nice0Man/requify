import { FlashOn } from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import type { WidgetConfig } from "@/shared/ui";

// Конфигурация виджета для разных режимов дашборда
export const quickActionsWidgetConfig: WidgetConfig = {
  id: "quick-actions-widget",
  title: i18n.t("dashboard.widgets.quickActions.title", "Быстрые действия"),
  description: i18n.t(
    "dashboard.widgets.quickActions.description",
    "Панель быстрого доступа к часто используемым функциям"
  ),
  icon: FlashOn,

  // Настройки по умолчанию
  defaultSize: "small",
  defaultPriority: "high",
  defaultAspectRatio: "square",

  // Режимы дашборда
  modes: {
    minimal: {
      size: "small",
      visible: true,
      priority: "high",
      aspectRatio: "square",
      spacing: { padding: "12px" },
    },
    compact: {
      size: "medium",
      visible: true,
      priority: "high",
      aspectRatio: "square",
      spacing: { padding: "16px" },
    },
    detailed: {
      size: "medium",
      visible: true,
      priority: "high",
      aspectRatio: "wide",
      spacing: { padding: "20px" },
    },
    fullscreen: {
      size: "large",
      visible: true,
      priority: "high",
      aspectRatio: "wide",
      spacing: { padding: "24px" },
    },
  },

  // Лейауты
  layouts: {
    grid: {
      aspectRatio: "square",
      minHeight: "200px",
      maxHeight: "300px",
    },
    list: {
      size: "small",
      aspectRatio: "wide",
      minHeight: "120px",
      maxHeight: "180px",
    },
    masonry: {
      size: "auto",
      aspectRatio: "auto",
      minHeight: "160px",
    },
  },

  // Стили
  border: true,
  shadow: true,
  borderRadius: 12,

  // Поведение
  collapsible: true,
  resizable: false,
  draggable: false,

  // Производительность
  lazy: false,
  virtualizeContent: false,
}; 