import React from "react";
import {
  Box,
  Paper,
  Typography,
  Badge,
  IconButton,
  Collapse,
  useTheme,
  alpha,
  // Chip, // unused
  Tooltip,
} from "@mui/material";
import { ExpandLess, ExpandMore, Add, MoreVert } from "@mui/icons-material";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { KanbanColumn as KanbanColumnType } from "../model/types";
import { KanbanCard } from "./KanbanCard";
import type { KanbanCard as KanbanCardType } from "../model/types";

interface KanbanColumnProps {
  column: KanbanColumnType;
  items: KanbanCardType[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onAddItem?: () => void;
  onItemClick?: (item: KanbanCardType) => void;
  onItemEdit?: (item: KanbanCardType) => void;
  onItemDelete?: (item: KanbanCardType) => void;
  variant?: "minimal" | "compact" | "detailed";
  isDragDisabled?: boolean;
  maxHeight?: number;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  items,
  isCollapsed = false,
  onToggleCollapse,
  onAddItem,
  onItemClick,
  onItemEdit,
  onItemDelete,
  variant = "detailed",
  isDragDisabled = false,
  maxHeight = 600,
}) => {
  const theme = useTheme();

  const hasLimit = column.limit && column.limit > 0;
  const isOverLimit = hasLimit && items.length > column.limit!;
  const limitColor = isOverLimit
    ? theme.palette.error.main
    : theme.palette.success.main;

  return (
    <Paper
      elevation={2}
      sx={{
        width: variant === "minimal" ? 280 : variant === "compact" ? 320 : 360,
        minHeight: 120,
        maxHeight: maxHeight,
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${alpha(column.color, 0.2)}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: alpha(column.color, 0.1),
          borderBottom: `1px solid ${alpha(column.color, 0.2)}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 64,
        }}
      >
        {/* Column Icon */}
        <Box
          sx={{
            color: column.color,
            display: "flex",
            alignItems: "center",
            "& svg": { fontSize: 20 },
          }}
        >
          {column.icon}
        </Box>

        {/* Column Title and Count */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary"
              sx={{
                fontSize: variant === "minimal" ? "0.875rem" : "1rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {column.title}
            </Typography>

            <Badge
              badgeContent={items.length}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: column.color,
                  color: theme.palette.getContrastText(column.color),
                  fontSize: "0.75rem",
                  height: 18,
                  minWidth: 18,
                },
              }}
            />
          </Box>

          {/* Limit indicator */}
          {hasLimit && variant !== "minimal" && (
            <Typography
              variant="caption"
              sx={{
                color: limitColor,
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {items.length}/{column.limit} {isOverLimit && "⚠"}
            </Typography>
          )}

          {/* Column description */}
          {column.description && variant === "detailed" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontSize: "0.7rem",
                mt: 0.5,
                lineHeight: 1.2,
              }}
            >
              {column.description}
            </Typography>
          )}
        </Box>

        {/* Column Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {onAddItem && (
            <Tooltip title="Add item">
              <IconButton
                size="small"
                onClick={onAddItem}
                sx={{
                  color: column.color,
                  "&:hover": {
                    backgroundColor: alpha(column.color, 0.1),
                  },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="More actions">
            <IconButton
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.action.hover, 0.5),
                },
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>

          {onToggleCollapse && (
            <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
              <IconButton
                size="small"
                onClick={onToggleCollapse}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                {isCollapsed ? (
                  <ExpandMore fontSize="small" />
                ) : (
                  <ExpandLess fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Column Content */}
      <Collapse in={!isCollapsed} timeout="auto">
        <Droppable droppableId={column.id} isDropDisabled={isDragDisabled}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                flex: 1,
                p: 1,
                minHeight: 100,
                maxHeight: maxHeight - 100,
                overflowY: "auto",
                overflowX: "hidden",
                backgroundColor: snapshot.isDraggingOver
                  ? alpha(column.color, 0.05)
                  : "transparent",
                border: snapshot.isDraggingOver
                  ? `2px dashed ${alpha(column.color, 0.3)}`
                  : "2px dashed transparent",
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&::-webkit-scrollbar": {
                  width: 6,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: alpha(theme.palette.divider, 0.1),
                  borderRadius: 3,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(theme.palette.divider, 0.3),
                  borderRadius: 3,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.divider, 0.5),
                  },
                },
              }}
            >
              {items.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 80,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                    No items
                  </Typography>
                  {onAddItem && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "0.7rem", mt: 0.5 }}
                    >
                      Click + to add
                    </Typography>
                  )}
                </Box>
              ) : (
                items.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={`${item.id}`}
                    index={index}
                    isDragDisabled={isDragDisabled}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          mb: 1,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                          transform: snapshot.isDragging
                            ? `rotate(5deg) ${
                                provided.draggableProps.style?.transform || ""
                              }`
                            : provided.draggableProps.style?.transform,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        <KanbanCard
                          item={item}
                          index={index}
                          variant={variant}
                          onItemClick={
                            onItemClick ? () => onItemClick(item) : undefined
                          }
                          onEdit={
                            onItemEdit ? () => onItemEdit(item) : undefined
                          }
                          onDelete={
                            onItemDelete ? () => onItemDelete(item) : undefined
                          }
                          isDragging={snapshot.isDragging}
                        />
                      </Box>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </Collapse>
    </Paper>
  );
};
