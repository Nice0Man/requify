import React, { memo, useState, useMemo } from "react";
import {
  Box,
  Grid,
  List,
  ListItem,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Skeleton,
  Alert,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  TableRows as TableIcon,
} from "@mui/icons-material";
import { TestCaseCard } from "./TestCaseCard";
import type {
  TestCase,
  TestCaseResult,
  TestCaseFilters,
  TestCasePriority,
  TestCaseStatus,
  TestExecutionStatus,
} from "../model/types";
import { TestCaseViewMode } from "../model/types";

export interface TestCaseListProps {
  /** Список тест-кейсов */
  testCases: TestCase[];
  /** Результаты выполнения */
  results?: Record<string, TestCaseResult>;
  /** Режим отображения */
  viewMode?: TestCaseViewMode;
  /** Загрузка */
  loading?: boolean;
  /** Ошибка */
  error?: string | null;
  /** Начальные фильтры */
  initialFilters?: Partial<TestCaseFilters>;
  /** Обработчик клика по тест-кейсу */
  onTestCaseClick?: (testCase: TestCase) => void;
  /** Обработчик меню действий */
  onTestCaseMenuClick?: (event: React.MouseEvent, testCase: TestCase) => void;
  /** Обработчик выполнения теста */
  onTestCaseExecute?: (testCase: TestCase, status: TestExecutionStatus) => void;
  /** Обработчик изменения фильтров */
  onFiltersChange?: (filters: TestCaseFilters) => void;
  /** Обработчик изменения режима отображения */
  onViewModeChange?: (mode: TestCaseViewMode) => void;
  /** Показывать ли поиск */
  showSearch?: boolean;
  /** Показывать ли фильтры */
  showFilters?: boolean;
  /** Показывать ли контролы выполнения */
  showExecutionControls?: boolean;
  /** Пустое состояние */
  emptyStateMessage?: string;
}

const PRIORITY_OPTIONS: TestCasePriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];
const STATUS_OPTIONS: TestCaseStatus[] = ["draft", "active", "deprecated"];
const EXECUTION_STATUS_OPTIONS: TestExecutionStatus[] = [
  "not_executed",
  "passed",
  "failed",
  "blocked",
  "skipped",
  "in_progress",
];

/**
 * Компонент списка тест-кейсов
 * Поддерживает поиск, фильтрацию и разные режимы отображения
 */
