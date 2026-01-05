import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { subscriptionAccess } from './subscriptionAccess';

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id),
  amount: real('amount').notNull(),
  transaction_type: text('transaction_type', {
    enum: ['topup', 'purchase', 'earning', 'refund', 'commission'],
  }).notNull(),
  reference_id: text('reference_id'),
  status: text('status', {
    enum: ['pending', 'completed', 'failed', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  admin_commission_percentage: real('admin_commission_percentage'),
  admin_commission_amount: real('admin_commission_amount'),
  related_subscription_access_id: integer('related_subscription_access_id').references(
    () => subscriptionAccess.id
  ),
  notes: text('notes'),
  processed_by_admin_id: integer('processed_by_admin_id').references(() => users.id),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;