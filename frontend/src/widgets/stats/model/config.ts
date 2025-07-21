import { Assessment } from "@mui/icons-material";
import i18n from "@/shared/lib/i18n";
import type { WidgetConfig } from "@/shared/ui";

// Конфигурация виджета для разных режимов дашборда  
export const dashboardStatsWidgetConfig: WidgetConfig = {
  id: 'dashboard-stats-widget',
  title: i18n.t('dashboard.widgets.stats.title', 'Статистика дашборда'),
  description: i18n.t('dashboard.widgets.stats.description', 'Основные метрики и KPI проектов'),
  icon: Assessment,
  
  // Настройки по умолчанию
  defaultSize: 'large',
  defaultPriority: 'high',
  defaultAspectRatio: 'wide',
  
  // Режимы дашборда
  modes: {
    minimal: {
      size: 'medium',
      visible: true,
      priority: 'normal',
      aspectRatio: 'wide',
      spacing: { padding: '16px' },
    },
    compact: {
      size: 'large',
      visible: true,
      priority: 'high',
      aspectRatio: 'wide',
      spacing: { padding: '20px' },
    },
    detailed: {
      size: 'xlarge',
      visible: true,
      priority: 'high',
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
    },
    list: {
      size: 'large',
      aspectRatio: 'wide',
      minHeight: '200px',
      maxHeight: '300px',
    },
    masonry: {
      size: 'auto',
      aspectRatio: 'auto',
      minHeight: '250px',
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