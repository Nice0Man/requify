import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  useTheme,
  alpha,
  Stack,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Assignment,
  RocketLaunch,
  BugReport,
  Rocket,
  ViewModule,
  ViewList,
  ViewComfy,
  Fullscreen,
  FullscreenExit,
  FilterList,
  Refresh,
} from "@mui/icons-material";

// Specialized Kanban components
import { RequirementsKanban } from "./RequirementsKanban";
import { ProjectsKanban } from "./ProjectsKanban";
import { TestsKanban } from "./TestsKanban";
import { ReleasesKanban } from "./ReleasesKanban";

// Types
type KanbanType = "requirements" | "projects" | "tests" | "releases";
type KanbanVariant = "compact" | "detailed" | "minimal";

interface KanbanProps {
  type?: KanbanType;
  projectId?: number;
  requirementId?: number;
  allowDragDrop?: boolean;
  showFilters?: boolean;
  className?: string;
  onItemClick?: (itemId: number, itemType: KanbanType) => void;
  variant?: KanbanVariant;
}

// Kanban type configurations
const kanbanTypes = {
  requirements: {
    label: "Requirements",
    icon: <Assignment />,
    color: "#3b82f6",
    description: "Manage requirements workflow",
  },
  projects: {
    label: "Projects",
    icon: <RocketLaunch />,
    color: "#10b981",
    description: "Track project progress",
  },
  tests: {
    label: "Tests",
    icon: <BugReport />,
    color: "#f59e0b",
    description: "Test case management",
  },
  releases: {
    label: "Releases",
    icon: <Rocket />,
    color: "#8b5cf6",
    description: "Release management",
  },
};

// Kanban variant configurations
const kanbanVariants = {
  minimal: {
    label: "Minimal",
    icon: <ViewList />,
    description: "Compact view with essential info",
  },
  compact: {
    label: "Compact",
    icon: <ViewModule />,
    description: "Balanced view with key details",
  },
  detailed: {
    label: "Detailed",
    icon: <ViewComfy />,
    description: "Full view with all information",
  },
};

export const Kanban: React.FC<KanbanProps> = ({
  type = "requirements",
  projectId,
  requirementId,
  allowDragDrop = true,
  showFilters = true,
  className,
  onItemClick,
  variant = "detailed",
}) => {
  const theme = useTheme();
  const [currentType, setCurrentType] = useState<KanbanType>(type);
  const [currentVariant, setCurrentVariant] = useState<KanbanVariant>(variant);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTypeFilters, setShowTypeFilters] = useState(true);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Update type when prop changes
  useEffect(() => {
    setCurrentType(type);
  }, [type]);

  // Update variant when prop changes
  useEffect(() => {
    setCurrentVariant(variant);
  }, [variant]);

  // Handle type change
  const handleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: KanbanType
  ) => {
    if (newType !== null) {
      setCurrentType(newType);
      setNotification({
        open: true,
        message: `Switched to ${kanbanTypes[newType].label} kanban`,
        severity: "info",
      });
    }
  };

  // Handle variant change
  const handleVariantChange = (
    _event: React.MouseEvent<HTMLElement>,
    newVariant: KanbanVariant
  ) => {
    if (newVariant !== null) {
      setCurrentVariant(newVariant);
      setNotification({
        open: true,
        message: `Switched to ${kanbanVariants[newVariant].label} view`,
        severity: "info",
      });
    }
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Handle item click
  const handleItemClick = (itemId: number) => {
    onItemClick?.(itemId, currentType);
  };

  // Handle refresh
  const handleRefresh = () => {
    setNotification({
      open: true,
      message: "Refreshing kanban data...",
      severity: "info",
    });
    // The individual kanban components will handle their own refresh
    window.location.reload();
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Render the appropriate kanban component
  const renderKanbanComponent = () => {
    const commonProps = {
      projectId,
      allowDragDrop,
      showFilters,
      className,
      onItemClick: handleItemClick,
      variant: currentVariant,
    };

    switch (currentType) {
      case "requirements":
        return <RequirementsKanban {...commonProps} />;
      case "projects":
        return <ProjectsKanban {...commonProps} />;
      case "tests":
        return <TestsKanban {...commonProps} requirementId={requirementId} />;
      case "releases":
        return <ReleasesKanban {...commonProps} />;
      default:
        return <RequirementsKanban {...commonProps} />;
    }
  };

  return (
    <Box
      className={className}
      sx={{
        width: "100%",
        minHeight: isFullscreen ? "100vh" : "calc(100vh - 200px)",
        backgroundColor: theme.palette.background.default,
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        right: isFullscreen ? 0 : "auto",
        bottom: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 9999 : "auto",
        overflow: isFullscreen ? "hidden" : "visible",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: alpha(kanbanTypes[currentType].color, 0.05),
          borderLeft: `4px solid ${kanbanTypes[currentType].color}`,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          {/* Title and Description */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              {kanbanTypes[currentType].icon}
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {kanbanTypes[currentType].label} Kanban
              </Typography>
              <Chip
                label={kanbanVariants[currentVariant].label}
                size="small"
                sx={{
                  backgroundColor: alpha(kanbanTypes[currentType].color, 0.1),
                  color: kanbanTypes[currentType].color,
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {kanbanTypes[currentType].description}
            </Typography>
          </Box>

          {/* Controls */}
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {/* View Variant Toggle */}
            <ToggleButtonGroup
              value={currentVariant}
              exclusive
              onChange={handleVariantChange}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  border: `1px solid ${alpha(
                    kanbanTypes[currentType].color,
                    0.3
                  )}`,
                  color: kanbanTypes[currentType].color,
                  "&.Mui-selected": {
                    backgroundColor: alpha(kanbanTypes[currentType].color, 0.1),
                    color: kanbanTypes[currentType].color,
                  },
                },
              }}
            >
              {Object.entries(kanbanVariants).map(([key, config]) => (
                <ToggleButton key={key} value={key}>
                  <Tooltip title={config.description}>{config.icon}</Tooltip>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem />

            {/* Action Buttons */}
            <Tooltip title="Toggle filters">
              <IconButton
                onClick={() => setShowTypeFilters(!showTypeFilters)}
                sx={{
                  color: showTypeFilters
                    ? kanbanTypes[currentType].color
                    : "text.secondary",
                }}
              >
                <FilterList />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <IconButton onClick={handleFullscreenToggle}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Type Selector */}
        {showTypeFilters && (
          <Box mt={2}>
            <ToggleButtonGroup
              value={currentType}
              exclusive
              onChange={handleTypeChange}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  border: `1px solid ${theme.palette.divider}`,
                  color: "text.secondary",
                  "&.Mui-selected": {
                    backgroundColor: alpha(kanbanTypes[currentType].color, 0.1),
                    color: kanbanTypes[currentType].color,
                    borderColor: kanbanTypes[currentType].color,
                  },
                },
              }}
            >
              {Object.entries(kanbanTypes).map(([key, config]) => (
                <ToggleButton key={key} value={key}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {config.icon}
                    <Typography variant="body2" fontWeight={500}>
                      {config.label}
                    </Typography>
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}
      </Paper>

      {/* Kanban Content */}
      <Box
        sx={{
          width: "100%",
          height: isFullscreen ? "calc(100vh - 140px)" : "auto",
          overflow: isFullscreen ? "hidden" : "visible",
        }}
      >
        {renderKanbanComponent()}
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
