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
  Fade,
  Slide,
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
import { DashboardLayout } from "@/widgets/layout";

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
      color: theme.palette.primary.main,
    },
    {
      value: "requirements_analysis",
      label: "Анализ требований",
      icon: <Analytics />,
      color: theme.palette.secondary.main,
    },
    {
      value: "testing_metrics",
      label: "Метрики тестирования",
      icon: <BarChart />,
      color: theme.palette.warning.main,
    },
    {
      value: "release_statistics",
      label: "Статистика релизов",
      icon: <Timeline />,
      color: theme.palette.info.main,
    },
    {
      value: "team_performance",
      label: "Производительность команды",
      icon: <TrendingUp />,
      color: theme.palette.success.main,
    },
    {
      value: "custom_dashboard",
      label: "Настраиваемый дашборд",
      icon: <InsertChart />,
      color: theme.palette.error.main,
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
    <DashboardLayout>
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 1)} 0%, 
            ${alpha(theme.palette.grey[50], 0.8)} 100%)`,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.palette.primary.main} 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, ${theme.palette.secondary.main} 0%, transparent 50%)`,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Fade in={true} timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 3,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <Analytics sx={{ color: "white", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 0.5,
                      }}
                    >
                      Отчеты и Аналитика
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Генерация отчетов и анализ данных проекта
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Analytics />}
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: theme.palette.grey[300],
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {isGenerating ? "Генерируется..." : "Сгенерировать отчет"}
                </Button>
              </Stack>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {/* Report Configuration */}
            <Grid item xs={12} md={4}>
              <Slide direction="right" in={true} timeout={400}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                      ${alpha(theme.palette.background.default, 0.6)} 100%)`,
                    backdropFilter: "blur(20px)",
                    height: "fit-content",
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}
                  >
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
                            <Box
                              sx={{
                                color: type.color,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {type.icon}
                            </Box>
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
                      <MenuItem value="project3">Проект 3</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Export Options */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Экспорт
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleExportReport("pdf")}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          borderColor: alpha(theme.palette.error.main, 0.3),
                          color: theme.palette.error.main,
                          "&:hover": {
                            borderColor: theme.palette.error.main,
                            backgroundColor: alpha(theme.palette.error.main, 0.04),
                          },
                        }}
                      >
                        PDF
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<TableChart />}
                        onClick={() => handleExportReport("excel")}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          borderColor: alpha(theme.palette.success.main, 0.3),
                          color: theme.palette.success.main,
                          "&:hover": {
                            borderColor: theme.palette.success.main,
                            backgroundColor: alpha(theme.palette.success.main, 0.04),
                          },
                        }}
                      >
                        Excel
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Email />}
                        onClick={() => handleExportReport("email")}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          borderColor: alpha(theme.palette.info.main, 0.3),
                          color: theme.palette.info.main,
                          "&:hover": {
                            borderColor: theme.palette.info.main,
                            backgroundColor: alpha(theme.palette.info.main, 0.04),
                          },
                        }}
                      >
                        Email
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Report Types Grid */}
            <Grid item xs={12} md={8}>
              <Fade in={true} timeout={800}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}
                  >
                    Доступные отчеты
                  </Typography>
                  <Grid container spacing={3}>
                    {reportTypes.map((type, index) => (
                      <Grid item xs={12} sm={6} lg={4} key={type.value}>
                        <Slide
                          direction="up"
                          in={true}
                          timeout={600 + index * 100}
                          style={{ transformOrigin: "center bottom" }}
                        >
                          <Card
                            sx={{
                              height: "100%",
                              cursor: "pointer",
                              borderRadius: 3,
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              background: `linear-gradient(135deg, 
                                ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                                ${alpha(theme.palette.background.default, 0.6)} 100%)`,
                              backdropFilter: "blur(20px)",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                transform: "translateY(-8px) scale(1.02)",
                                boxShadow: `0 20px 40px ${alpha(type.color, 0.15)}`,
                                border: `1px solid ${alpha(type.color, 0.3)}`,
                              },
                            }}
                            onClick={() => setReportType(type.value)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 2,
                                  background: `linear-gradient(135deg, ${type.color}, ${alpha(type.color, 0.8)})`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mb: 2,
                                  boxShadow: `0 8px 16px ${alpha(type.color, 0.3)}`,
                                }}
                              >
                                {React.cloneElement(type.icon, {
                                  sx: { color: "white", fontSize: 24 },
                                })}
                              </Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  mb: 1,
                                  color: type.color,
                                }}
                              >
                                {type.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: 1.6 }}
                              >
                                Подробный анализ и статистика
                              </Typography>
                              {reportType === type.value && (
                                <Chip
                                  label="Выбрано"
                                  size="small"
                                  sx={{
                                    mt: 2,
                                    backgroundColor: type.color,
                                    color: "white",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Slide>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default ReportsPage;
