import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ViewColumn,
  Search,
  FilterList,
  Add,
  Refresh,
  Assignment,
  RocketLaunch,
  BugReport,
  Person,
  Schedule,
  Flag,
  DragIndicator,
} from '@mui/icons-material';

// Using entities according to FSD
import { requirementsApi } from '@/entities/requirement';
import { projectsApi } from '@/entities/project';
import { testCasesApi } from '@/entities/test-case';
import type { Requirement } from '@/entities/requirement/model/types';
import type { Project } from '@/entities/project/model/types';
import type { TestCase } from '@/entities/test-case/model/types';

// Using shared utilities
import { formatDate } from '@/shared/utils';

// Widget props from types
import type { KanbanProps, KanbanColumn, KanbanItem } from '../../types';

// Default columns for different modes
const defaultColumns: Record<string, KanbanColumn[]> = {
  requirements: [
    { id: 'draft', title: 'Draft', color: '#94a3b8', status: 'draft' },
    { id: 'review', title: 'In Review', color: '#f59e0b', status: 'review' },
    { id: 'approved', title: 'Approved', color: '#10b981', status: 'approved' },
    { id: 'rejected', title: 'Rejected', color: '#ef4444', status: 'rejected' },
  ],
  projects: [
    { id: 'planning', title: 'Planning', color: '#6366f1', status: 'planning' },
    { id: 'active', title: 'Active', color: '#10b981', status: 'active' },
    { id: 'completed', title: 'Completed', color: '#94a3b8', status: 'completed' },
    { id: 'cancelled', title: 'Cancelled', color: '#ef4444', status: 'cancelled' },
  ],
  tasks: [
    { id: 'pending', title: 'Pending', color: '#94a3b8', status: 'pending' },
    { id: 'in_progress', title: 'In Progress', color: '#f59e0b', status: 'in_progress' },
    { id: 'passed', title: 'Passed', color: '#10b981', status: 'passed' },
    { id: 'failed', title: 'Failed', color: '#ef4444', status: 'failed' },
  ],
};

