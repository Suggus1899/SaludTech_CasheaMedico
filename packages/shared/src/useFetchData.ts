"use client";

import { useQueryData } from "./useQuery";

export { useQueryData } from "./useQuery";
export type { UseQueryOptions } from "./useQuery";

export function useFetchData<T>(url: string, dependencies: unknown[] = []) {
  return useQueryData<T>(url, { dependencies });
}
