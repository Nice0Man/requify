import type { AdaptiveWidgetProps } from "@/widgets/types";
import type { SxProps, Theme } from "@mui/material/styles";

export interface RequirementListWidgetProps extends AdaptiveWidgetProps {
  /** CSS классы */
  className?: string;
  /** Стили MUI */
  sx?: SxProps<Theme>;
  requirements?: Array<{ id: string; title: string; status: string }>;
} 