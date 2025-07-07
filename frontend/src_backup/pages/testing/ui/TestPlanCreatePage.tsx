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

const TestPlanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
    start_date: "",
    end_date: "",
    objectives: "",
    scope: "",
    approach: "",
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement test plan creation API call
      console.log("Creating test plan:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate("/testing");
    } catch (error) {
      console.error("Failed to create test plan:", error);
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
            Create Test Plan
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Test Plan Name"
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
                    label="Start Date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange("start_date")}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange("end_date")}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Test Objectives"
                    value={formData.objectives}
                    onChange={handleInputChange("objectives")}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Define what you want to achieve with this test plan..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Test Scope"
                    value={formData.scope}
                    onChange={handleInputChange("scope")}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Define what will be tested and what will not be tested..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Test Approach"
                    value={formData.approach}
                    onChange={handleInputChange("approach")}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Describe the testing strategy and methodology..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Status"
                    value={formData.status}
                    onChange={handleInputChange("status")}
                    select
                    fullWidth
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </TextField>
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
                      {loading ? "Creating..." : "Create Test Plan"}
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

export default TestPlanCreatePage; 