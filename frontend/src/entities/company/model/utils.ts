/**
 * Company Entity Utils - Утилиты для работы с компаниями
 */

import type { 
  Company, 
  CompanyType, 
  CompanyStatus, 
  SubscriptionPlan, 
  SubscriptionStatus,
  CompanySubscription,
} from './types';

// =============================================================================
// Company Status Utils
// =============================================================================

/**
 * Проверка активности компании
 */
export function isCompanyActive(company: Company): boolean {
  return company.is_active && company.status === 'active';
}

/**
 * Проверка возможности редактирования компании
 */
export function canEditCompany(company: Company): boolean {
  return company.status !== 'archived' && company.is_active;
}

/**
 * Получение цвета статуса компании для UI
 */
export function getCompanyStatusColor(status: CompanyStatus): string {
  const colors: Record<CompanyStatus, string> = {
    active: 'green',
    trial: 'blue',
    suspended: 'orange',
    inactive: 'gray',
    archived: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Получение текста статуса компании на русском
 */
export function getCompanyStatusText(status: CompanyStatus): string {
  const texts: Record<CompanyStatus, string> = {
    active: 'Активная',
    trial: 'Пробный период',
    suspended: 'Приостановлена',
    inactive: 'Неактивная',
    archived: 'Архивирована',
  };
  return texts[status] || status;
}

/**
 * Получение текста типа компании на русском
 */
export function getCompanyTypeText(type: CompanyType): string {
  const texts: Record<CompanyType, string> = {
    startup: 'Стартап',
    small_business: 'Малый бизнес',
    medium_business: 'Средний бизнес',
    enterprise: 'Корпорация',
    non_profit: 'Некоммерческая',
    government: 'Государственная',
    educational: 'Образовательная',
  };
  return texts[type] || type;
}

/**
 * Alias для getCompanyTypeText для обратной совместимости
 */
export const getCompanyTypeLabel = getCompanyTypeText;

// =============================================================================
// Company Subscription Utils  
// =============================================================================

/**
 * Проверка активности подписки
 */
export function isSubscriptionActive(subscription: CompanySubscription): boolean {
  return subscription.status === 'active' || subscription.status === 'trial';
}

/**
 * Проверка истечения пробного периода
 */
export function isTrialExpired(subscription: CompanySubscription): boolean {
  if (!subscription.trial_end) return false;
  return new Date(subscription.trial_end) < new Date();
}

/**
 * Получение оставшихся дней пробного периода
 */
export function getTrialDaysRemaining(subscription: CompanySubscription): number {
  if (!subscription.trial_end) return 0;
  const trialEnd = new Date(subscription.trial_end);
  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Получение текста плана подписки на русском
 */
export function getSubscriptionPlanText(plan: SubscriptionPlan): string {
  const texts: Record<SubscriptionPlan, string> = {
    free: 'Бесплатный',
    starter: 'Стартер',
    professional: 'Профессиональный',
    enterprise: 'Корпоративный',
    custom: 'Индивидуальный',
  };
  return texts[plan] || plan;
}

/**
 * Получение текста статуса подписки на русском
 */
export function getSubscriptionStatusText(status: SubscriptionStatus): string {
  const texts: Record<SubscriptionStatus, string> = {
    active: 'Активная',
    trial: 'Пробный период',
    past_due: 'Просрочена',
    canceled: 'Отменена',
    incomplete: 'Незавершена',
  };
  return texts[status] || status;
}

/**
 * Получение цвета статуса подписки для UI
 */
export function getSubscriptionStatusColor(status: SubscriptionStatus): string {
  const colors: Record<SubscriptionStatus, string> = {
    active: 'green',
    trial: 'blue',
    past_due: 'orange',
    canceled: 'red',
    incomplete: 'gray',
  };
  return colors[status] || 'gray';
}

// =============================================================================
// Company Data Utils
// =============================================================================

/**
 * Генерация slug из названия компании
 */
export function generateCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Удаляем специальные символы
    .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
    .replace(/-+/g, '-') // Удаляем повторяющиеся дефисы
    .trim()
    .replace(/^-|-$/g, ''); // Удаляем дефисы в начале и конце
}

/**
 * Форматирование размера компании по количеству сотрудников
 */
export function formatCompanySize(employeeCount?: number): string {
  if (!employeeCount) return 'Не указано';
  
  if (employeeCount <= 10) return 'Микро (1-10)';
  if (employeeCount <= 50) return 'Малая (11-50)';
  if (employeeCount <= 250) return 'Средняя (51-250)';
  if (employeeCount <= 1000) return 'Крупная (251-1000)';
  return 'Очень крупная (1000+)';
}

/**
 * Форматирование количества сотрудников для отображения в UI
 */
export function formatEmployeeCount(count?: number): string {
  if (!count || count === 0) return '0 сотрудников';
  if (count === 1) return '1 сотрудник';
  if (count >= 2 && count <= 4) return `${count} сотрудника`;
  return `${count} сотрудников`;
}

/**
 * Получение инициалов компании для аватара
 */
export function getCompanyInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Проверка доступности функции по плану подписки
 */
export function isFeatureAvailable(
  subscription: CompanySubscription,
  feature: string
): boolean {
  return subscription.features.includes(feature);
}

/**
 * Проверка лимитов подписки
 */
export function checkSubscriptionLimits(
  subscription: CompanySubscription,
  currentUsage: {
    users: number;
    projects: number;
    storageGb: number;
  }
): {
  users: { exceeded: boolean; percentage: number };
  projects: { exceeded: boolean; percentage: number };
  storage: { exceeded: boolean; percentage: number };
} {
  return {
    users: {
      exceeded: currentUsage.users > subscription.max_users,
      percentage: (currentUsage.users / subscription.max_users) * 100,
    },
    projects: {
      exceeded: currentUsage.projects > subscription.max_projects,
      percentage: (currentUsage.projects / subscription.max_projects) * 100,
    },
    storage: {
      exceeded: currentUsage.storageGb > subscription.max_storage_gb,
      percentage: (currentUsage.storageGb / subscription.max_storage_gb) * 100,
    },
  };
}

// =============================================================================
// Sorting and Filtering Utils
// =============================================================================

/**
 * Сортировка компаний
 */
export function sortCompanies(
  companies: Company[],
  sortBy: 'name' | 'created_at' | 'updated_at' | 'employee_count',
  order: 'asc' | 'desc' = 'asc'
): Company[] {
  return [...companies].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created_at':
      case 'updated_at':
        aValue = new Date(a[sortBy]);
        bValue = new Date(b[sortBy]);
        break;
      case 'employee_count':
        aValue = a.employee_count || 0;
        bValue = b.employee_count || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Фильтрация компаний
 */
export function filterCompanies(
  companies: Company[],
  filters: {
    search?: string;
    type?: CompanyType;
    status?: CompanyStatus;
    industry?: string;
  }
): Company[] {
  return companies.filter(company => {
    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        company.name.toLowerCase().includes(searchLower) ||
        company.legal_name?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Фильтр по типу
    if (filters.type && company.type !== filters.type) {
      return false;
    }

    // Фильтр по статусу
    if (filters.status && company.status !== filters.status) {
      return false;
    }

    // Фильтр по индустрии
    if (filters.industry && company.industry !== filters.industry) {
      return false;
    }

    return true;
  });
}