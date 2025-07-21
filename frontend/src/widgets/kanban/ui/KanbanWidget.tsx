import React, {
  useState,
  useCallback,
  useMemo,
  memo,
  startTransition,
} from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Collapse,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme as useThemeMode } from "@/shared/contexts/PerformanceContext";
import {
  useRenderTracker,
  usePerformanceMeasure,
} from "@/shared/hooks/usePerformanceOptimizations";
import {
  Assignment,
  RocketLaunch,
  BugReport,
  Rocket,
  ViewModule,
  ViewList,
  ViewComfy,
  Search,
  FilterList,
  ClearAll,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Settings,
  Download,
} from "@mui/icons-material";
import { DropResult } from "@hello-pangea/dnd";

// FSD Imports
import type {
  KanbanType,
  KanbanVariant,
  KanbanCard,
  KanbanFilter,
  KanbanItemPriority,
} from "@/entities/kanban/model/types";
import { KanbanBoard } from "@/entities/kanban/ui/KanbanBoard";
import {
  useKanbanData,
  useKanbanFilters,
  useKanbanDragDrop,
} from "@/features/kanban/model";
import { useKanbanStore } from "@/features/kanban/model/kanbanStore";
import i18n from "@/shared/lib/i18n";
import { TFunction } from "i18next";

interface KanbanWidgetProps {
  type?: KanbanType;
  projectId?: number;
  requirementId?: number;
  variant?: KanbanVariant;
  showFilters?: boolean;
  showTypeSelector?: boolean;
  allowDragDrop?: boolean;
  maxHeight?: number;
  onItemClick?: (item: KanbanCard) => void;
  onItemEdit?: (item: KanbanCard) => void;
  onItemDelete?: (item: KanbanCard) => void;
  className?: string;
}

const kanbanTypeConfig = (t: TFunction) => ({
  projects: {
    label: t("navigation.projects"),
    icon: <RocketLaunch />,
    color: "#10b981",
  },
  requirements: {
    label: t("navigation.requirements"),
    icon: <Assignment />,
    color: "#3b82f6",
  },
  releases: {
    label: t("navigation.releases"),
    icon: <Rocket />,
    color: "#8b5cf6",
  },
  tests: {
    label: t("navigation.testing"),
    icon: <BugReport />,
    color: "#f59e0b",
  },
});

const variantConfig = (t: TFunction) => ({
  minimal: { label: t("common.minimal"), icon: <ViewList /> },
  compact: { label: t("common.compact"), icon: <ViewModule /> },
  detailed: { label: t("common.detailed"), icon: <ViewComfy /> },
});

