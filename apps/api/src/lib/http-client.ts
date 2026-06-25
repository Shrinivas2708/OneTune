import { SEARCH_PROVIDER_TIMEOUT_MS } from "@vibevault/config";

export class HttpClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "HttpClientError";
  }
}

export async function fetchJson<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = SEARCH_PROVIDER_TIMEOUT_MS, ...init } = options;
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new HttpClientError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      body,
    );
  }

  return body as T;
}

export async function postJson<T>(
  url: string,
  payload: unknown,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  return fetchJson<T>(url, {
    method: "POST",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(payload),
  });
}
