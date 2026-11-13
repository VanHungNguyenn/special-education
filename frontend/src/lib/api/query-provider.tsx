"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ApiError } from "./http-client";

const isClientError = (error: unknown) => error instanceof ApiError && error.status >= 400 && error.status < 500;

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [client] = useState(() => {
    const onError = (error: unknown) => {
      if (!(error instanceof ApiError) || error.code !== "UNAUTHENTICATED") return;
      queryClient.clear();
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    };
    const queryClient: QueryClient = new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: {
        queries: { staleTime: 30_000, retry: (failureCount, error) => !isClientError(error) && failureCount < 2 },
        mutations: { retry: false },
      },
    });
    return queryClient;
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
