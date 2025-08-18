import React from 'react';
import {
  CalendarToday as CalendarIcon,
  Label as TagIcon,
  CheckCircle as CompletedIcon,
  Schedule as DraftIcon,
  Visibility as PreviewIcon,
  Edit as InProgressIcon,
} from '@mui/icons-material';
import type { Release } from '../model/types';

interface ReleaseStatusIconProps {
  status: Release['status'];
  fontSize?: 'small' | 'medium' | 'large';
}

/**
 * Компонент иконки статуса релиза
 */
export const ReleaseStatusIcon: React.FC<ReleaseStatusIconProps> = ({ 
  status, 
  fontSize = 'small' 
}) => {
  const iconMap: Record<Release['status'], React.ReactElement> = {
    draft: <DraftIcon fontSize={fontSize} />,
    planned: <CalendarIcon fontSize={fontSize} />,
    in_progress: <InProgressIcon fontSize={fontSize} />,
    ready: <PreviewIcon fontSize={fontSize} />,
    published: <CompletedIcon fontSize={fontSize} />,
    archived: <TagIcon fontSize={fontSize} />,
  };
  
  return iconMap[status] || <TagIcon fontSize={fontSize} />;
}; 