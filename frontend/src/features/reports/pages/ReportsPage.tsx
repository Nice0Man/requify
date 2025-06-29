import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Assessment,
  GetApp,
  Schedule,
  TrendingUp,
  BugReport,
  CheckCircle,
  Warning,
} from "@mui/icons-material";
import { formatDate } from "../../../shared/utils/formatters";
import { useApi } from "../../../shared/hooks/useApi";
import LoadingSpinner from "../../../shared/components/LoadingSpinner/LoadingSpinner";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "project" | "requirements" | "testing" | "release";
  icon: React.ReactNode;
}

interface ReportData {
  id: string;
  name: string;
  createdAt: string;
  status: "generating" | "ready" | "failed";
  downloadUrl?: string;
  type: string;
}

const ReportsPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState<ReportData[]>([]);

  const { loading: generatingReport, execute: generateReport } = useApi();
  const { loading: loadingReports, execute: loadReports } = useApi();

  const reportTemplates: ReportTemplate[] = [
    {
      id: "project-summary",
      name: "Project Summary Report",
      description: "Overall project status, milestones, and key metrics",
      type: "project",
      icon: <Assessment />,
    },
    {
      id: "requirements-analysis",
      name: "Requirements Analysis Report",
      description: "Requirements status, coverage, and traceability",
      type: "requirements",
      icon: <CheckCircle />,
    },
    {
      id: "test-execution",
      name: "Test Execution Report",
      description: "Test results, coverage, and defect statistics",
      type: "testing",
      icon: <BugReport />,
    },
    {
      id: "release-readiness",
      name: "Release Readiness Report",
      description: "Release criteria, risk assessment, and go/no-go analysis",
      type: "release",
      icon: <TrendingUp />,
    },
    {
      id: "progress-dashboard",
      name: "Progress Dashboard",
      description: "Real-time project progress with charts and KPIs",
      type: "project",
      icon: <Schedule />,
    },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // Load projects and existing reports
    await loadReports(() =>
      Promise.resolve([
        {
          id: "1",
          name: "Project Alpha Summary - 2024-01-15",
          createdAt: "2024-01-15T10:00:00Z",
          status: "ready" as const,
          downloadUrl: "/api/reports/1/download",
          type: "Project Summary",
        },
        {
          id: "2",
          name: "Requirements Analysis - 2024-01-14",
          createdAt: "2024-01-14T15:30:00Z",
          status: "generating" as const,
          type: "Requirements Analysis",
        },
      ])
    );
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !selectedProject) return;

    const reportData = {
      templateId: selectedTemplate,
      projectId: selectedProject,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    };

    await generateReport(
      () => Promise.resolve({ success: true, reportId: "new-report" }),
      {
        showSuccessToast: true,
        successMessage:
          "Report generation started. You will be notified when it's ready.",
      }
    );

    // Refresh reports list
    loadInitialData();
  };

  const handleDownloadReport = (report: ReportData) => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, "_blank");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "success";
      case "generating":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle />;
      case "generating":
        return <Schedule />;
      case "failed":
        return <Warning />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Generate comprehensive reports to track project progress, analyze
          requirements, and assess quality metrics.
        </Typography>

        <Grid container spacing={3}>
          {/* Report Generation Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate New Report
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Project</InputLabel>
                      <Select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        label="Project"
                      >
                        <MenuItem value="1">Project Alpha</MenuItem>
                        <MenuItem value="2">Project Beta</MenuItem>
                        <MenuItem value="3">Project Gamma</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Report Template</InputLabel>
                      <Select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        label="Report Template"
                      >
                        {reportTemplates.map((template) => (
                          <MenuItem key={template.id} value={template.id}>
                            {template.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Date From (Optional)
                    </Typography>
                    {/* Date picker would be implemented with proper date library */}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Date To (Optional)
                    </Typography>
                    {/* Date picker would be implemented with proper date library */}
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Selected Template Description:
                  </Typography>
                  {selectedTemplate && (
                    <Typography variant="body2">
                      {
                        reportTemplates.find((t) => t.id === selectedTemplate)
                          ?.description
                      }
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  variant="contained"
                  startIcon={<Assessment />}
                  onClick={handleGenerateReport}
                  disabled={
                    !selectedTemplate || !selectedProject || generatingReport
                  }
                >
                  {generatingReport ? "Generating..." : "Generate Report"}
                </Button>
              </CardActions>
            </Card>

            {/* Report Templates */}
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Available Report Templates
              </Typography>
              <Grid container spacing={2}>
                {reportTemplates.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        bgcolor:
                          selectedTemplate === template.id
                            ? "action.selected"
                            : "inherit",
                      }}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          {template.icon}
                          <Typography variant="subtitle2" ml={1}>
                            {template.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                        <Chip
                          label={template.type}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Recent Reports Section */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Reports
                </Typography>

                {loadingReports ? (
                  <LoadingSpinner message="Loading reports..." />
                ) : reports.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No reports generated yet.
                  </Typography>
                ) : (
                  <List dense>
                    {reports.map((report, index) => (
                      <React.Fragment key={report.id}>
                        <ListItem
                          secondaryAction={
                            report.status === "ready" ? (
                              <Button
                                size="small"
                                startIcon={<GetApp />}
                                onClick={() => handleDownloadReport(report)}
                              >
                                Download
                              </Button>
                            ) : null
                          }
                        >
                          <ListItemIcon>
                            {getStatusIcon(report.status)}
                          </ListItemIcon>
                          <ListItemText
                            primary={report.name}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {formatDate(report.createdAt)}
                                </Typography>
                                <Chip
                                  label={report.status}
                                  size="small"
                                  color={getStatusColor(report.status) as any}
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < reports.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ReportsPage;
