import { Context } from 'hono';
import { UsersService } from './users.service';
import { successResponse, errorResponse } from '../../utils/response';
import { getAuthUser } from '../../middlewares/auth.middleware';
import { Env } from '../../db';

export class UsersController {
  constructor(private usersService: UsersService) {}


  getProfile = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const profile = await this.usersService.getUserProfile(user.userId);
      return successResponse(c, profile);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };

  updateProfile = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const body = await c.req.json();
      const updatedProfile = await this.usersService.updateProfile(user.userId, body);
      return successResponse(c, updatedProfile, 'Profile updated successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  updatePassword = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const body = await c.req.json();
      const result = await this.usersService.updatePassword(
        user.userId,
        body.currentPassword,
        body.newPassword
      );
      return successResponse(c, result, 'Password updated successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getWalletBalance = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const balance = await this.usersService.getWalletBalance(user.userId);
      return successResponse(c, balance);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };


  getWalletTransactions = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const limit = parseInt(c.req.query('limit') || '50');
      const transactions = await this.usersService.getWalletTransactions(user.userId, limit);
      return successResponse(c, transactions);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  getMySubscriptions = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const subscriptions = await this.usersService.getMySubscriptions(user.userId);
      return successResponse(c, subscriptions);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  getSharedSubscriptions = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const shared = await this.usersService.getSharedSubscriptions(user.userId);
      return successResponse(c, shared);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  getUserStats = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const stats = await this.usersService.getUserStats(user.userId);
      return successResponse(c, stats);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };
}