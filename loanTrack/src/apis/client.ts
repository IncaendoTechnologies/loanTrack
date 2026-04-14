import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';

const extractHost = (uri?: string) => uri?.split(':')[0];

const resolveApiBaseUrl = () => {
  const expoConfigHost = extractHost(Constants.expoConfig?.hostUri);
  const expoGoHost = extractHost((Constants as any).manifest2?.extra?.expoGo?.debuggerHost);
  const legacyManifestHost = extractHost((Constants as any).manifest?.debuggerHost);
  const easHost = extractHost((Constants as any).expoGoConfig?.debuggerHost);
  const host = expoConfigHost || expoGoHost || legacyManifestHost || easHost;

  if (host) return `http://${host}:8000`;
  return '';
};

const normalizeBaseUrl = (url?: string) => (url ? url.replace(/\/+$/, '') : '');

const getPlatformHost = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://127.0.0.1:8000';
};

const getApiBaseUrl = () => {
  const envUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
  if (envUrl) return envUrl;

  const derivedUrl = normalizeBaseUrl(resolveApiBaseUrl());
  if (derivedUrl) return derivedUrl;

  return normalizeBaseUrl(getPlatformHost());
};

const getApiBaseCandidates = () => {
  return [getApiBaseUrl()];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  retries = 1,
  backoffMs = 300,
  timeoutMs = 5000
): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, init, timeoutMs);
      if (response.ok) {
        return response;
      }

      if (response.status >= 500 && attempt < retries) {
        lastError = new Error(`Server error ${response.status}`);
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

export const requestWithFallback = async (path: string, init?: RequestInit) => {
  const candidates = getApiBaseCandidates();
  if (candidates.length === 0) {
    throw new Error(
      'No API base URL configured. Set EXPO_PUBLIC_API_BASE_URL or run the app with a valid local server host.'
    );
  }

  let lastError: unknown;
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const headers = {
    ...(init?.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const requestInit: RequestInit = { ...init, headers };

  for (const baseUrl of candidates) {
    try {
      return await fetchWithRetry(`${baseUrl}${path}`, requestInit);
    } catch (error) {
      lastError = new Error(
        `Network request failed at ${baseUrl}${path}: ${String(error)}`
      );
    }
  }

  throw new Error(
    `All API endpoints failed. Tried: ${candidates.join(', ')}. Last error: ${String(lastError)}`
  );
};

export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};
