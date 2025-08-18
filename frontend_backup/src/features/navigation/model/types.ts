export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  badge?: number;
  children?: NavigationItem[];
}

export interface NavigationState {
  items: NavigationItem[];
  activeItem: string | null;
  isCollapsed: boolean;
  breadcrumbs: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  title: string;
  path?: string;
}
