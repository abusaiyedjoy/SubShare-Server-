import { eq, desc } from 'drizzle-orm';
import { Database } from '../../db';
import { users, transactions, sharedSubscriptions, subscriptionAccess } from '../../db/schema';
import { hashPassword, verifyPassword } from '../../utils/hash';

export class UsersService {
  constructor(private db: Database) {}

  async getUserProfile(userId: number) {
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

    return user;
  }


  async updateProfile(userId: number, data: { name?: string }) {
    if (!data.name) {
      throw new Error('No data to update');
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({
        name: data.name,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        balance: users.balance,
      });

    return updatedUser;
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    // Get user with password
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await this.db
      .update(users)
      .set({
        password: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    return { message: 'Password updated successfully' };
  }

  async getWalletBalance(userId: number) {
    const [user] = await this.db
      .select({
        balance: users.balance,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    return { balance: user.balance };
  }

  async getWalletTransactions(userId: number, limit: number = 50) {
    const userTransactions = await this.db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        transaction_type: transactions.transaction_type,
        reference_id: transactions.reference_id,
        status: transactions.status,
        admin_commission_percentage: transactions.admin_commission_percentage,
        admin_commission_amount: transactions.admin_commission_amount,
        notes: transactions.notes,
        created_at: transactions.created_at,
      })
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at))
      .limit(limit);

    return userTransactions;
  }

  async getMySubscriptions(userId: number) {
    const activeSubscriptions = await this.db
      .select({
        id: subscriptionAccess.id,
        shared_subscription_id: subscriptionAccess.shared_subscription_id,
        access_price_paid: subscriptionAccess.access_price_paid,
        status: subscriptionAccess.status,
        access_start_time: subscriptionAccess.access_start_time,
        access_end_time: subscriptionAccess.access_end_time,
        created_at: subscriptionAccess.created_at,
        subscription: {
          id: sharedSubscriptions.id,
          platform_id: sharedSubscriptions.platform_id,
          price_per_hour: sharedSubscriptions.price_per_hour,
        },
      })
      .from(subscriptionAccess)
      .leftJoin(
        sharedSubscriptions,
        eq(subscriptionAccess.shared_subscription_id, sharedSubscriptions.id)
      )
      .where(eq(subscriptionAccess.accessed_by, userId))
      .orderBy(desc(subscriptionAccess.created_at));

    return activeSubscriptions;
  }

  async getSharedSubscriptions(userId: number) {
    const sharedSubs = await this.db
      .select({
        id: sharedSubscriptions.id,
        platform_id: sharedSubscriptions.platform_id,
        credentials_username: sharedSubscriptions.credentials_username,
        price_per_hour: sharedSubscriptions.price_per_hour,
        status: sharedSubscriptions.status,
        is_verified: sharedSubscriptions.is_verified,
        verification_note: sharedSubscriptions.verification_note,
        total_shares_count: sharedSubscriptions.total_shares_count,
        created_at: sharedSubscriptions.created_at,
        expires_at: sharedSubscriptions.expires_at,
      })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.shared_by, userId))
      .orderBy(desc(sharedSubscriptions.created_at));

    return sharedSubs;
  }

  async getUserStats(userId: number) {
    // Total earnings
    const [earningsResult] = await this.db
      .select({
        total: transactions.amount,
      })
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .where(eq(transactions.transaction_type, 'earning'))
      .where(eq(transactions.status, 'completed'));

    // Total purchases
    const [purchasesResult] = await this.db
      .select({
        total: transactions.amount,
      })
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .where(eq(transactions.transaction_type, 'purchase'))
      .where(eq(transactions.status, 'completed'));

    // Count shared subscriptions
    const sharedCount = await this.db
      .select({
        count: sharedSubscriptions.id,
      })
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.shared_by, userId));

    // Count active accesses
    const activeAccessCount = await this.db
      .select({
        count: subscriptionAccess.id,
      })
      .from(subscriptionAccess)
      .where(eq(subscriptionAccess.accessed_by, userId))
      .where(eq(subscriptionAccess.status, 'active'));

    return {
      totalEarnings: earningsResult?.total || 0,
      totalPurchases: Math.abs(purchasesResult?.total || 0),
      sharedSubscriptionsCount: sharedCount.length,
      activeSubscriptionsCount: activeAccessCount.length,
    };
  }
}