export const TestCaseList = memo<TestCaseListProps>(
  ({
    testCases,
    results = {},
    viewMode = TestCaseViewMode.CARDS,
    loading = false,
    error = null,
    initialFilters = {},
    onTestCaseClick,
    onTestCaseMenuClick,
    onTestCaseExecute,
    onFiltersChange,
    onViewModeChange,
    showSearch = true,
    showFilters = true,
    showExecutionControls = false,
    emptyStateMessage = "Тест-кейсы не найдены",
  }) => {
    const [filters, setFilters] = useState<TestCaseFilters>({
      search: "",
      priority: [],
      status: [],
      executionStatus: [],
      ...initialFilters,
    });

    // Фильтрация тест-кейсов
    const filteredTestCases = useMemo(() => {
      return testCases.filter((testCase) => {
        const result = results[testCase.id];
        const executionStatus =
          result?.execution?.status ||
          result?.lastExecution?.status ||
          "not_executed";

        const matchesSearch =
          !filters.search ||
          testCase.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          testCase.description
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        const matchesPriority =
          !filters.priority?.length ||
          filters.priority.includes(testCase.priority);

        const matchesStatus =
          !filters.status?.length || filters.status.includes(testCase.status);

        const matchesExecutionStatus =
          !filters.executionStatus?.length ||
          filters.executionStatus.includes(executionStatus);

        const matchesRequirement =
          !filters.requirementId ||
          testCase.requirementId === filters.requirementId;

        return (
          matchesSearch &&
          matchesPriority &&
          matchesStatus &&
          matchesExecutionStatus &&
          matchesRequirement
        );
      });
    }, [testCases, results, filters]);

    // Обработчик изменения фильтров
    const handleFiltersChange = (newFilters: Partial<TestCaseFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange?.(updatedFilters);
    };

    // Рендер скелетонов при загрузке
    const renderSkeletons = () => {
      const skeletonCount = viewMode === TestCaseViewMode.LIST ? 5 : 6;

      if (viewMode === TestCaseViewMode.CARDS) {
        return (
          <Grid container spacing={2}>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: 1 }}
                />
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
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            </ListItem>
          ))}
        </List>
      );
    };

    // Рендер тест-кейсов в режиме карточек
    const renderCards = () => (
      <Grid container spacing={2}>
        {filteredTestCases.map((testCase) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={testCase.id}>
            <Fade in timeout={300}>
              <div>
                <TestCaseCard
                  testCase={testCase}
                  result={results[testCase.id]}
                  onClick={onTestCaseClick}
                  onMenuClick={onTestCaseMenuClick}
                  onExecute={onTestCaseExecute}
                  showExecutionControls={showExecutionControls}
                />
              </div>
            </Fade>
          </Grid>
        ))}
      </Grid>
    );

    // Рендер тест-кейсов в режиме списка
    const renderList = () => (
      <List>
        {filteredTestCases.map((testCase) => (
          <ListItem key={testCase.id} sx={{ px: 0 }}>
            <Fade in timeout={300}>
              <Box width="100%">
                <TestCaseCard
                  testCase={testCase}
                  result={results[testCase.id]}
                  onClick={onTestCaseClick}
                  onMenuClick={onTestCaseMenuClick}
                  onExecute={onTestCaseExecute}
                  showExecutionControls={showExecutionControls}
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
          <Paper sx={{ p: 2, mb: 3 }}>
            {showSearch && (
              <TextField
                fullWidth
                placeholder="Поиск тест-кейсов..."
                value={filters.search}
                onChange={(e) =>
                  handleFiltersChange({ search: e.target.value })
                }
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
              <Grid container spacing={2}>
                {/* Приоритет */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Приоритет</InputLabel>
                    <Select
                      multiple
                      value={filters.priority || []}
                      onChange={(e) =>
                        handleFiltersChange({
                          priority: e.target.value as TestCasePriority[],
                        })
                      }
                      input={<OutlinedInput label="Приоритет" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Статус */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Статус</InputLabel>
                    <Select
                      multiple
                      value={filters.status || []}
                      onChange={(e) =>
                        handleFiltersChange({
                          status: e.target.value as TestCaseStatus[],
                        })
                      }
                      input={<OutlinedInput label="Статус" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Статус выполнения */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Выполнение</InputLabel>
                    <Select
                      multiple
                      value={filters.executionStatus || []}
                      onChange={(e) =>
                        handleFiltersChange({
                          executionStatus: e.target
                            .value as TestExecutionStatus[],
                        })
                      }
                      input={<OutlinedInput label="Выполнение" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {EXECUTION_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Требование */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ID требования"
                    value={filters.requirementId || ""}
                    onChange={(e) =>
                      handleFiltersChange({
                        requirementId: e.target.value || undefined,
                      })
                    }
                  />
                </Grid>
              </Grid>
            )}
          </Paper>
        )}

        {/* Заголовок и контролы */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="body2" color="text.secondary">
            {loading
              ? "Загрузка..."
              : `Найдено тест-кейсов: ${filteredTestCases.length}`}
          </Typography>

          {onViewModeChange && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, mode) => mode && onViewModeChange(mode)}
              size="small"
            >
              <ToggleButton value={TestCaseViewMode.CARDS}>
                <GridIcon />
              </ToggleButton>
              <ToggleButton value={TestCaseViewMode.LIST}>
                <ListIcon />
              </ToggleButton>
              <ToggleButton value={TestCaseViewMode.TABLE}>
                <TableIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>

        {/* Содержимое */}
        {loading ? (
          renderSkeletons()
        ) : (
          <>
            {filteredTestCases.length === 0 ? (
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
              <>
                {viewMode === TestCaseViewMode.CARDS && renderCards()}
                {viewMode === TestCaseViewMode.LIST && renderList()}
                {viewMode === TestCaseViewMode.TABLE && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={4}
                  >
                    Табличный режим будет реализован позже
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Box>
    );
  }
);

TestCaseList.displayName = "TestCaseList";
