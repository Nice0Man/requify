import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Button,
  Alert,
  AlertTitle,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ExpandMore,
  Api,
  Security,
  AccountCircle,
  FolderOpen,
  Assignment,
  RocketLaunch,
  BugReport,
  AdminPanelSettings,
  LibraryBooks,
  AccountTree,
  Comment,
  Http,
  LockOpen,
  Key,
  Code,
  ContentCopy,
  Launch,
  Dashboard,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/context/auth.context";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ApiOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openTokenDialog, setOpenTokenDialog] = useState(false);
  const [testToken, setTestToken] = useState("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // API Endpoint Categories based on OpenAPI spec
  const apiCategories = [
    {
      name: "Authentication",
      icon: <Security color="primary" />,
      baseUrl: "/api/v1/auth",
      description: "OAuth2 authentication with access and refresh tokens",
      endpoints: [
        {
          method: "POST",
          path: "/register",
          description: "Register new user",
          scopes: [],
        },
        {
          method: "POST",
          path: "/login",
          description: "Login for access token",
          scopes: [],
        },
        {
          method: "POST",
          path: "/refresh",
          description: "Refresh access token",
          scopes: [],
        },
        {
          method: "POST",
          path: "/logout",
          description: "Logout and revoke tokens",
          scopes: ["me"],
        },
        {
          method: "POST",
          path: "/validate-token",
          description: "Validate access token",
          scopes: [],
        },
        {
          method: "POST",
          path: "/change-password",
          description: "Change user password",
          scopes: ["me"],
        },
        {
          method: "POST",
          path: "/reset-password",
          description: "Request password reset",
          scopes: [],
        },
        {
          method: "POST",
          path: "/reset-password/confirm",
          description: "Confirm password reset",
          scopes: [],
        },
        {
          method: "GET",
          path: "/sessions",
          description: "Get user sessions",
          scopes: ["me"],
        },
        {
          method: "POST",
          path: "/sessions/revoke",
          description: "Revoke user sessions",
          scopes: ["me"],
        },
      ],
    },
    {
      name: "Users",
      icon: <AccountCircle color="success" />,
      baseUrl: "/api/v1/users",
      description: "User management and profile operations",
      endpoints: [
        {
          method: "GET",
          path: "/",
          description: "List users",
          scopes: ["users:read"],
        },
        {
          method: "GET",
          path: "/me",
          description: "Get current user profile",
          scopes: ["me"],
        },
        {
          method: "PUT",
          path: "/me",
          description: "Update current user profile",
          scopes: ["me"],
        },
        {
          method: "GET",
          path: "/{user_id}",
          description: "Get user by ID",
          scopes: ["users:read"],
        },
        {
          method: "PUT",
          path: "/{user_id}",
          description: "Update user",
          scopes: ["users:write"],
        },
        {
          method: "DELETE",
          path: "/{user_id}",
          description: "Delete user",
          scopes: ["users:delete"],
        },
        {
          method: "POST",
          path: "/{user_id}/activate",
          description: "Activate user",
          scopes: ["users:write"],
        },
        {
          method: "POST",
          path: "/{user_id}/deactivate",
          description: "Deactivate user",
          scopes: ["users:write"],
        },
      ],
    },
    {
      name: "Projects",
      icon: <FolderOpen color="info" />,
      baseUrl: "/api/v1/projects",
      description: "Project management and team collaboration",
      endpoints: [
        {
          method: "GET",
          path: "/",
          description: "List projects",
          scopes: ["projects:read"],
        },
        {
          method: "POST",
          path: "/",
          description: "Create project",
          scopes: ["projects:write"],
        },
        {
          method: "GET",
          path: "/{project_id}",
          description: "Get project details",
          scopes: ["projects:read"],
        },
        {
          method: "PUT",
          path: "/{project_id}",
          description: "Update project",
          scopes: ["projects:write"],
        },
        {
          method: "DELETE",
          path: "/{project_id}",
          description: "Delete project",
          scopes: ["projects:delete"],
        },
        {
          method: "GET",
          path: "/{project_id}/requirements",
          description: "Get project requirements",
          scopes: ["projects:read", "requirements:read"],
        },
        {
          method: "GET",
          path: "/{project_id}/releases",
          description: "Get project releases",
          scopes: ["projects:read", "releases:read"],
        },
        {
          method: "GET",
          path: "/{project_id}/stats",
          description: "Get project statistics",
          scopes: ["projects:read"],
        },
      ],
    },
    {
      name: "Requirements",
      icon: <Assignment color="warning" />,
      baseUrl: "/api/v1/requirements",
      description: "Requirements management and tracking",
      endpoints: [
        {
          method: "GET",
          path: "/search",
          description: "Search requirements",
          scopes: ["requirements:read"],
        },
        {
          method: "GET",
          path: "/",
          description: "List requirements",
          scopes: ["requirements:read"],
        },
        {
          method: "POST",
          path: "/",
          description: "Create requirement",
          scopes: ["requirements:write"],
        },
        {
          method: "GET",
          path: "/{requirement_id}",
          description: "Get requirement details",
          scopes: ["requirements:read"],
        },
        {
          method: "PUT",
          path: "/{requirement_id}",
          description: "Update requirement",
          scopes: ["requirements:write"],
        },
        {
          method: "DELETE",
          path: "/{requirement_id}",
          description: "Delete requirement",
          scopes: ["requirements:delete"],
        },
        {
          method: "POST",
          path: "/{requirement_id}/change-status",
          description: "Change requirement status",
          scopes: ["requirements:write"],
        },
        {
          method: "GET",
          path: "/{requirement_id}/tests",
          description: "Get requirement tests",
          scopes: ["requirements:read", "testing:read"],
        },
        {
          method: "GET",
          path: "/{requirement_id}/relationships",
          description: "Get requirement relationships",
          scopes: ["requirements:read"],
        },
      ],
    },
    {
      name: "Releases",
      icon: <RocketLaunch color="error" />,
      baseUrl: "/api/v1/releases",
      description: "Release management and deployment tracking",
      endpoints: [
        {
          method: "GET",
          path: "/",
          description: "List releases",
          scopes: ["releases:read"],
        },
        {
          method: "POST",
          path: "/",
          description: "Create release",
          scopes: ["releases:write"],
        },
        {
          method: "GET",
          path: "/{release_id}",
          description: "Get release details",
          scopes: ["releases:read"],
        },
        {
          method: "PUT",
          path: "/{release_id}",
          description: "Update release",
          scopes: ["releases:write"],
        },
        {
          method: "DELETE",
          path: "/{release_id}",
          description: "Delete release",
          scopes: ["releases:delete"],
        },
        {
          method: "POST",
          path: "/create-from-requirements",
          description: "Create release from requirements",
          scopes: ["releases:write"],
        },
        {
          method: "POST",
          path: "/{release_id}/generate-specification",
          description: "Generate release specification",
          scopes: ["releases:read"],
        },
        {
          method: "POST",
          path: "/{release_id}/publish",
          description: "Publish release",
          scopes: ["releases:write"],
        },
        {
          method: "GET",
          path: "/{release_id}/requirements",
          description: "Get release requirements",
          scopes: ["releases:read"],
        },
        {
          method: "GET",
          path: "/{release_id}/changelog",
          description: "Get release changelog",
          scopes: ["releases:read"],
        },
      ],
    },
    {
      name: "Testing",
      icon: <BugReport color="secondary" />,
      baseUrl: "/api/v1/testing",
      description: "Test management and execution",
      endpoints: [
        {
          method: "GET",
          path: "/results",
          description: "Get test results",
          scopes: ["testing:read"],
        },
        {
          method: "POST",
          path: "/results",
          description: "Create test result",
          scopes: ["testing:write"],
        },
        {
          method: "GET",
          path: "/plans",
          description: "List test plans",
          scopes: ["testing:read"],
        },
        {
          method: "POST",
          path: "/plans",
          description: "Create test plan",
          scopes: ["testing:write"],
        },
        {
          method: "GET",
          path: "/plans/{plan_id}",
          description: "Get test plan details",
          scopes: ["testing:read"],
        },
        {
          method: "GET",
          path: "/cases",
          description: "List test cases",
          scopes: ["testing:read"],
        },
        {
          method: "POST",
          path: "/cases",
          description: "Create test case",
          scopes: ["testing:write"],
        },
        {
          method: "GET",
          path: "/executions",
          description: "List test executions",
          scopes: ["testing:read"],
        },
        {
          method: "POST",
          path: "/executions",
          description: "Execute tests",
          scopes: ["testing:execute"],
        },
        {
          method: "GET",
          path: "/reports/summary",
          description: "Get test summary report",
          scopes: ["testing:read"],
        },
        {
          method: "POST",
          path: "/integration/run",
          description: "Run integration tests",
          scopes: ["testing:execute"],
        },
        {
          method: "GET",
          path: "/integration/status/{job_id}",
          description: "Get integration test status",
          scopes: ["testing:read"],
        },
      ],
    },
    {
      name: "Administration",
      icon: <AdminPanelSettings color="error" />,
      baseUrl: "/api/v1/admin",
      description: "System administration and monitoring",
      endpoints: [
        {
          method: "GET",
          path: "/users",
          description: "Admin user management",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/system-info",
          description: "Get system information",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/health",
          description: "Health check",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/metrics",
          description: "System metrics",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/logs",
          description: "System logs",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/users-stats",
          description: "User statistics",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/projects-stats",
          description: "Project statistics",
          scopes: ["admin:read"],
        },
        {
          method: "POST",
          path: "/backup",
          description: "Create system backup",
          scopes: ["system:admin"],
        },
        {
          method: "GET",
          path: "/backups",
          description: "List backups",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/system-settings",
          description: "Get system settings",
          scopes: ["admin:read"],
        },
        {
          method: "GET",
          path: "/audit-log",
          description: "Get audit log",
          scopes: ["admin:read"],
        },
      ],
    },
    {
      name: "Reference Data",
      icon: <LibraryBooks color="primary" />,
      baseUrl: "/api/v1/reference",
      description: "Reference data and lookup values",
      endpoints: [
        {
          method: "GET",
          path: "/requirement-types",
          description: "Get requirement types",
          scopes: [],
        },
        {
          method: "POST",
          path: "/requirement-types",
          description: "Create requirement type",
          scopes: ["admin:write"],
        },
        {
          method: "GET",
          path: "/requirement-priorities",
          description: "Get requirement priorities",
          scopes: [],
        },
        {
          method: "POST",
          path: "/requirement-priorities",
          description: "Create requirement priority",
          scopes: ["admin:write"],
        },
        {
          method: "GET",
          path: "/requirement-statuses",
          description: "Get requirement statuses",
          scopes: [],
        },
        {
          method: "POST",
          path: "/requirement-statuses",
          description: "Create requirement status",
          scopes: ["admin:write"],
        },
        {
          method: "GET",
          path: "/relationship-types",
          description: "Get relationship types",
          scopes: [],
        },
        {
          method: "POST",
          path: "/relationship-types",
          description: "Create relationship type",
          scopes: ["admin:write"],
        },
      ],
    },
    {
      name: "Specifications",
      icon: <LibraryBooks color="success" />,
      baseUrl: "/api/v1/specifications",
      description: "Document specifications and generation",
      endpoints: [
        {
          method: "GET",
          path: "/",
          description: "List specifications",
          scopes: ["requirements:read"],
        },
        {
          method: "POST",
          path: "/",
          description: "Create specification",
          scopes: ["requirements:write"],
        },
        {
          method: "GET",
          path: "/{spec_id}",
          description: "Get specification details",
          scopes: ["requirements:read"],
        },
        {
          method: "PUT",
          path: "/{spec_id}",
          description: "Update specification",
          scopes: ["requirements:write"],
        },
        {
          method: "DELETE",
          path: "/{spec_id}",
          description: "Delete specification",
          scopes: ["requirements:delete"],
        },
        {
          method: "GET",
          path: "/{spec_id}/requirements",
          description: "Get specification requirements",
          scopes: ["requirements:read"],
        },
        {
          method: "POST",
          path: "/{spec_id}/generate-document",
          description: "Generate specification document",
          scopes: ["requirements:read"],
        },
      ],
    },
    {
      name: "Relationships",
      icon: <AccountTree color="info" />,
      baseUrl: "/api/v1/relationships",
      description: "Requirement relationships and traceability",
      endpoints: [
        {
          method: "GET",
          path: "/",
          description: "List relationships",
          scopes: ["requirements:read"],
        },
        {
          method: "POST",
          path: "/",
          description: "Create relationship",
          scopes: ["requirements:write"],
        },
        {
          method: "GET",
          path: "/{relationship_id}",
          description: "Get relationship details",
          scopes: ["requirements:read"],
        },
        {
          method: "PUT",
          path: "/{relationship_id}",
          description: "Update relationship",
          scopes: ["requirements:write"],
        },
        {
          method: "DELETE",
          path: "/{relationship_id}",
          description: "Delete relationship",
          scopes: ["requirements:delete"],
        },
        {
          method: "GET",
          path: "/requirements/{requirement_id}/relationships",
          description: "Get requirement relationships",
          scopes: ["requirements:read"],
        },
        {
          method: "GET",
          path: "/requirements/{requirement_id}/dependencies",
          description: "Get requirement dependencies",
          scopes: ["requirements:read"],
        },
        {
          method: "GET",
          path: "/requirements/{requirement_id}/dependents",
          description: "Get requirement dependents",
          scopes: ["requirements:read"],
        },
        {
          method: "GET",
          path: "/requirements/{requirement_id}/trace-matrix",
          description: "Get traceability matrix",
          scopes: ["requirements:read"],
        },
      ],
    },
    {
      name: "Comments",
      icon: <Comment color="secondary" />,
      baseUrl: "/api/v1/comments",
      description: "Comments and collaboration features",
      endpoints: [
        {
          method: "GET",
          path: "/",
          description: "List comments",
          scopes: ["requirements:read"],
        },
        {
          method: "POST",
          path: "/",
          description: "Create comment",
          scopes: ["requirements:write"],
        },
        {
          method: "GET",
          path: "/{comment_id}",
          description: "Get comment details",
          scopes: ["requirements:read"],
        },
        {
          method: "PUT",
          path: "/{comment_id}",
          description: "Update comment",
          scopes: ["requirements:write"],
        },
        {
          method: "DELETE",
          path: "/{comment_id}",
          description: "Delete comment",
          scopes: ["requirements:delete"],
        },
        {
          method: "GET",
          path: "/requirements/{requirement_id}/comments",
          description: "Get requirement comments",
          scopes: ["requirements:read"],
        },
        {
          method: "GET",
          path: "/recent",
          description: "Get recent comments",
          scopes: ["requirements:read"],
        },
        {
          method: "GET",
          path: "/statistics",
          description: "Get comment statistics",
          scopes: ["requirements:read"],
        },
      ],
    },
  ];

  // OAuth2 Scopes
  const oauth2Scopes = [
    { scope: "me", description: "Read information about the current user" },
    { scope: "users:read", description: "Read users information" },
    { scope: "users:write", description: "Create and update users" },
    { scope: "users:delete", description: "Delete users" },
    { scope: "projects:read", description: "Read projects information" },
    { scope: "projects:write", description: "Create and update projects" },
    { scope: "projects:delete", description: "Delete projects" },
    {
      scope: "requirements:read",
      description: "Read requirements information",
    },
    {
      scope: "requirements:write",
      description: "Create and update requirements",
    },
    { scope: "requirements:delete", description: "Delete requirements" },
    { scope: "releases:read", description: "Read releases information" },
    { scope: "releases:write", description: "Create and update releases" },
    { scope: "releases:delete", description: "Delete releases" },
    { scope: "testing:read", description: "Read testing information" },
    { scope: "testing:write", description: "Create and update tests" },
    { scope: "testing:execute", description: "Execute tests" },
    { scope: "admin:read", description: "Read admin information" },
    { scope: "admin:write", description: "Admin write operations" },
    { scope: "system:admin", description: "System administration operations" },
  ];

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "get":
        return "success";
      case "post":
        return "primary";
      case "put":
        return "warning";
      case "delete":
        return "error";
      default:
        return "default";
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const authExample = `// OAuth2 Authentication Example
const authResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    username: 'your_username',
    password: 'your_password',
    grant_type: 'password'
  })
});

const tokens = await authResponse.json();
// tokens.access_token - Use for API requests
// tokens.refresh_token - Use to refresh access token

// Making authenticated API requests
const apiResponse = await fetch('/api/v1/projects/', {
  headers: {
    'Authorization': \`Bearer \${tokens.access_token}\`
  }
});`;

  const curlExample = `# Login to get tokens
curl -X POST "http://localhost/api/v1/auth/login" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=your_username&password=your_password&grant_type=password"

# Use access token for API requests
curl -X GET "http://localhost/api/v1/projects/" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Refresh token when expired
curl -X POST "http://localhost/api/v1/auth/refresh" \\
  -H "Content-Type: application/json" \\
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'`;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
      {/* Simple Header for Public Access */}
      <Box
        sx={{
          backgroundColor: "white",
          borderBottom: 1,
          borderColor: "divider",
          mb: 4,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Requify
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              variant="text"
              onClick={() => (window.location.href = "/start")}
              startIcon={<Launch />}
            >
              Home
            </Button>
            {user ? (
              <>
                <Button
                  variant="text"
                  onClick={() => (window.location.href = "/dashboard")}
                  startIcon={<Dashboard />}
                >
                  Dashboard
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Welcome, {user.username}
                </Typography>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => (window.location.href = "/login")}
                startIcon={<Security />}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, pb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            <Api sx={{ mr: 2, verticalAlign: "bottom" }} />
            Requify API Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive API documentation and integration guide for the
            Requify requirements management system.
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  color="primary.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {apiCategories.reduce(
                    (total, cat) => total + cat.endpoints.length,
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Endpoints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  color="success.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {oauth2Scopes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  OAuth2 Scopes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  color="info.main"
                  sx={{ fontWeight: "bold" }}
                >
                  {apiCategories.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  API Categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  color="warning.main"
                  sx={{ fontWeight: "bold" }}
                >
                  2
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Token Types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* API Documentation Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="API documentation tabs"
            >
              <Tab icon={<Api />} label="Endpoints" />
              <Tab icon={<Security />} label="Authentication" />
              <Tab icon={<Code />} label="Examples" />
              <Tab icon={<Launch />} label="Testing" />
            </Tabs>
          </Box>

          {/* Endpoints Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              API Endpoints by Category
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              All endpoints are available at:{" "}
              <code>http://localhost/api/v1</code>
            </Typography>

            {apiCategories.map((category, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {category.icon}
                    <Box>
                      <Typography variant="h6">{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                    <Badge
                      badgeContent={category.endpoints.length}
                      color="primary"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {category.endpoints.map((endpoint, idx) => (
                      <ListItem key={idx} sx={{ py: 1 }}>
                        <ListItemIcon>
                          <Chip
                            label={endpoint.method}
                            size="small"
                            color={getMethodColor(endpoint.method)}
                            sx={{ minWidth: 60, fontWeight: "bold" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <code>
                                {category.baseUrl}
                                {endpoint.path}
                              </code>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleCopyToClipboard(
                                    `${category.baseUrl}${endpoint.path}`
                                  )
                                }
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2">
                                {endpoint.description}
                              </Typography>
                              {endpoint.scopes.length > 0 && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {endpoint.scopes.map((scope) => (
                                    <Chip
                                      key={scope}
                                      label={scope}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          {/* Authentication Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              OAuth2 Authentication with 2 Tokens
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>OAuth2 Password Flow</AlertTitle>
              Requify uses OAuth2 Password flow with access and refresh tokens
              for secure API access.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="Token Information"
                    avatar={<Key color="primary" />}
                  />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <LockOpen color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Access Token"
                          secondary="Short-lived token for API requests (expires in 30 minutes)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Security color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Refresh Token"
                          secondary="Long-lived token to refresh access tokens (expires in 30 days)"
                        />
                      </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      Token URL
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <code>POST /api/v1/auth/login</code>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleCopyToClipboard("POST /api/v1/auth/login")
                        }
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>
                      Current User Info
                    </Typography>
                    {user ? (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Username:</strong> {user.username}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Role:</strong> {user.role}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {user.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "warning.light",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="warning.dark">
                          <strong>Not logged in</strong> - Sign in to view your
                          user information and access protected endpoints
                        </Typography>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => (window.location.href = "/login")}
                          sx={{ mt: 1, p: 0 }}
                        >
                          Sign In
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="OAuth2 Scopes"
                    avatar={<AdminPanelSettings color="secondary" />}
                  />
                  <CardContent>
                    <List dense>
                      {oauth2Scopes.map((scopeInfo) => (
                        <ListItem key={scopeInfo.scope}>
                          <ListItemText
                            primary={<code>{scopeInfo.scope}</code>}
                            secondary={scopeInfo.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Examples Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Integration Examples
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title="JavaScript/TypeScript"
                    avatar={<Code color="primary" />}
                    action={
                      <IconButton
                        onClick={() => handleCopyToClipboard(authExample)}
                      >
                        <ContentCopy />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: "grey.900",
                        color: "common.white",
                        fontFamily: "monospace",
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                        {authExample}
                      </pre>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title="cURL Examples"
                    avatar={<Http color="secondary" />}
                    action={
                      <IconButton
                        onClick={() => handleCopyToClipboard(curlExample)}
                      >
                        <ContentCopy />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: "grey.900",
                        color: "common.white",
                        fontFamily: "monospace",
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                        {curlExample}
                      </pre>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Testing Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              API Testing Tools
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="OpenAPI Specification"
                    avatar={<Api color="primary" />}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Access the full OpenAPI specification for automatic tool
                      integration.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Launch />}
                      href="http://localhost/openapi.json"
                      target="_blank"
                      fullWidth
                    >
                      View OpenAPI JSON
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="Interactive Documentation"
                    avatar={<LibraryBooks color="success" />}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Access Swagger UI for interactive API testing and
                      exploration.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Launch />}
                      href="http://localhost/docs"
                      target="_blank"
                      fullWidth
                    >
                      Open Swagger UI
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title="Test Your Token"
                    avatar={<Security color="warning" />}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Test if your access token is valid and view token
                      information.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Key />}
                      onClick={() => setOpenTokenDialog(true)}
                    >
                      Test Token
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* Token Testing Dialog */}
        <Dialog
          open={openTokenDialog}
          onClose={() => setOpenTokenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Test Access Token</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter an access token to validate it against the API.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Access Token"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Paste your access token here..."
              sx={{ mb: 2 }}
            />
            <Alert severity="info">
              You can get an access token by logging in through the
              /api/v1/auth/login endpoint.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTokenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                // Here you would implement token validation
                console.log("Testing token:", testToken);
              }}
              disabled={!testToken.trim()}
            >
              Validate Token
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ApiOverviewPage;
