import { eq, desc, and } from 'drizzle-orm';
import { Database } from '../../db';
import { topupRequests, users } from '../../db/schema';
import { TransactionService } from '../../services/transaction.service';

export interface CreateTopupRequestParams {
  userId: number;
  amount: number;
  transactionId: string;
  screenshotUrl?: string;
}

export class WalletService {
  constructor(
    private db: Database,
    private transactionService: TransactionService
  ) {}


  async createTopupRequest(params: CreateTopupRequestParams) {
    // Check if transaction ID already exists
    const [existing] = await this.db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.transaction_id, params.transactionId));

    if (existing) {
      throw new Error('Transaction ID already used');
    }

    // Create topup request
    const [request] = await this.db
      .insert(topupRequests)
      .values({
        user_id: params.userId,
        amount: params.amount,
        transaction_id: params.transactionId,
        screenshot_url: params.screenshotUrl,
        status: 'pending',
      })
      .returning();

    return request;
  }

  async getUserTopupRequests(userId: number, limit: number = 50) {
    const requests = await this.db
      .select({
        id: topupRequests.id,
        amount: topupRequests.amount,
        transaction_id: topupRequests.transaction_id,
        screenshot_url: topupRequests.screenshot_url,
        status: topupRequests.status,
        review_notes: topupRequests.review_notes,
        created_at: topupRequests.created_at,
        updated_at: topupRequests.updated_at,
      })
      .from(topupRequests)
      .where(eq(topupRequests.user_id, userId))
      .orderBy(desc(topupRequests.created_at))
      .limit(limit);

    return requests;
  }


  async getTopupRequestById(requestId: number, userId?: number) {
    let query = this.db
      .select({
        id: topupRequests.id,
        user_id: topupRequests.user_id,
        amount: topupRequests.amount,
        transaction_id: topupRequests.transaction_id,
        screenshot_url: topupRequests.screenshot_url,
        status: topupRequests.status,
        reviewed_by_admin_id: topupRequests.reviewed_by_admin_id,
        review_notes: topupRequests.review_notes,
        created_at: topupRequests.created_at,
        updated_at: topupRequests.updated_at,
        user_name: users.name,
        user_email: users.email,
      })
      .from(topupRequests)
      .leftJoin(users, eq(topupRequests.user_id, users.id))
      .where(eq(topupRequests.id, requestId));

    // If userId provided, ensure request belongs to user
    if (userId) {
      query = query.where(eq(topupRequests.user_id, userId)) as any;
    }

    const [request] = await query;

    if (!request) {
      throw new Error('Topup request not found');
    }

    return request;
  }


  async getAllTopupRequests(status?: string, limit: number = 100) {
    let query = this.db
      .select({
        id: topupRequests.id,
        user_id: topupRequests.user_id,
        amount: topupRequests.amount,
        transaction_id: topupRequests.transaction_id,
        screenshot_url: topupRequests.screenshot_url,
        status: topupRequests.status,
        reviewed_by_admin_id: topupRequests.reviewed_by_admin_id,
        review_notes: topupRequests.review_notes,
        created_at: topupRequests.created_at,
        updated_at: topupRequests.updated_at,
        user_name: users.name,
        user_email: users.email,
      })
      .from(topupRequests)
      .leftJoin(users, eq(topupRequests.user_id, users.id));

    if (status) {
      query = query.where(eq(topupRequests.status, status as any)) as any;
    }

    const requests = await query.orderBy(desc(topupRequests.created_at)).limit(limit);

    return requests;
  }

  async approveTopupRequest(
    requestId: number,
    adminId: number,
    reviewNotes?: string
  ) {
    // Get request details
    const [request] = await this.db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.id, requestId));

    if (!request) {
      throw new Error('Topup request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Topup request is not pending');
    }

    // Update request status
    await this.db
      .update(topupRequests)
      .set({
        status: 'approved',
        reviewed_by_admin_id: adminId,
        review_notes: reviewNotes,
        updated_at: new Date(),
      })
      .where(eq(topupRequests.id, requestId));

    // Add funds to user wallet
    await this.transactionService.addFunds(
      request.user_id,
      request.amount,
      `Topup approved - ${request.transaction_id}`
    );

    return { message: 'Topup request approved and funds added' };
  }


  async rejectTopupRequest(
    requestId: number,
    adminId: number,
    reviewNotes?: string
  ) {
    // Get request details
    const [request] = await this.db
      .select()
      .from(topupRequests)
      .where(eq(topupRequests.id, requestId));

    if (!request) {
      throw new Error('Topup request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Topup request is not pending');
    }

    // Update request status
    await this.db
      .update(topupRequests)
      .set({
        status: 'rejected',
        reviewed_by_admin_id: adminId,
        review_notes: reviewNotes || 'Request rejected',
        updated_at: new Date(),
      })
      .where(eq(topupRequests.id, requestId));

    return { message: 'Topup request rejected' };
  }


  async cancelTopupRequest(requestId: number, userId: number) {
    // Get request details
    const [request] = await this.db
      .select()
      .from(topupRequests)
      .where(
        and(
          eq(topupRequests.id, requestId),
          eq(topupRequests.user_id, userId)
        )
      );

    if (!request) {
      throw new Error('Topup request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Can only cancel pending requests');
    }

    // Update request status
    await this.db
      .update(topupRequests)
      .set({
        status: 'rejected',
        review_notes: 'Cancelled by user',
        updated_at: new Date(),
      })
      .where(eq(topupRequests.id, requestId));

    return { message: 'Topup request cancelled' };
  }
}