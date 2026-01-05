import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './db';
import { createAuthRoutes } from './modules/auth/auth.routes';
import { createUsersRoutes } from './modules/users/users.routes';
import { createWalletRoutes } from './modules/wallet/wallet.routes';
import { createPlatformsRoutes } from './modules/platforms/platforms.routes';
import { createSubscriptionsRoutes } from './modules/subscriptions/subscriptions.routes';

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
  app.route('/api/users', createUsersRoutes());
  app.route('/api/wallet', createWalletRoutes());
  app.route('/api/platforms', createPlatformsRoutes());
  app.route('/api/subscriptions', createSubscriptionsRoutes());

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