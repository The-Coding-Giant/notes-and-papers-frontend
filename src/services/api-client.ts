/**
 * Browser-side client for authenticated calls. Everything goes through the same-origin BFF
 * (`/api/backend/*`), which attaches the session token server-side.
 */

export class BffError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "BffError";
  }
}

export async function bff<T = unknown>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    raw?: BodyInit;
    headers?: HeadersInit;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const res = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
    method: init.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    body: init.raw ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
    signal: init.signal,
    cache: "no-store",
  });
  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const data = (await res.json()) as { error?: { message?: string }; detail?: string };
      message = data.error?.message ?? data.detail ?? message;
    } catch {
      /* non-JSON body */
    }
    throw new BffError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
