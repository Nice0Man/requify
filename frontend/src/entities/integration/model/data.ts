import type { IntegrationCategory } from "./types";

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: "development",
    name: "Разработка",
    description: "Инструменты для разработчиков и DevOps",
    color: "#2196F3",
  },
  {
    id: "communication",
    name: "Коммуникации",
    description: "Инструменты для командного общения",
    color: "#4CAF50",
  },
  {
    id: "management",
    name: "Управление",
    description: "Системы управления проектами",
    color: "#FF9800",
  },
  {
    id: "security",
    name: "Безопасность",
    description: "Инструменты безопасности и аутентификации",
    color: "#9C27B0",
  },
];
