import React, { memo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ButtonGroup,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreIcon,
  PlayArrow as ExecuteIcon,
  CheckCircle as PassedIcon,
  Cancel as FailedIcon,
  Block as BlockedIcon,
  SkipNext as SkippedIcon,
  Schedule as InProgressIcon,
  HelpOutline as NotExecutedIcon,
} from '@mui/icons-material';
import type { 
  TestCase, 
  TestCaseResult, 
  TestExecutionStatus,
  TestCasePriority,
  TestCaseStatus 
} from '../model/types';

export interface TestCaseCardProps {
  /** Данные тест-кейса */
  testCase: TestCase;
  /** Результат выполнения (опционально) */
  result?: TestCaseResult;
  /** Обработчик клика по карточке */
  onClick?: (testCase: TestCase) => void;
  /** Обработчик меню действий */
  onMenuClick?: (event: React.MouseEvent, testCase: TestCase) => void;
  /** Обработчик выполнения теста */
  onExecute?: (testCase: TestCase, status: TestExecutionStatus) => void;
  /** Показывать ли кнопки выполнения */
  showExecutionControls?: boolean;
  /** Показывать ли детали */
  showDetails?: boolean;
  /** Компактный режим */
  compact?: boolean;
}

/**
 * Получение цвета приоритета
 */
const getPriorityColor = (priority: TestCasePriority): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (priority) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'default';
    default: return 'default';
  }
};

/**
 * Получение цвета статуса
 */
const getStatusColor = (status: TestCaseStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'active': return 'success';
    case 'draft': return 'warning';
    case 'deprecated': return 'default';
    default: return 'default';
  }
};

/**
 * Получение иконки и цвета статуса выполнения
 */
const getExecutionStatusProps = (status?: TestExecutionStatus) => {
  switch (status) {
    case 'passed':
      return { icon: <PassedIcon />, color: 'success', label: 'Прошел' };
    case 'failed':
      return { icon: <FailedIcon />, color: 'error', label: 'Провалился' };
    case 'blocked':
      return { icon: <BlockedIcon />, color: 'warning', label: 'Заблокирован' };
    case 'skipped':
      return { icon: <SkippedIcon />, color: 'info', label: 'Пропущен' };
    case 'in_progress':
      return { icon: <InProgressIcon />, color: 'primary', label: 'Выполняется' };
    case 'not_executed':
    default:
      return { icon: <NotExecutedIcon />, color: 'default', label: 'Не выполнен' };
  }
};

/**
 * Компонент карточки тест-кейса
 * Отображает информацию о тест-кейсе и статус выполнения
 */
export const TestCaseCard = memo<TestCaseCardProps>(({
  testCase,
  result,
  onClick,
  onMenuClick,
  onExecute,
  showExecutionControls = false,
  showDetails = false,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(showDetails);
  const [executing, setExecuting] = useState(false);

  const executionStatus = result?.execution?.status || result?.lastExecution?.status || 'not_executed';
  const executionProps = getExecutionStatusProps(executionStatus);

  const handleCardClick = () => {
    onClick?.(testCase);
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onMenuClick?.(event, testCase);
  };

  const handleExecute = async (status: TestExecutionStatus) => {
    if (!onExecute) return;
    
    setExecuting(true);
    try {
      await onExecute(testCase, status);
    } finally {
      setExecuting(false);
    }
  };

  const handleExpandClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        '&:hover': onClick ? {
          boxShadow: 2,
          transform: 'translateY(-1px)',
        } : undefined,
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ pb: compact ? 1 : 2 }}>
        {/* Заголовок и статусы */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flex={1}>
            <Typography 
              variant={compact ? "body1" : "h6"} 
              component="h3"
              sx={{ 
                fontWeight: 600,
                mb: 0.5,
                wordBreak: 'break-word',
              }}
            >
              {testCase.title}
            </Typography>
            
            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
              <Chip
                label={testCase.priority}
                size="small"
                color={getPriorityColor(testCase.priority)}
                variant="outlined"
              />
              <Chip
                label={testCase.status}
                size="small"
                color={getStatusColor(testCase.status)}
              />
              <Chip
                icon={executionProps.icon}
                label={executionProps.label}
                size="small"
                color={executionProps.color as any}
                variant="filled"
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center">
            {!compact && (
              <Tooltip title={expanded ? "Свернуть" : "Развернуть"}>
                <IconButton size="small" onClick={handleExpandClick}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Действия">
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Описание */}
        {testCase.description && !compact && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'none' : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {testCase.description}
          </Typography>
        )}

        {/* Статистика выполнения */}
        {result && !compact && (
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Выполнений: {result.totalExecutions}
            </Typography>
            {result.passRate > 0 && (
              <Typography variant="caption" color="success.main">
                Успех: {Math.round(result.passRate * 100)}%
              </Typography>
            )}
          </Box>
        )}

        {/* Кнопки выполнения */}
        {showExecutionControls && !compact && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <ButtonGroup size="small" disabled={executing}>
                <Button
                  startIcon={<PassedIcon />}
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecute('passed');
                  }}
                >
                  Pass
                </Button>
                <Button
                  startIcon={<FailedIcon />}
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecute('failed');
                  }}
                >
                  Fail
                </Button>
                <Button
                  startIcon={<BlockedIcon />}
                  color="warning"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecute('blocked');
                  }}
                >
                  Block
                </Button>
              </ButtonGroup>

              <Button
                startIcon={<ExecuteIcon />}
                variant="outlined"
                size="small"
                disabled={executing}
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute('in_progress');
                }}
              >
                Выполнить
              </Button>
            </Box>
          </>
        )}

        {/* Развернутые детали */}
        <Collapse in={expanded && !compact}>
          <Box mt={2}>
            {testCase.steps.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Шаги выполнения:
                </Typography>
                <List dense>
                  {testCase.steps.map((step, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={`${index + 1}. ${step}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {testCase.expectedResult && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Ожидаемый результат:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {testCase.expectedResult}
                </Typography>
              </>
            )}

            {result?.execution?.notes && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Заметки по выполнению:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.execution.notes}
                </Typography>
              </>
            )}
          </Box>
        </Collapse>

        {/* Метаданные */}
        {!compact && (
          <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              ID: {testCase.requirementId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(testCase.createdAt).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

TestCaseCard.displayName = 'TestCaseCard'; 