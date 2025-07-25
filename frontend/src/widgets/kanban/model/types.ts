import type { AdaptiveWidgetProps } from "@/widgets/types";
import type { KanbanCard } from "@/entities/kanban";
import type { SxProps, Theme } from "@mui/material/styles";

export interface KanbanWidgetProps extends AdaptiveWidgetProps {
  /** CSS классы */
  className?: string;
  /** Стили MUI */
  sx?: SxProps<Theme>;
  type?: string; // Добавляю недостающее свойство
  projectId?: number;
  requirementId?: number;
  showTypeSelector?: boolean;
  showFilters?: boolean;
  allowDragDrop?: boolean;
  maxHeight?: number;
  columns?: any[]; // Добавляю недостающие пропсы
  onItemMove?: (item: any, newStatus: string) => void;
  onItemClick?: (item: KanbanCard) => void;
  onItemEdit?: (item: KanbanCard) => void;
} 