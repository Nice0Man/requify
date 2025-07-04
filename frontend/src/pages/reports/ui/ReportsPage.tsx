import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  MenuItem,
  Chip,
  List,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Snackbar,
  Alert,
  Tooltip,
  LinearProgress,
  Fade,
  Avatar,
  Paper,
  Tab,
  Tabs,
  ListItemButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Assessment,
  Schedule,
  TrendingUp,
  CheckCircle,
  Search,
  FilterList,
  Add,
  Analytics,
  BarChart,
  Refresh,
  Download,
  Dashboard,
  CalendarToday,
  AttachMoney,
  InsertChart,
  Timeline,
  Clear,
  FileDownload,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ReportStatus } from "@/features/reporting/model/reports.types";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type:
    | "project"
    | "requirements"
    | "testing"
    | "release"
    | "team"
    | "financial"
    | "quality"
    | "executive"
    | "summary";
  icon: React.ReactNode;
  color: string;
  category: string;
  estimatedTime: string;
  lastGenerated?: string;
  isPopular?: boolean;
}



interface ReportFilters {
  search: string;
  type: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  projectId: number | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedReport, setSelectedReport] =
    React.useState<ReportTemplate | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);

  // Filters
  const [filters, setFilters] = React.useState<ReportFilters>({
    search: "",
    type: [],
    dateRange: {
      start: null,
      end: null,
    },
    projectId: null,
  });

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState<ReportStatus[]>([]);

  const reportTemplates: ReportTemplate[] = [
    // Project Analytics
    {
      id: "project-overview",
      name: "Project Overview",
      description:
        "Comprehensive project status, progress, and team performance metrics",
      type: "project",
      icon: <Analytics />,
      color: theme.palette.primary.main,
      category: "Project Analytics",
      estimatedTime: "2-3 min",
      lastGenerated: "2025-01-07",
      isPopular: true,
    },
    {
      id: "requirements-analysis",
      name: "Requirements Analysis",
      description: "Requirements coverage, approval rates, and change tracking",
      type: "requirements",
      icon: <Assessment />,
      color: theme.palette.success.main,
      category: "Project Analytics",
      estimatedTime: "1-2 min",
      lastGenerated: "2025-01-06",
      isPopular: true,
    },
    {
      id: "team-performance",
      name: "Team Performance",
      description:
        "Individual and team productivity, task completion, and workload distribution",
      type: "team",
      icon: <BarChart />,
      color: theme.palette.info.main,
      category: "Project Analytics",
      estimatedTime: "3-4 min",
    },

    // Financial Reports
    {
      id: "budget-tracking",
      name: "Budget Tracking",
      description:
        "Project costs, budget utilization, and financial forecasting",
      type: "financial",
      icon: <AttachMoney />,
      color: theme.palette.warning.main,
      category: "Financial Reports",
      estimatedTime: "2-3 min",
      lastGenerated: "2025-01-05",
    },
    {
      id: "cost-analysis",
      name: "Cost Analysis",
      description:
        "Detailed breakdown of project expenses and ROI calculations",
      type: "financial",
      icon: <TrendingUp />,
      color: theme.palette.secondary.main,
      category: "Financial Reports",
      estimatedTime: "4-5 min",
    },

    // Quality & Testing
    {
      id: "quality-metrics",
      name: "Quality Metrics",
      description:
        "Testing coverage, defect rates, and quality gate compliance",
      type: "quality",
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      category: "Quality & Testing",
      estimatedTime: "2-3 min",
    },
    {
      id: "testing-report",
      name: "Testing Report",
      description:
        "Test execution results, coverage analysis, and bug tracking",
      type: "testing",
      icon: <Timeline />,
      color: theme.palette.error.main,
      category: "Quality & Testing",
      estimatedTime: "3-4 min",
    },

    // Executive Summary
    {
      id: "executive-dashboard",
      name: "Executive Dashboard",
      description:
        "High-level KPIs, project health, and strategic metrics for leadership",
      type: "executive",
      icon: <Dashboard />,
      color: theme.palette.primary.dark,
      category: "Executive Summary",
      estimatedTime: "1-2 min",
      isPopular: true,
    },
    {
      id: "monthly-summary",
      name: "Monthly Summary",
      description:
        "Consolidated monthly performance across all projects and teams",
      type: "summary",
      icon: <CalendarToday />,
      color: theme.palette.info.dark,
      category: "Executive Summary",
      estimatedTime: "5-6 min",
    },
  ];

  // Group reports by category
  const reportsByCategory = reportTemplates.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: [],
      dateRange: { start: null, end: null },
      projectId: null,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateReport = (report: ReportTemplate) => {
    setSelectedReport(report);
    setGenerateDialogOpen(true);
  };

  const confirmGenerate = async () => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSnackbarMessage(`${selectedReport.name} generated successfully!`);
      setSnackbarOpen(true);

      // In real app, would trigger download or redirect to report view
      setGenerateDialogOpen(false);
      setSelectedReport(null);
    } catch (err) {
      setSnackbarMessage("Failed to generate report");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "schedule":
        setSnackbarMessage("Schedule Reports - Coming Soon");
        break;
      case "templates":
        setSnackbarMessage("Custom Templates - Coming Soon");
        break;
      case "export":
        setSnackbarMessage("Bulk Export - Coming Soon");
        break;
      case "refresh":
        setSnackbarMessage("Data refreshed successfully");
        break;
      default:
        setSnackbarMessage("Feature - Coming Soon");
    }
    setSnackbarOpen(true);
  };

  // Filter reports based on search and filters
  const getFilteredReports = (reports: ReportTemplate[]) => {
    return reports.filter((report) => {
      const matchesSearch =
        !filters.search ||
        report.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType =
        filters.type.length === 0 || filters.type.includes(report.type);

      return matchesSearch && matchesType;
    });
  };

  const popularReports = reportTemplates.filter((report) => report.isPopular);
  const recentReports = reportTemplates.filter(
    (report) => report.lastGenerated
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Reports & Analytics
        </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate insights, track performance, and analyze project data
              with comprehensive reports.
        </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Data">
              <span>
                <IconButton
                  onClick={() => handleQuickAction("refresh")}
                  disabled={loading}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      transform: "rotate(180deg)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => handleQuickAction("schedule")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Schedule Reports
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleQuickAction("templates")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              Custom Template
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={() => setError(null)}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              }
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => setActiveTab(0)}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {reportTemplates.length}
                  </Typography>
                  <InsertChart color="primary" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Available Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ready to generate
                </Typography>
              </Stack>
            </Card>
                  </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => setActiveTab(1)}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                    <Typography
                    variant="h4"
                    fontWeight={700}
                    color="success.main"
                  >
                    {popularReports.length}
                  </Typography>
                  <TrendingUp color="success" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Popular Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Most requested
                    </Typography>
              </Stack>
            </Card>
                  </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => setActiveTab(2)}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {recentReports.length}
                  </Typography>
                  <Schedule color="info" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Recent Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generated this week
                    </Typography>
              </Stack>
            </Card>
                </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => handleQuickAction("export")}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="secondary.main"
                  >
                    4
                  </Typography>
                  <FileDownload color="secondary" />
                </Stack>
                <Typography variant="subtitle1" fontWeight={600}>
                  Export Formats
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDF, Excel, CSV, JSON
                    </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <FilterList color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Filters
              </Typography>
              {(filters.search || filters.type.length > 0) && (
                <Button
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ textTransform: "none" }}
                >
                  Clear All
                </Button>
              )}
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Report Type"
                  value={filters.type[0] || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "type",
                      e.target.value ? [e.target.value] : []
                    )
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="project">Project Analytics</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="quality">Quality & Testing</MenuItem>
                  <MenuItem value="executive">Executive Summary</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  type="date"
                  fullWidth
                  label="Date From"
                  value={filters.dateRange.start || ""}
                  onChange={(e) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      start: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={() => navigate("/analytics")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    height: "56px",
                  }}
                >
                  Analytics
                </Button>
              </Grid>
            </Grid>
          </Stack>
            </Card>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              px: 2,
            }}
          >
            <Tab
              icon={<InsertChart />}
              label="All Reports"
              sx={{ textTransform: "none", minHeight: 72 }}
            />
            <Tab
              icon={<TrendingUp />}
              label="Popular"
              sx={{ textTransform: "none", minHeight: 72 }}
            />
            <Tab
              icon={<Schedule />}
              label="Recent"
              sx={{ textTransform: "none", minHeight: 72 }}
            />
          </Tabs>

          {/* All Reports Tab */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={4}>
              {Object.entries(reportsByCategory).map(([category, reports]) => {
                const filteredReports = getFilteredReports(reports);
                if (filteredReports.length === 0) return null;

                return (
                  <Box key={category}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {category}
              </Typography>
                    <Grid container spacing={3}>
                      {filteredReports.map((report) => (
                        <Grid item xs={12} sm={6} md={4} key={report.id}>
                    <Card
                            elevation={0}
                      sx={{
                              height: "100%",
                              borderRadius: 3,
                              border: `1px solid ${alpha(
                                theme.palette.divider,
                                0.1
                              )}`,
                        cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                                borderColor: alpha(report.color, 0.3),
                              },
                      }}
                            onClick={() => handleGenerateReport(report)}
                    >
                            <CardContent sx={{ p: 3 }}>
                              <Stack spacing={2}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={2}
                                >
                                  <Avatar
                                    sx={{
                                      backgroundColor: alpha(report.color, 0.1),
                                      color: report.color,
                                      width: 48,
                                      height: 48,
                                    }}
                                  >
                                    {report.icon}
                                  </Avatar>
                                  {report.isPopular && (
                                    <Chip
                                      label="Popular"
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  )}
                                </Stack>
                                <Typography variant="h6" fontWeight={600}>
                                  {report.name}
                          </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {report.description}
                        </Typography>
                                <Stack direction="row" spacing={1}>
                                  <Chip
                                    label={report.estimatedTime}
                                    size="small"
                                    variant="outlined"
                                    icon={<Schedule />}
                                  />
                                  {report.lastGenerated && (
                        <Chip
                                      label={`Last: ${report.lastGenerated}`}
                          size="small"
                                      variant="outlined"
                        />
                                  )}
                                </Stack>
                              </Stack>
                      </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                              <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                  backgroundColor: report.color,
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontWeight: 500,
                                  "&:hover": {
                                    backgroundColor: alpha(report.color, 0.8),
                                  },
                                }}
                              >
                                Generate Report
                              </Button>
                            </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
                );
              })}
            </Stack>
          </TabPanel>

          {/* Popular Reports Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              {getFilteredReports(popularReports).map((report) => (
                <Grid item xs={12} md={6} key={report.id}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[4],
                      },
                    }}
                    onClick={() => handleGenerateReport(report)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={3}>
                        <Avatar
                          sx={{
                            backgroundColor: alpha(report.color, 0.1),
                            color: report.color,
                            width: 60,
                            height: 60,
                          }}
                        >
                          {report.icon}
                        </Avatar>
                        <Stack spacing={1} flex={1}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography variant="h6" fontWeight={600}>
                              {report.name}
                </Typography>
                            <Chip
                              label="Popular"
                              size="small"
                              color="primary"
                            />
                          </Stack>
                  <Typography variant="body2" color="text.secondary">
                            {report.description}
                  </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={report.estimatedTime}
                              size="small"
                              variant="outlined"
                            />
                            {report.lastGenerated && (
                              <Chip
                                label={`Last: ${report.lastGenerated}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Recent Reports Tab */}
          <TabPanel value={activeTab} index={2}>
            <List>
              {getFilteredReports(recentReports).map((report, index) => (
                <React.Fragment key={report.id}>
                  <ListItemButton
                    onClick={() => handleGenerateReport(report)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                      },
                    }}
                        >
                          <ListItemIcon>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(report.color, 0.1),
                          color: report.color,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {report.icon}
                      </Avatar>
                          </ListItemIcon>
                          <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {report.name}
                                </Typography>
                          {report.isPopular && (
                                <Chip
                              label="Popular"
                                  size="small"
                              color="primary"
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {report.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last generated: {report.lastGenerated} •{" "}
                            {report.estimatedTime} to generate
                          </Typography>
                        </Stack>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Regenerate Report">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReport(report);
                          }}
                        >
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Last Report">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setSnackbarMessage("Download - Coming Soon");
                            setSnackbarOpen(true);
                          }}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItemButton>
                  {index < recentReports.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
          </TabPanel>
        </Paper>
      </Stack>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          "&:hover": {
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
        onClick={() => handleQuickAction("templates")}
      >
        <Add />
      </Fab>

      {/* Generate Report Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => !loading && setGenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Generate Report
            </Typography>
            {!loading && (
              <IconButton
                onClick={() => setGenerateDialogOpen(false)}
                size="small"
              >
                <Clear />
              </IconButton>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(selectedReport.color, 0.1),
                    color: selectedReport.color,
                    width: 56,
                    height: 56,
                  }}
                >
                  {selectedReport.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedReport.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedReport.description}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Report Configuration
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Export Format"
                  defaultValue="pdf"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  <MenuItem value="pdf">PDF Document</MenuItem>
                  <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                  <MenuItem value="csv">CSV File</MenuItem>
                  <MenuItem value="json">JSON Data</MenuItem>
                </TextField>
                <TextField
                  type="date"
                  fullWidth
                  label="Data Range From"
                  defaultValue={
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  type="date"
                  fullWidth
                  label="Data Range To"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Stack>

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Generating report... Estimated time:{" "}
                    {selectedReport.estimatedTime}
                  </Typography>
      </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setGenerateDialogOpen(false)}
            color="inherit"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmGenerate}
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReportsPage;
