import {
  getApiUrl,
  getAuthHeaders,
  apiFetch,
  createSessionHelpers,
} from "@saludtech/shared";
import type { FetchState, FetchAction } from "@saludtech/shared";
import { useFetchData } from "@saludtech/shared";

export { getApiUrl, getAuthHeaders, apiFetch, useFetchData };
export type { FetchState, FetchAction };

// Merchant-specific session helpers (stores user under "merchant_user")
const session = createSessionHelpers("merchant_user");
export const setSession = session.setSession;
export const clearSession = session.clearSession;
export const getStoredUser = session.getStoredUser;
