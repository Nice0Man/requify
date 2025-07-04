import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Alert,
  useTheme,
  alpha,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { requirementsApi } from "@/shared/api/index";
import { RequirementWithDetails } from '@/entities/requirement/model/types';
import {
  CommentsApi,
  CommentWithAuthor,
  CommentCreate,
} from "@/shared/api/comments.api";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { LoadingSpinner } from "@/shared/ui/components";

const commentsApi = new CommentsApi();

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

const RequirementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requirement, setRequirement] = useState<RequirementWithDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [selectedComment, setSelectedComment] =
    useState<CommentWithAuthor | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Load requirement data
  const loadRequirement = async () => {
    if (!id) {
      setError("No requirement ID provided");
      setLoading(false);
      return;
    }

    // Validate that id is a valid number
    const requirementId = parseInt(id, 10);
    if (isNaN(requirementId) || requirementId <= 0) {
      setError(
        `Invalid requirement ID: "${id}". Please check the URL and try again.`
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await requirementsApi.getRequirement(requirementId);
      setRequirement(response.data);
    } catch (err: any) {
      console.error("Failed to load requirement:", err);

      // Properly extract error message from API response
      let errorMessage = "Failed to load requirement details";

      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(", ");
        } else {
          errorMessage = String(err.response.data.message);
        }
      } else if (err?.message) {
        errorMessage = String(err.message);
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load comments for the requirement
  const loadComments = async () => {
    if (!id) return;

    const requirementId = parseInt(id);
    if (isNaN(requirementId)) return;

    try {
      setCommentsLoading(true);
      const response = await commentsApi.getRequirementComments(requirementId);
      setComments(response.data || []);
    } catch (err: any) {
      console.error("Failed to load comments:", err);
      setSnackbarMessage("Failed to load comments");
      setSnackbarOpen(true);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Create new comment
  const handleAddComment = async () => {
    if (!newCommentContent.trim() || !id) return;

    const requirementId = parseInt(id);
    if (isNaN(requirementId)) return;

    try {
      const commentData: CommentCreate = {
        content: newCommentContent.trim(),
      };

      await commentsApi.createRequirementComment(requirementId, commentData);
      setNewCommentContent("");
      setSnackbarMessage("Comment added successfully");
      setSnackbarOpen(true);
      loadComments(); // Reload comments
    } catch (err: any) {
      console.error("Failed to create comment:", err);
      setSnackbarMessage("Failed to add comment");
      setSnackbarOpen(true);
    }
  };

  // Edit comment
  const handleEditComment = (comment: CommentWithAuthor) => {
    setSelectedComment(comment);
    setCommentContent(comment.content);
    setCommentDialogOpen(true);
  };

  // Update comment
  const handleUpdateComment = async () => {
    if (!selectedComment || !commentContent.trim() || !id) return;

    const requirementId = parseInt(id);
    if (isNaN(requirementId)) return;

    try {
      const updateData = {
        content: commentContent.trim(),
      };

      await commentsApi.updateRequirementComment(
        requirementId,
        selectedComment.id,
        updateData
      );
      setCommentDialogOpen(false);
      setCommentContent("");
      setSelectedComment(null);
      setSnackbarMessage("Comment updated successfully");
      setSnackbarOpen(true);
      loadComments(); // Reload comments
    } catch (err: any) {
      console.error("Failed to update comment:", err);
      setSnackbarMessage("Failed to update comment");
      setSnackbarOpen(true);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!id) return;

    const requirementId = parseInt(id);
    if (isNaN(requirementId)) return;

    try {
      await commentsApi.deleteRequirementComment(requirementId, commentId);
      setSnackbarMessage("Comment deleted successfully");
      setSnackbarOpen(true);
      loadComments(); // Reload comments
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      setSnackbarMessage("Failed to delete comment");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    loadRequirement();
    loadComments();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "default";
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

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "default";
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (error || !requirement) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ||
            "Requirement not found. Please check the requirement ID and try again."}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/requirements")}
        >
          Back to Requirements
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton
            onClick={() => navigate("/requirements")}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {requirement.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {requirement.project_name} • REQ-{requirement.id}
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<Share />} size="small">
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              size="small"
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              size="small"
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="requirement details tabs"
                sx={{ px: 3 }}
              >
                <Tab label="Details" />
                <Tab label="Comments" />
                <Tab label="History" />
                <Tab label="Tests" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  {requirement.description || "No description provided."}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Additional Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deadline:{" "}
                  {requirement.deadline
                    ? new Date(requirement.deadline).toLocaleDateString()
                    : "Not set"}
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Comments ({comments.length})
                </Typography>

                {/* Add new comment form */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a comment..."
                    variant="outlined"
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleAddComment}
                    disabled={!newCommentContent.trim()}
                  >
                    Add Comment
                  </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Comments list */}
                {commentsLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <LoadingSpinner />
                  </Box>
                ) : comments.length > 0 ? (
                  <Box>
                    {comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    py={4}
                  >
                    No comments yet. Be the first to comment!
                  </Typography>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  History
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  History will be loaded from the API.
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Test Cases
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Test cases will be loaded from the API.
                </Typography>
              </Box>
            </TabPanel>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 2px 12px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              mb: 3,
            }}
          >
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <AssignmentIcon color="primary" fontSize="small" />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Details
                  </Typography>
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Status
                </Typography>
                <Chip
                  label={requirement.status_name || "Unknown"}
                  color={getStatusColor(requirement.status_name) as any}
                  size="medium"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Priority
                </Typography>
                <Chip
                  label={requirement.priority_name || "Unknown"}
                  color={getPriorityColor(requirement.priority_name) as any}
                  size="medium"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Type
                </Typography>
                <Typography variant="body1">
                  {requirement.type_name || "Unknown"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Created By
                </Typography>
                <Typography variant="body2">
                  {requirement.author_name || "Unknown"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Last Modified By
                </Typography>
                <Typography variant="body2">
                  {requirement.last_modifier_name || "Unknown"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(requirement.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {new Date(requirement.updated_at).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Release and Spec info if available */}
          {(requirement.release_version || requirement.spec_name) && (
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: `0 2px 12px ${alpha(
                  theme.palette.common.black,
                  0.08
                )}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <CardHeader
                title={
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Project Information
                  </Typography>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                {requirement.release_version && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Release
                    </Typography>
                    <Typography variant="body2">
                      {requirement.release_version}
                    </Typography>
                  </Box>
                )}
                {requirement.spec_name && (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Specification
                    </Typography>
                    <Typography variant="body2">
                      {requirement.spec_name}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Edit Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter your comment..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateComment} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

interface CommentItemProps {
  comment: CommentWithAuthor;
  onEdit: (comment: CommentWithAuthor) => void;
  onDelete: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onEdit,
  onDelete,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" fontWeight="600">
              {comment.author_name || `User #${comment.author_id}`}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ru,
                })}
              </Typography>
              <IconButton size="small" onClick={() => onEdit(comment)}>
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(comment.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {comment.content}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RequirementDetailsPage;
