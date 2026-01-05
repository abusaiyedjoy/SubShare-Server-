import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { Database } from '../db';
import { transactions, users, NewTransaction } from '../db/schema';
import { CreateTransactionParams, TransactionFilters } from '../types/transactions';

export class TransactionService {
  constructor(private db: Database) {}

  /**
   * Create a new transaction
   */
  async createTransaction(params: CreateTransactionParams): Promise<number> {
    const [transaction] = await this.db
      .insert(transactions)
      .values({
        user_id: params.userId,
        amount: params.amount,
        transaction_type: params.transactionType,
        reference_id: params.referenceId,
        status: params.status || 'pending',
        admin_commission_percentage: params.adminCommissionPercentage,
        admin_commission_amount: params.adminCommissionAmount,
        related_subscription_access_id: params.relatedSubscriptionAccessId,
        notes: params.notes,
        processed_by_admin_id: params.processedByAdminId,
      })
      .returning({ id: transactions.id });

    return transaction.id;
  }

  /**
   * Update user balance
   */
  async updateUserBalance(userId: number, amount: number): Promise<void> {
    await this.db
      .update(users)
      .set({
        balance: amount,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));
  }

  /**
   * Add funds to user wallet
   */
  async addFunds(userId: number, amount: number, notes?: string): Promise<void> {
    const [user] = await this.db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    const newBalance = user.balance + amount;

    await this.updateUserBalance(userId, newBalance);

    await this.createTransaction({
      userId,
      amount,
      transactionType: 'topup',
      status: 'completed',
      notes,
    });
  }

  /**
   * Deduct funds from user wallet
   */
  async deductFunds(
    userId: number,
    amount: number,
    transactionType: 'purchase' | 'refund',
    relatedSubscriptionAccessId?: number,
    notes?: string
  ): Promise<void> {
    const [user] = await this.db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    if (user.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const newBalance = user.balance - amount;

    await this.updateUserBalance(userId, newBalance);

    await this.createTransaction({
      userId,
      amount: -amount,
      transactionType,
      status: 'completed',
      relatedSubscriptionAccessId,
      notes,
    });
  }

  /**
   * Process earning for subscription owner
   */
  async processEarning(
    userId: number,
    amount: number,
    relatedSubscriptionAccessId: number,
    notes?: string
  ): Promise<void> {
    const [user] = await this.db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    const newBalance = user.balance + amount;

    await this.updateUserBalance(userId, newBalance);

    await this.createTransaction({
      userId,
      amount,
      transactionType: 'earning',
      status: 'completed',
      relatedSubscriptionAccessId,
      notes,
    });
  }

  /**
   * Process admin commission
   */
  async processAdminCommission(
    adminId: number,
    amount: number,
    commissionPercentage: number,
    relatedSubscriptionAccessId: number
  ): Promise<void> {
    const [admin] = await this.db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, adminId));

    if (!admin) {
      throw new Error('Admin not found');
    }

    const newBalance = admin.balance + amount;

    await this.updateUserBalance(adminId, newBalance);

    await this.createTransaction({
      userId: adminId,
      amount,
      transactionType: 'commission',
      status: 'completed',
      adminCommissionPercentage: commissionPercentage,
      adminCommissionAmount: amount,
      relatedSubscriptionAccessId,
      notes: 'Admin commission',
    });
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: number, limit: number = 50) {
    return await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at))
      .limit(limit);
  }

  /**
   * Get all transactions with filters (admin)
   */
  async getAllTransactions(filters?: TransactionFilters, limit: number = 100) {
    let query = this.db.select().from(transactions);

    if (filters?.userId) {
      query = query.where(eq(transactions.user_id, filters.userId)) as any;
    }

    if (filters?.transactionType) {
      query = query.where(eq(transactions.transaction_type, filters.transactionType as any)) as any;
    }

    if (filters?.status) {
      query = query.where(eq(transactions.status, filters.status as any)) as any;
    }

    return await query.orderBy(desc(transactions.created_at)).limit(limit);
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: number) {
    const [transaction] = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    return transaction;
  }
}