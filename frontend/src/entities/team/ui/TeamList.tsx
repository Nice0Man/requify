import React, { memo, useState, useMemo } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  Typography,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Skeleton,
  Alert,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
} from '@mui/icons-material';
import { TeamCard } from './TeamCard';
import type { Team, TeamViewMode, TeamSearchFilters } from '../model/types';

export interface TeamListProps {
  /** Список команд */
  teams: Team[];
  /** Режим отображения */
  viewMode?: TeamViewMode;
  /** Загрузка */
  loading?: boolean;
  /** Ошибка */
  error?: string | null;
  /** Начальные фильтры */
  initialFilters?: Partial<TeamSearchFilters>;
  /** Обработчик клика по команде */
  onTeamClick?: (team: Team) => void;
  /** Обработчик меню действий */
  onTeamMenuClick?: (event: React.MouseEvent, team: Team) => void;
  /** Обработчик изменения фильтров */
  onFiltersChange?: (filters: TeamSearchFilters) => void;
  /** Показывать ли поиск */
  showSearch?: boolean;
  /** Показывать ли фильтры */
  showFilters?: boolean;
  /** Пустое состояние */
  emptyStateMessage?: string;
}

/**
 * Компонент списка команд
 * Поддерживает поиск, фильтрацию и разные режимы отображения
 */
export const TeamList = memo<TeamListProps>(({
  teams,
  viewMode = TeamViewMode.CARDS,
  loading = false,
  error = null,
  initialFilters = {},
  onTeamClick,
  onTeamMenuClick,
  onFiltersChange,
  showSearch = true,
  showFilters = true,
  emptyStateMessage = 'Команды не найдены',
}) => {
  const [filters, setFilters] = useState<TeamSearchFilters>({
    search: '',
    archived: false,
    ...initialFilters,
  });

  // Фильтрация команд
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = !filters.search || 
        team.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        team.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesArchived = filters.archived ? team.archived : !team.archived;
      
      return matchesSearch && matchesArchived;
    });
  }, [teams, filters]);

  // Обработчик изменения фильтров
  const handleFiltersChange = (newFilters: Partial<TeamSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  // Рендер скелетонов при загрузке
  const renderSkeletons = () => {
    const skeletonCount = viewMode === TeamViewMode.LIST ? 5 : 6;
    
    if (viewMode === TeamViewMode.CARDS) {
      return (
        <Grid container spacing={2}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <List>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ListItem key={index}>
            <Box width="100%">
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </ListItem>
        ))}
      </List>
    );
  };

  // Рендер команд в режиме карточек
  const renderCards = () => (
    <Grid container spacing={2}>
      {filteredTeams.map(team => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
          <Fade in timeout={300}>
            <div>
              <TeamCard
                team={team}
                onClick={onTeamClick}
                onMenuClick={onTeamMenuClick}
              />
            </div>
          </Fade>
        </Grid>
      ))}
    </Grid>
  );

  // Рендер команд в режиме списка
  const renderList = () => (
    <List>
      {filteredTeams.map(team => (
        <ListItem key={team.id} sx={{ px: 0 }}>
          <Fade in timeout={300}>
            <Box width="100%">
              <TeamCard
                team={team}
                onClick={onTeamClick}
                onMenuClick={onTeamMenuClick}
                compact
              />
            </Box>
          </Fade>
        </ListItem>
      ))}
    </List>
  );

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Поиск и фильтры */}
      {(showSearch || showFilters) && (
        <Box mb={3}>
          {showSearch && (
            <TextField
              fullWidth
              placeholder="Поиск команд..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: showFilters ? 2 : 0 }}
            />
          )}

          {showFilters && (
            <Box display="flex" alignItems="center" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.archived}
                    onChange={(e) => handleFiltersChange({ archived: e.target.checked })}
                  />
                }
                label="Показать архивированные"
              />
            </Box>
          )}
        </Box>
      )}

      {/* Статистика */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Загрузка...' : `Найдено команд: ${filteredTeams.length}`}
        </Typography>
      </Box>

      {/* Содержимое */}
      {loading ? renderSkeletons() : (
        <>
          {filteredTeams.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              py={8}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {emptyStateMessage}
              </Typography>
              {filters.search && (
                <Typography variant="body2" color="text.secondary">
                  Попробуйте изменить критерии поиска
                </Typography>
              )}
            </Box>
          ) : (
            viewMode === TeamViewMode.CARDS ? renderCards() : renderList()
          )}
        </>
      )}
    </Box>
  );
});

TeamList.displayName = 'TeamList'; 