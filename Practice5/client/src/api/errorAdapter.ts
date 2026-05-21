import type { ApiError } from '../types/user';

/* ──────────────────────────────────────────────
 *  Адаптер помилок — нормалізація HTTP-відповідей
 *  до єдиного інтерфейсу ApiError
 * ────────────────────────────────────────────── */

export function adaptError(status: number, body: unknown): ApiError {
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>;
    return {
      message: (b.message as string) || `Помилка сервера (${status})`,
      details: b.details as ApiError['details'],
      statusCode: status,
    };
  }
  return {
    message: `Помилка сервера (${status})`,
    statusCode: status,
  };
}
