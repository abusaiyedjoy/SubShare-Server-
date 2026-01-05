import { Hono } from 'hono';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { validateRequest } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { updateProfileSchema, updatePasswordSchema } from './users.schema';
import { Env, getDb } from '../../db';

export function createUsersRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // All user routes require authentication
  router.use('*', authMiddleware);

  // Get user profile
  router.get('/profile', async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.getProfile(c);
  });

  // Update user profile
  router.put('/profile', validateRequest(updateProfileSchema), async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.updateProfile(c);
  });

  // Update password
  router.put('/password', validateRequest(updatePasswordSchema), async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.updatePassword(c);
  });

  // Get wallet balance
  router.get('/wallet-balance', async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.getWalletBalance(c);
  });

  // Get wallet transactions
  router.get('/wallet-transactions', async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.getWalletTransactions(c);
  });

  // Get user's active subscriptions
  router.get('/my-subscriptions', async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.getMySubscriptions(c);
  });

  // Get subscriptions shared by user
  router.get('/shared-subscriptions', async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.getSharedSubscriptions(c);
  });

  // Get user statistics
  router.get('/stats', async (c) => {
    const db = getDb(c.env);
    const usersService = new UsersService(db);
    const usersController = new UsersController(usersService);
    return usersController.getUserStats(c);
  });

  return router;
}