import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { sharedSubscriptions } from './sharedSubscriptions';
import { users } from './users';

export const subscriptionAccess = sqliteTable('subscription_access', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shared_subscription_id: integer('shared_subscription_id')
    .notNull()
    .references(() => sharedSubscriptions.id),
  accessed_by: integer('accessed_by')
    .notNull()
    .references(() => users.id),
  access_price_paid: real('access_price_paid').notNull(),
  admin_commission: real('admin_commission').notNull(),
  status: text('status', { enum: ['active', 'expired', 'cancelled'] })
    .notNull()
    .default('active'),
  access_start_time: integer('access_start_time', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  access_end_time: integer('access_end_time', { mode: 'timestamp' }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type SubscriptionAccess = typeof subscriptionAccess.$inferSelect;
export type NewSubscriptionAccess = typeof subscriptionAccess.$inferInsert;