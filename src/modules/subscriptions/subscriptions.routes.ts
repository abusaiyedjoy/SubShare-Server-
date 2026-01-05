import { Hono } from 'hono';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { AccessService } from './access.service';
import { TransactionService } from '../../services/transaction.service';
import { createEncryptionService } from '../../services/encryption.service';
import { validateRequest } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  unlockSubscriptionSchema,
} from './subscriptions.schema';
import { Env, getDb } from '../../db';
import { getCommissionConfig } from '../../config/commission';

export function createSubscriptionsRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // Public routes
  router.get('/', async (c) => {
    const db = getDb(c.env);
    const encryptionService = createEncryptionService(c.env.ENCRYPTION_KEY);
    const transactionService = new TransactionService(db);
    const accessService = new AccessService(db);
    const commissionConfig = getCommissionConfig(c.env);
    const subscriptionsService = new SubscriptionsService(
      db,
      encryptionService,
      transactionService,
      accessService,
      commissionConfig.percentage
    );
    const subscriptionsController = new SubscriptionsController(subscriptionsService);
    return subscriptionsController.getAllSubscriptions(c);
  });

  router.get('/:id', async (c) => {
    const db = getDb(c.env);
    const encryptionService = createEncryptionService(c.env.ENCRYPTION_KEY);
    const transactionService = new TransactionService(db);
    const accessService = new AccessService(db);
    const commissionConfig = getCommissionConfig(c.env);
    const subscriptionsService = new SubscriptionsService(
      db,
      encryptionService,
      transactionService,
      accessService,
      commissionConfig.percentage
    );
    const subscriptionsController = new SubscriptionsController(subscriptionsService);
    return subscriptionsController.getSubscriptionById(c);
  });

  // Protected routes
  router.use('*', authMiddleware);

  router.post('/', validateRequest(createSubscriptionSchema), async (c) => {
    const db = getDb(c.env);
    const encryptionService = createEncryptionService(c.env.ENCRYPTION_KEY);
    const transactionService = new TransactionService(db);
    const accessService = new AccessService(db);
    const commissionConfig = getCommissionConfig(c.env);
    const subscriptionsService = new SubscriptionsService(
      db,
      encryptionService,
      transactionService,
      accessService,
      commissionConfig.percentage
    );
    const subscriptionsController = new SubscriptionsController(subscriptionsService);
    return subscriptionsController.createSubscription(c);
  });

  router.put('/:id', validateRequest(updateSubscriptionSchema), async (c) => {
    const db = getDb(c.env);
    const encryptionService = createEncryptionService(c.env.ENCRYPTION_KEY);
    const transactionService = new TransactionService(db);
    const accessService = new AccessService(db);
    const commissionConfig = getCommissionConfig(c.env);
    const subscriptionsService = new SubscriptionsService(
      db,
      encryptionService,
      transactionService,
      accessService,
      commissionConfig.percentage
    );
    const subscriptionsController = new SubscriptionsController(subscriptionsService);
    return subscriptionsController.updateSubscription(c);
  });

  router.delete('/:id', async (c) => {
    const db = getDb(c.env);
    const encryptionService = createEncryptionService(c.env.ENCRYPTION_KEY);
    const transactionService = new TransactionService(db);
    const accessService = new AccessService(db);
    const commissionConfig = getCommissionConfig(c.env);
    const subscriptionsService = new SubscriptionsService(
      db,
      encryptionService,
      transactionService,
      accessService,
      commissionConfig.percentage
    );
    const subscriptionsController = new SubscriptionsController(subscriptionsService);
    return subscriptionsController.deleteSubscription(c);
  });

  router.post('/:id/unlock', validateRequest(unlockSubscriptionSchema), async (c) => {
    const db = getDb(c.env);
    const encryptionService = createEncryptionService(c.env.ENCRYPTION_KEY);
    const transactionService = new TransactionService(db);
    const accessService = new AccessService(db);
    const commissionConfig = getCommissionConfig(c.env);
    const subscriptionsService = new SubscriptionsService(
      db,
      encryptionService,
      transactionService,
      accessService,
      commissionConfig.percentage
    );
    const subscriptionsController = new SubscriptionsController(subscriptionsService);
    return subscriptionsController.unlockSubscription(c);
  });

  router.get('/:id/credentials', async (c) => {
    const db = getDb(c.env);
    const encryptionService = createEncryptionService(c.env.ENCRYPTION_KEY);
    const transactionService = new TransactionService(db);
    const accessService = new AccessService(db);
    const commissionConfig = getCommissionConfig(c.env);
    const subscriptionsService = new SubscriptionsService(
      db,
      encryptionService,
      transactionService,
      accessService,
      commissionConfig.percentage
    );
    const subscriptionsController = new SubscriptionsController(subscriptionsService);
    return subscriptionsController.getCredentials(c);
  });

  return router;
}