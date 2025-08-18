import { DemoProject, DemoUser, DemoRequirement, DemoTest, DemoMetrics, DemoActivity } from './types';

// Демо-пользователи
export const demoUsers: DemoUser[] = [
  {
    id: '1',
    name: 'Анна Петрова',
    role: 'admin',
    email: 'anna.petrova@example.com',
    isOnline: true,
    avatar: '/avatars/anna.jpg'
  },
  {
    id: '2',
    name: 'Михаил Сидоров',
    role: 'project_manager',
    email: 'mikhail.sidorov@example.com',
    isOnline: true,
    avatar: '/avatars/mikhail.jpg'
  },
  {
    id: '3',
    name: 'Елена Иванова',
    role: 'analyst',
    email: 'elena.ivanova@example.com',
    isOnline: false,
    avatar: '/avatars/elena.jpg'
  },
  {
    id: '4',
    name: 'Дмитрий Козлов',
    role: 'developer',
    email: 'dmitry.kozlov@example.com',
    isOnline: true,
    avatar: '/avatars/dmitry.jpg'
  },
  {
    id: '5',
    name: 'Ольга Смирнова',
    role: 'tester',
    email: 'olga.smirnova@example.com',
    isOnline: false,
    avatar: '/avatars/olga.jpg'
  }
];

// Демо-проекты
export const demoProjects: DemoProject[] = [
  {
    id: '1',
    name: 'E-commerce платформа',
    description: 'Разработка современной платформы электронной коммерции с интеграцией платежных систем',
    status: 'active',
    progress: 75,
    requirementsCount: 45,
    testsCount: 120,
    team: [demoUsers[0], demoUsers[1], demoUsers[2], demoUsers[3]],
    startDate: '2024-01-15',
    endDate: '2024-06-30'
  },
  {
    id: '2',
    name: 'Мобильное приложение',
    description: 'Создание кроссплатформенного мобильного приложения для управления задачами',
    status: 'planning',
    progress: 25,
    requirementsCount: 32,
    testsCount: 85,
    team: [demoUsers[1], demoUsers[3], demoUsers[4]],
    startDate: '2024-03-01',
    endDate: '2024-08-15'
  },
  {
    id: '3',
    name: 'CRM система',
    description: 'Система управления взаимоотношениями с клиентами для средних компаний',
    status: 'completed',
    progress: 100,
    requirementsCount: 28,
    testsCount: 95,
    team: [demoUsers[0], demoUsers[2], demoUsers[4]],
    startDate: '2023-09-01',
    endDate: '2024-01-20'
  }
];

// Демо-требования
export const demoRequirements: DemoRequirement[] = [
  {
    id: '1',
    title: 'Авторизация пользователей',
    description: 'Реализация системы входа и регистрации пользователей с поддержкой OAuth',
    type: 'functional',
    priority: 'high',
    status: 'implemented',
    assignee: demoUsers[3],
    projectId: '1',
    createdDate: '2024-01-20',
    dueDate: '2024-02-15',
    progress: 100
  },
  {
    id: '2',
    title: 'Корзина покупок',
    description: 'Функциональность добавления товаров в корзину и управления заказами',
    type: 'functional',
    priority: 'high',
    status: 'tested',
    assignee: demoUsers[3],
    projectId: '1',
    createdDate: '2024-02-01',
    dueDate: '2024-03-01',
    progress: 100
  },
  {
    id: '3',
    title: 'Производительность загрузки',
    description: 'Время загрузки страниц не должно превышать 2 секунд',
    type: 'non-functional',
    priority: 'medium',
    status: 'review',
    assignee: demoUsers[4],
    projectId: '1',
    createdDate: '2024-02-15',
    dueDate: '2024-03-15',
    progress: 60
  },
  {
    id: '4',
    title: 'API документация',
    description: 'Создание подробной документации для REST API',
    type: 'technical',
    priority: 'medium',
    status: 'draft',
    assignee: demoUsers[2],
    projectId: '2',
    createdDate: '2024-03-01',
    dueDate: '2024-04-01',
    progress: 30
  }
];

// Демо-тесты
export const demoTests: DemoTest[] = [
  {
    id: '1',
    title: 'Тест авторизации пользователя',
    status: 'passed',
    requirementId: '1',
    executedBy: demoUsers[4],
    executedDate: '2024-02-20'
  },
  {
    id: '2',
    title: 'Тест добавления товара в корзину',
    status: 'passed',
    requirementId: '2',
    executedBy: demoUsers[4],
    executedDate: '2024-03-05'
  },
  {
    id: '3',
    title: 'Нагрузочное тестирование',
    status: 'failed',
    requirementId: '3',
    executedBy: demoUsers[4],
    executedDate: '2024-03-10'
  }
];

// Демо-метрики
export const demoMetrics: DemoMetrics = {
  totalProjects: 3,
  activeProjects: 1,
  totalRequirements: 105,
  completedRequirements: 78,
  totalTests: 300,
  passedTests: 265,
  teamMembers: 5,
  avgProjectCompletion: 66.7
};

// Демо-активность
export const demoActivities: DemoActivity[] = [
  {
    id: '1',
    type: 'requirement_updated',
    title: 'Требование обновлено',
    description: 'Обновлено требование "API документация"',
    user: demoUsers[2],
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 минут назад
    projectId: '2',
    requirementId: '4'
  },
  {
    id: '2',
    type: 'test_executed',
    title: 'Тест выполнен',
    description: 'Выполнено нагрузочное тестирование',
    user: demoUsers[4],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
    projectId: '1',
    requirementId: '3'
  },
  {
    id: '3',
    type: 'user_joined',
    title: 'Новый участник',
    description: 'Дмитрий Козлов присоединился к проекту',
    user: demoUsers[3],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 часа назад
    projectId: '1'
  },
  {
    id: '4',
    type: 'project_created',
    title: 'Проект создан',
    description: 'Создан новый проект "Мобильное приложение"',
    user: demoUsers[1],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
    projectId: '2'
  }
]; 