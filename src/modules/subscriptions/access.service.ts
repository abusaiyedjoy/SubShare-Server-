import { eq, and, gte } from 'drizzle-orm';
import { Database } from '../../db';
import { subscriptionAccess, sharedSubscriptions, subscriptionPlatforms } from '../../db/schema';
import { calculateAccessEndTime } from '../../utils/time';

export class AccessService {
  constructor(private db: Database) {}

  /**
   * Check if user has active access to a subscription
   */
  async hasActiveAccess(userId: number, sharedSubscriptionId: number): Promise<boolean> {
    const now = new Date();
    const [access] = await this.db
      .select()
      .from(subscriptionAccess)
      .where(
        and(
          eq(subscriptionAccess.accessed_by, userId),
          eq(subscriptionAccess.shared_subscription_id, sharedSubscriptionId),
          eq(subscriptionAccess.status, 'active'),
          gte(subscriptionAccess.access_end_time, Math.floor(now.getTime() / 1000))
        )
      );

    return !!access;
  }

  /**
   * Get active access for user and subscription
   */
  async getActiveAccess(userId: number, sharedSubscriptionId: number) {
    const now = new Date();
    const [access] = await this.db
      .select()
      .from(subscriptionAccess)
      .where(
        and(
          eq(subscriptionAccess.accessed_by, userId),
          eq(subscriptionAccess.shared_subscription_id, sharedSubscriptionId),
          eq(subscriptionAccess.status, 'active'),
          gte(subscriptionAccess.access_end_time, Math.floor(now.getTime() / 1000))
        )
      );

    return access || null;
  }

  /**
   * Create access record
   */
  async createAccess(
    userId: number,
    sharedSubscriptionId: number,
    hours: number,
    pricePaid: number,
    adminCommission: number
  ) {
    const accessEndTime = calculateAccessEndTime(hours);

    const [access] = await this.db
      .insert(subscriptionAccess)
      .values({
        shared_subscription_id: sharedSubscriptionId,
        accessed_by: userId,
        access_price_paid: pricePaid,
        admin_commission: adminCommission,
        status: 'active',
        access_start_time: Math.floor(Date.now() / 1000),
        access_end_time: Math.floor(accessEndTime.getTime() / 1000),
      })
      .returning();

    // Increment total shares count
    await this.db
      .update(sharedSubscriptions)
      .set({
        total_shares_count: (sharedSubscriptions.total_shares_count as any) + 1,
      })
      .where(eq(sharedSubscriptions.id, sharedSubscriptionId));

    return access;
  }

  /**
   * Get credentials if user has access
   */
  async getCredentials(userId: number, sharedSubscriptionId: number) {
    // Check if user has active access
    const hasAccess = await this.hasActiveAccess(userId, sharedSubscriptionId);

    if (!hasAccess) {
      throw new Error('You do not have active access to this subscription');
    }

    // Get subscription details with platform info
    const [subscription] = await this.db
      .select({
        id: sharedSubscriptions.id,
        credentials_username: sharedSubscriptions.credentials_username,
        credentials_password: sharedSubscriptions.credentials_password,
        platform_name: subscriptionPlatforms.name,
      })
      .from(sharedSubscriptions)
      .leftJoin(
        subscriptionPlatforms,
        eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id)
      )
      .where(eq(sharedSubscriptions.id, sharedSubscriptionId));

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return subscription;
  }

  /**
   * Update expired accesses
   */
  async updateExpiredAccesses() {
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .update(subscriptionAccess)
      .set({ status: 'expired' })
      .where(
        and(
          eq(subscriptionAccess.status, 'active'),
          gte(now, subscriptionAccess.access_end_time)
        )
      );
  }

  /**
   * Cancel access
   */
  async cancelAccess(accessId: number, userId: number) {
    const [access] = await this.db
      .select()
      .from(subscriptionAccess)
      .where(
        and(
          eq(subscriptionAccess.id, accessId),
          eq(subscriptionAccess.accessed_by, userId)
        )
      );

    if (!access) {
      throw new Error('Access not found');
    }

    if (access.status !== 'active') {
      throw new Error('Access is not active');
    }

    await this.db
      .update(subscriptionAccess)
      .set({ status: 'cancelled' })
      .where(eq(subscriptionAccess.id, accessId));

    return { message: 'Access cancelled successfully' };
  }
}