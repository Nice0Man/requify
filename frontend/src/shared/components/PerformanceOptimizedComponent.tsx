import React, { memo, useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  Chip,
} from "@mui/material";
import {
  useDebounced,
  useThrottledCallback,
  useRenderTracker,
  usePerformanceMeasure,
  withPerformanceOptimization,
} from "@/shared/hooks/usePerformanceOptimizations";
import {
  useTheme,
  useLoadingState,
  useUserPreferences,
} from "@/shared/contexts/PerformanceContext";

// =============================================================================
// Example: Optimized List Item Component
// =============================================================================

interface OptimizedListItemProps {
  id: string;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

// Memoized list item with custom comparison to prevent unnecessary re-renders
const OptimizedListItem = memo<OptimizedListItemProps>(
  ({ id, title, description, isSelected, onSelect, onDelete }) => {
    // Track renders for performance debugging
    useRenderTracker("OptimizedListItem", { id, isSelected });

    // Selective context consumption - only theme value, not functions
    const theme = useTheme();

    // Memoized event handlers to prevent child re-renders
    const handleSelect = useCallback(() => {
      onSelect(id);
    }, [id, onSelect]);

    const handleDelete = useCallback(() => {
      onDelete(id);
    }, [id, onDelete]);

    // Memoized styles based on theme and selection
    const itemStyles = useMemo(
      () => ({
        backgroundColor: isSelected
          ? theme === "dark"
            ? "#333"
            : "#f0f0f0"
          : "transparent",
        borderLeft: isSelected ? "4px solid #1976d2" : "4px solid transparent",
        padding: "12px",
        margin: "4px 0",
        borderRadius: "8px",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }),
      [isSelected, theme]
    );

    return (
      <Box sx={itemStyles} onClick={handleSelect}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Button
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          sx={{ mt: 1 }}
        >
          Delete
        </Button>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for more granular control
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onSelect === nextProps.onSelect &&
      prevProps.onDelete === nextProps.onDelete
    );
  }
);

OptimizedListItem.displayName = "OptimizedListItem";

// =============================================================================
// Example: Search Component with Debouncing
// =============================================================================

interface OptimizedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const OptimizedSearch = memo<OptimizedSearchProps>(
  ({ onSearch, placeholder = "Search..." }) => {
    const [searchValue, setSearchValue] = useState("");

    // Debounced search to prevent excessive API calls
    const debouncedSearchValue = useDebounced(searchValue, 300);

    // Effect for debounced search
    React.useEffect(() => {
      onSearch(debouncedSearchValue);
    }, [debouncedSearchValue, onSearch]);

    const handleSearchChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
      },
      []
    );

    return (
      <TextField
        fullWidth
        value={searchValue}
        onChange={handleSearchChange}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
      />
    );
  }
);

OptimizedSearch.displayName = "OptimizedSearch";

// =============================================================================
// Example: Main Component with All Optimizations
// =============================================================================

interface PerformanceOptimizedComponentProps {
  title: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  className?: string;
}

const PerformanceOptimizedComponentBase: React.FC<
  PerformanceOptimizedComponentProps
> = ({ title, items, className }) => {
  // Performance measurement for this component
  usePerformanceMeasure("PerformanceOptimizedComponent");

  // Local state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Context subscriptions - only what we need
  const { isLoading } = useLoadingState();
  const { preferences } = useUserPreferences();

  // Memoized filtered items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Memoized statistics
  const statistics = useMemo(
    () => ({
      total: items.length,
      filtered: filteredItems.length,
      selected: selectedIds.size,
    }),
    [items.length, filteredItems.length, selectedIds.size]
  );

  // Optimized event handlers
  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    // In real app, this would make API call
    console.log("Delete item:", id);
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Throttled bulk action to prevent UI blocking
  const handleBulkAction = useThrottledCallback(
    (action: string) => {
      console.log(`Bulk ${action} on:`, Array.from(selectedIds));
    },
    500,
    [selectedIds]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Memoized action buttons
  const actionButtons = useMemo(
    () => (
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          disabled={selectedIds.size === 0}
          onClick={() => handleBulkAction("delete")}
        >
          Delete Selected ({selectedIds.size})
        </Button>
        <Button
          variant="outlined"
          disabled={selectedIds.size === 0}
          onClick={handleClearSelection}
        >
          Clear Selection
        </Button>
      </Box>
    ),
    [selectedIds.size, handleBulkAction, handleClearSelection]
  );

  if (isLoading) {
    return (
      <Box className={className} sx={{ p: 2 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      {/* Statistics */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Chip label={`Total: ${statistics.total}`} />
        <Chip label={`Filtered: ${statistics.filtered}`} />
        <Chip label={`Selected: ${statistics.selected}`} />
        <Chip
          label={`Preference: ${preferences.displayMode || "default"}`}
          color="secondary"
        />
      </Box>

      {/* Search */}
      <OptimizedSearch
        onSearch={setSearchQuery}
        placeholder="Search items..."
      />

      {/* Actions */}
      {actionButtons}

      {/* List */}
      <List>
        {filteredItems.map((item) => (
          <OptimizedListItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            isSelected={selectedIds.has(item.id)}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        ))}
      </List>

      {filteredItems.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 4 }}
        >
          {searchQuery ? "No items match your search" : "No items available"}
        </Typography>
      )}
    </Box>
  );
};

// Apply performance optimization HOC
export const PerformanceOptimizedComponent = withPerformanceOptimization(
  PerformanceOptimizedComponentBase,
  {
    displayName: "PerformanceOptimizedComponent",
    trackRenders: process.env.NODE_ENV === "development",
    measurePerformance: process.env.NODE_ENV === "development",
    customCompare: (prevProps, nextProps) => {
      // Custom comparison logic for props
      return (
        prevProps.title === nextProps.title &&
        prevProps.items === nextProps.items && // Reference comparison for memoized arrays
        prevProps.className === nextProps.className
      );
    },
  }
);

// =============================================================================
// Usage Example Component
// =============================================================================

export const PerformanceOptimizedExample: React.FC = () => {
  // Memoized sample data
  const sampleItems = useMemo(
    () => [
      {
        id: "1",
        title: "Task 1",
        description: "Complete project documentation",
      },
      { id: "2", title: "Task 2", description: "Review code changes" },
      { id: "3", title: "Task 3", description: "Update user interface" },
      { id: "4", title: "Task 4", description: "Fix performance issues" },
      { id: "5", title: "Task 5", description: "Write unit tests" },
    ],
    []
  );

  return (
    <PerformanceOptimizedComponent
      title="Performance Optimized List"
      items={sampleItems}
    />
  );
};
