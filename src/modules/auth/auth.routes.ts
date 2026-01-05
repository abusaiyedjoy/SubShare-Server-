import { Hono } from 'hono';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { validateRequest } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { Env, getDb } from '../../db';

export function createAuthRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  router.post('/register', validateRequest(registerSchema), async (c) => {
    const db = getDb(c.env);
    const authService = new AuthService(db, c.env.JWT_SECRET, c.env.JWT_EXPIRY);
    const authController = new AuthController(authService);
    return authController.register(c);
  });

  router.post('/login', validateRequest(loginSchema), async (c) => {
    const db = getDb(c.env);
    const authService = new AuthService(db, c.env.JWT_SECRET, c.env.JWT_EXPIRY);
    const authController = new AuthController(authService);
    return authController.login(c);
  });

  router.get('/me', authMiddleware, async (c) => {
    const db = getDb(c.env);
    const authService = new AuthService(db, c.env.JWT_SECRET, c.env.JWT_EXPIRY);
    const authController = new AuthController(authService);
    return authController.me(c);
  });

  router.post('/logout', authMiddleware, async (c) => {
    const db = getDb(c.env);
    const authService = new AuthService(db, c.env.JWT_SECRET, c.env.JWT_EXPIRY);
    const authController = new AuthController(authService);
    return authController.logout(c);
  });

  return router;
}