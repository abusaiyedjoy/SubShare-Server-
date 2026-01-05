import { eq, and, desc } from 'drizzle-orm';
import { Database } from '../../db';
import { reports, sharedSubscriptions, users } from '../../db/schema';

export interface CreateReportParams {
  reportedByUserId: number;
  sharedSubscriptionId: number;
  reason: string;
}

export interface ResolveReportParams {
  status: 'resolved' | 'dismissed';
  resolutionNotes?: string;
  resolvedByAdminId: number;
}

export class ReportsService {
  constructor(private db: Database) {}

  async createReport(params: CreateReportParams) {
    // Check if subscription exists
    const [subscription] = await this.db
      .select()
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.id, params.sharedSubscriptionId));

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if user already reported this subscription
    const [existingReport] = await this.db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.reported_by_user_id, params.reportedByUserId),
          eq(reports.shared_subscription_id, params.sharedSubscriptionId),
          eq(reports.status, 'pending')
        )
      );

    if (existingReport) {
      throw new Error('You have already reported this subscription');
    }

    // Create report
    const [report] = await this.db
      .insert(reports)
      .values({
        reported_by_user_id: params.reportedByUserId,
        shared_subscription_id: params.sharedSubscriptionId,
        reason: params.reason,
        status: 'pending',
      })
      .returning();

    return report;
  }

  async getAllReports(status?: string) {
    let query = this.db
      .select({
        id: reports.id,
        reported_by_user_id: reports.reported_by_user_id,
        shared_subscription_id: reports.shared_subscription_id,
        reason: reports.reason,
        status: reports.status,
        resolved_by_admin_id: reports.resolved_by_admin_id,
        resolution_notes: reports.resolution_notes,
        created_at: reports.created_at,
        updated_at: reports.updated_at,
        reporter_name: users.name,
        reporter_email: users.email,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reported_by_user_id, users.id));

    if (status) {
      query = query.where(eq(reports.status, status as any)) as any;
    }

    const allReports = await query.orderBy(desc(reports.created_at));

    return allReports;
  }

  async getReportById(reportId: number) {
    const [report] = await this.db
      .select({
        id: reports.id,
        reported_by_user_id: reports.reported_by_user_id,
        shared_subscription_id: reports.shared_subscription_id,
        reason: reports.reason,
        status: reports.status,
        resolved_by_admin_id: reports.resolved_by_admin_id,
        resolution_notes: reports.resolution_notes,
        created_at: reports.created_at,
        updated_at: reports.updated_at,
        reporter_name: users.name,
        reporter_email: users.email,
        subscription: {
          id: sharedSubscriptions.id,
          platform_id: sharedSubscriptions.platform_id,
          shared_by: sharedSubscriptions.shared_by,
          status: sharedSubscriptions.status,
        },
      })
      .from(reports)
      .leftJoin(users, eq(reports.reported_by_user_id, users.id))
      .leftJoin(
        sharedSubscriptions,
        eq(reports.shared_subscription_id, sharedSubscriptions.id)
      )
      .where(eq(reports.id, reportId));

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  async getUserReports(userId: number) {
    const userReports = await this.db
      .select({
        id: reports.id,
        shared_subscription_id: reports.shared_subscription_id,
        reason: reports.reason,
        status: reports.status,
        resolution_notes: reports.resolution_notes,
        created_at: reports.created_at,
        updated_at: reports.updated_at,
      })
      .from(reports)
      .where(eq(reports.reported_by_user_id, userId))
      .orderBy(desc(reports.created_at));

    return userReports;
  }

  async resolveReport(reportId: number, params: ResolveReportParams) {
    const [report] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId));

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.status !== 'pending') {
      throw new Error('Report is not pending');
    }

    // Update report
    const [updated] = await this.db
      .update(reports)
      .set({
        status: params.status,
        resolved_by_admin_id: params.resolvedByAdminId,
        resolution_notes: params.resolutionNotes,
        updated_at: new Date(),
      })
      .where(eq(reports.id, reportId))
      .returning();

    // If resolved, suspend the subscription temporarily
    if (params.status === 'resolved') {
      await this.db
        .update(sharedSubscriptions)
        .set({
          status: false,
          is_verified: false,
        })
        .where(eq(sharedSubscriptions.id, report.shared_subscription_id));
    }

    return updated;
  }


  async deleteReport(reportId: number) {
    const [report] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId));

    if (!report) {
      throw new Error('Report not found');
    }

    await this.db.delete(reports).where(eq(reports.id, reportId));

    return { message: 'Report deleted successfully' };
  }
}