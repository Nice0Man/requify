import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Delete,
  Link as LinkIcon,
  BugReport,
  History,
  Comment,
  Share,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`requirement-tabpanel-${index}`}
      aria-labelledby={`requirement-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Mock data for demonstration
const mockRequirement = {
  id: 1,
  title: "User Authentication System",
  description:
    "The system shall provide secure user authentication using email/username and password credentials. It should include password complexity requirements, account lockout after failed attempts, and session management.",
  status: "In Progress",
  priority: "High",
  type: "Functional",
  project: {
    id: 1,
    name: "Requify Core System",
    code: "REQ-CORE",
  },
  assignee: {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@company.com",
  },
  reporter: {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@company.com",
  },
  created_at: "2024-03-10T00:00:00Z",
  updated_at: "2024-03-15T00:00:00Z",
  acceptance_criteria: [
    "User can log in with valid email/username and password",
    "User account is locked after 5 failed login attempts",
    "Password must meet complexity requirements (8+ chars, special chars)",
    "User session expires after 30 minutes of inactivity",
    "User can reset password via email verification",
  ],
  related_requirements: [
    { id: 2, title: "Password Reset Functionality", type: "depends_on" },
    { id: 3, title: "User Profile Management", type: "relates_to" },
    { id: 4, title: "Session Management", type: "blocks" },
  ],
  test_cases: [
    {
      id: 1,
      title: "Valid Login Test",
      status: "Passed",
      last_run: "2024-03-14",
    },
    {
      id: 2,
      title: "Invalid Password Test",
      status: "Passed",
      last_run: "2024-03-14",
    },
    {
      id: 3,
      title: "Account Lockout Test",
      status: "Failed",
      last_run: "2024-03-13",
    },
    { id: 4, title: "Session Timeout Test", status: "Pending", last_run: null },
  ],
  comments: [
    {
      id: 1,
      author: "Jane Smith",
      content:
        "Updated the password complexity requirements based on security review.",
      created_at: "2024-03-15T10:30:00Z",
    },
    {
      id: 2,
      author: "Mike Johnson",
      content:
        "Account lockout test is failing due to timing issue in the test script.",
      created_at: "2024-03-13T14:20:00Z",
    },
  ],
  history: [
    {
      id: 1,
      action: "Status changed",
      details: "From 'New' to 'In Progress'",
      user: "Jane Smith",
      date: "2024-03-12",
    },
    {
      id: 2,
      action: "Assignee changed",
      details: "Assigned to Jane Smith",
      user: "John Doe",
      date: "2024-03-11",
    },
    {
      id: 3,
      action: "Requirement created",
      details: "Initial creation",
      user: "John Doe",
      date: "2024-03-10",
    },
  ],
};

const RequirementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requirement, setRequirement] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchRequirement = async () => {
      setLoading(true);
      // In real app: const response = await requirementsApi.getRequirement(id);
      setTimeout(() => {
        setRequirement(mockRequirement);
        setLoading(false);
      }, 1000);
    };

    fetchRequirement();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "default";
      case "in progress":
        return "warning";
      case "completed":
        return "success";
      case "blocked":
        return "error";
      case "on hold":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getTestStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "passed":
        return "success";
      case "failed":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!requirement) {
    return (
      <Alert severity="error">
        Requirement not found. Please check the requirement ID and try again.
      </Alert>
    );
  }

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
          <Typography variant="h4" gutterBottom>
            {requirement.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              REQ-{requirement.id} • {requirement.project.name}
            </Typography>
            <Chip
              label={requirement.status}
              color={getStatusColor(requirement.status)}
              size="small"
            />
            <Chip
              label={requirement.priority}
              color={getPriorityColor(requirement.priority)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{ mr: 1 }}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit
          </Button>
          <IconButton color="error">
            <Delete />
          </IconButton>
          <IconButton>
            <Share />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {requirement.description}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Acceptance Criteria
              </Typography>
              <List dense>
                {requirement.acceptance_criteria.map(
                  (criteria: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${index + 1}. ${criteria}`} />
                    </ListItem>
                  )
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">{requirement.type}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Assignee
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                      {requirement.assignee.first_name[0]}
                      {requirement.assignee.last_name[0]}
                    </Avatar>
                    <Typography variant="body1">
                      {requirement.assignee.first_name}{" "}
                      {requirement.assignee.last_name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Reporter
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                      {requirement.reporter.first_name[0]}
                      {requirement.reporter.last_name[0]}
                    </Avatar>
                    <Typography variant="body1">
                      {requirement.reporter.first_name}{" "}
                      {requirement.reporter.last_name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(requirement.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(requirement.updated_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Related" icon={<LinkIcon />} />
            <Tab label="Tests" icon={<BugReport />} />
            <Tab label="Comments" icon={<Comment />} />
            <Tab label="History" icon={<History />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Related Requirements
          </Typography>
          <List>
            {requirement.related_requirements.map((related: any) => (
              <ListItem key={related.id}>
                <ListItemText
                  primary={related.title}
                  secondary={`REQ-${related.id}`}
                />
                <Chip label={related.type} size="small" variant="outlined" />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Test Cases
          </Typography>
          <List>
            {requirement.test_cases.map((test: any) => (
              <ListItem key={test.id}>
                <ListItemText
                  primary={test.title}
                  secondary={
                    test.last_run ? `Last run: ${test.last_run}` : "Never run"
                  }
                />
                <Chip
                  label={test.status}
                  color={getTestStatusColor(test.status)}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          <List>
            {requirement.comments.map((comment: any) => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemText
                  primary={comment.content}
                  secondary={`${comment.author} • ${new Date(
                    comment.created_at
                  ).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Change History
          </Typography>
          <List>
            {requirement.history.map((entry: any) => (
              <ListItem key={entry.id}>
                <ListItemText
                  primary={entry.action}
                  secondary={`${entry.details} • ${entry.user} • ${entry.date}`}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Requirement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              defaultValue={requirement.title}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              defaultValue={requirement.description}
              multiline
              rows={4}
              margin="normal"
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select defaultValue={requirement.status} label="Status">
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Blocked">Blocked</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select defaultValue={requirement.priority} label="Priority">
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setEditDialogOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequirementDetailsPage;
