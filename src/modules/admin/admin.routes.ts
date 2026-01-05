import { Hono } from 'hono';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { VerificationService } from '../../services/verification.service';
import { TransactionService } from '../../services/transaction.service';
import { validateRequest } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import { verifySubscriptionSchema, adjustBalanceSchema, updateSettingSchema } from './admin.schema';
import { Env, getDb } from '../../db';

export function createAdminRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // All admin routes require authentication and admin role
  router.use('*', authMiddleware, adminMiddleware);

  // Dashboard
  router.get('/dashboard-stats', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.getDashboardStats(c);
  });

  router.get('/system-stats', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.getSystemStatistics(c);
  });

  // Users management
  router.get('/users', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.getAllUsers(c);
  });

  router.get('/users/:id', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.getUserDetails(c);
  });

  router.put('/users/:id/balance', validateRequest(adjustBalanceSchema), async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.adjustUserBalance(c);
  });

  router.put('/users/:id/role', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.updateUserRole(c);
  });

  // Transactions
  router.get('/transactions', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.getAllTransactions(c);
  });

  // Verifications
  router.get('/pending-verifications', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.getPendingVerifications(c);
  });

  router.post('/subscriptions/:id/verify', validateRequest(verifySubscriptionSchema), async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.verifySubscription(c);
  });

  // Settings
  router.get('/settings', async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.getPlatformSettings(c);
  });

  router.put('/settings', validateRequest(updateSettingSchema), async (c) => {
    const db = getDb(c.env);
    const verificationService = new VerificationService(db);
    const transactionService = new TransactionService(db);
    const adminService = new AdminService(db, verificationService, transactionService);
    const adminController = new AdminController(adminService);
    return adminController.updatePlatformSetting(c);
  });

  return router;
}