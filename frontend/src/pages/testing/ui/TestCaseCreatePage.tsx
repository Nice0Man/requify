import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { testingApi } from "@/shared/api";
import { toast } from "@/shared/ui";

const TestCaseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium",
    type: "functional",
    preconditions: "",
    steps: "",
    expected_result: "",
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement test case creation API call
      console.log("Creating test case:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate("/testing");
    } catch (error) {
      console.error("Failed to create test case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/testing");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleCancel}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Create Test Case
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Test Case Name"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={handleInputChange("description")}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Priority"
                    value={formData.priority}
                    onChange={handleInputChange("priority")}
                    select
                    fullWidth
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Type"
                    value={formData.type}
                    onChange={handleInputChange("type")}
                    select
                    fullWidth
                  >
                    <MenuItem value="functional">Functional</MenuItem>
                    <MenuItem value="performance">Performance</MenuItem>
                    <MenuItem value="security">Security</MenuItem>
                    <MenuItem value="usability">Usability</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Preconditions"
                    value={formData.preconditions}
                    onChange={handleInputChange("preconditions")}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Test Steps"
                    value={formData.steps}
                    onChange={handleInputChange("steps")}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Expected Result"
                    value={formData.expected_result}
                    onChange={handleInputChange("expected_result")}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleCancel}
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? "Creating..." : "Create Test Case"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default TestCaseCreatePage; 