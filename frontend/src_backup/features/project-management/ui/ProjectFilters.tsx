import React from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
  Chip,
} from '@mui/material';
import { ProjectStatus } from '@/shared/types';
import { getStatusColor, getStatusLabel } from '@/shared/utils/formatters';

interface ProjectFiltersProps {
  filters: {
    status: ProjectStatus[];
    owner_id?: number;
  };
  onFilterChange: (key: string, value: any) => void;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <Autocomplete
          multiple
          size="small"
          options={Object.values(ProjectStatus)}
          value={filters.status || []}
          onChange={(_, value) => onFilterChange('status', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Status"
              helperText="Leave empty to show all projects"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  size="small"
                  label={getStatusLabel(option)}
                  color={getStatusColor(option)}
                  {...chipProps}
                />
              );
            })
          }
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          size="small"
          label="Owner ID"
          type="number"
          value={filters.owner_id || ''}
          onChange={(e) =>
            onFilterChange(
              'owner_id',
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
          fullWidth
        />
      </Grid>
    </>
  );
}; 