import { Context } from 'hono';
import { ReportsService } from './reports.service';
import { successResponse, errorResponse } from '../../utils/response';
import { getAuthUser } from '../../middlewares/auth.middleware';
import { Env } from '../../db';

export class ReportsController {
  constructor(private reportsService: ReportsService) {}


  createReport = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const body = await c.req.json();

      const report = await this.reportsService.createReport({
        reportedByUserId: user.userId,
        sharedSubscriptionId: body.shared_subscription_id,
        reason: body.reason,
      });

      return successResponse(c, report, 'Report submitted successfully', 201);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  getUserReports = async (c: Context<{ Bindings: Env }>) => {
    try {
      const user = getAuthUser(c);
      const reports = await this.reportsService.getUserReports(user.userId);
      return successResponse(c, reports);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };


  getAllReports = async (c: Context<{ Bindings: Env }>) => {
    try {
      const status = c.req.query('status');
      const reports = await this.reportsService.getAllReports(status);
      return successResponse(c, reports);
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  getReportById = async (c: Context<{ Bindings: Env }>) => {
    try {
      const reportId = parseInt(c.req.param('id'));
      const report = await this.reportsService.getReportById(reportId);
      return successResponse(c, report);
    } catch (error: any) {
      return errorResponse(c, error.message, 404);
    }
  };


  resolveReport = async (c: Context<{ Bindings: Env }>) => {
    try {
      const admin = getAuthUser(c);
      const reportId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      const report = await this.reportsService.resolveReport(reportId, {
        status: body.status,
        resolutionNotes: body.resolution_notes,
        resolvedByAdminId: admin.userId,
      });

      return successResponse(c, report, 'Report resolved successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };

  deleteReport = async (c: Context<{ Bindings: Env }>) => {
    try {
      const reportId = parseInt(c.req.param('id'));
      const result = await this.reportsService.deleteReport(reportId);
      return successResponse(c, result, 'Report deleted successfully');
    } catch (error: any) {
      return errorResponse(c, error.message, 400);
    }
  };
}