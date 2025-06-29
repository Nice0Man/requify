import { format, parseISO, formatDistanceToNow, isValid } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: string | Date, pattern = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, pattern) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatTimeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

// Text formatting utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Number formatting utilities
export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Status formatting utilities
export const formatStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'success' },
    inactive: { label: 'Inactive', color: 'default' },
    pending: { label: 'Pending', color: 'warning' },
    completed: { label: 'Completed', color: 'success' },
    cancelled: { label: 'Cancelled', color: 'error' },
    draft: { label: 'Draft', color: 'info' },
    published: { label: 'Published', color: 'success' },
    archived: { label: 'Archived', color: 'default' },
  };
  
  return statusMap[status.toLowerCase()] || { label: capitalizeFirst(status), color: 'default' };
};

export const formatPriority = (priority: string): { label: string; color: string } => {
  const priorityMap: Record<string, { label: string; color: string }> = {
    low: { label: 'Low', color: 'success' },
    medium: { label: 'Medium', color: 'warning' },
    high: { label: 'High', color: 'error' },
    critical: { label: 'Critical', color: 'error' },
  };
  
  return priorityMap[priority.toLowerCase()] || { label: capitalizeFirst(priority), color: 'default' };
};

// Array formatting utilities
export const formatList = (items: string[], maxItems = 3): string => {
  if (items.length === 0) return '';
  if (items.length <= maxItems) return items.join(', ');
  
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  
  return `${visible.join(', ')} and ${remaining} more`;
};

// URL formatting utilities
export const formatUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://${url}`;
};

export const extractDomain = (url: string): string => {
  try {
    const domain = new URL(formatUrl(url)).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}; 