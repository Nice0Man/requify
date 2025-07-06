import React, { useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import { Kanban } from "@/widgets/kanban";

export const KanbanPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | undefined>();

  const handleItemClick = (itemId: number, itemType: string) => {
    console.log(`Clicked ${itemType} item:`, itemId);
    
    // Navigate to detailed view based on item type
    switch (itemType) {
      case "requirements":
        // Navigate to requirement details
        break;
      case "projects":
        // Navigate to project details
        setSelectedProjectId(itemId);
        break;
      case "tests":
        // Navigate to test case details
        break;
      case "releases":
        // Navigate to release details
        break;
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh" }}>
      <Container maxWidth={false} disableGutters sx={{ px: 2, py: 3 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Kanban Board
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your requirements, projects, tests, and releases with drag-and-drop kanban boards.
          </Typography>
        </Box>

        <Kanban
          type="requirements"
          projectId={selectedProjectId}
          requirementId={selectedRequirementId}
          allowDragDrop={true}
          showFilters={true}
          onItemClick={handleItemClick}
          variant="detailed"
        />
      </Container>
    </Box>
  );
}; 