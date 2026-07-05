import { adminConfig } from "../config";

const TOKEN_KEY = "onetune_admin_token";

export interface AdminOverview {
  totalUsers: number;
  usersWithPlays: number;
  totalPlays: number;
  topArtistsGlobal: Array<{ name: string; playCount: number }>;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  totalPlays: number;
  lastPlayedAt: string | null;
  topArtist: string | null;
}

export interface AdminUserDetail {
  user: {
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
  };
  stats: {
    totalPlays: number;
    lastPlayedAt: string | null;
  };
  topArtists: Array<{ name: string; playCount: number }>;
  recentHistory: Array<{
    id: string;
    track: {
      title: string;
      artists: Array<{ name: string }>;
      album?: { title?: string };
    };
    playedAt: string;
    durationPlayedMs?: number;
  }>;
}

class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function hasAdminToken() {
  return Boolean(getToken());
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${adminConfig.apiUrl}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new AdminApiError(
      payload.error?.message ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return payload.data as T;
}

interface AdminLoginResponse {
  tokens: {
    accessToken: string;
  };
}

export async function login(email: string, password: string) {
  const response = await fetch(`${adminConfig.apiUrl}/v1/admin/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as {
    data?: AdminLoginResponse;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new AdminApiError(
      payload.error?.message ?? `Login failed (${response.status})`,
      response.status,
    );
  }

  const accessToken = payload.data?.tokens.accessToken;
  if (!accessToken) {
    throw new AdminApiError("Login response missing access token", 500);
  }

  sessionStorage.setItem(TOKEN_KEY, accessToken);
}

export function fetchOverview() {
  return request<AdminOverview>("/v1/admin/overview");
}

export function fetchUsers() {
  return request<AdminUserSummary[]>("/v1/admin/users");
}

export function fetchUserDetail(userId: string) {
  return request<AdminUserDetail>(`/v1/admin/users/${userId}`);
}

export { AdminApiError };
