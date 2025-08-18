import type { AdaptiveWidgetProps } from "@/widgets/types";
import type { SxProps, Theme } from "@mui/material/styles";

export interface ProjectStatsWidgetProps extends AdaptiveWidgetProps {
  /** CSS классы */
  className?: string;
  /** Стили MUI */
  sx?: SxProps<Theme>;
  stats?: { total: number; completed: number; inProgress: number };
} 