import { Hono } from 'hono';
import { PlatformsController } from './platforms.controller';
import { PlatformsService } from './platforms.service';
import { validateRequest } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import { createPlatformSchema, updatePlatformSchema } from './platforms.schema';
import { Env, getDb } from '../../db';

export function createPlatformsRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // Public routes (no auth required)
  router.get('/', async (c) => {
    const db = getDb(c.env);
    const platformsService = new PlatformsService(db);
    const platformsController = new PlatformsController(platformsService);
    return platformsController.getAllPlatforms(c);
  });

  router.get('/search', async (c) => {
    const db = getDb(c.env);
    const platformsService = new PlatformsService(db);
    const platformsController = new PlatformsController(platformsService);
    return platformsController.searchPlatforms(c);
  });

  router.get('/:id', async (c) => {
    const db = getDb(c.env);
    const platformsService = new PlatformsService(db);
    const platformsController = new PlatformsController(platformsService);
    return platformsController.getPlatformById(c);
  });

  // Admin routes
  router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    validateRequest(createPlatformSchema),
    async (c) => {
      const db = getDb(c.env);
      const platformsService = new PlatformsService(db);
      const platformsController = new PlatformsController(platformsService);
      return platformsController.createPlatform(c);
    }
  );

  router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    validateRequest(updatePlatformSchema),
    async (c) => {
      const db = getDb(c.env);
      const platformsService = new PlatformsService(db);
      const platformsController = new PlatformsController(platformsService);
      return platformsController.updatePlatform(c);
    }
  );

  router.post('/:id/verify', authMiddleware, adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const platformsService = new PlatformsService(db);
    const platformsController = new PlatformsController(platformsService);
    return platformsController.verifyPlatform(c);
  });

  router.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const platformsService = new PlatformsService(db);
    const platformsController = new PlatformsController(platformsService);
    return platformsController.deletePlatform(c);
  });

  return router;
}