"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api";

export interface UseQueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  dependencies?: unknown[];
}

export function useQueryData<T>(
  url: string,
  options: UseQueryOptions<T> = {}
) {
  const queryClient = useQueryClient();
  const { enabled = true, staleTime = 30_000, refetchOnWindowFocus = true, dependencies = [] } = options;

  const queryKey = [url, ...dependencies];

  const query = useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const res = await apiFetch(url);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return (await res.json()) as T;
    },
    enabled,
    staleTime,
    refetchOnWindowFocus,
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    return queryClient.fetchQuery<T, Error>({
      queryKey,
      queryFn: async () => {
        const res = await apiFetch(url);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return (await res.json()) as T;
      },
    });
  }, [queryClient, queryKey, url]);

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch,
  };
}
