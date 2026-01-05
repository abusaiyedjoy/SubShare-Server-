import { Context } from 'hono';
import { SubscriptionsService } from './subscriptions.service';
import { successResponse, errorResponse } from '../../utils/response';
import { getAuthUser } from '../../middlewares/auth.middleware';
import { Env } from '../../db';

export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  getAllSubscriptions = async (c: Context<{ Bindings: Env }>) => {
    try {
      const platformId = c.req.query('platform_id');
      const verifiedOnly = c.req.query('verified_only') === 'true';
      const activeOnly = c.req.query('active_only') === 'true';

      const subscriptions = await this.subscriptionsService.getAllSubscriptions({
        platformId: platformId ? parseInt(platformId) : undefined,
        verifiedOnly,
        activeOnly,
      });

      return successResponse(c, subscriptions);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getSubscriptionById = async (c: Context<{ Bindings: Env }>) => {
    try {
      const subscriptionId = parseInt(c.req.param('id'));
      const subscription = await this.subscriptionsService.getSubscriptionById(subscriptionId);
      return successResponse(c, subscription);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };


  createSubscription = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const body = await c.req.json();

      const subscription = await this.subscriptionsService.createSharedSubscription({
        platformId: body.platform_id,
        sharedBy: user.userId,
        credentialsUsername: body.credentials_username,
        credentialsPassword: body.credentials_password,
        pricePerHour: body.price_per_hour,
        expiresAt: body.expires_at ? new Date(body.expires_at) : undefined,
      });

      return successResponse(
        c,
        subscription,
        'Subscription shared successfully. Waiting for admin verification.',
        201
      );
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  updateSubscription = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const subscriptionId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const subscription = await this.subscriptionsService.updateSharedSubscription(
        subscriptionId,
        user.userId,
        {
          credentialsUsername: body.credentials_username,
          credentialsPassword: body.credentials_password,
          pricePerHour: body.price_per_hour,
          status: body.status,
        }
      );

      return successResponse(c, subscription, 'Subscription updated successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  deleteSubscription = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const subscriptionId = parseInt(c.req.param('id'));

      const result = await this.subscriptionsService.deleteSharedSubscription(
        subscriptionId,
        user.userId
      );

      return successResponse(c, result, 'Subscription deleted successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  unlockSubscription = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const subscriptionId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const result = await this.subscriptionsService.unlockSubscription(
        subscriptionId,
        user.userId,
        body.hours
      );

      return successResponse(c, result, 'Subscription unlocked successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  getCredentials = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const subscriptionId = parseInt(c.req.param('id'));

      const credentials = await this.subscriptionsService.getCredentials(
        subscriptionId,
        user.userId
      );

      return successResponse(c, credentials);
    } catch (error: any) {
      return errorResponse(c, error.message, 403);
    }
  };
}