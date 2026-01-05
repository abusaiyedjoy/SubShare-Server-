import { Context } from 'hono';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export function successResponse<T>(
  c: Context,
  data: T,
  message?: string,
  status: number = 200
) {
  return c.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
    },
    status
  );
}

export function errorResponse(
  c: Context,
  error: string,
  status: number = 400,
  errors?: Record<string, string[]>
) {
  return c.json<ApiResponse>(
    {
      success: false,
      error,
      errors,
    },
    status
  );
}

export function validationErrorResponse(
  c: Context,
  errors: Record<string, string[]>
) {
  return c.json<ApiResponse>(
    {
      success: false,
      error: 'Validation failed',
      errors,
    },
    400
  );
}

export function unauthorizedResponse(c: Context, message: string = 'Unauthorized') {
  return errorResponse(c, message, 401);
}

export function forbiddenResponse(c: Context, message: string = 'Forbidden') {
  return errorResponse(c, message, 403);
}

export function notFoundResponse(c: Context, message: string = 'Resource not found') {
  return errorResponse(c, message, 404);
}

export function serverErrorResponse(
  c: Context,
  message: string = 'Internal server error'
) {
  return errorResponse(c, message, 500);
}