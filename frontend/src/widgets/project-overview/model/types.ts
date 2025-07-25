import type { AdaptiveWidgetProps } from "@/widgets/types";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Статус проекта
 */
export type ProjectStatus =
  | "draft"
  | "planning"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

/**
 * Приоритет проекта
 */
export type ProjectPriority = "low" | "medium" | "high" | "critical";

/**
 * Информация о проекте
 */
export interface ProjectInfo {
  /** Идентификатор */
  id: string;

  /** Название проекта */
  name: string;

  /** Описание */
  description?: string;

  /** Статус */
  status: ProjectStatus;

  /** Приоритет */
  priority: ProjectPriority;

  /** Прогресс (0-100) */
  progress: number;

  /** Дата начала */
  startDate: Date;

  /** Планируемая дата окончания */
  endDate: Date;

  /** Команда проекта */
  team: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;

  /** Статистика */
  stats: {
    totalRequirements: number;
    completedRequirements: number;
    totalTasks: number;
    completedTasks: number;
    openIssues: number;
  };

  /** Теги */
  tags?: string[];

  /** Цвет проекта */
  color?: string;
}

/**
 * Пропы для ProjectOverviewWidget
 */
export interface ProjectOverviewWidgetProps extends AdaptiveWidgetProps {
  /** CSS классы */
  className?: string;
  /** Стили MUI */
  sx?: SxProps<Theme>;
  /** Проекты для отображения */
  projects?: ProjectInfo[];

  /** Загрузка данных */
  isDataLoading?: boolean;

  /** Ошибка загрузки */
  dataError?: Error | null;

  /** Обработчик клика по проекту */
  onProjectClick?: (project: ProjectInfo) => void;

  /** Обработчик обновления */
  onRefresh?: () => void;

  /** Максимальное количество проектов */
  maxProjects?: number;

  /** Показывать команду */
  showTeam?: boolean;

  /** Показывать прогресс */
  showProgress?: boolean;

  /** Кастомный заголовок */
  customTitle?: string;
}
