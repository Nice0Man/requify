import React from 'react';
import { Box, Typography, LinearProgress, Tooltip } from '@mui/material';
import { Assignment as RequirementsIcon, CheckCircle } from '@mui/icons-material';
import type { Release } from '../model/types';
import { calculateProgress } from '../model/utils';

interface ReleaseProgressProps {
  release: Release;
  compact?: boolean;
}

/**
 * Компонент отображения прогресса релиза
 */
export const ReleaseProgress: React.FC<ReleaseProgressProps> = ({ 
  release, 
  compact = false 
}) => {
  const progress = calculateProgress(release);

  if (compact) {
    return (
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 4, borderRadius: 2 }}
      />
    );
  }

  return (
    <Box>
      {/* Прогресс */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="caption" color="text.secondary">
            Готовность
          </Typography>
          <Typography variant="caption" fontWeight="medium">
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Метрики */}
      {release.stats && (
        <Box display="flex" gap={2} flexWrap="wrap" mt={1.5}>
          <Tooltip title="Требования">
            <Box display="flex" alignItems="center" gap={0.5}>
              <RequirementsIcon fontSize="small" color="action" />
              <Typography variant="caption">
                {release.stats.completed_requirements}/{release.stats.total_requirements}
              </Typography>
            </Box>
          </Tooltip>
          
          {release.stats.bugs_fixed && (
            <Tooltip title="Исправлено ошибок">
              <Box display="flex" alignItems="center" gap={0.5}>
                <CheckCircle fontSize="small" color="action" />
                <Typography variant="caption">
                  {release.stats.bugs_fixed} исправлений
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}; 