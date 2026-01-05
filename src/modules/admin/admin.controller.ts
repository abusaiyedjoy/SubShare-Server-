import { Context } from 'hono';
import { AdminService } from './admin.service';
import { successResponse, errorResponse } from '../../utils/response';
import { getAuthUser } from '../../middlewares/auth.middleware';
import { Env } from '../../db';

export class AdminController {
  constructor(private adminService: AdminService) {}

  getDashboardStats = async (c: Context<{ Bindings: Env }>) => {
    try {
      const stats = await this.adminService.getDashboardStats();
      return successResponse(c, stats);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getAllUsers = async (c: Context<{ Bindings: Env }>) => {
    try {
      const limit = parseInt(c.req.query('limit') || '100');
      const users = await this.adminService.getAllUsers(limit);
      return successResponse(c, users);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getUserDetails = async (c: Context<{ Bindings: Env }>) => {
    try {
      const userId = parseInt(c.req.param('id'));
      const userDetails = await this.adminService.getUserDetails(userId);
      return successResponse(c, userDetails);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };

  adjustUserBalance = async (c: Context<{ Bindings: Env }>) => {
    try {
      const admin = getAuthUser(c);
      const userId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const result = await this.adminService.adjustUserBalance(
        userId,
        body.amount,
        admin.userId,
        body.notes
      );

      return successResponse(c, result, 'Balance adjusted successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getAllTransactions = async (c: Context<{ Bindings: Env }>) => {
    try {
      const limit = parseInt(c.req.query('limit') || '100');
      const transactions = await this.adminService.getAllTransactions(limit);
      return successResponse(c, transactions);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getPendingVerifications = async (c: Context<{ Bindings: Env }>) => {
    try {
      const verifications = await this.adminService.getPendingVerifications();
      return successResponse(c, verifications);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  verifySubscription = async (c: Context<{ Bindings: Env }>) => {
    try {
      const admin = getAuthUser(c);
      const subscriptionId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const result = await this.adminService.verifySubscription(
        subscriptionId,
        admin.userId,
        body.is_verified,
        body.verification_note
      );

      return successResponse(c, result, 'Subscription verified successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getPlatformSettings = async (c: Context<{ Bindings: Env }>) => {
    try {
      const settings = await this.adminService.getPlatformSettings();
      return successResponse(c, settings);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  updatePlatformSetting = async (c: Context<{ Bindings: Env }>) => {
    try {
      const body = await c.req.json();
      const setting = await this.adminService.updatePlatformSetting(body.key, body.value);
      return successResponse(c, setting, 'Setting updated successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getSystemStatistics = async (c: Context<{ Bindings: Env }>) => {
    try {
      const stats = await this.adminService.getSystemStatistics();
      return successResponse(c, stats);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  updateUserRole = async (c: Context<{ Bindings: Env }>) => {
    try {
      const userId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const user = await this.adminService.updateUserRole(userId, body.role);
      return successResponse(c, user, 'User role updated successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };
}