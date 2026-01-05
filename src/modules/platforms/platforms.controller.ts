import { Context } from 'hono';
import { PlatformsService } from './platforms.service';
import { successResponse, errorResponse } from '../../utils/response';
import { getAuthUser } from '../../middlewares/auth.middleware';
import { Env } from '../../db';

export class PlatformsController {
  constructor(private platformsService: PlatformsService) {}

  /**
   * Get all platforms
   */
  getAllPlatforms = async (c: Context<{ Bindings: Env }>) => {
    try {
      const activeOnly = c.req.query('active_only') === 'true';
      const platforms = await this.platformsService.getAllPlatforms(activeOnly);
      return successResponse(c, platforms);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  /**
   * Get platform by ID
   */
  getPlatformById = async (c: Context<{ Bindings: Env }>) => {
    try {
      const platformId = parseInt(c.req.param('id'));
      const platform = await this.platformsService.getPlatformById(platformId);
      return successResponse(c, platform);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };

  /**
   * Create platform (admin)
   */
  createPlatform = async (c: Context<{ Bindings: Env }>) => {
    try {
      const admin = getAuthUser(c);
      const body = await c.req.json();

      const platform = await this.platformsService.createPlatform({
        name: body.name,
        logoUrl: body.logo_url,
        createdBy: admin.userId,
      });

      return successResponse(c, platform, 'Platform created successfully', 201);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  /**
   * Update platform (admin)
   */
  updatePlatform = async (c: Context<{ Bindings: Env }>) => {
    try {
      const platformId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const platform = await this.platformsService.updatePlatform(platformId, {
        name: body.name,
        logoUrl: body.logo_url,
        isActive: body.is_active,
        status: body.status,
      });

      return successResponse(c, platform, 'Platform updated successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  /**
   * Verify platform (admin)
   */
  verifyPlatform = async (c: Context<{ Bindings: Env }>) => {
    try {
      const platformId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const platform = await this.platformsService.verifyPlatform(
        platformId,
        body.is_active ?? true
      );

      return successResponse(c, platform, 'Platform verification updated');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  /**
   * Delete platform (admin)
   */
  deletePlatform = async (c: Context<{ Bindings: Env }>) => {
    try {
      const platformId = parseInt(c.req.param('id'));
      const result = await this.platformsService.deletePlatform(platformId);
      return successResponse(c, result, 'Platform deleted successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  /**
   * Search platforms
   */
  searchPlatforms = async (c: Context<{ Bindings: Env }>) => {
    try {
      const searchTerm = c.req.query('q') || '';
      const activeOnly = c.req.query('active_only') === 'true';

      const platforms = await this.platformsService.searchPlatforms(
        searchTerm,
        activeOnly
      );

      return successResponse(c, platforms);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };
}