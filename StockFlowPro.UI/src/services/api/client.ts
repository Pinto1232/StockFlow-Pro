const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

function buildAbsoluteUrl(url: string): string {
  // If no base URL, use same-origin (e.g., Vite dev proxy handles /api)
  if (!API_BASE) return url;
  // Avoid double /api when base ends with /api and url starts with /api/
  const normalizedUrl = API_BASE.endsWith('/api') && url.startsWith('/api/')
    ? url.replace(/^\/api\//, '/')
    : url;
  const path = normalizedUrl.replace(/^\/+/, '');
  return `${API_BASE}/${path}`;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.append(k, String(v));
  });
  const q = usp.toString();
  return q ? `?${q}` : '';
}

async function request<T>(
  method: HttpMethod,
  url: string,
  opts?: { params?: Record<string, unknown>; body?: unknown; signal?: AbortSignal; headers?: Record<string, string> }
): Promise<T> {
  const { params, body, signal, headers } = opts ?? {};
  const query = buildQuery(params);

  const absolute = buildAbsoluteUrl(url);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const res = await fetch(`${absolute}${query}`, {
    method,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(headers ?? {}),
    },
    body: body ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    signal,
  });

  if (res.status === 401) {
    // Optional: central auth handling
    // window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Attempt JSON parse
  const json = await res.json().catch(() => null);
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data as T;
  }
  return json as T;
}

export const http = {
  get: <T>(url: string, opts?: Omit<Parameters<typeof request<T>>[2], 'body'>) => request<T>('GET', url, opts),
  post: <T>(url: string, body?: unknown, opts?: Omit<Parameters<typeof request<T>>[2], 'body'>) => request<T>('POST', url, { ...opts, body }),
  put: <T>(url: string, body?: unknown, opts?: Omit<Parameters<typeof request<T>>[2], 'body'>) => request<T>('PUT', url, { ...opts, body }),
  patch: <T>(url: string, body?: unknown, opts?: Omit<Parameters<typeof request<T>>[2], 'body'>) => request<T>('PATCH', url, { ...opts, body }),
  delete: <T>(url: string, opts?: Omit<Parameters<typeof request<T>>[2], 'body'>) => request<T>('DELETE', url, opts),
};
