import React from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Badge,
  Paper,
  Grid,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface SearchFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  onRefresh: () => void;
  children?: React.ReactNode; // Дополнительные фильтры
  searchPlaceholder?: string;
  loading?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchValue,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  onClearFilters,
  onRefresh,
  children,
  searchPlaceholder = 'Search...',
  loading = false,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        display="flex"
        gap={2}
        alignItems="center"
        mb={showFilters ? 2 : 0}
      >
        <TextField
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchChange('')}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
          disabled={loading}
        />

        <Badge badgeContent={activeFiltersCount} color="primary">
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterIcon />}
            onClick={onToggleFilters}
            disabled={loading}
          >
            Filters
          </Button>
        </Badge>

        {activeFiltersCount > 0 && (
          <Button 
            variant="outlined" 
            onClick={onClearFilters}
            disabled={loading}
          >
            Clear Filters
          </Button>
        )}

        <IconButton 
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Collapse in={showFilters}>
        {children && (
          <Grid container spacing={2}>
            {children}
          </Grid>
        )}
      </Collapse>
    </Paper>
  );
}; 