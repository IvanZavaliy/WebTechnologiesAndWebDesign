import { normalizeError } from './errorAdapter';

const BASE_URL = 'http://localhost:3001/api';

/**
 * HTTP client module.
 * Encapsulates HTTP calls to the server and transforms responses.
 */

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    },
  };

  if (options.body) {
    config.body = options.body as string;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = {
        response: {
          status: response.status,
          data,
        },
      };
      throw error;
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    throw normalizeError(error);
  }
}

export const httpClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint);
  },

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
