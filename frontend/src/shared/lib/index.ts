// Shared lib layer - адаптеры для внешних библиотек
// Содержит обертки и конфигурации для сторонних библиотек

// Axios configuration and interceptors
export { apiClient } from '../api/client';

// React Query configuration (если будет использоваться)
// export { queryClient } from './react-query';

// Date utilities (если нужны дополнительные)
// export { dateLib } from './date';

// Storage adapters
export { tokenStorage } from '../utils/tokenStorage';

// Theme utilities
// export { themeUtils } from './theme'; 