import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuItem } from "@/shared/types";

interface NavigationState {
  sidebarOpen: boolean;
  activeMenuItem: string;
  menuItems: MenuItem[];
  breadcrumbs: { label: string; path?: string }[];
}

const initialState: NavigationState = {
  sidebarOpen: true,
  activeMenuItem: "dashboard",
  menuItems: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      path: "/dashboard",
    },
    {
      id: "projects",
      label: "Projects",
      icon: "folder",
      path: "/projects",
    },
    {
      id: "requirements",
      label: "Requirements",
      icon: "list",
      path: "/requirements",
    },
    {
      id: "releases",
      label: "Releases",
      icon: "rocket",
      path: "/releases",
    },
    {
      id: "testing",
      label: "Testing",
      icon: "bug",
      path: "/testing",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "chart",
      path: "/reports",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "settings",
      path: "/settings",
    },
  ],
  breadcrumbs: [],
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActiveMenuItem: (state, action: PayloadAction<string>) => {
      state.activeMenuItem = action.payload;
    },
    setBreadcrumbs: (
      state,
      action: PayloadAction<{ label: string; path?: string }[]>
    ) => {
      state.breadcrumbs = action.payload;
    },
    updateMenuItemBadge: (
      state,
      action: PayloadAction<{ id: string; badge?: string | number }>
    ) => {
      const menuItem = state.menuItems.find(
        (item) => item.id === action.payload.id
      );
      if (menuItem) {
        menuItem.badge = action.payload.badge;
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveMenuItem,
  setBreadcrumbs,
  updateMenuItemBadge,
} = navigationSlice.actions;
export { navigationSlice };
