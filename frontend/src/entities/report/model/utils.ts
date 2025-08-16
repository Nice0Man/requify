/**
 * Report Entity Utils - Утилиты для работы с отчетами
 */

import type { 
  Report,
  ReportType,
  ReportFormat,
  ReportStatus,
  ReportTemplate,
  ReportGenerationJob,
  ReportAnalytics,
} from './types';

// =============================================================================
// Report Type Utils
// =============================================================================

/**
 * Получение текста типа отчета на русском
 */
export function getReportTypeText(type: ReportType): string {
  const texts: Record<ReportType, string> = {
    specification: 'Спецификация',
    requirements: 'Требования',
    project_summary: 'Сводка по проекту',
    progress: 'Прогресс',
    testing: 'Тестирование',
    audit: 'Аудит',
    trace_matrix: 'Матрица трассируемости',
    custom: 'Пользовательский',
  };
  return texts[type] || type;
}

/**
 * Получение иконки типа отчета
 */
export function getReportTypeIcon(type: ReportType): string {
  const icons: Record<ReportType, string> = {
    specification: 'AssignmentIcon',
    requirements: 'EditNoteIcon',
    project_summary: 'BarChartIcon',
    progress: 'TrendingUpIcon',
    testing: 'ScienceIcon',
    audit: 'SearchIcon',
    trace_matrix: 'LinkIcon',
    custom: 'SettingsIcon',
  };
  return icons[type] || 'DescriptionIcon';
}

/**
 * Получение цвета типа отчета
 */
export function getReportTypeColor(type: ReportType): string {
  const colors: Record<ReportType, string> = {
    specification: 'blue',
    requirements: 'green',
    project_summary: 'purple',
    progress: 'orange',
    testing: 'cyan',
    audit: 'red',
    trace_matrix: 'indigo',
    custom: 'gray',
  };
  return colors[type] || 'gray';
}

// =============================================================================
// Report Format Utils
// =============================================================================

/**
 * Получение текста формата отчета на русском
 */
export function getReportFormatText(format: ReportFormat): string {
  const texts: Record<ReportFormat, string> = {
    html: 'HTML',
    pdf: 'PDF',
    docx: 'Word',
    xlsx: 'Excel',
    json: 'JSON',
    csv: 'CSV',
    xml: 'XML',
  };
  return texts[format] || format.toUpperCase();
}

/**
 * Получение иконки формата отчета
 */
export function getReportFormatIcon(format: ReportFormat): string {
  const icons: Record<ReportFormat, string> = {
    html: 'LanguageIcon',
    pdf: 'PictureAsPdfIcon',
    docx: 'DescriptionIcon',
    xlsx: 'GridOnIcon',
    json: 'DataObjectIcon',
    csv: 'TableChartIcon',
    xml: 'CodeIcon',
  };
  return icons[format] || 'DescriptionIcon';
}

/**
 * Получение MIME типа для формата
 */
export function getReportFormatMimeType(format: ReportFormat): string {
  const mimeTypes: Record<ReportFormat, string> = {
    html: 'text/html',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    json: 'application/json',
    csv: 'text/csv',
    xml: 'application/xml',
  };
  return mimeTypes[format] || 'application/octet-stream';
}

// =============================================================================
// Report Status Utils
// =============================================================================

/**
 * Получение текста статуса отчета на русском
 */
export function getReportStatusText(status: ReportStatus): string {
  const texts: Record<ReportStatus, string> = {
    pending: 'Ожидает',
    generating: 'Генерируется',
    completed: 'Готов',
    failed: 'Ошибка',
    cancelled: 'Отменен',
    expired: 'Истек',
  };
  return texts[status] || status;
}

/**
 * Получение цвета статуса отчета
 */
export function getReportStatusColor(status: ReportStatus): string {
  const colors: Record<ReportStatus, string> = {
    pending: 'yellow',
    generating: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
    expired: 'orange',
  };
  return colors[status] || 'gray';
}

/**
 * Получение иконки статуса отчета
 */
