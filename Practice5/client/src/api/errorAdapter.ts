import type { ApiError } from '../types/user';

/**
 * Error adapter module.
 * Normalizes technical API errors into a unified format for the client.
 */
export function normalizeError(error: unknown): ApiError {
  // Axios-like error with response
  if (isResponseError(error)) {
    const { status, data } = error.response;
    return {
      message: data?.error || data?.message || 'An error occurred',
      details: data?.details,
      statusCode: status,
    };
  }

  // Network or timeout error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      message: 'Unable to connect to the server. Please check your connection.',
      statusCode: 0,
    };
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: 'An unknown error occurred',
    statusCode: 500,
  };
}

interface ResponseError {
  response: {
    status: number;
    data: {
      error?: string;
      message?: string;
      details?: Array<{ field: string; message: string }>;
    };
  };
}

function isResponseError(error: unknown): error is ResponseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as ResponseError).response === 'object'
  );
}
