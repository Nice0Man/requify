import type { Integration, CarouselConfig } from "./types";

export const DEFAULT_CAROUSEL_CONFIG: CarouselConfig = {
  autoPlayInterval: 3500,
  visibleCards: {
    mobile: 1.2,
    tablet: 2.5,
    desktop: 4.5,
  },
  cardSpacing: {
    mobile: 16,
    tablet: 20,
    desktop: 24,
  },
  blurRadius: 2, // Уменьшили с 8 до 2 для более мягкого эффекта
  cloneCount: 3,
  dragThreshold: 30, // Уменьшили для более отзывчивого скроллинга
  transitionDuration: 500,
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "github",
    title: "GitHub",
    description: "Синхронизация требований с репозиториями и pull requests",
    icon: "GitHub",
    connections: "2.3M+ подключений",
    category: "development",
    color: "#181717",
    gradient: "linear-gradient(135deg, #333 0%, #666 100%)",
    isPopular: true,
    order: 1,
    features: ["Pull Requests", "Issues", "Actions", "Webhooks"],
    status: "active",
  },
  {
    id: "slack",
    title: "Slack",
    description: "Уведомления в реальном времени и командная работа",
    icon: "Chat",
    connections: "1.8M+ подключений",
    category: "communication",
    color: "#4a154b",
    gradient: "linear-gradient(135deg, #4a154b 0%, #7b2d8e 100%)",
    isPopular: true,
    order: 2,
    features: [
      "Channels",
      "Direct Messages",
      "Notifications",
      "Bot Integration",
    ],
    status: "active",
  },
  {
    id: "jira",
    title: "Jira",
    description: "Бесшовное управление проектами и отслеживание задач",
    icon: "Assignment",
    connections: "950K+ подключений",
    category: "management",
    color: "#0052cc",
    gradient: "linear-gradient(135deg, #0052cc 0%, #2684ff 100%)",
    isPopular: true,
    order: 3,
    features: ["Issues", "Sprints", "Boards", "Reports"],
    status: "active",
  },
  {
    id: "rest-api",
    title: "REST API",
    description: "Подключение любых инструментов через мощный API",
    icon: "Api",
    connections: "300K+ подключений",
    category: "development",
    color: "#1976d2",
    gradient: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
    order: 4,
    features: ["REST", "GraphQL", "Webhooks", "SDK"],
    status: "active",
  },
  {
    id: "sso",
    title: "SSO",
    description: "Единый вход для корпоративных решений",
    icon: "Security",
    connections: "200K+ подключений",
    category: "security",
    color: "#388e3c",
    gradient: "linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)",
    order: 5,
    features: ["SAML", "OAuth", "LDAP", "Active Directory"],
    status: "active",
  },
  {
    id: "webhooks",
    title: "Webhooks",
    description: "Синхронизация данных в реальном времени через webhooks",
    icon: "CloudSync",
    connections: "150K+ подключений",
    category: "development",
    color: "#f57c00",
    gradient: "linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)",
    order: 6,
    features: ["Real-time", "Custom Events", "Retry Logic", "Security"],
    status: "active",
  },
  {
    id: "teams",
    title: "Microsoft Teams",
    description: "Интеграция с корпоративными коммуникациями",
    icon: "Groups",
    connections: "1.2M+ подключений",
    category: "communication",
    color: "#6264a7",
    gradient: "linear-gradient(135deg, #6264a7 0%, #8b8cc7 100%)",
    order: 7,
    features: ["Channels", "Meetings", "Files", "Calls"],
    status: "active",
  },
  {
    id: "confluence",
    title: "Confluence",
    description: "Синхронизация документации и знаний",
    icon: "Description",
    connections: "800K+ подключений",
    category: "management",
    color: "#172b4d",
    gradient: "linear-gradient(135deg, #172b4d 0%, #253858 100%)",
    order: 8,
    features: ["Documentation", "Knowledge Base", "Collaboration", "Templates"],
    status: "active",
  },
];

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  },
  carousel: {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  },
  controls: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.4,
      },
    },
  },
} as const;
