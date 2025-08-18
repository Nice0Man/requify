import {
  QueryClient,
  QueryClientProvider,
  QueryFunction,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import { client } from "@/shared/api";

// Default query function как показано в документации TanStack Query
const defaultQueryFn = async ({ queryKey }: { queryKey: unknown[] }) => {
  // Преобразуем query key в URL
  const url = Array.isArray(queryKey) ? queryKey.join("/") : String(queryKey);

  try {
    const response = await client.get(`/${url}`);
    return response.data;
  } catch (error) {
    console.warn(
      `Default query function failed for key: ${JSON.stringify(queryKey)}`,
      error
    );
    throw error;
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn as unknown as QueryFunction, // Добавляем default query function
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
