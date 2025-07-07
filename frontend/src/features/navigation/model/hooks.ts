import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import { setActiveMenuItem, toggleSidebar, setBreadcrumbs } from "./store";
import { BreadcrumbItem } from "./types";

export const useNavigation = () => {
  const dispatch = useDispatch();
  const { menuItems, activeMenuItem, sidebarOpen, breadcrumbs } = useSelector(
    (state: RootState) => state.navigation
  );

  const setActive = (itemId: string) => {
    dispatch(setActiveMenuItem(itemId));
  };

  const toggleSidebar = () => {
    dispatch(toggleSidebar() as any);
  };

  const updateBreadcrumbs = (items: BreadcrumbItem[]) => {
    dispatch(setBreadcrumbs(items.map(item => ({
      label: item.title,
      path: item.path
    }))));
  };

  return {
    menuItems,
    activeMenuItem,
    sidebarOpen,
    breadcrumbs,
    setActive,
    toggleSidebar,
    updateBreadcrumbs,
  };
};
