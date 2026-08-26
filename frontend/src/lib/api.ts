export const API_BASE = import.meta.env.VITE_API_BASE || "http://13.53.158.214:8081";

export type Role = "DOCTOR" | "PATIENT";

export interface Session {
  token: string;
  role: Role;
  userId?: number | string | undefined;
  name?: string | undefined;
  email?: string | undefined;
}

const KEY = "hms_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("hms-auth"));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("hms-auth"));
}

/** Decodes a JWT payload without verifying it (display / expiry only). */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  const exp = payload?.["exp"];
  if (typeof exp !== "number") return false;
  return Date.now() >= exp * 1000;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function api<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const session = getSession();
    if (session?.token) {
      if (isTokenExpired(session.token)) {
        clearSession();
        throw new ApiError("Session expired. Please log in again.", 401);
      }
      headers["Authorization"] = `Bearer ${session.token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`Cannot reach the API server at ${API_BASE}.`, 0);
  }

  if (res.status === 401 || res.status === 403) {
    clearSession();
    throw new ApiError("Unauthorized. Please log in again.", res.status);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : typeof data === "string" && data
          ? data
          : `Request failed (${res.status})`) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

/** Backends return either a plain array or a Spring Page object. */
export function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj["content"])) return obj["content"] as T[];
    if (Array.isArray(obj["data"])) return obj["data"] as T[];
  }
  return [];
}

export function totalPages(data: unknown, fallback: number): number {
  if (data && typeof data === "object") {
    const tp = (data as Record<string, unknown>)["totalPages"];
    if (typeof tp === "number") return tp;
  }
  return fallback;
}
