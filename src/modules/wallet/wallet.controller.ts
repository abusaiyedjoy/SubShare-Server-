import { Context } from 'hono';
import { WalletService } from './wallet.service';
import { successResponse, errorResponse } from '../../utils/response';
import { getAuthUser } from '../../middlewares/auth.middleware';
import { Env } from '../../db';

export class WalletController {
  constructor(private walletService: WalletService) {}

  createTopupRequest = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const body = await c.req.json();

      const request = await this.walletService.createTopupRequest({
        userId: user.userId,
        amount: body.amount,
        transactionId: body.transaction_id,
        screenshotUrl: body.screenshot_url,
      });

      return successResponse(c, request, 'Topup request created successfully', 201);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getUserTopupRequests = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const limit = parseInt(c.req.query('limit') || '50');

      const requests = await this.walletService.getUserTopupRequests(user.userId, limit);
      return successResponse(c, requests);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getTopupRequestById = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const requestId = parseInt(c.req.param('id'));

      const request = await this.walletService.getTopupRequestById(requestId, user.userId);
      return successResponse(c, request);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };


  cancelTopupRequest = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const requestId = parseInt(c.req.param('id'));

      const result = await this.walletService.cancelTopupRequest(requestId, user.userId);
      return successResponse(c, result, 'Topup request cancelled');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  getAllTopupRequests = async (c: Context<{ Bindings: Env }>) => {
    try {
      const status = c.req.query('status');
      const limit = parseInt(c.req.query('limit') || '100');

      const requests = await this.walletService.getAllTopupRequests(status, limit);
      return successResponse(c, requests);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  approveTopupRequest = async (c: Context<{ Bindings: Env }>) => {
    try {
      const admin = getAuthUser(c);
      const requestId = parseInt(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));

      const result = await this.walletService.approveTopupRequest(
        requestId,
        admin.userId,
        body.review_notes
      );

      return successResponse(c, result, 'Topup request approved');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  rejectTopupRequest = async (c: Context<{ Bindings: Env }>) => {
    try {
      const admin = getAuthUser(c);
      const requestId = parseInt(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));

      const result = await this.walletService.rejectTopupRequest(
        requestId,
        admin.userId,
        body.review_notes
      );

      return successResponse(c, result, 'Topup request rejected');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };
}