export function getReportStatusIcon(status: ReportStatus): string {
  const icons: Record<ReportStatus, string> = {
    pending: 'PendingActionsIcon',
    generating: 'SettingsIcon',
    completed: 'CheckCircleIcon',
    failed: 'ErrorIcon',
    cancelled: 'CancelIcon',
    expired: 'AccessTimeIcon',
  };
  return icons[status] || 'DescriptionIcon';
}

// =============================================================================
// Report Status Checks
// =============================================================================

/**
 * Проверка готовности отчета
 */
export function isReportReady(report: Report): boolean {
  return report.status === 'completed' && !!report.download_url;
}

/**
 * Проверка процесса генерации отчета
 */
export function isReportGenerating(report: Report): boolean {
  return ['pending', 'generating'].includes(report.status);
}

/**
 * Проверка ошибки генерации отчета
 */
export function hasReportFailed(report: Report): boolean {
  return report.status === 'failed';
}

/**
 * Проверка истечения срока отчета
 */
export function isReportExpired(report: Report): boolean {
  if (report.status === 'expired') return true;
  if (!report.expires_at) return false;
  return new Date(report.expires_at) < new Date();
}

/**
 * Проверка возможности скачивания отчета
 */
export function canDownloadReport(report: Report): boolean {
  return isReportReady(report) && !isReportExpired(report);
}

// =============================================================================
// File Size Utils
// =============================================================================

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return 'Неизвестно';

  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

/**
 * Получение класса цвета для размера файла
 */
export function getFileSizeColorClass(bytes?: number): string {
  if (!bytes) return 'text-gray-500';
  
  const mb = bytes / (1024 * 1024);
  
  if (mb < 1) return 'text-green-600';
  if (mb < 10) return 'text-blue-600';
  if (mb < 50) return 'text-yellow-600';
  if (mb < 100) return 'text-orange-600';
  return 'text-red-600';
}

// =============================================================================
// Time Utils
// =============================================================================

/**
 * Форматирование времени генерации
 */
