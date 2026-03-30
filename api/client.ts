import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL ?? 'http://10.0.2.2:8000/api/v1';

const STORAGE_KEYS = {
  accessToken: 'fitbook_access_token',
  refreshToken: 'fitbook_refresh_token',
} as const;

// ── Token storage ──────────────────────────────────────────
export const TokenStore = {
  async save(access: string, refresh: string) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.accessToken, access],
      [STORAGE_KEYS.refreshToken, refresh],
    ]);
  },
  async getAccess(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
  },
  async getRefresh(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
  },
  async clear() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.accessToken,
      STORAGE_KEYS.refreshToken,
    ]);
  },
};

// ── Timeout wrapper ────────────────────────────────────────
const TIMEOUT_MS = 15_000;

async function withTimeout(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Raw fetch helpers ──────────────────────────────────────
async function rawPost<T>(path: string, body: unknown): Promise<T> {
  const res = await withTimeout(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const envelope = await res.json();
  if (!res.ok) throw new Error(envelope.error ?? 'Request failed');
  return envelope.data as T;
}

// ── Authenticated fetch with auto-refresh ──────────────────
export async function authFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = await TokenStore.getAccess();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    ...(options.headers ?? {}),
  };

  let res = await withTimeout(`${BASE_URL}${path}`, { ...options, headers });

  // Access token expired — attempt silent refresh
  if (res.status === 401) {
    const refreshToken = await TokenStore.getRefresh();
    if (!refreshToken) throw new Error('SESSION_EXPIRED');

    try {
      const tokens = await rawPost<{
        access_token: string;
        refresh_token: string;
      }>('/auth/token/refresh', { refresh_token: refreshToken });
      await TokenStore.save(tokens.access_token, tokens.refresh_token);

      // Retry with new access token
      res = await withTimeout(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
    } catch {
      await TokenStore.clear();
      throw new Error('SESSION_EXPIRED');
    }
  }

  const envelope = await res.json();
  if (!res.ok) throw new Error(envelope.error ?? 'Request failed');
  return envelope.data as T;
}

export { rawPost, BASE_URL };
