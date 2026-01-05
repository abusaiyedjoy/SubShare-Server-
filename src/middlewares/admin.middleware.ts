import { Context, Next } from 'hono';
import { forbiddenResponse } from '../utils/response';
import { getAuthUser } from './auth.middleware';

export async function adminMiddleware(c: Context, next: Next) {
  const user = getAuthUser(c);

  if (!user) {
    return forbiddenResponse(c, 'Authentication required');
  }

  if (user.role !== 'admin') {
    return forbiddenResponse(c, 'Admin access required');
  }

  await next();
}