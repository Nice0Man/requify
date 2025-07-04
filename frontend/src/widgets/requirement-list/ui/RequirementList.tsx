import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
  useTheme,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Assignment,
  Search,
  FilterList,
  Refresh,
  ChevronRight,
  Priority,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';

// Using entities according to FSD
import { requirementsApi } from '@/entities/requirement';
import type { Requirement } from '@/entities/requirement/model/types';

// Using shared utilities
import { formatDate } from '@/shared/utils';

// Widget props from types
import type { RequirementListProps } from '../../types';

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'draft':
      return 'default';
    case 'review':
      return 'warning';
    case 'rejected':
      return 'error';
    default:
      return 'info';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return <CheckCircle />;
    case 'draft':
      return <Schedule />;
    case 'review':
      return <Warning />;
    default:
      return <Assignment />;
  }
};

export const RequirementList: React.FC<RequirementListProps> = ({
  projectId,
  limit = 10,
  showFilters = true,
  showPagination = true,
  className,
  onRequirementClick,
}) => {
  const theme = useTheme();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: any = {};
      if (projectId) filters.project_id = projectId;
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await requirementsApi.getRequirements({
        ...filters,
        page,
        limit,
      });
      
      setRequirements(response.items || []);
      setTotalPages(Math.ceil((response.total || 0) / limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load requirements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [projectId, page, limit, statusFilter, priorityFilter, searchTerm]);

  const handleRequirementClick = (requirement: Requirement) => {
    if (onRequirementClick && requirement.id) {
      onRequirementClick(requirement.id);
    }
  };

  const handleRefresh = () => {
    loadRequirements();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on search
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
          <IconButton onClick={handleRefresh} size="small">
            <Refresh />
          </IconButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={className}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Assignment />
          </Box>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Requirements
          </Typography>
        }
        action={
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <Refresh />
          </IconButton>
        }
        sx={{ pb: showFilters ? 1 : 2 }}
      />

      <CardContent sx={{ pt: 0 }}>
        {showFilters && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

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
            </Box>
          </Box>
        )}

        {isLoading ? (
          <Box>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box flex={1}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
                <Skeleton variant="rectangular" width={60} height={24} sx={{ mr: 1 }} />
                <Skeleton variant="rectangular" width={60} height={24} />
              </Box>
            ))}
          </Box>
        ) : requirements.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            py={4}
            color="text.secondary"
          >
            <Assignment sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
            <Typography variant="body2">
              {searchTerm || statusFilter || priorityFilter
                ? 'No requirements match your filters'
                : 'No requirements found'
              }
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {requirements.map((requirement) => (
              <ListItem
                key={requirement.id}
                onClick={() => handleRequirementClick(requirement)}
                sx={{
                  cursor: onRequirementClick ? 'pointer' : 'default',
                  borderRadius: 2,
                  mb: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '&:hover': onRequirementClick ? {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                    borderColor: theme.palette.primary.main,
                  } : {},
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getStatusIcon(requirement.status)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: 600, flex: 1 }}
                      >
                        {requirement.title}
                      </Typography>
                      <Chip
                        label={requirement.priority}
                        size="small"
                        color={getPriorityColor(requirement.priority) as any}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={requirement.status}
                        size="small"
                        color={getStatusColor(requirement.status) as any}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {requirement.description && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'block', 
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {requirement.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {requirement.code} • Created: {formatDate(requirement.created_at)}
                        {requirement.author_name && ` • by ${requirement.author_name}`}
                      </Typography>
                    </Box>
                  }
                />
                
                {onRequirementClick && (
                  <ChevronRight sx={{ color: 'text.secondary', opacity: 0.5 }} />
                )}
              </ListItem>
            ))}
          </List>
        )}

        {showPagination && totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 