import { eq, and, desc } from 'drizzle-orm';
import { Database } from '../../db';
import { subscriptionPlatforms } from '../../db/schema';

export interface CreatePlatformParams {
  name: string;
  logoUrl?: string;
  createdBy: number;
}

export interface UpdatePlatformParams {
  name?: string;
  logoUrl?: string;
  isActive?: boolean;
  status?: boolean;
}

export class PlatformsService {
  constructor(private db: Database) {}

  async getAllPlatforms(activeOnly: boolean = false) {
    let query = this.db
      .select({
        id: subscriptionPlatforms.id,
        name: subscriptionPlatforms.name,
        logo_url: subscriptionPlatforms.logo_url,
        is_active: subscriptionPlatforms.is_active,
        status: subscriptionPlatforms.status,
        created_at: subscriptionPlatforms.created_at,
      })
      .from(subscriptionPlatforms);

    if (activeOnly) {
      query = query.where(
        and(
          eq(subscriptionPlatforms.is_active, true),
          eq(subscriptionPlatforms.status, true)
        )
      ) as any;
    }

    const platforms = await query.orderBy(subscriptionPlatforms.name);

    return platforms;
  }

  async getPlatformById(platformId: number) {
    const [platform] = await this.db
      .select({
        id: subscriptionPlatforms.id,
        name: subscriptionPlatforms.name,
        logo_url: subscriptionPlatforms.logo_url,
        is_active: subscriptionPlatforms.is_active,
        status: subscriptionPlatforms.status,
        created_by: subscriptionPlatforms.created_by,
        created_at: subscriptionPlatforms.created_at,
      })
      .from(subscriptionPlatforms)
      .where(eq(subscriptionPlatforms.id, platformId));

    if (!platform) {
      throw new Error('Platform not found');
    }

    return platform;
  }

  async createPlatform(params: CreatePlatformParams) {
    // Check if platform with same name exists
    const [existing] = await this.db
      .select()
      .from(subscriptionPlatforms)
      .where(eq(subscriptionPlatforms.name, params.name));

    if (existing) {
      throw new Error('Platform with this name already exists');
    }

    // Create platform
    const [platform] = await this.db
      .insert(subscriptionPlatforms)
      .values({
        name: params.name,
        logo_url: params.logoUrl,
        created_by: params.createdBy,
        is_active: true,
        status: true,
      })
      .returning();

    return platform;
  }

  async updatePlatform(platformId: number, params: UpdatePlatformParams) {
    // Check if platform exists
    const [existing] = await this.db
      .select()
      .from(subscriptionPlatforms)
      .where(eq(subscriptionPlatforms.id, platformId));

    if (!existing) {
      throw new Error('Platform not found');
    }

    // Check if new name conflicts with another platform
    if (params.name && params.name !== existing.name) {
      const [nameConflict] = await this.db
        .select()
        .from(subscriptionPlatforms)
        .where(eq(subscriptionPlatforms.name, params.name));

      if (nameConflict) {
        throw new Error('Platform with this name already exists');
      }
    }

    // Build update object
    const updateData: any = {};
    if (params.name !== undefined) updateData.name = params.name;
    if (params.logoUrl !== undefined) updateData.logo_url = params.logoUrl;
    if (params.isActive !== undefined) updateData.is_active = params.isActive;
    if (params.status !== undefined) updateData.status = params.status;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No data to update');
    }

    // Update platform
    const [updated] = await this.db
      .update(subscriptionPlatforms)
      .set(updateData)
      .where(eq(subscriptionPlatforms.id, platformId))
      .returning();

    return updated;
  }

  async verifyPlatform(platformId: number, isActive: boolean) {
    const [platform] = await this.db
      .select()
      .from(subscriptionPlatforms)
      .where(eq(subscriptionPlatforms.id, platformId));

    if (!platform) {
      throw new Error('Platform not found');
    }

    const [updated] = await this.db
      .update(subscriptionPlatforms)
      .set({
        is_active: isActive,
        status: isActive,
      })
      .where(eq(subscriptionPlatforms.id, platformId))
      .returning();

    return updated;
  }

  async deletePlatform(platformId: number) {
    const [platform] = await this.db
      .select()
      .from(subscriptionPlatforms)
      .where(eq(subscriptionPlatforms.id, platformId));

    if (!platform) {
      throw new Error('Platform not found');
    }

    // Soft delete by setting status to false
    await this.db
      .update(subscriptionPlatforms)
      .set({
        status: false,
        is_active: false,
      })
      .where(eq(subscriptionPlatforms.id, platformId));

    return { message: 'Platform deleted successfully' };
  }

  async searchPlatforms(searchTerm: string, activeOnly: boolean = false) {
    let query = this.db
      .select({
        id: subscriptionPlatforms.id,
        name: subscriptionPlatforms.name,
        logo_url: subscriptionPlatforms.logo_url,
        is_active: subscriptionPlatforms.is_active,
        status: subscriptionPlatforms.status,
        created_at: subscriptionPlatforms.created_at,
      })
      .from(subscriptionPlatforms);

    if (activeOnly) {
      query = query.where(
        and(
          eq(subscriptionPlatforms.is_active, true),
          eq(subscriptionPlatforms.status, true)
        )
      ) as any;
    }

    const platforms = await query.orderBy(subscriptionPlatforms.name);

    // Filter by search term (client-side since SQLite doesn't have great LIKE support in D1)
    return platforms.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}