import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";

export interface Column<T = any> {
  id: keyof T;
  label: string;
  sortable?: boolean;
  width?: number | string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface Action<T = any> {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
  disabled?: (row: T) => boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  sortBy?: keyof T;
  sortOrder?: "asc" | "desc";
  onSort?: (column: keyof T, order: "asc" | "desc") => void;
  page?: number;
  rowsPerPage?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  getRowId?: (row: T) => string | number;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortBy,
  sortOrder = "asc",
  onSort,
  page = 0,
  rowsPerPage = 10,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  emptyMessage = "Нет данных для отображения",
  getRowId = (row: T) => row.id || "",
}: DataTableProps<T>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<T | null>(null);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange?.(data);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;

    const isSelected = selectedRows.some(
      (selected) => getRowId(selected) === getRowId(row)
    );

    if (isSelected) {
      onSelectionChange(
        selectedRows.filter((selected) => getRowId(selected) !== getRowId(row))
      );
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const handleSort = (column: keyof T) => {
    if (!onSort) return;

    const isCurrentSort = sortBy === column;
    const newOrder = isCurrentSort && sortOrder === "asc" ? "desc" : "asc";
    onSort(column, newOrder);
  };

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    row: T
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const isSelected = (row: T) =>
    selectedRows.some((selected) => getRowId(selected) === getRowId(row));

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < data.length
                    }
                    checked={
                      data.length > 0 && selectedRows.length === data.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || "left"}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortOrder : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" width={48}>
                  Действия
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                >
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                >
                  <Box py={4}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, _index) => (
                <TableRow key={getRowId(row)} selected={isSelected(row)} hover>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(row)}
                        onChange={() => handleSelectRow(row)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.id)}
                      align={column.align || "left"}
                    >
                      {column.render
                        ? column.render(row[column.id], row)
                        : row[column.id]}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuOpen(e, row)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {(totalRows !== undefined || onPageChange || onRowsPerPageChange) && (
        <TablePagination
          component="div"
          count={totalRows || data.length}
          page={page}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) =>
            onRowsPerPageChange?.(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} из ${count}`
          }
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionMenuClose}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              if (selectedRow) {
                action.onClick(selectedRow);
              }
              handleActionMenuClose();
            }}
            disabled={selectedRow ? action.disabled?.(selectedRow) : false}
          >
            {action.icon && <Box mr={1}>{action.icon}</Box>}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};
