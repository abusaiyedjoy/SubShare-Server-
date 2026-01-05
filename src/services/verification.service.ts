import { eq } from 'drizzle-orm';
import { Database } from '../db';
import { sharedSubscriptions, subscriptionPlatforms } from '../db/schema';

export class VerificationService {
  constructor(private db: Database) {}

  /**
   * Verify a shared subscription
   */
  async verifySubscription(
    subscriptionId: number,
    adminId: number,
    isVerified: boolean,
    verificationNote?: string
  ): Promise<void> {
    await this.db
      .update(sharedSubscriptions)
      .set({
        is_verified: isVerified,
        verified_by_admin_id: adminId,
        verification_note: verificationNote,
      })
      .where(eq(sharedSubscriptions.id, subscriptionId));
  }

  /**
   * Get pending subscription verifications
   */
  async getPendingVerifications() {
    return await this.db
      .select({
        id: sharedSubscriptions.id,
        platform_id: sharedSubscriptions.platform_id,
        shared_by: sharedSubscriptions.shared_by,
        credentials_username: sharedSubscriptions.credentials_username,
        price_per_hour: sharedSubscriptions.price_per_hour,
        status: sharedSubscriptions.status,
        created_at: sharedSubscriptions.created_at,
        platform_name: subscriptionPlatforms.name,
      })
      .from(sharedSubscriptions)
      .leftJoin(
        subscriptionPlatforms,
        eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id)
      )
      .where(eq(sharedSubscriptions.is_verified, false));
  }

  /**
   * Verify a platform
   */
  async verifyPlatform(platformId: number, isActive: boolean): Promise<void> {
    await this.db
      .update(subscriptionPlatforms)
      .set({
        is_active: isActive,
        status: isActive,
      })
      .where(eq(subscriptionPlatforms.id, platformId));
  }

  /**
   * Get subscription details for verification
   */
  async getSubscriptionForVerification(subscriptionId: number) {
    const [subscription] = await this.db
      .select({
        id: sharedSubscriptions.id,
        platform_id: sharedSubscriptions.platform_id,
        shared_by: sharedSubscriptions.shared_by,
        credentials_username: sharedSubscriptions.credentials_username,
        credentials_password: sharedSubscriptions.credentials_password,
        price_per_hour: sharedSubscriptions.price_per_hour,
        status: sharedSubscriptions.status,
        is_verified: sharedSubscriptions.is_verified,
        verification_note: sharedSubscriptions.verification_note,
        created_at: sharedSubscriptions.created_at,
        platform_name: subscriptionPlatforms.name,
      })
      .from(sharedSubscriptions)
      .leftJoin(
        subscriptionPlatforms,
        eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id)
      )
      .where(eq(sharedSubscriptions.id, subscriptionId));

    return subscription;
  }
}