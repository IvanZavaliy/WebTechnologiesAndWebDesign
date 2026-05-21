import { adaptError } from './errorAdapter';

/* ──────────────────────────────────────────────
 *  HTTP-клієнт — обгортка над fetch
 *
 *  Забезпечує:
 *  - Єдиний базовий URL (API_BASE)
 *  - Автоматичне додавання JSON headers
 *  - Нормалізацію помилок через adaptError
 * ────────────────────────────────────────────── */

const API_BASE = 'http://localhost:3001/api';

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    throw adaptError(response.status, body);
  }

  return body as T;
}

export const httpClient = {
  get<T>(url: string): Promise<T> {
    return request<T>(url, { method: 'GET' });
  },

  post<T>(url: string, data: unknown): Promise<T> {
    return request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put<T>(url: string, data: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete<T>(url: string): Promise<T> {
    return request<T>(url, { method: 'DELETE' });
  },
};
