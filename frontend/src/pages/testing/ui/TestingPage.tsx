import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Fab,
  Badge,
  InputAdornment,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbar,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Assignment as TestPlanIcon,
  CheckBox as TestCaseIcon,
  PlayArrow as ExecuteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as PassedIcon,
  Cancel as FailedIcon,
  Block as BlockedIcon,
  SkipNext as SkippedIcon,
  PlayCircle as NotRunIcon,
  AutoMode as AutomatedIcon,
  PanTool as ManualIcon,
  Assessment as ReportsIcon,
  Timeline as TrendsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import type {
  TestPlan,
  TestCase,
  TestExecution,
} from "@/entities/test-case";
import { projectsApi, testingApi } from "@/shared/api";
import { useAuth } from "@/features/auth";
import { Project } from "@/entities/project";
import { toast } from "@/shared/ui";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`testing-tabpanel-${index}`}
      aria-labelledby={`testing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TestingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Main state
  const [tabValue, setTabValue] = useState(0);

  // Test Plans
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [testPlanLoading, setTestPlanLoading] = useState(true);
  const [testPlanCount, setTestPlanCount] = useState(0);
  const [testPlanPage, setTestPlanPage] = useState(0);
  const [testPlanPageSize, setTestPlanPageSize] = useState(25);

  // Test Cases
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testCaseLoading, setTestCaseLoading] = useState(true);
  const [testCaseCount, setTestCaseCount] = useState(0);
  const [testCasePage, setTestCasePage] = useState(0);
  const [testCasePageSize, setTestCasePageSize] = useState(25);

  // Test Executions
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([]);
  const [testExecutionLoading, setTestExecutionLoading] = useState(true);
  const [testExecutionCount, setTestExecutionCount] = useState(0);
  const [testExecutionPage, setTestExecutionPage] = useState(0);
  const [testExecutionPageSize, setTestExecutionPageSize] = useState(25);

  // Filters
  const [testFilters, setTestFilters] = useState({
    search: "",
    projectId: null,
    testPlanId: null,
    status: [],
    priority: [],
    type: [],
    automationLevel: [],
    assignedTo: null,
    tags: [],
    executionDateRange: { start: null, end: null },
  });

  const [executionFilters, setExecutionFilters] = useState({
    search: "",
    testPlanId: null,
    testCaseId: null,
    status: [],
    executedBy: null,
    environment: [],
    dateRange: { start: null, end: null },
  });

  // Reference data
  const [projects, setProjects] = useState<Project[]>([]);

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: string;
  } | null>(null);
  const [bulkActionsAnchor, setBulkActionsAnchor] =
    useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load data functions
  const loadTestPlans = useCallback(async () => {
    try {
      setTestPlanLoading(true);
      const params = {
        skip: testPlanPage * testPlanPageSize,
        limit: testPlanPageSize,
        project_id: testFilters.projectId || undefined,
        search: testFilters.search || undefined,
      };

      const response = await testingApi.getTestPlans(params);
      setTestPlans(response.items || []);
      setTestPlanCount(response.total || 0);
    } catch (error: any) {
      console.error("Failed to load test plans:", error);
      setTestPlans([]); // Ensure array is never undefined
      setTestPlanCount(0);
      toast.error(error.message || "Failed to load test plans");
    } finally {
      setTestPlanLoading(false);
    }
  }, [testPlanPage, testPlanPageSize, testFilters]);

  const loadTestCases = useCallback(async () => {
    try {
      setTestCaseLoading(true);
      const params = {
        skip: testCasePage * testCasePageSize,
        limit: testCasePageSize,
        test_plan_id: testFilters.testPlanId || undefined,
        priority:
          testFilters.priority.length === 1
            ? testFilters.priority[0]
            : undefined,
        type: testFilters.type.length === 1 ? testFilters.type[0] : undefined,
        status:
          testFilters.status.length === 1 ? testFilters.status[0] : undefined,
        automation_level:
          testFilters.automationLevel.length === 1
            ? testFilters.automationLevel[0]
            : undefined,
        search: testFilters.search || undefined,
      };

      const response = await testingApi.getTestCasesWithPagination(params);
      setTestCases(response.items || []);
      setTestCaseCount(response.total || 0);
    } catch (error: any) {
      console.error("Failed to load test cases:", error);
      setTestCases([]); // Ensure array is never undefined
      setTestCaseCount(0);
      toast.error(error.message || "Failed to load test cases");
    } finally {
      setTestCaseLoading(false);
    }
  }, [testCasePage, testCasePageSize, testFilters]);

  const loadTestExecutions = useCallback(async () => {
    try {
      setTestExecutionLoading(true);
      const params = {
        skip: testExecutionPage * testExecutionPageSize,
        limit: testExecutionPageSize,
        test_plan_id: executionFilters.testPlanId || undefined,
        test_case_id: executionFilters.testCaseId || undefined,
        status:
          executionFilters.status.length === 1
            ? executionFilters.status[0]
            : undefined,
        executed_by: executionFilters.executedBy || undefined,
        environment:
          executionFilters.environment.length === 1
            ? executionFilters.environment[0]
            : undefined,
      };

      const response = await testingApi.getTestExecutions(params);
      setTestExecutions(response.items || []);
      setTestExecutionCount(response.total || 0);
    } catch (error: any) {
      console.error("Failed to load test executions:", error);
      setTestExecutions([]); // Ensure array is never undefined
      setTestExecutionCount(0);
      toast.error(error.message || "Failed to load test executions");
    } finally {
      setTestExecutionLoading(false);
    }
  }, [testExecutionPage, testExecutionPageSize, executionFilters]);

  const loadReferenceData = useCallback(async () => {
    try {
      const projectsRes = await projectsApi.getProjects({ limit: 1000 });
      setProjects(projectsRes.items || []);
    } catch (error: any) {
      toast.error("Failed to load reference data");
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    if (tabValue === 0) loadTestPlans();
    else if (tabValue === 1) loadTestCases();
    else if (tabValue === 2) loadTestExecutions();
  }, [tabValue, loadTestPlans, loadTestCases, loadTestExecutions]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "success";
      case "failed":
        return "error";
      case "blocked":
        return "warning";
      case "skipped":
        return "info";
      case "not_run":
        return "default";
      case "active":
        return "primary";
      case "draft":
        return "default";
      case "completed":
        return "success";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <PassedIcon />;
      case "failed":
        return <FailedIcon />;
      case "blocked":
        return <BlockedIcon />;
      case "skipped":
        return <SkippedIcon />;
      case "not_run":
        return <NotRunIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getAutomationIcon = (level: string) => {
    switch (level) {
      case "automated":
        return <AutomatedIcon />;
      case "semi-automated":
        return <AutomatedIcon />;
      case "manual":
        return <ManualIcon />;
      default:
        return <ManualIcon />;
    }
  };

  // Test Plans columns
  const testPlanColumns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Test Plan",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              v{params.row.version} • {params.row.project?.name}
            </Typography>
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            color={getStatusColor(params.value)}
          />
        ),
      },
      {
        field: "assigned_to_user",
        headerName: "Assigned To",
        width: 150,
        valueGetter: (params) =>
          params.row.assigned_to_user
            ? `${params.row.assigned_to_user.first_name} ${params.row.assigned_to_user.last_name}`
            : "Unassigned",
        renderCell: (params) =>
          params.row.assigned_to_user ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                {params.row.assigned_to_user.first_name[0]}
                {params.row.assigned_to_user.last_name[0]}
              </Avatar>
              <Typography variant="body2" noWrap>
                {params.row.assigned_to_user.first_name}{" "}
                {params.row.assigned_to_user.last_name}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Unassigned
            </Typography>
          ),
      },
      {
        field: "test_cases_count",
        headerName: "Test Cases",
        width: 120,
        valueGetter: (params) => params.row.test_cases?.length || 0,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            <TestCaseIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {params.row.test_cases?.length || 0}
            </Typography>
          </Box>
        ),
      },
      {
        field: "end_date",
        headerName: "Due Date",
        width: 120,
        valueFormatter: (params) =>
          params.value ? format(parseISO(params.value), "MMM dd, yyyy") : "",
        renderCell: (params) => {
          if (!params.value)
            return (
              <Typography variant="body2" color="text.secondary">
                No due date
              </Typography>
            );
          const isOverdue =
            differenceInDays(parseISO(params.value), new Date()) < 0;
          return (
            <Typography
              variant="body2"
              color={isOverdue ? "error" : "text.primary"}
              fontWeight={isOverdue ? 600 : 400}
            >
              {format(parseISO(params.value), "MMM dd, yyyy")}
            </Typography>
          );
        },
      },
      {
        field: "updated_at",
        headerName: "Updated",
        width: 120,
        valueFormatter: (params) =>
          format(parseISO(params.value), "MMM dd, yyyy"),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View"
            onClick={() => navigate(`/testing/plans/${params.id}`)}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => navigate(`/testing/plans/${params.id}/edit`)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              setItemToDelete({ id: params.id as number, type: "plan" });
              setDeleteDialogOpen(true);
            }}
          />,
        ],
      },
    ],
    [navigate]
  );

  // Test Cases columns
  const testCaseColumns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Test Case",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.value}
            </Typography>
            {params.row.test_plan && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.test_plan.name}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: "type",
        headerName: "Type",
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            variant="outlined"
          />
        ),
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 100,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            color={getPriorityColor(params.value)}
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            color={getStatusColor(params.value)}
          />
        ),
      },
      {
        field: "automation_level",
        headerName: "Automation",
        width: 120,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            {getAutomationIcon(params.value)}
            <Typography variant="body2" textTransform="capitalize">
              {params.value.replace("_", " ")}
            </Typography>
          </Box>
        ),
      },
      {
        field: "assigned_to_user",
        headerName: "Assigned To",
        width: 150,
        valueGetter: (params) =>
          params.row.assigned_to_user
            ? `${params.row.assigned_to_user.first_name} ${params.row.assigned_to_user.last_name}`
            : "Unassigned",
        renderCell: (params) =>
          params.row.assigned_to_user ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
                {params.row.assigned_to_user.first_name[0]}
                {params.row.assigned_to_user.last_name[0]}
              </Avatar>
              <Typography variant="body2" noWrap>
                {params.row.assigned_to_user.first_name}{" "}
                {params.row.assigned_to_user.last_name}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Unassigned
            </Typography>
          ),
      },
      {
        field: "last_execution",
        headerName: "Last Execution",
        width: 120,
        valueGetter: (params) => {
          const executions = params.row.executions || [];
          if (executions.length === 0) return "Never";
          const latest = executions.sort(
            (a: any, b: any) =>
              new Date(b.execution_date).getTime() -
              new Date(a.execution_date).getTime()
          )[0];
          return latest.status;
        },
        renderCell: (params) => {
          const executions = params.row.executions || [];
          if (executions.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary">
                Never
              </Typography>
            );
          }
          const latest = executions.sort(
            (a: any, b: any) =>
              new Date(b.execution_date).getTime() -
              new Date(a.execution_date).getTime()
          )[0];
          return (
            <Chip
              size="small"
              label={
                latest.status.charAt(0).toUpperCase() + latest.status.slice(1)
              }
              color={getStatusColor(latest.status)}
              icon={getStatusIcon(latest.status)}
            />
          );
        },
      },
      {
        field: "updated_at",
        headerName: "Updated",
        width: 120,
        valueFormatter: (params) =>
          format(parseISO(params.value), "MMM dd, yyyy"),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View"
            onClick={() => navigate(`/testing/cases/${params.id}`)}
          />,
          <GridActionsCellItem
            icon={<ExecuteIcon />}
            label="Execute"
            onClick={() => navigate(`/testing/cases/${params.id}/execute`)}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => navigate(`/testing/cases/${params.id}/edit`)}
          />,
        ],
      },
    ],
    [navigate]
  );

  // Test Executions columns
  const testExecutionColumns: GridColDef[] = useMemo(
    () => [
      {
        field: "test_case",
        headerName: "Test Case",
        flex: 1,
        minWidth: 200,
        valueGetter: (params) => params.row.test_case?.name || "",
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.row.test_case?.name}
            </Typography>
            {params.row.test_plan && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.test_plan.name}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            color={getStatusColor(params.value)}
            icon={getStatusIcon(params.value)}
          />
        ),
      },
      {
        field: "executed_by_user",
        headerName: "Executed By",
        width: 150,
        valueGetter: (params) =>
          params.row.executed_by_user
            ? `${params.row.executed_by_user.first_name} ${params.row.executed_by_user.last_name}`
            : "",
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: "0.75rem" }}>
              {params.row.executed_by_user.first_name[0]}
              {params.row.executed_by_user.last_name[0]}
            </Avatar>
            <Typography variant="body2" noWrap>
              {params.row.executed_by_user.first_name}{" "}
              {params.row.executed_by_user.last_name}
            </Typography>
          </Box>
        ),
      },
      {
        field: "execution_date",
        headerName: "Execution Date",
        width: 140,
        valueFormatter: (params) =>
          format(parseISO(params.value), "MMM dd, yyyy HH:mm"),
      },
      {
        field: "duration",
        headerName: "Duration",
        width: 100,
        valueFormatter: (params) =>
          params.value ? `${params.value} min` : "N/A",
      },
      {
        field: "environment",
        headerName: "Environment",
        width: 120,
        renderCell: (params) =>
          params.value ? (
            <Chip size="small" label={params.value} variant="outlined" />
          ) : (
            <Typography variant="body2" color="text.secondary">
              N/A
            </Typography>
          ),
      },
      {
        field: "build_version",
        headerName: "Build",
        width: 100,
        renderCell: (params) =>
          params.value ? (
            <Typography variant="body2" fontFamily="monospace">
              {params.value}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              N/A
            </Typography>
          ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 100,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View"
            onClick={() => navigate(`/testing/executions/${params.id}`)}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => navigate(`/testing/executions/${params.id}/edit`)}
          />,
        ],
      },
    ],
    [navigate]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle export functionality
  const handleExport = () => {
    try {
      let data: any[] = [];
      let filename = "";
      let headers: string[] = [];

      if (tabValue === 0) {
        // Export Test Plans
        data = testPlans;
        filename = `test_plans_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        headers = [
          "ID",
          "Name",
          "Description",
          "Project ID",
          "Status",
          "Created By",
          "Created At",
        ];

        const csvContent = [
          headers.join(","),
          ...data.map((plan) =>
            [
              plan.id,
              `"${plan.name.replace(/"/g, '""')}"`,
              `"${(plan.description || "").replace(/"/g, '""')}"`,
              plan.project_id,
              plan.status,
              plan.created_by,
              plan.created_at,
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success(`Exported ${data.length} test plans to CSV`);
        }
      } else if (tabValue === 1) {
        // Export Test Cases
        data = testCases;
        filename = `test_cases_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        headers = [
          "ID",
          "Title",
          "Description",
          "Priority",
          "Status",
          "Test Plan ID",
          "Automation Level",
        ];

        const csvContent = [
          headers.join(","),
          ...data.map((testCase) =>
            [
              testCase.id,
              `"${testCase.title.replace(/"/g, '""')}"`,
              `"${(testCase.description || "").replace(/"/g, '""')}"`,
              testCase.priority,
              testCase.status,
              testCase.test_plan_id,
              testCase.automation_level,
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success(`Exported ${data.length} test cases to CSV`);
        }
      } else {
        // Export Test Executions
        data = testExecutions;
        filename = `test_executions_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        headers = [
          "ID",
          "Test Case ID",
          "Test Plan ID",
          "Status",
          "Executed By",
          "Execution Date",
          "Environment",
        ];

        const csvContent = [
          headers.join(","),
          ...data.map((execution) =>
            [
              execution.id,
              execution.test_case_id,
              execution.test_plan_id,
              execution.status,
              execution.executed_by,
              execution.execution_date,
              execution.environment,
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success(`Exported ${data.length} test executions to CSV`);
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  };

  // Statistics calculations
  const stats = useMemo(() => {
    const totalTestCases = testCases?.length || 0;
    const automatedCases =
      testCases?.filter((tc) => tc.automation_level === "automated").length ||
      0;
    const passedExecutions =
      testExecutions?.filter((te) => te.status === "passed").length || 0;
    const totalExecutions = testExecutions?.length || 0;

    return {
      totalTestPlans: testPlans?.length || 0,
      totalTestCases,
      totalExecutions,
      automationCoverage:
        totalTestCases > 0
          ? Math.round((automatedCases / totalTestCases) * 100)
          : 0,
      passRate:
        totalExecutions > 0
          ? Math.round((passedExecutions / totalExecutions) * 100)
          : 0,
      executionsToday:
        testExecutions?.filter(
          (te) =>
            format(parseISO(te.execution_date.toString()), "yyyy-MM-dd") ===
            format(new Date(), "yyyy-MM-dd")
        ).length || 0,
    };
  }, [testPlans, testCases, testExecutions]);

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Testing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage test plans, cases, and track execution results
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ReportsIcon />}
            onClick={() => navigate("/testing/reports")}
          >
            Reports
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (tabValue === 0) navigate("/testing/plans/create");
              else if (tabValue === 1) navigate("/testing/cases/create");
              else navigate("/testing/execute");
            }}
          >
            {tabValue === 0
              ? "Create Plan"
              : tabValue === 1
              ? "Create Case"
              : "Execute Tests"}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Test Plans
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {stats.totalTestPlans}
                  </Typography>
                </Box>
                <TestPlanIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Test Cases
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {stats.totalTestCases}
                  </Typography>
                </Box>
                <TestCaseIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Executions
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {stats.totalExecutions}
                  </Typography>
                </Box>
                <ExecuteIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Automation
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {stats.automationCoverage}%
                  </Typography>
                </Box>
                <AutomatedIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Pass Rate
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {stats.passRate}%
                  </Typography>
                </Box>
                <PassedIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Today
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {stats.executionsToday}
                  </Typography>
                </Box>
                <TrendsIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="testing tabs"
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <TestPlanIcon />
                Test Plans
                <Badge badgeContent={testPlanCount} color="primary" />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <TestCaseIcon />
                Test Cases
                <Badge badgeContent={testCaseCount} color="primary" />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <ExecuteIcon />
                Executions
                <Badge badgeContent={testExecutionCount} color="primary" />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder={`Search ${
              tabValue === 0
                ? "test plans"
                : tabValue === 1
                ? "test cases"
                : "executions"
            }...`}
            value={tabValue < 2 ? testFilters.search : executionFilters.search}
            onChange={(e) => {
              if (tabValue < 2) {
                setTestFilters((prev) => ({ ...prev, search: e.target.value }));
              } else {
                setExecutionFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }));
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              if (tabValue === 0) loadTestPlans();
              else if (tabValue === 1) loadTestCases();
              else loadTestExecutions();
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={testPlans || []}
            columns={testPlanColumns}
            loading={testPlanLoading}
            pagination
            paginationMode="server"
            rowCount={testPlanCount}
            paginationModel={{ page: testPlanPage, pageSize: testPlanPageSize }}
            onPaginationModelChange={(newModel) => {
              setTestPlanPage(newModel.page);
              setTestPlanPageSize(newModel.pageSize);
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={testCases || []}
            columns={testCaseColumns}
            loading={testCaseLoading}
            pagination
            paginationMode="server"
            rowCount={testCaseCount}
            paginationModel={{ page: testCasePage, pageSize: testCasePageSize }}
            onPaginationModelChange={(newModel) => {
              setTestCasePage(newModel.page);
              setTestCasePageSize(newModel.pageSize);
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={testExecutions || []}
            columns={testExecutionColumns}
            loading={testExecutionLoading}
            pagination
            paginationMode="server"
            rowCount={testExecutionCount}
            paginationModel={{
              page: testExecutionPage,
              pageSize: testExecutionPageSize,
            }}
            onPaginationModelChange={(newModel) => {
              setTestExecutionPage(newModel.page);
              setTestExecutionPageSize(newModel.pageSize);
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />
        </Paper>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete {itemToDelete?.type === "plan" ? "Test Plan" : "Test Case"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this{" "}
            {itemToDelete?.type === "plan" ? "test plan" : "test case"}? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              // TODO: Implement delete functionality
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => {
          if (tabValue === 0) navigate("/testing/plans/create");
          else if (tabValue === 1) navigate("/testing/cases/create");
          else navigate("/testing/execute");
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TestingPage;
