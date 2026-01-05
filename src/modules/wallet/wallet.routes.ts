import { Hono } from 'hono';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TransactionService } from '../../services/transaction.service';
import { validateRequest } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import { topupRequestSchema } from './wallet.schema';
import { Env, getDb } from '../../db';

export function createWalletRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // All wallet routes require authentication
  router.use('*', authMiddleware);

  router.post('/topup-request', validateRequest(topupRequestSchema), async (c) => {
    const db = getDb(c.env);
    const transactionService = new TransactionService(db);
    const walletService = new WalletService(db, transactionService);
    const walletController = new WalletController(walletService);
    return walletController.createTopupRequest(c);
  });

  router.get('/topup-requests', async (c) => {
    const db = getDb(c.env);
    const transactionService = new TransactionService(db);
    const walletService = new WalletService(db, transactionService);
    const walletController = new WalletController(walletService);
    return walletController.getUserTopupRequests(c);
  });

  router.get('/topup-requests/:id', async (c) => {
    const db = getDb(c.env);
    const transactionService = new TransactionService(db);
    const walletService = new WalletService(db, transactionService);
    const walletController = new WalletController(walletService);
    return walletController.getTopupRequestById(c);
  });

  router.delete('/topup-requests/:id', async (c) => {
    const db = getDb(c.env);
    const transactionService = new TransactionService(db);
    const walletService = new WalletService(db, transactionService);
    const walletController = new WalletController(walletService);
    return walletController.cancelTopupRequest(c);
  });

  router.get('/admin/topup-requests', adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const transactionService = new TransactionService(db);
    const walletService = new WalletService(db, transactionService);
    const walletController = new WalletController(walletService);
    return walletController.getAllTopupRequests(c);
  });

  router.put('/admin/topup-requests/:id/approve', adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const transactionService = new TransactionService(db);
    const walletService = new WalletService(db, transactionService);
    const walletController = new WalletController(walletService);
    return walletController.approveTopupRequest(c);
  });

  router.put('/admin/topup-requests/:id/reject', adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const transactionService = new TransactionService(db);
    const walletService = new WalletService(db, transactionService);
    const walletController = new WalletController(walletService);
    return walletController.rejectTopupRequest(c);
  });

  return router;
}