export const KanbanWidget: React.FC<KanbanWidgetProps> = memo(
  ({
    type = "requirements",
    projectId,
    requirementId,
    variant = "detailed",
    showFilters = true,
    showTypeSelector = true,
    allowDragDrop = true,
    maxHeight = 600,
    onItemClick,
    onItemEdit,
    onItemDelete,
    className,
  }) => {
    // Performance monitoring
    useRenderTracker("KanbanWidget");
    usePerformanceMeasure("KanbanWidget");

    // Hooks and services
    const { t } = i18n;
    const muiTheme = useTheme();
    const themeMode = useThemeMode();

    // Store state
    const {
      activeType,
      activeVariant,
      isFullscreen,
      showFilters: showFiltersStore,
      collapsedColumns,
      setActiveType,
      setActiveVariant,
      toggleFullscreen,
      toggleFilters,
      toggleColumn,
      reset,
    } = useKanbanStore();

    // Local state
    const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(
      null
    );
    const [notification, setNotification] = useState<{
      open: boolean;
      message: string;
      severity: "success" | "error" | "info" | "warning";
    }>({ open: false, message: "", severity: "info" });

    // Use provided type or store type
    const currentType = type || activeType;
    const currentVariant = variant || activeVariant;

    // Data hooks
    const kanbanData = useKanbanData({
      type: currentType,
      projectId,
      requirementId,
    });
    const { items, isLoading, error, refetch } = kanbanData;

    const { filter, setSearch, setPriority, setAssignee, clearFilters } =
      useKanbanFilters(currentType);

    const { handleDragEnd } = useKanbanDragDrop({
      onSuccess: () => {
        setNotification({
          open: true,
          message: "Item moved successfully!",
          severity: "success",
        });
      },
    });

    // Available priorities and assignees from items
    const { availablePriorities, availableAssignees } = useMemo(() => {
      const itemsArray = Array.isArray(items) ? items : [];
      const priorities = Array.from(
        new Set(
          itemsArray.map((item: KanbanCard) => item.priority).filter(Boolean)
        )
      ) as KanbanItemPriority[];

      const assignees = Array.from(
        new Set(
          itemsArray.map((item: KanbanCard) => item.assignee).filter(Boolean)
        )
      );

      return {
        availablePriorities: priorities,
        availableAssignees: assignees,
      };
    }, [items]);

    // Handle type change
    const handleTypeChange = useCallback(
      (_event: React.MouseEvent<HTMLElement>, newType: KanbanType | null) => {
        if (newType && newType !== currentType) {
          setActiveType(newType);
          setNotification({
            open: true,
            message: `Switched to ${kanbanTypeConfig(t)[newType].label}`,
            severity: "info",
          });
        }
      },
      [currentType, setActiveType]
    );

    // Handle variant change
    const handleVariantChange = useCallback(
      (
        _event: React.MouseEvent<HTMLElement>,
        newVariant: KanbanVariant | null
      ) => {
        if (newVariant && newVariant !== currentVariant) {
          setActiveVariant(newVariant);
          setNotification({
            open: true,
            message: `Switched to ${variantConfig(t)[newVariant].label} view`,
            severity: "info",
          });
        }
      },
      [currentVariant, setActiveVariant]
    );

    // Handle drag end
    const handleDragEndWrapper = useCallback(
      (result: DropResult) => {
        if (!allowDragDrop) return;
        handleDragEnd(result);
      },
      [allowDragDrop, handleDragEnd]
    );

    // Handle settings menu
    const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
      setSettingsAnchor(event.currentTarget);
    };

    const handleSettingsClose = () => {
      setSettingsAnchor(null);
    };

    return (
      <Paper
        elevation={2}
        className={className}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: muiTheme.palette.background.paper,
          ...(isFullscreen && {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: muiTheme.zIndex.modal,
            borderRadius: 0,
          }),
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: alpha(muiTheme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${muiTheme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Type Selector */}
              {showTypeSelector && (
                <ToggleButtonGroup
                  value={currentType}
                  exclusive
                  onChange={handleTypeChange}
                  size="small"
                  sx={{ height: 32 }}
                >
                  {Object.entries(kanbanTypeConfig).map(([key, config]) => (
                    <ToggleButton key={key} value={key} sx={{ px: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box sx={{ color: config.color, display: "flex" }}>
                          {config.icon}
                        </Box>
                        <Typography variant="caption" fontWeight={500}>
                          {config.label}
                        </Typography>
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}

              {/* Title */}
              <Typography variant="h6" fontWeight={600}>
                {kanbanTypeConfig(t)[currentType].label} Board
              </Typography>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Variant Selector */}
              <ToggleButtonGroup
                value={currentVariant}
                exclusive
                onChange={handleVariantChange}
                size="small"
                sx={{ height: 32 }}
              >
                {Object.entries(variantConfig).map(([key, config]) => (
                  <ToggleButton key={key} value={key}>
                    <Tooltip title={config.label}>{config.icon}</Tooltip>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Divider orientation="vertical" flexItem />

              {/* Filters Toggle */}
              {showFilters && (
                <Tooltip title="Toggle filters">
                  <IconButton
                    size="small"
                    onClick={toggleFilters}
                    color={showFiltersStore ? "primary" : "default"}
                  >
                    <Badge
                      badgeContent={
                        Object.keys(filter).filter(
                          (key) =>
                            filter[key as keyof KanbanFilter] &&
                            (Array.isArray(filter[key as keyof KanbanFilter])
                              ? (filter[key as keyof KanbanFilter] as any[])
                                  .length > 0
                              : filter[key as keyof KanbanFilter])
                        ).length
                      }
                      color="error"
                    >
                      <FilterList />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* Refresh */}
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={() => refetch()}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              {/* Fullscreen */}
              <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                <IconButton size="small" onClick={toggleFullscreen}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>

              {/* Settings */}
              <Tooltip title="Settings">
                <IconButton size="small" onClick={handleSettingsClick}>
                  <Settings />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Filters */}
          {showFilters && showFiltersStore && (
            <Collapse in={showFiltersStore}>
              <Box sx={{ mt: 2 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  {/* Search */}
                  <TextField
                    size="small"
                    placeholder="Search items..."
                    value={filter.search || ""}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 200 }}
                  />

                  {/* Priority Filter */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      multiple
                      value={filter.priority || []}
                      onChange={(e) =>
                        setPriority(e.target.value as KanbanItemPriority[])
                      }
                      input={<OutlinedInput label="Priority" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {availablePriorities.map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Assignee Filter */}
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Assignee</InputLabel>
                    <Select
                      multiple
                      value={filter.assignee || []}
                      onChange={(e) => setAssignee(e.target.value as string[])}
                      input={<OutlinedInput label="Assignee" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {availableAssignees.map((assignee) => (
                        <MenuItem key={assignee} value={assignee}>
                          {assignee}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Clear Filters */}
                  <Button
                    size="small"
                    startIcon={<ClearAll />}
                    onClick={clearFilters}
                    disabled={
                      !Object.values(filter).some((v) =>
                        Array.isArray(v) ? v.length > 0 : Boolean(v)
                      )
                    }
                  >
                    Clear
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          )}
        </Box>

        {/* Board */}
        <KanbanBoard
          type={currentType}
          items={items}
          isLoading={isLoading}
          error={error?.message || null}
          filter={filter}
          variant={currentVariant}
          onDragEnd={handleDragEndWrapper}
          onItemClick={onItemClick}
          onItemEdit={onItemEdit}
          onItemDelete={onItemDelete}
          onToggleColumn={toggleColumn}
          collapsedColumns={collapsedColumns}
          isDragDisabled={!allowDragDrop}
          maxHeight={maxHeight}
        />

        {/* Settings Menu */}
        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={handleSettingsClose}
        >
          <MenuItem
            onClick={() => {
              reset();
              handleSettingsClose();
            }}
          >
            <ListItemIcon>
              <Refresh />
            </ListItemIcon>
            <ListItemText>Reset to defaults</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClose}>
            <ListItemIcon>
              <Download />
            </ListItemIcon>
            <ListItemText>Export data</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() =>
              setNotification((prev) => ({ ...prev, open: false }))
            }
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Paper>
    );
  }
);

KanbanWidget.displayName = "KanbanWidget";
