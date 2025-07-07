// Common UI types
export interface Option {
  value: string | number;
  label: string;
}

export interface TabItem {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

export interface Column {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
} 