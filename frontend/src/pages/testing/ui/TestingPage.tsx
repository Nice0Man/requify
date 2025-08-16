import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { PageLayout } from "@/shared/ui/PageLayout";
import { LoadingSpinner } from "@/shared/ui";
// TODO: Implement these hooks when testing feature is ready
// import {
//   useTestCases,
//   useTestStats,
//   useUpdateTestCase,
// } from "@/features/testing";
// import type { TestCase, TestFilters } from "@/features/testing/api/testApi";

// Temporary mock types and hooks for demo
interface TestCase {
  id: string;
  title: string;
  description?: string;
  steps: string[];
  status: 'draft' | 'active' | 'deprecated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface TestFilters {
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
}

// Mock hooks
const useTestCases = (filters: TestFilters) => ({
  data: [] as TestCase[],
  isPending: false,
  error: null,
});

const useTestStats = () => ({
  data: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
  },
  isPending: false,
  error: null,
});

const useUpdateTestCase = () => ({});

const TestingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "active" | "deprecated"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high" | "critical"
  >("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tabValue, setTabValue] = useState(0);

  // Формируем фильтры для API
  const filters: TestFilters = {
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    projectId: selectedProject === "all" ? undefined : selectedProject,
  };

  const {
    data: testCases = [],
    isPending: testCasesLoading,
    error: testCasesError,
  } = useTestCases(filters);
  const {
    data: testStats,
    isPending: testStatsLoading,
    error: testStatsError,
  } = useTestStats();
  const updateTestCase = useUpdateTestCase();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Фильтрация тест-кейсов
  const filteredTestCases = testCases.filter((testCase: TestCase) => {
    const matchesSearch =
      testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || testCase.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || testCase.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: TestCase["status"]) => {
    switch (status) {
      case "draft":
        return "default";
      case "active":
        return "success";
      case "deprecated":
        return "warning";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: TestCase["priority"]) => {
    switch (priority) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const TestCaseCard = ({ testCase }: { testCase: TestCase }) => (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" component="h2" fontWeight={700}>
            {testCase.title}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={`Статус: ${testCase.status}`}
              color={getStatusColor(testCase.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Приоритет: ${testCase.priority}`}
              color={getPriorityColor(testCase.priority)}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {testCase.description || "Описание отсутствует"}
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Шаги
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {testCase.steps.length} шагов
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Создан
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(testCase.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button size="small" startIcon={<EditIcon />} sx={{ fontWeight: 600 }}>
          Редактировать
        </Button>
        <Button
          size="small"
          startIcon={<PlayArrowIcon />}
          sx={{ fontWeight: 600 }}
          color="primary"
        >
          Выполнить
        </Button>
        <Button
          size="small"
          startIcon={<AssignmentIcon />}
          sx={{ fontWeight: 600 }}
        >
          Просмотр
        </Button>
      </CardActions>
    </Card>
  );

  if (testCasesLoading || testStatsLoading) {
    return (
      <PageLayout title="Тестирование">
        <LoadingSpinner fullScreen />
      </PageLayout>
    );
  }

  if (testCasesError || testStatsError) {
    return (
      <PageLayout title="Тестирование">
        <Box p={3} textAlign="center">
          <Typography color="error">Ошибка загрузки данных</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Тестирование">
      <Box p={3}>
        {/* Заголовок */}
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            Тестирование
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Управление тест-кейсами и выполнение тестов
          </Typography>
        </Box>

        {/* Статистика */}
        {testStats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={3}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
              >
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {testStats.totalTests}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Всего тестов
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
              >
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {testStats.passedTests}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Пройдено
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
              >
                <Typography variant="h4" color="error.main" fontWeight={700}>
                  {testStats.failedTests}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Провалено
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper
                elevation={1}
                sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
              >
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  {(testStats?.totalTests || 0) -
                    (testStats?.passedTests || 0) -
                    (testStats?.failedTests || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Пропущено
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Фильтры и поиск */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Поиск тест-кейсов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  label="Статус"
                  onChange={(e) =>
                    setStatusFilter(e.target.value as typeof statusFilter)
                  }
                >
                  <MenuItem value="all">Все статусы</MenuItem>
                  <MenuItem value="draft">Черновик</MenuItem>
                  <MenuItem value="active">Активный</MenuItem>
                  <MenuItem value="deprecated">Устаревший</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Приоритет"
                  onChange={(e) =>
                    setPriorityFilter(e.target.value as typeof priorityFilter)
                  }
                >
                  <MenuItem value="all">Все приоритеты</MenuItem>
                  <MenuItem value="low">Низкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                  <MenuItem value="critical">Критический</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newViewMode) =>
                  newViewMode && setViewMode(newViewMode)
                }
                aria-label="Режим просмотра"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ fontWeight: 600 }}
              >
                Создать тест-кейс
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Список тест-кейсов */}
        {filteredTestCases.length === 0 ? (
          <Paper
            elevation={1}
            sx={{ p: 6, textAlign: "center", borderRadius: 2 }}
          >
            <Typography variant="h6" color="text.secondary" mb={2}>
              Тест-кейсы не найдены
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ fontWeight: 600 }}
            >
              Создать первый тест-кейс
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredTestCases.map((testCase) => (
              <Grid item xs={12} md={6} lg={4} key={testCase.id}>
                <TestCaseCard testCase={testCase} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </PageLayout>
  );
};

export default TestingPage;
