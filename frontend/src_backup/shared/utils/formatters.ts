import { format, parseISO, isValid, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    
    const now = new Date();
    const seconds = differenceInSeconds(now, dateObj);
    const minutes = differenceInMinutes(now, dateObj);
    const hours = differenceInHours(now, dateObj);
    const days = differenceInDays(now, dateObj);
    const weeks = differenceInWeeks(now, dateObj);
    const months = differenceInMonths(now, dateObj);
    const years = differenceInYears(now, dateObj);
    
    // Future dates
    if (seconds < 0) {
      const futureSeconds = Math.abs(seconds);
      const futureMinutes = Math.abs(minutes);
      const futureHours = Math.abs(hours);
      const futureDays = Math.abs(days);
      
      if (futureSeconds < 60) return 'in a few seconds';
      if (futureMinutes < 60) return `in ${futureMinutes} minute${futureMinutes === 1 ? '' : 's'}`;
      if (futureHours < 24) return `in ${futureHours} hour${futureHours === 1 ? '' : 's'}`;
      if (futureDays < 7) return `in ${futureDays} day${futureDays === 1 ? '' : 's'}`;
      return formatDate(dateObj, 'MMM dd, yyyy');
    }
    
    // Past dates
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    if (years > 0) return `${years} year${years === 1 ? '' : 's'} ago`;
    
    // Fallback to formatted date for very old dates
    return formatDate(dateObj, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

// Number formatting utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Text formatting utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatInitials = (firstName?: string, lastName?: string): string => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

// Status formatting utilities
export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'active':
    case 'completed':
    case 'published':
    case 'approved':
      return 'success';
    case 'pending':
    case 'in_progress':
    case 'in_review':
    case 'testing':
      return 'warning';
    case 'draft':
    case 'planning':
      return 'info';
    case 'cancelled':
    case 'rejected':
    case 'failed':
      return 'error';
    case 'archived':
    case 'inactive':
      return 'default';
    default:
      return 'primary';
  }
};

export const getStatusLabel = (status: string): string => {
  return status
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
};
