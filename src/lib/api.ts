export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://foodhub-backend-7.onrender.com";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      "Network error. Please check your connection and try again.",
      0,
    );
  }

  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        (data.message || data.error || data.errorMessage)) ||
      (typeof data === "string" && data.slice(0, 200)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(String(message), res.status);
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T = unknown>(path: string) => request<T>(path, { method: "DELETE" }),
};

/**
 * Unwraps common API envelope shapes such as `{ data: ... }` or
 * `{ result: ... }`, falling back to the raw payload.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    if (payload.data !== undefined && payload.data !== null) {
      return payload.data as T;
    }
    if (payload.result !== undefined && payload.result !== null) {
      return payload.result as T;
    }
  }
  return payload as T;
}

/**
 * Extracts an array from an unknown API payload shape. Handles raw arrays as
 * well as envelopes like `{ data: [...] }`, `{ data: { meals: [...] } }`, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asArray<T>(payload: any): T[] {
  const seen = new Set<unknown>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dig = (value: any, depth: number): T[] | null => {
    if (value == null || depth > 3 || seen.has(value)) return null;
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== "object") return null;
    seen.add(value);
    const keys = [
      "data",
      "result",
      "results",
      "items",
      "meals",
      "orders",
      "users",
      "categories",
      "reviews",
      "docs",
    ];
    for (const key of keys) {
      if (key in value) {
        const found = dig(value[key], depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  return dig(payload, 0) ?? [];
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
