import { eq, desc, sql, count } from 'drizzle-orm';
import { Database } from '../../db';
import {
  users,
  sharedSubscriptions,
  subscriptionAccess,
  transactions,
  topupRequests,
  reports,
  platformSettings,
  subscriptionPlatforms,
} from '../../db/schema';
import { VerificationService } from '../../services/verification.service';
import { TransactionService } from '../../services/transaction.service';

export class AdminService {
  constructor(
    private db: Database,
    private verificationService: VerificationService,
    private transactionService: TransactionService
  ) {}

  async getDashboardStats() {
    // Total users
    const [totalUsersResult] = await this.db
      .select({ count: count() })
      .from(users);

    // Total subscriptions
    const [totalSubscriptionsResult] = await this.db
      .select({ count: count() })
      .from(sharedSubscriptions);

    // Pending verifications
    const [pendingVerificationsResult] = await this.db
      .select({ count: count() })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.is_verified, false));

    // Pending topup requests
    const [pendingTopupsResult] = await this.db
      .select({ count: count() })
      .from(topupRequests)
      .where(eq(topupRequests.status, 'pending'));

    // Pending reports
    const [pendingReportsResult] = await this.db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, 'pending'));

    // Total revenue (admin commissions)
    const [revenueResult] = await this.db
      .select({ total: sql<number>`SUM(${transactions.amount})` })
      .from(transactions)
      .where(eq(transactions.transaction_type, 'commission'));

    // Active subscriptions count
    const [activeAccessResult] = await this.db
      .select({ count: count() })
      .from(subscriptionAccess)
      .where(eq(subscriptionAccess.status, 'active'));

    // Recent transactions (last 10)
    const recentTransactions = await this.db
      .select({
        id: transactions.id,
        user_id: transactions.user_id,
        amount: transactions.amount,
        transaction_type: transactions.transaction_type,
        status: transactions.status,
        created_at: transactions.created_at,
        user_name: users.name,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.user_id, users.id))
      .orderBy(desc(transactions.created_at))
      .limit(10);

    return {
      totalUsers: totalUsersResult?.count || 0,
      totalSubscriptions: totalSubscriptionsResult?.count || 0,
      pendingVerifications: pendingVerificationsResult?.count || 0,
      pendingTopupRequests: pendingTopupsResult?.count || 0,
      pendingReports: pendingReportsResult?.count || 0,
      totalRevenue: revenueResult?.total || 0,
      activeAccess: activeAccessResult?.count || 0,
      recentTransactions,
    };
  }

  async getAllUsers(limit: number = 100) {
    const allUsers = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        balance: users.balance,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .orderBy(desc(users.created_at))
      .limit(limit);

    return allUsers;
  }

  async getUserDetails(userId: number) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        balance: users.balance,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's subscription count
    const [sharedCount] = await this.db
      .select({ count: count() })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.shared_by, userId));

    // Get user's access count
    const [accessCount] = await this.db
      .select({ count: count() })
      .from(subscriptionAccess)
      .where(eq(subscriptionAccess.accessed_by, userId));

    // Get user's recent transactions
    const recentTransactions = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at))
      .limit(10);

    return {
      user,
      sharedSubscriptionsCount: sharedCount?.count || 0,
      accessCount: accessCount?.count || 0,
      recentTransactions,
    };
  }

  async adjustUserBalance(userId: number, amount: number, adminId: number, notes: string) {
    const [user] = await this.db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    const newBalance = user.balance + amount;

    if (newBalance < 0) {
      throw new Error('Balance cannot be negative');
    }

    // Update balance
    await this.transactionService.updateUserBalance(userId, newBalance);

    // Create transaction record
    await this.transactionService.createTransaction({
      userId,
      amount,
      transactionType: amount > 0 ? 'topup' : 'refund',
      status: 'completed',
      notes: `Admin adjustment: ${notes}`,
      processedByAdminId: adminId,
    });

    return { message: 'Balance adjusted successfully', newBalance };
  }

  async getAllTransactions(limit: number = 100) {
    const allTransactions = await this.db
      .select({
        id: transactions.id,
        user_id: transactions.user_id,
        amount: transactions.amount,
        transaction_type: transactions.transaction_type,
        status: transactions.status,
        reference_id: transactions.reference_id,
        notes: transactions.notes,
        created_at: transactions.created_at,
        user_name: users.name,
        user_email: users.email,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.user_id, users.id))
      .orderBy(desc(transactions.created_at))
      .limit(limit);

    return allTransactions;
  }

  async getPendingVerifications() {
    return await this.verificationService.getPendingVerifications();
    }

  async verifySubscription(
    subscriptionId: number,
    adminId: number,
    isVerified: boolean,
    verificationNote?: string
  ) {
    await this.verificationService.verifySubscription(
      subscriptionId,
      adminId,
      isVerified,
      verificationNote
    );

    return { message: 'Subscription verification updated successfully' };
  }

  async getPlatformSettings() {
    const settings = await this.db
      .select({
        id: platformSettings.id,
        key: platformSettings.key,
        value: platformSettings.value,
        description: platformSettings.description,
        updated_at: platformSettings.updated_at,
      })
      .from(platformSettings);

    return settings;
  }

  async updatePlatformSetting(key: string, value: string) {
    const [existing] = await this.db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key));

    if (!existing) {
      // Insert new setting
      const [setting] = await this.db
        .insert(platformSettings)
        .values({
          key,
          value,
          description: null,
        })
        .returning();

      return setting;
    }

    // Update existing setting
    const [updated] = await this.db
      .update(platformSettings)
      .set({
        value,
        updated_at: new Date(),
      })
      .where(eq(platformSettings.key, key))
      .returning();

    return updated;
  }

  async getSystemStatistics() {
    // Platform statistics
    const [platformsCount] = await this.db
      .select({ count: count() })
      .from(subscriptionPlatforms);

    // User statistics by role
    const [regularUsersCount] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'user'));

    const [adminUsersCount] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'));

    // Transaction statistics
    const [completedTransactions] = await this.db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    const [totalTransactionVolume] = await this.db
      .select({ total: sql<number>`SUM(ABS(${transactions.amount}))` })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    // Subscription statistics
    const [verifiedSubscriptions] = await this.db
      .select({ count: count() })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.is_verified, true));

    const [activeSubscriptions] = await this.db
      .select({ count: count() })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.status, true));

    return {
      platforms: {
        total: platformsCount?.count || 0,
      },
      users: {
        total: (regularUsersCount?.count || 0) + (adminUsersCount?.count || 0),
        regular: regularUsersCount?.count || 0,
        admins: adminUsersCount?.count || 0,
      },
      transactions: {
        completed: completedTransactions?.count || 0,
        totalVolume: totalTransactionVolume?.total || 0,
      },
      subscriptions: {
        verified: verifiedSubscriptions?.count || 0,
        active: activeSubscriptions?.count || 0,
      },
    };
  }

  async updateUserRole(userId: number, role: 'user' | 'admin') {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    const [updated] = await this.db
      .update(users)
      .set({
        role,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return updated;
  }
}