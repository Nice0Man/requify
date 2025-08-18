import { Assessment } from "@mui/icons-material";
import type { WidgetConfig } from "@/shared/ui";

// Конфигурация виджета для разных режимов дашборда
export const enhancedStatsWidgetConfig: WidgetConfig = {
  id: 'enhanced-stats-widget',
  title: 'Расширенная статистика',
  description: 'Детальные метрики и KPI с трендами',
  icon: Assessment,
  
  // Настройки по умолчанию
  defaultSize: 'xlarge',
  defaultPriority: 'critical',
  defaultAspectRatio: 'wide',
  
  // Режимы дашборда
  modes: {
    minimal: {
      size: 'large',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '16px' },
    },
    compact: {
      size: 'xlarge',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '20px' },
    },
    detailed: {
      size: 'xlarge',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '24px' },
    },
    fullscreen: {
      size: 'xlarge',
      visible: true,
      priority: 'critical',
      aspectRatio: 'wide',
      spacing: { padding: '32px' },
    },
  },
  
  // Лейауты
  layouts: {
    grid: {
      aspectRatio: 'wide',
      minHeight: '300px',
      maxHeight: '500px',
    },
    list: {
      size: 'xlarge',
      aspectRatio: 'wide',
      minHeight: '200px',
      maxHeight: '400px',
    },
    masonry: {
      size: 'auto',
      aspectRatio: 'auto',
      minHeight: '280px',
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