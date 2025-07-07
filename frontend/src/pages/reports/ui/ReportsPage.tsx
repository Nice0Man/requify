import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Stack,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Analytics,
  Download,
  Print,
  Email,
  PieChart,
  BarChart,
  Timeline,
  TrendingUp,
  Assessment,
  InsertChart,
  TableChart,
  Refresh,
} from "@mui/icons-material";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const ReportsPage: React.FC = () => {
  const theme = useTheme();
  const [reportType, setReportType] = useState("project_summary");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [projectFilter, setProjectFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      value: "project_summary",
      label: "Сводка по проектам",
      icon: <Assessment />,
    },
    {
      value: "requirements_analysis",
      label: "Анализ требований",
      icon: <Analytics />,
    },
    {
      value: "testing_metrics",
      label: "Метрики тестирования",
      icon: <BarChart />,
    },
    {
      value: "release_statistics",
      label: "Статистика релизов",
      icon: <Timeline />,
    },
    {
      value: "team_performance",
      label: "Производительность команды",
      icon: <TrendingUp />,
    },
    {
      value: "custom_dashboard",
      label: "Настраиваемый дашборд",
      icon: <InsertChart />,
    },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleExportReport = (format: string) => {
    console.log(`Exporting report in ${format} format`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        mb={4}
        sx={{
          opacity: 0,
          transform: "translateY(20px)",
          animation: "fadeInUp 0.6s ease-out 0.1s forwards",
          "@keyframes fadeInUp": {
            "0%": { opacity: 0, transform: "translateY(20px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              Отчеты и Аналитика
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Генерация отчетов и анализ данных проекта
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Analytics />}
            onClick={handleGenerateReport}
            disabled={isGenerating}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { boxShadow: theme.shadows[4] },
            }}
          >
            {isGenerating ? (
              <CircularProgress size={20} />
            ) : (
              "Сгенерировать отчет"
            )}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: "none",
              height: "fit-content",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Настройки отчета
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Тип отчета</InputLabel>
              <Select
                value={reportType}
                label="Тип отчета"
                onChange={(e) => setReportType(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Проект</InputLabel>
              <Select
                value={projectFilter}
                label="Проект"
                onChange={(e) => setProjectFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">Все проекты</MenuItem>
                <MenuItem value="project1">Проект 1</MenuItem>
                <MenuItem value="project2">Проект 2</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ru}
            >
              <Stack spacing={2}>
                <TextField
                  label="Дата начала"
                  type="date"
                  value={dateRange[0] ? format(dateRange[0], "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setDateRange([
                      e.target.value ? new Date(e.target.value) : null,
                      dateRange[1],
                    ])
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="Дата окончания"
                  type="date"
                  value={dateRange[1] ? format(dateRange[1], "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setDateRange([
                      dateRange[0],
                      e.target.value ? new Date(e.target.value) : null,
                    ])
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Stack>
            </LocalizationProvider>

            <Box mt={3}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Экспорт
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Экспорт в PDF">
                  <IconButton
                    onClick={() => handleExportReport("pdf")}
                    sx={{
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Печать">
                  <IconButton
                    onClick={() => handleExportReport("print")}
                    sx={{
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    <Print />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Отправить по email">
                  <IconButton
                    onClick={() => handleExportReport("email")}
                    sx={{
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    <Email />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Report Types Grid */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {reportTypes.map((type) => (
              <Grid item xs={12} sm={6} key={type.value}>
                <Card
                  sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: "all 0.2s ease-in-out",
                    backgroundColor:
                      reportType === type.value
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => setReportType(type.value)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={2}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {type.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {type.label}
                        </Typography>
                        {reportType === type.value && (
                          <Chip
                            label="Выбран"
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {type.value === "project_summary" &&
                        "Общая сводка по всем проектам с ключевыми метриками"}
                      {type.value === "requirements_analysis" &&
                        "Анализ требований, их статус и выполнение"}
                      {type.value === "testing_metrics" &&
                        "Метрики тестирования, покрытие, результаты"}
                      {type.value === "release_statistics" &&
                        "Статистика релизов, развертываний, откатов"}
                      {type.value === "team_performance" &&
                        "Производительность команды, загрузка, эффективность"}
                      {type.value === "custom_dashboard" &&
                        "Настраиваемый дашборд с выбранными метриками"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Recent Reports */}
      <Box mt={4}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Недавние отчеты
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((report) => (
            <Grid item xs={12} md={4} key={report}>
              <Card
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { boxShadow: theme.shadows[2] },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Отчет #{report}
                    </Typography>
                    <Chip
                      label="Готов"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {format(new Date(), "dd.MM.yyyy HH:mm", { locale: ru })}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      sx={{ borderRadius: 1 }}
                    >
                      Скачать
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Refresh />}
                      sx={{ borderRadius: 1 }}
                    >
                      Обновить
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ReportsPage;
