import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Box,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert,
  Flag,
  Person,
  Schedule,
  Assignment,
  CalendarToday,
  AccessTime,
} from "@mui/icons-material";
import type { KanbanCardProps } from "../model/types";
import {
  getPriorityColor,
  calculateProgress,
  isItemOverdue,
  getRelativeTime,
  formatDuration,
} from "../model/utils";

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  index,
  onItemClick,
  onEdit,
  onDelete,
  variant = "detailed",
  isDragging = false,
}) => {
  const theme = useTheme();
  const priorityColor = getPriorityColor(item.priority);
  const progress = calculateProgress(item);
  const overdue = isItemOverdue(item);

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent click when clicking on action buttons
    if ((event.target as Element).closest("button")) {
      return;
    }
    onItemClick?.(item.id);
  };

  const handleMoreClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Implement menu logic here
  };

  const renderMinimalCard = () => (
    <Card
      onClick={handleCardClick}
      sx={{
        mb: 1,
        cursor: "pointer",
        borderLeft: `3px solid ${priorityColor}`,
        backgroundColor: isDragging
          ? alpha(theme.palette.primary.main, 0.1)
          : "background.paper",
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {item.title}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="space-between"
          mt={0.5}
        >
          <Chip
            label={item.priority || "medium"}
            size="small"
            sx={{
              backgroundColor: alpha(priorityColor, 0.1),
              color: priorityColor,
              fontSize: "0.7rem",
              height: 20,
            }}
          />
          {item.assignee && (
            <Avatar sx={{ width: 20, height: 20, fontSize: "0.7rem" }}>
              {item.assignee.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderCompactCard = () => (
    <Card
      onClick={handleCardClick}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        borderLeft: `4px solid ${priorityColor}`,
        backgroundColor: isDragging
          ? alpha(theme.palette.primary.main, 0.1)
          : "background.paper",
        border: overdue
          ? `1px solid ${theme.palette.error.main}`
          : "1px solid transparent",
        "&:hover": {
          boxShadow: theme.shadows[6],
          transform: "translateY(-2px)",
        },
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ flex: 1, mr: 1 }}
          >
            {item.title}
          </Typography>
          <IconButton size="small" onClick={handleMoreClick}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Chip
            icon={<Flag sx={{ fontSize: "0.8rem" }} />}
            label={item.priority || "medium"}
            size="small"
            sx={{
              backgroundColor: alpha(priorityColor, 0.1),
              color: priorityColor,
            }}
          />
          {item.labels?.slice(0, 2).map((label, idx) => (
            <Chip
              key={idx}
              label={label}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem" }}
            />
          ))}
          {item.labels && item.labels.length > 2 && (
            <Typography variant="caption" color="text.secondary">
              +{item.labels.length - 2}
            </Typography>
          )}
        </Stack>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          {item.assignee && (
            <Tooltip title={item.assignee}>
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                {item.assignee.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          )}
          <Typography variant="caption" color="text.secondary">
            {getRelativeTime(item.updated_at)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDetailedCard = () => (
    <Card
      onClick={handleCardClick}
      sx={{
        mb: 2,
        cursor: "pointer",
        borderLeft: `4px solid ${priorityColor}`,
        backgroundColor: isDragging
          ? alpha(theme.palette.primary.main, 0.1)
          : "background.paper",
        border: overdue
          ? `1px solid ${theme.palette.error.main}`
          : "1px solid transparent",
        "&:hover": {
          boxShadow: theme.shadows[8],
          transform: "translateY(-2px)",
        },
        transition: "all 0.3s ease-in-out",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              {item.title}
            </Typography>
            {item.type_name && (
              <Chip
                label={item.type_name}
                size="small"
                variant="outlined"
                sx={{ mr: 1, fontSize: "0.7rem" }}
              />
            )}
          </Box>
          <IconButton size="small" onClick={handleMoreClick}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Description */}
        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Progress */}
        {progress > 0 && (
          <Box mb={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.grey[300], 0.3),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  backgroundColor:
                    progress === 100
                      ? theme.palette.success.main
                      : priorityColor,
                },
              }}
            />
          </Box>
        )}

        {/* Labels */}
        {item.labels && item.labels.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            mb={2}
            flexWrap="wrap"
            useFlexGap
          >
            {item.labels.slice(0, 3).map((label, idx) => (
              <Chip
                key={idx}
                label={label}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", mb: 0.5 }}
              />
            ))}
            {item.labels.length > 3 && (
              <Chip
                label={`+${item.labels.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", mb: 0.5 }}
              />
            )}
          </Stack>
        )}

        {/* Meta Information */}
        <Stack spacing={1}>
          {/* Priority and Assignee */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<Flag sx={{ fontSize: "0.8rem" }} />}
              label={item.priority || "medium"}
              size="small"
              sx={{
                backgroundColor: alpha(priorityColor, 0.1),
                color: priorityColor,
                fontWeight: 500,
              }}
            />
            {item.assignee && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Person sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {item.assignee}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Dates and Time */}
          <Stack direction="row" spacing={2} alignItems="center">
            {item.dueDate && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarToday
                  sx={{
                    fontSize: "0.8rem",
                    color: overdue ? "error.main" : "text.secondary",
                  }}
                />
                <Typography
                  variant="caption"
                  color={overdue ? "error.main" : "text.secondary"}
                  fontWeight={overdue ? 600 : 400}
                >
                  {new Date(item.dueDate).toLocaleDateString()}
                </Typography>
              </Stack>
            )}
            {item.estimatedHours && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTime
                  sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(item.estimatedHours)}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Bottom row */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pt={0.5}
          >
            <Typography variant="caption" color="text.secondary">
              Updated {getRelativeTime(item.updated_at)}
            </Typography>
            {item.assignee && (
              <Tooltip title={item.assignee}>
                <Avatar sx={{ width: 28, height: 28, fontSize: "0.9rem" }}>
                  {item.assignee.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderCard = () => {
    switch (variant) {
      case "minimal":
        return renderMinimalCard();
      case "compact":
        return renderCompactCard();
      case "detailed":
      default:
        return renderDetailedCard();
    }
  };

  return (
    <Draggable draggableId={`item-${item.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          {renderCard()}
        </div>
      )}
    </Draggable>
  );
};
