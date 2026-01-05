import { Context } from 'hono';
import { serverErrorResponse } from '../utils/response';

export async function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  // Handle specific error types
  if (err.message.includes('User not found')) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      404
    );
  }

  if (err.message.includes('Insufficient balance')) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      400
    );
  }

  if (err.message.includes('already exists')) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      409
    );
  }

  // Default server error
  return serverErrorResponse(c, 'An unexpected error occurred');
}