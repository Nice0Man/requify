import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface TanStackQueryProviderProps {
  children: ReactNode;
}

// Создаем query client с лучшими практиками конфигурации
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Время до устаревания данных (stale time)
        staleTime: 5 * 60 * 1000, // 5 минут

        // Время кэширования в памяти (garbage collection time)
        gcTime: 30 * 60 * 1000, // 30 минут (was cacheTime)

        // Повторные запросы
        retry: (failureCount, error: any) => {
          // Не повторяем для 4xx ошибок (кроме 408, 429)
          if (
            error?.status >= 400 &&
            error?.status < 500 &&
            ![408, 429].includes(error.status)
          ) {
            return false;
          }
          return failureCount < 3;
        },

        // Интервал между повторными запросами
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Обновление при фокусе окна
        refetchOnWindowFocus: true,

        // Обновление при переподключении
        refetchOnReconnect: true,

        // Использовать error boundary только для критических ошибок
        throwOnError: (error: any) => error?.status >= 500,
      },
      mutations: {
        // Время кэширования для мутаций
        gcTime: 5 * 60 * 1000, // 5 минут

        // Использовать error boundary для критических ошибок
        throwOnError: (error: any) => error?.status >= 500,

        // Retry для мутаций только для network errors
        retry: (failureCount, error: any) => {
          if (error?.name === "NetworkError" || error?.status >= 500) {
            return failureCount < 1; // Только одна попытка
          }
          return false;
        },
      },
    },
  });

// Singleton instance для предотвращения создания нескольких клиентов
let queryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server-side: всегда создаем новый клиент
    return createQueryClient();
  }

  // Client-side: создаем клиент только один раз
  if (!queryClient) {
    queryClient = createQueryClient();
  }

  return queryClient;
};

export const TanStackQueryProvider: React.FC<TanStackQueryProviderProps> = ({
  children,
}) => {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}

      {/* Devtools только в development режиме */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

// Export query client для использования вне React компонентов
export { getQueryClient };
