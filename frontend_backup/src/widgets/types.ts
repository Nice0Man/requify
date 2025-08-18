// import type { SxProps, Theme } from "@mui/material/styles"; // Перенесено в конкретные виджеты

// Импортируем базовые типы из shared
import type {
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
  BaseWidgetProps as SharedBaseWidgetProps,
} from "@/shared/types/dashboard";

// Реэкспортируем для обратной совместимости
export type {
  DashboardMode,
  DashboardLayoutType,
  DashboardDensity,
};

/**
 * Базовые пропы для всех виджетов дашборда (расширенные)
 */
export interface BaseWidgetProps extends SharedBaseWidgetProps {
  /** Обработчик ошибок (расширенный) */
  onError?: (error: Error | string) => void;
}

/**
 * Адаптивные пропы виджета
 */
export interface AdaptiveWidgetProps extends BaseWidgetProps {
  /** Размер виджета */
  size?: WidgetSize;

  /** Состояние виджета */
  state?: WidgetState;

  /** Интерактивный виджет */
  interactive?: boolean;
}

/**
 * Пропы виджета с данными
 */
export interface DataWidgetProps extends AdaptiveWidgetProps {
  /** Данные для отображения */
  data?: any;

  /** Состояние загрузки данных */
  dataLoading?: boolean;

  /** Ошибка загрузки данных */
  dataError?: Error | string | null;

  /** Обработчик обновления данных */
  onRefresh?: () => void | Promise<void>;
}

/**
 * Конфигурация виджета
 */
export interface WidgetConfig {
  /** Уникальный идентификатор виджета */
  id: string;

  /** Иконка виджета */
  icon: React.ReactElement;

  /** Название виджета */
  title: string;

  /** Описание виджета */
  description?: string;

  /** Тип виджета */
  type: WidgetType;

  /** Размер виджета */
  size: WidgetSize;

  /** Приоритет отображения (чем меньше число, тем выше приоритет) */
  priority: number;

  /** Настройки отображения */
  display: {
    /** Показывать ли виджет по умолчанию */
    visible: boolean;

    /** Минимальная ширина */
    minWidth?: number;

    /** Минимальная высота */
    minHeight?: number;

    /** Максимальная ширина */
    maxWidth?: number;

    /** Максимальная высота */
    maxHeight?: number;

    /** Можно ли изменять размер */
    resizable?: boolean;

    /** Можно ли перемещать */
    draggable?: boolean;

    /** Можно ли сворачивать */
    collapsible?: boolean;
  };

  /** Настройки позиционирования */
  position?: {
    /** Позиция X в сетке */
    x: number;

    /** Позиция Y в сетке */
    y: number;

    /** Ширина в единицах сетки */
    width: number;

    /** Высота в единицах сетки */
    height: number;
  };

  /** Дополнительные настройки виджета */
  settings?: Record<string, any>;

  /** Разрешения для просмотра виджета */
  permissions?: string[];
}

/**
 * Типы виджетов
 */
export enum WidgetType {
  /** Метрики и статистика */
  METRICS = "metrics",

  /** Графики и диаграммы */
  CHART = "chart",

  /** Списки и таблицы */
  LIST = "list",

  /** Лента активности */
  ACTIVITY = "activity",

  /** Быстрые действия */
  QUICK_ACTIONS = "quick_actions",

  /** Статус системы */
  SYSTEM_HEALTH = "system_health",

  /** Календарь и события */
  CALENDAR = "calendar",

  /** Прогресс и индикаторы */
  PROGRESS = "progress",

  /** Пользовательский виджет */
  CUSTOM = "custom",
}

/**
 * Размеры виджетов
 */
export enum WidgetSize {
  /** Маленький виджет */
  SMALL = "small",

  /** Средний виджет */
  MEDIUM = "medium",

  /** Большой виджет */
  LARGE = "large",

  /** Очень большой виджет */
  XLARGE = "xlarge",

  /** Автоматический размер */
  AUTO = "auto",
}

/**
 * Состояние виджета
 */
export interface WidgetState {
  /** Загружается ли виджет */
  isLoading: boolean;

  /** Ошибка виджета */
  error?: string | Error;

  /** Данные виджета */
  data?: any;

  /** Последнее обновление */
  lastUpdate?: Date;

  /** Свернут ли виджет */
  isCollapsed?: boolean;

  /** Выбран ли виджет */
  isSelected?: boolean;

  /** Настройки виджета */
  settings?: Record<string, any>;
}

/**
 * Контекст виджета
 */
export interface WidgetContext {
  /** Текущий режим дашборда */
  mode: DashboardMode;

  /** Текущий макет */
  layout: DashboardLayoutType;

  /** Текущая плотность */
  density: DashboardDensity;

  /** Функция изменения режима */
  setMode: (mode: DashboardMode) => void;

  /** Функция изменения макета */
  setLayout: (layout: DashboardLayoutType) => void;

  /** Функция изменения плотности */
  setDensity: (density: DashboardDensity) => void;

  /** Обновить виджет */
  refreshWidget: (widgetId: string) => void;

  /** Установить состояние виджета */
  setWidgetState: (widgetId: string, state: Partial<WidgetState>) => void;

  /** Получить состояние виджета */
  getWidgetState: (widgetId: string) => WidgetState | undefined;
}

/**
 * Пропсы для компонентов виджетов
 */
export interface WidgetComponentProps extends BaseWidgetProps {
  /** Конфигурация виджета */
  config: WidgetConfig;

  /** Состояние виджета */
  state: WidgetState;

  /** Контекст виджета */
  context: WidgetContext;

  /** Обработчик обновления состояния */
  onStateChange: (state: Partial<WidgetState>) => void;

  /** Обработчик изменения настроек */
  onSettingsChange: (settings: Record<string, any>) => void;
}

/**
 * Фабрика виджетов
 */
export interface WidgetFactory {
  /** Создать виджет */
  create: (
    config: WidgetConfig
  ) => Promise<React.ComponentType<WidgetComponentProps>>;

  /** Получить доступные типы виджетов */
  getAvailableTypes: () => WidgetType[];

  /** Получить конфигурацию по умолчанию для типа */
  getDefaultConfig: (type: WidgetType) => Partial<WidgetConfig>;

  /** Валидировать конфигурацию */
  validateConfig: (config: WidgetConfig) => boolean;
}

/**
 * Менеджер виджетов
 */
export interface WidgetManager {
  /** Зарегистрировать виджет */
  register: (type: WidgetType, factory: WidgetFactory) => void;

  /** Разрегистрировать виджет */
  unregister: (type: WidgetType) => void;

  /** Получить фабрику виджета */
  getFactory: (type: WidgetType) => WidgetFactory | undefined;

  /** Получить все зарегистрированные типы */
  getRegisteredTypes: () => WidgetType[];
}
