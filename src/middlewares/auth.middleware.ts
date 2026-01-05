import { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt';
import { unauthorizedResponse } from '../utils/response';
import { Env } from '../db';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorizedResponse(c, 'No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload) {
      return unauthorizedResponse(c, 'Invalid or expired token');
    }

    // Attach user info to context
    c.set('user', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    await next();
  } catch (error) {
    return unauthorizedResponse(c, 'Authentication failed');
  }
}

// Helper to get authenticated user from context
export function getAuthUser(c: Context) {
  return c.get('user') as {
    userId: number;
    email: string;
    role: 'user' | 'admin';
  };
}