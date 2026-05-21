/**
 * Utility module for query string building and common operations.
 */

/**
 * Builds a URL query string from an object of parameters.
 * Skips undefined and empty string values.
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const result = searchParams.toString();
  return result ? `?${result}` : '';
}

/**
 * Formats a date string into a human-readable format.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce utility for search inputs.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
