import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './db';
import { createAuthRoutes } from './modules/auth/auth.routes';

export function createApp() {
  const app = new Hono<{ Bindings: Env }>();

  // Middlewares
  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Health check
  app.get('/', (c) => {
    return c.json({
      success: true,
      message: 'SubShare API is running',
      version: '1.0.0',
    });
  });

  // API Routes
  app.route('/api/auth', createAuthRoutes());

  // 404 handler
  app.notFound((c) => {
    return c.json(
      {
        success: false,
        error: 'Route not found',
      },
      404
    );
  });

  // Error handler
  app.onError((err, c) => {
    console.error('Error:', err);
    return c.json(
      {
        success: false,
        error: err.message || 'Internal server error',
      },
      500
    );
  });

  return app;
}