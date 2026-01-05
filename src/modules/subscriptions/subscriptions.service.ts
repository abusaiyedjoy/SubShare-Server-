import { eq, and, desc } from 'drizzle-orm';
import { Database } from '../../db';
import { sharedSubscriptions, subscriptionPlatforms, users } from '../../db/schema';
import { EncryptionService } from '../../services/encryption.service';
import { TransactionService } from '../../services/transaction.service';
import { CommissionService } from '../../services/commission.service';
import { AccessService } from './access.service';

export interface CreateSharedSubscriptionParams {
  platformId: number;
  sharedBy: number;
  credentialsUsername: string;
  credentialsPassword: string;
  pricePerHour: number;
  expiresAt?: Date;
}

export interface UpdateSharedSubscriptionParams {
  credentialsUsername?: string;
  credentialsPassword?: string;
  pricePerHour?: number;
  status?: boolean;
}

export class SubscriptionsService {
  constructor(
    private db: Database,
    private encryptionService: EncryptionService,
    private transactionService: TransactionService,
    private accessService: AccessService,
    private commissionPercentage: number
  ) {}


  async getAllSubscriptions(filters?: {
    platformId?: number;
    verifiedOnly?: boolean;
    activeOnly?: boolean;
  }) {
    let query = this.db
      .select({
        id: sharedSubscriptions.id,
        platform_id: sharedSubscriptions.platform_id,
        shared_by: sharedSubscriptions.shared_by,
        price_per_hour: sharedSubscriptions.price_per_hour,
        status: sharedSubscriptions.status,
        is_verified: sharedSubscriptions.is_verified,
        total_shares_count: sharedSubscriptions.total_shares_count,
        created_at: sharedSubscriptions.created_at,
        expires_at: sharedSubscriptions.expires_at,
        platform_name: subscriptionPlatforms.name,
        platform_logo: subscriptionPlatforms.logo_url,
        owner_name: users.name,
      })
      .from(sharedSubscriptions)
      .leftJoin(
        subscriptionPlatforms,
        eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id)
      )
      .leftJoin(users, eq(sharedSubscriptions.shared_by, users.id));

    if (filters?.platformId) {
      query = query.where(eq(sharedSubscriptions.platform_id, filters.platformId)) as any;
    }

    if (filters?.verifiedOnly) {
      query = query.where(eq(sharedSubscriptions.is_verified, true)) as any;
    }

    if (filters?.activeOnly) {
      query = query.where(eq(sharedSubscriptions.status, true)) as any;
    }

    const subscriptions = await query.orderBy(desc(sharedSubscriptions.created_at));

