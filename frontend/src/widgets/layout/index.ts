// Основной layout виджет
export { MainLayout } from "./ui/MainLayout";

// Хуки и модель
export { useLayout } from "./model/useLayout";

// Типы
export type {
  LayoutConfig,
  LayoutState,
  MainLayoutProps,
  PageTitleMap,
  UseLayoutReturn,
} from "./model";

// Константы
export {
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_PAGE_TITLES,
} from "./model"; 