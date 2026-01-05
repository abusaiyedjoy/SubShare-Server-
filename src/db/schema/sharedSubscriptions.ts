import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { subscriptionPlatforms } from './subscriptionPlatforms';
import { users } from './users';

export const sharedSubscriptions = sqliteTable('shared_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  platform_id: integer('platform_id')
    .notNull()
    .references(() => subscriptionPlatforms.id),
  shared_by: integer('shared_by')
    .notNull()
    .references(() => users.id),
  credentials_username: text('credentials_username').notNull(),
  credentials_password: text('credentials_password').notNull(),
  price_per_hour: real('price_per_hour').notNull(),
  status: integer('status', { mode: 'boolean' }).notNull().default(true),
  is_verified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  verification_note: text('verification_note'),
  verified_by_admin_id: integer('verified_by_admin_id').references(() => users.id),
  total_shares_count: integer('total_shares_count').notNull().default(0),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  expires_at: integer('expires_at', { mode: 'timestamp' }),
});

export type SharedSubscription = typeof sharedSubscriptions.$inferSelect;
export type NewSharedSubscription = typeof sharedSubscriptions.$inferInsert;