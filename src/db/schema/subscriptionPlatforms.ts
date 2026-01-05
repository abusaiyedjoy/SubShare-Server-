import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const subscriptionPlatforms = sqliteTable('subscription_platforms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  logo_url: text('logo_url'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_by: integer('created_by')
    .notNull()
    .references(() => users.id),
  status: integer('status', { mode: 'boolean' }).notNull().default(true),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type SubscriptionPlatform = typeof subscriptionPlatforms.$inferSelect;
export type NewSubscriptionPlatform = typeof subscriptionPlatforms.$inferInsert;