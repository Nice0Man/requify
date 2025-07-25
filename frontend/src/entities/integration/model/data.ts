import {
  GitHub,
  Chat as SlackIcon,
  Assignment as JiraIcon,
  VideoCall as TeamsIcon,
  Videocam as ZoomIcon,
  Api as ApiIcon,
  Security as SSOIcon,
  CloudSync as WebhooksIcon,
  Code,
  Business,
  Security,
  Devices,
} from "@mui/icons-material";
import type { Integration, IntegrationCategory } from "./types";

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: "development",
    name: "Разработка",
    description: "Инструменты для разработчиков и DevOps",
    color: "#2196F3",
    icon: Code,
  },
  {
    id: "communication",
    name: "Коммуникации",
    description: "Инструменты для командного общения",
    color: "#4CAF50",
    icon: Business,
  },
  {
    id: "management",
    name: "Управление",
    description: "Системы управления проектами",
    color: "#FF9800",
    icon: Business,
  },
  {
    id: "security",
    name: "Безопасность",
    description: "Инструменты безопасности и аутентификации",
    color: "#9C27B0",
    icon: Security,
  },
];

export const INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    category: "development",
    description: "Синхронизация требований с репозиториями и pull requests",
    icon: GitHub,
    color: "#181717",
    popular: true,
    connections: "2.3M+",
    status: "active",
    features: ["Pull Requests", "Issues", "Actions", "Webhooks"],
  },
  {
    id: "slack",
    name: "Slack",
    category: "communication",
    description: "Уведомления в реальном времени и командная работа",
    icon: SlackIcon,
    color: "#4A154B",
    popular: true,
    connections: "1.8M+",
    status: "active",
    features: ["Channels", "Direct Messages", "Notifications", "Bot Integration"],
  },
  {
    id: "jira",
    name: "Jira",
    category: "management",
    description: "Бесшовное управление проектами и отслеживание задач",
    icon: JiraIcon,
    color: "#0052CC",
    popular: true,
    connections: "950K+",
    status: "active",
    features: ["Issues", "Sprints", "Boards", "Reports"],
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    category: "communication",
    description: "Совместная работа в каналах Teams и встречах",
    icon: TeamsIcon,
    color: "#6264A7",
    popular: false,
    connections: "750K+",
    status: "active",
    features: ["Channels", "Meetings", "Files", "Calls"],
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "communication", 
    description: "Запись требований во время видеозвонков",
    icon: ZoomIcon,
    color: "#2D8CFF",
    popular: false,
    connections: "480K+",
    status: "active",
    features: ["Meetings", "Recordings", "Webinars", "Phone"],
  },
  {
    id: "api",
    name: "REST API",
    category: "development",
    description: "Подключение любых инструментов через мощный API",
    icon: ApiIcon,
    color: "#FF6B35",
    popular: false,
    connections: "300K+",
    status: "active",
    features: ["REST", "GraphQL", "Webhooks", "SDK"],
  },
  {
    id: "sso",
    name: "SSO",
    category: "security",
    description: "Единый вход для корпоративных решений",
    icon: SSOIcon,
    color: "#9C27B0",
    popular: false,
    connections: "200K+",
    status: "active",
    features: ["SAML", "OAuth", "LDAP", "Active Directory"],
  },
  {
    id: "webhooks",
    name: "Webhooks",
    category: "development",
    description: "Синхронизация данных в реальном времени через webhooks",
    icon: WebhooksIcon,
    color: "#4CAF50",
    popular: false,
    connections: "150K+",
    status: "active",
    features: ["Real-time", "Custom Events", "Retry Logic", "Security"],
  },
];

export const getIntegrationById = (id: string): Integration | undefined => {
  return INTEGRATIONS.find(integration => integration.id === id);
};

export const getIntegrationsByCategory = (categoryId: string): Integration[] => {
  return INTEGRATIONS.filter(integration => integration.category === categoryId);
};

export const getPopularIntegrations = (): Integration[] => {
  return INTEGRATIONS.filter(integration => integration.popular);
};

export const getCategoryById = (id: string): IntegrationCategory | undefined => {
  return INTEGRATION_CATEGORIES.find(category => category.id === id);
}; 