export function formatGenerationTime(milliseconds?: number): string {
  if (!milliseconds) return 'Неизвестно';

  if (milliseconds < 1000) {
    return `${milliseconds}мс`;
  }

  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}с`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}м ${remainingSeconds}с` : `${minutes}м`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}м` : `${hours}ч`;
}

/**
 * Получение времени до истечения срока
 */
export function getTimeUntilExpiration(expiresAt?: string): string | null {
  if (!expiresAt) return null;

  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return 'Истек';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  return `${minutes}м`;
}

// =============================================================================
// Template Utils
// =============================================================================

/**
 * Проверка публичности шаблона
 */
export function isTemplatePublic(template: ReportTemplate): boolean {
  return template.is_public;
}

/**
 * Проверка шаблона по умолчанию
 */
export function isDefaultTemplate(template: ReportTemplate): boolean {
  return template.is_default;
}

/**
 * Получение популярности шаблона
 */
export function getTemplatePopularityText(usageCount?: number): string {
  if (!usageCount || usageCount === 0) return 'Не использовался';
  if (usageCount === 1) return '1 использование';
  if (usageCount < 5) return `${usageCount} использования`;
  if (usageCount < 10) return `${usageCount} использований`;
  if (usageCount < 50) return 'Популярный';
  return 'Очень популярный';
}

// =============================================================================
// Generation Job Utils
// =============================================================================

/**
 * Получение текста статуса задачи генерации
 */
export function getJobStatusText(status: ReportGenerationJob['status']): string {
  const texts = {
    queued: 'В очереди',
    processing: 'Обрабатывается',
    completed: 'Завершено',
    failed: 'Ошибка',
    cancelled: 'Отменено',
  };
  return texts[status] || status;
}

/**
 * Получение оценочного времени завершения
 */
export function getEstimatedCompletion(job: ReportGenerationJob): string | null {
  if (!job.estimated_completion) return null;
  
  const now = new Date();
  const estimated = new Date(job.estimated_completion);
  const diffMs = estimated.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Скоро';
  
  const minutes = Math.ceil(diffMs / (1000 * 60));
  if (minutes === 1) return '~1 минута';
  if (minutes < 60) return `~${minutes} минут`;
  
  const hours = Math.ceil(minutes / 60);
  return `~${hours} часов`;
}

// =============================================================================
// Analytics Utils
// =============================================================================

/**
 * Расчет среднего размера файлов по типу отчета
 */
export function calculateAverageFileSize(
  reports: Report[],
  type?: ReportType
): number {
  const filteredReports = type 
    ? reports.filter(r => r.type === type && r.file_size)
    : reports.filter(r => r.file_size);
  
  if (filteredReports.length === 0) return 0;
  
  const totalSize = filteredReports.reduce((sum, r) => sum + (r.file_size || 0), 0);
  return Math.round(totalSize / filteredReports.length);
}

/**
 * Группировка отчетов по дате
 */
export function groupReportsByDate(reports: Report[]): Record<string, Report[]> {
  return reports.reduce((groups, report) => {
    const date = report.created_at.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(report);
    return groups;
  }, {} as Record<string, Report[]>);
}

/**
 * Расчет тренда генерации отчетов
 */
export function calculateReportTrend(reports: Report[], days: number = 7): {
  date: string;
  count: number;
  avgSize: number;
  avgTime: number;
}[] {
  const grouped = groupReportsByDate(reports);
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayReports = grouped[dateStr] || [];
    const count = dayReports.length;
    const avgSize = count > 0 ? calculateAverageFileSize(dayReports) : 0;
    
    // Расчет среднего времени генерации (заглушка)
    const avgTime = count > 0 ? 5000 : 0; // TODO: добавить реальные данные
    
    result.push({
      date: dateStr,
      count,
      avgSize,
      avgTime,
    });
  }

  return result;
}

// =============================================================================
// Sorting and Filtering Utils
// =============================================================================

/**
 * Сортировка отчетов
 */
export function sortReports(
  reports: Report[],
  sortBy: 'created_at' | 'updated_at' | 'generated_at' | 'file_size' | 'name',
  order: 'asc' | 'desc' = 'desc'
): Report[] {
  return [...reports].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'created_at':
      case 'updated_at':
      case 'generated_at':
        aValue = new Date(a[sortBy]);
        bValue = new Date(b[sortBy]);
        break;
      case 'file_size':
        aValue = a.file_size || 0;
        bValue = b.file_size || 0;
        break;
      case 'name':
        aValue = (a.name || 'Без названия').toLowerCase();
        bValue = (b.name || 'Без названия').toLowerCase();
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
 * Фильтрация отчетов
 */
export function filterReports(
  reports: Report[],
  filters: {
    search?: string;
    type?: ReportType;
    format?: ReportFormat;
    status?: ReportStatus;
    project_id?: number;
    generated_by?: number;
    date_from?: string;
    date_to?: string;
    include_expired?: boolean;
  }
): Report[] {
  return reports.filter(report => {
    // Поиск по названию и описанию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        report.name?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower) ||
        report.project_name?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Фильтр по типу
    if (filters.type && report.type !== filters.type) {
      return false;
    }

    // Фильтр по формату
    if (filters.format && report.format !== filters.format) {
      return false;
    }

    // Фильтр по статусу
    if (filters.status && report.status !== filters.status) {
      return false;
    }

    // Фильтр по проекту
    if (filters.project_id && report.project_id !== filters.project_id) {
      return false;
    }

    // Фильтр по автору
    if (filters.generated_by && report.generated_by_user?.id !== filters.generated_by) {
      return false;
    }

    // Фильтр по дате создания
    if (filters.date_from && report.created_at < filters.date_from) {
      return false;
    }

    if (filters.date_to && report.created_at > filters.date_to) {
      return false;
    }

    // Фильтр истекших отчетов
    if (!filters.include_expired && isReportExpired(report)) {
      return false;
    }

    return true;
  });
}