const getItemIcon = (type: string) => {
  switch (type) {
    case 'requirement':
      return <Assignment fontSize="small" />;
    case 'project':
      return <RocketLaunch fontSize="small" />;
    case 'task':
      return <BugReport fontSize="small" />;
    default:
      return <Assignment fontSize="small" />;
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

interface KanbanCardProps {
  item: KanbanItem;
  onItemClick?: (itemId: number, itemType: string) => void;
  allowDragDrop?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ 
  item, 
  onItemClick, 
  allowDragDrop 
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onItemClick && item.id) {
      onItemClick(item.id, item.type);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: onItemClick ? 'pointer' : 'default',
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        '&:hover': onItemClick ? {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
        } : {},
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            {allowDragDrop && (
              <DragIndicator sx={{ fontSize: 16, color: 'text.disabled', cursor: 'grab' }} />
            )}
            {getItemIcon(item.type)}
          </Box>
          {item.priority && (
            <Chip
              label={item.priority}
              size="small"
              color={getPriorityColor(item.priority) as any}
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>

        <Typography
          variant="body2"
          sx={{ fontWeight: 600, mb: 1, lineHeight: 1.4 }}
        >
          {item.title}
        </Typography>

        {item.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box',
            }}
          >
            {item.description}
          </Typography>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(item.created_at)}
          </Typography>
          
          {item.assignee && (
            <Tooltip title={item.assignee}>
              <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                {item.assignee[0].toUpperCase()}
              </Avatar>
            </Tooltip>
          )}
        </Box>

        {item.labels && item.labels.length > 0 && (
          <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
            {item.labels.slice(0, 3).map((label, index) => (
              <Chip
                key={index}
                label={label}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.6rem', height: 16 }}
              />
            ))}
            {item.labels.length > 3 && (
              <Chip
                label={`+${item.labels.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.6rem', height: 16 }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface KanbanColumnProps {
  column: KanbanColumn;
  items: KanbanItem[];
  onItemClick?: (itemId: number, itemType: string) => void;
  allowDragDrop?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  items,
  onItemClick,
  allowDragDrop,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minWidth: 280,
        maxWidth: 320,
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        borderRadius: 3,
        p: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: column.color || theme.palette.primary.main,
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {column.title}
          </Typography>
          <Badge
            badgeContent={items.length}
            color="default"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                height: 16,
                minWidth: 16,
              },
            }}
          />
        </Box>
        
        {column.limit && items.length >= column.limit && (
          <Chip
            label="LIMIT"
            size="small"
            color="warning"
            sx={{ fontSize: '0.6rem', height: 18 }}
          />
        )}
      </Box>

      <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
        {items.map((item) => (
          <KanbanCard
            key={item.id}
            item={item}
            onItemClick={onItemClick}
            allowDragDrop={allowDragDrop}
          />
        ))}
      </Box>
    </Box>
  );
};

export const Kanban: React.FC<KanbanProps> = ({
  mode = 'requirements',
  projectId,
  columns,
  showFilters = true,
  allowDragDrop = false,
  className,
  onItemClick,
  onItemMove,
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const currentColumns = columns || defaultColumns[mode] || defaultColumns.requirements;

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: KanbanItem[] = [];

      switch (mode) {
        case 'requirements':
          const reqResponse = await requirementsApi.getRequirements({
            project_id: projectId,
            limit: 100,
          });
          data = reqResponse.items.map((req: Requirement) => ({
            id: req.id,
            title: req.title,
            description: req.description,
            status: req.status,
            priority: req.priority,
            assignee: req.author_name,
            created_at: req.created_at,
            updated_at: req.updated_at,
            type: 'requirement' as const,
            labels: req.type ? [req.type] : [],
          }));
          break;

        case 'projects':
          const projResponse = await projectsApi.getProjects({
            limit: 100,
          });
          data = projResponse.items.map((proj: Project) => ({
            id: proj.id,
            title: proj.name,
            description: proj.description,
            status: proj.status,
            priority: 'medium',
            assignee: 'PM',
            created_at: proj.created_at,
            updated_at: proj.updated_at,
            type: 'project' as const,
            labels: proj.code ? [proj.code] : [],
          }));
          break;

        case 'tasks':
          const testResponse = await testCasesApi.getTestCases({
            limit: 100,
          });
          data = testResponse.items.map((test: TestCase) => ({
            id: test.id,
            title: test.title,
            description: test.description,
            status: test.status,
            priority: test.priority,
            assignee: test.author_name,
            created_at: test.created_at,
            updated_at: test.updated_at,
            type: 'task' as const,
            labels: test.type ? [test.type] : [],
          }));
          break;
      }

      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [mode, projectId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefresh = () => {
    loadItems();
  };

  const handleItemMove = (itemId: number, fromColumn: string, toColumn: string) => {
    if (onItemMove) {
      onItemMove(itemId, fromColumn, toColumn);
    }
    // Update local state
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: toColumn }
        : item
    ));
  };

  const filteredItems = items.filter(item => {
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (priorityFilter && item.priority !== priorityFilter) {
      return false;
    }
    if (assigneeFilter && item.assignee !== assigneeFilter) {
      return false;
    }
    return true;
  });

  const getColumnItems = (columnId: string) => {
    return filteredItems.filter(item => 
      item.status === columnId || 
      item.status === currentColumns.find(col => col.id === columnId)?.status
    );
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'requirements':
        return <Assignment />;
      case 'projects':
        return <RocketLaunch />;
      case 'tasks':
        return <BugReport />;
      default:
        return <ViewColumn />;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'requirements':
        return 'Requirements Board';
      case 'projects':
        return 'Projects Board';
      case 'tasks':
        return 'Tasks Board';
      default:
        return 'Kanban Board';
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
          <Button onClick={handleRefresh} size="small" sx={{ mt: 1 }}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className={className}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {getModeIcon()}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {getModeTitle()}
          </Typography>
          <Chip
            label={`${filteredItems.length} items`}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Box
          display="flex"
          gap={2}
          mb={3}
          flexWrap="wrap"
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <TextField
            size="small"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Assignee</InputLabel>
            <Select
              value={assigneeFilter}
              label="Assignee"
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {Array.from(new Set(items.map(item => item.assignee).filter(Boolean))).map(assignee => (
                <MenuItem key={assignee} value={assignee}>
                  {assignee}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Kanban Board */}
      {isLoading ? (
        <Box display="flex" gap={2} overflow="auto" pb={2}>
          {currentColumns.map((_, index) => (
            <Box key={index} minWidth={280}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box display="flex" gap={2} overflow="auto" pb={2}>
          {currentColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={getColumnItems(column.id)}
              onItemClick={onItemClick}
              allowDragDrop={allowDragDrop}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}; 