    return subscriptions;
  }


  async getSubscriptionById(subscriptionId: number) {
    const [subscription] = await this.db
      .select({
        id: sharedSubscriptions.id,
        platform_id: sharedSubscriptions.platform_id,
        shared_by: sharedSubscriptions.shared_by,
        price_per_hour: sharedSubscriptions.price_per_hour,
        status: sharedSubscriptions.status,
        is_verified: sharedSubscriptions.is_verified,
        verification_note: sharedSubscriptions.verification_note,
        total_shares_count: sharedSubscriptions.total_shares_count,
        created_at: sharedSubscriptions.created_at,
        expires_at: sharedSubscriptions.expires_at,
        platform_name: subscriptionPlatforms.name,
        platform_logo: subscriptionPlatforms.logo_url,
        owner_name: users.name,
        owner_email: users.email,
      })
      .from(sharedSubscriptions)
      .leftJoin(
        subscriptionPlatforms,
        eq(sharedSubscriptions.platform_id, subscriptionPlatforms.id)
      )
      .leftJoin(users, eq(sharedSubscriptions.shared_by, users.id))
      .where(eq(sharedSubscriptions.id, subscriptionId));

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return subscription;
  }


  async createSharedSubscription(params: CreateSharedSubscriptionParams) {
    // Verify platform exists and is active
    const [platform] = await this.db
      .select()
      .from(subscriptionPlatforms)
      .where(eq(subscriptionPlatforms.id, params.platformId));

    if (!platform) {
      throw new Error('Platform not found');
    }

    if (!platform.is_active || !platform.status) {
      throw new Error('Platform is not active');
    }

    // Encrypt credentials
    const { encryptedUsername, encryptedPassword } =
      this.encryptionService.encryptCredentials(
        params.credentialsUsername,
        params.credentialsPassword
      );

    // Create subscription
    const [subscription] = await this.db
      .insert(sharedSubscriptions)
      .values({
        platform_id: params.platformId,
        shared_by: params.sharedBy,
        credentials_username: encryptedUsername,
        credentials_password: encryptedPassword,
        price_per_hour: params.pricePerHour,
        status: true,
        is_verified: false,
        expires_at: params.expiresAt ? Math.floor(params.expiresAt.getTime() / 1000) : null,
      })
      .returning();

    return subscription;
  }


  async updateSharedSubscription(
    subscriptionId: number,
    userId: number,
    params: UpdateSharedSubscriptionParams
  ) {
    // Check if subscription exists and belongs to user
    const [subscription] = await this.db
      .select()
      .from(sharedSubscriptions)
      .where(
        and(
          eq(sharedSubscriptions.id, subscriptionId),
          eq(sharedSubscriptions.shared_by, userId)
        )
      );

    if (!subscription) {
      throw new Error('Subscription not found or unauthorized');
    }

    // Build update object
    const updateData: any = {};

    if (params.credentialsUsername && params.credentialsPassword) {
      const { encryptedUsername, encryptedPassword } =
        this.encryptionService.encryptCredentials(
          params.credentialsUsername,
          params.credentialsPassword
        );
      updateData.credentials_username = encryptedUsername;
      updateData.credentials_password = encryptedPassword;
    }

    if (params.pricePerHour !== undefined) {
      updateData.price_per_hour = params.pricePerHour;
    }

    if (params.status !== undefined) {
      updateData.status = params.status;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No data to update');
    }

    const [updated] = await this.db
      .update(sharedSubscriptions)
      .set(updateData)
      .where(eq(sharedSubscriptions.id, subscriptionId))
      .returning();

    return updated;
  }

  async deleteSharedSubscription(subscriptionId: number, userId: number) {
    const [subscription] = await this.db
      .select()
      .from(sharedSubscriptions)
      .where(
        and(
          eq(sharedSubscriptions.id, subscriptionId),
          eq(sharedSubscriptions.shared_by, userId)
        )
      );

    if (!subscription) {
      throw new Error('Subscription not found or unauthorized');
    }

    // Soft delete by setting status to false
    await this.db
      .update(sharedSubscriptions)
      .set({ status: false })
      .where(eq(sharedSubscriptions.id, subscriptionId));

    return { message: 'Subscription deleted successfully' };
  }

  async unlockSubscription(subscriptionId: number, userId: number, hours: number) {
    // Get subscription details
    const [subscription] = await this.db
      .select()
      .from(sharedSubscriptions)
      .where(eq(sharedSubscriptions.id, subscriptionId));

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (!subscription.status) {
      throw new Error('Subscription is not active');
    }

    if (!subscription.is_verified) {
      throw new Error('Subscription is not verified yet');
    }

    // Check if user is trying to buy their own subscription
    if (subscription.shared_by === userId) {
      throw new Error('You cannot purchase your own subscription');
    }

    // Check if user already has active access
    const hasAccess = await this.accessService.hasActiveAccess(userId, subscriptionId);
    if (hasAccess) {
      throw new Error('You already have active access to this subscription');
    }

    const totalPrice = subscription.price_per_hour * hours;

    // Check user balance
    const [user] = await this.db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || user.balance < totalPrice) {
      throw new Error('Insufficient balance');
    }

    // Calculate commission
    const { ownerAmount, adminAmount } = CommissionService.splitPayment(
      totalPrice,
      this.commissionPercentage
    );

    // Deduct from buyer
    await this.transactionService.deductFunds(
      userId,
      totalPrice,
      'purchase',
      undefined,
      `Purchase ${hours}h access to subscription #${subscriptionId}`
    );

    // Create access record
    const access = await this.accessService.createAccess(
      userId,
      subscriptionId,
      hours,
      totalPrice,
      adminAmount
    );

    // Add earnings to owner
    await this.transactionService.processEarning(
      subscription.shared_by,
      ownerAmount,
      access.id,
      `Earning from subscription #${subscriptionId} (${hours}h)`
    );

    // Get admin user (first admin in system)
    const [admin] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, 'admin'));

    if (admin) {
      // Add commission to admin
      await this.transactionService.processAdminCommission(
        admin.id,
        adminAmount,
        this.commissionPercentage,
        access.id
      );
    }

    return {
      access,
      message: 'Subscription unlocked successfully',
      totalPaid: totalPrice,
      accessHours: hours,
    };
  }

  async getCredentials(subscriptionId: number, userId: number) {
    const subscription = await this.accessService.getCredentials(userId, subscriptionId);

    // Decrypt credentials
    const { username, password } = this.encryptionService.decryptCredentials(
      subscription.credentials_username,
      subscription.credentials_password
    );

    return {
      platform: subscription.platform_name,
      username,
      password,
    };
  }
}