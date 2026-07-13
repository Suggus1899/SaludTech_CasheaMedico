"use client";

import { useCallback, useEffect, useReducer } from "react";
import { apiFetch } from "./api";
import type { FetchAction, FetchState } from "./api";

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: null };
    case "success":
      return { data: action.payload as T, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.payload as string };
  }
}

export function useFetchData<T>(url: string, dependencies: unknown[] = []) {
  const [state, dispatch] = useReducer(fetchReducer<T>, {
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const res = await apiFetch(url);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const json = (await res.json()) as T;
      dispatch({ type: "success", payload: json });
    } catch (err: unknown) {
      dispatch({
        type: "error",
        payload: err instanceof Error ? err.message : "Error desconocido",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...dependencies]);

  useEffect(() => {
    fetchData().catch(() => undefined);
  }, [fetchData]);

  return { data: state.data, loading: state.loading, error: state.error, refetch: fetchData };
}
