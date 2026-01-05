import { Hono } from 'hono';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { validateRequest } from '../../middlewares/validation.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import { createReportSchema, resolveReportSchema } from './reports.schema';
import { Env, getDb } from '../../db';

export function createReportsRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // All routes require authentication
  router.use('*', authMiddleware);

  // User routes
  router.post('/', validateRequest(createReportSchema), async (c) => {
    const db = getDb(c.env);
    const reportsService = new ReportsService(db);
    const reportsController = new ReportsController(reportsService);
    return reportsController.createReport(c);
  });

  router.get('/my-reports', async (c) => {
    const db = getDb(c.env);
    const reportsService = new ReportsService(db);
    const reportsController = new ReportsController(reportsService);
    return reportsController.getUserReports(c);
  });

  // Admin routes
  router.get('/', adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const reportsService = new ReportsService(db);
    const reportsController = new ReportsController(reportsService);
    return reportsController.getAllReports(c);
  });

  router.get('/:id', adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const reportsService = new ReportsService(db);
    const reportsController = new ReportsController(reportsService);
    return reportsController.getReportById(c);
  });

  router.put('/:id/resolve', adminMiddleware, validateRequest(resolveReportSchema), async (c) => {
    const db = getDb(c.env);
    const reportsService = new ReportsService(db);
    const reportsController = new ReportsController(reportsService);
    return reportsController.resolveReport(c);
  });

  router.delete('/:id', adminMiddleware, async (c) => {
    const db = getDb(c.env);
    const reportsService = new ReportsService(db);
    const reportsController = new ReportsController(reportsService);
    return reportsController.deleteReport(c);
  });

  return router;
}