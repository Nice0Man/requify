import React, { memo, useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  Chip,
} from "@mui/material";
import {
  useDebounced,
} from "@/shared/hooks/usePerformanceOptimizations";

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
    // Memoized event handlers to prevent child re-renders
    const handleSelect = useCallback(() => {
      onSelect(id);
    }, [id, onSelect]);

    const handleDelete = useCallback(() => {
      onDelete(id);
    }, [id, onDelete]);

    // Memoized styles based on selection
    const itemStyles = useMemo(
      () => ({
        backgroundColor: isSelected ? "#f0f0f0" : "transparent",
        borderLeft: isSelected ? "4px solid #1976d2" : "4px solid transparent",
        padding: "12px",
        margin: "4px 0",
        borderRadius: "8px",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }),
      [isSelected]
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
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

OptimizedListItem.displayName = "OptimizedListItem";

// =============================================================================
// Main Performance Optimized Component
// =============================================================================

interface ListItem {
  id: string;
  title: string;
  description: string;
}

interface PerformanceOptimizedComponentProps {
  title: string;
  items: ListItem[];
  className?: string;
}

const PerformanceOptimizedComponentBase: React.FC<
  PerformanceOptimizedComponentProps
> = ({ title, items, className }) => {
  // Local state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filtered items based on search
  const debouncedSearchQuery = useDebounced(searchQuery, 300);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchQuery) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [items, debouncedSearchQuery]);

  // Memoized handlers to prevent unnecessary re-renders of children
  const handleItemSelect = useCallback((id: string) => {
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

  const handleItemDelete = useCallback((id: string) => {
    console.log("Delete item:", id);
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Memoized action buttons
  const actionButtons = useMemo(
    () => (
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          disabled={selectedIds.size === 0}
          onClick={() => {
            console.log(`Bulk delete on:`, Array.from(selectedIds));
          }}
        >
          Delete Selected ({selectedIds.size})
        </Button>
        <Button
          variant="outlined"
          disabled={selectedIds.size === 0}
          onClick={() => setSelectedIds(new Set())}
        >
          Clear Selection
        </Button>
      </Box>
    ),
    [selectedIds.size]
  );

  return (
    <Box className={className} sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <TextField
        fullWidth
        label="Search items"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      {actionButtons}

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`Total: ${items.length}`} />
        <Chip label={`Filtered: ${filteredItems.length}`} />
        <Chip label={`Selected: ${selectedIds.size}`} />
      </Box>

      <List>
        {filteredItems.map((item) => (
          <OptimizedListItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            isSelected={selectedIds.has(item.id)}
            onSelect={handleItemSelect}
            onDelete={handleItemDelete}
          />
        ))}
      </List>
    </Box>
  );
};

// Apply performance optimization HOC
export const PerformanceOptimizedComponent = memo(PerformanceOptimizedComponentBase);

/**
 * Performance Best Practices demonstrated in this component:
 *
 * 1. **React.memo with custom comparison**: Prevents unnecessary re-renders
 *    when props haven't meaningfully changed
 *
 * 2. **useMemo for expensive calculations**: Memoizes filtered results
 *    to avoid recalculating on every render
 *
 * 3. **useCallback for stable references**: Prevents child components
 *    from re-rendering due to new function references
 *
 * 4. **Debounced search**: Reduces API calls and expensive filtering
 *    operations during user typing
 *
 * 5. **Selective state updates**: Uses functional state updates to
 *    avoid closure dependencies and improve stability
 *
 * 6. **Memoized UI components**: Action buttons and statistics are
 *    memoized to prevent unnecessary DOM operations
 */

export default PerformanceOptimizedComponent;
