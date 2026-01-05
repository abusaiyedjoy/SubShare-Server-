import { Context } from 'hono';
import { AuthService } from './auth.service';
import { successResponse, errorResponse } from '../../utils/response';
import { getAuthUser } from '../../middlewares/auth.middleware';
import { Env } from '../../db';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (c: Context<{ Bindings: Env }>) => {
    try {
      const body = await c.req.json();
      const result = await this.authService.register(body);
      return successResponse(c, result, 'User registered successfully', 201);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  login = async (c: Context<{ Bindings: Env }>) => {
    try {
      const body = await c.req.json();
      const result = await this.authService.login(body);
      return successResponse(c, result, 'Login successful');
    } catch (error: any) {
      return errorResponse(c, error.message, 401);
    }
  };


  me = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const currentUser = await this.authService.getCurrentUser(user.userId);
      return successResponse(c, currentUser);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };

  logout = async (c: Context<{ Bindings: Env }>) => {
    return successResponse(c, null, 'Logout successful');
  };
}