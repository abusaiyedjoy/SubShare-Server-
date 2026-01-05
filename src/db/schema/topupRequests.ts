import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const topupRequests = sqliteTable('topup_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id),
  amount: real('amount').notNull(),
  transaction_id: text('transaction_id').notNull(),
  screenshot_url: text('screenshot_url'),
  status: text('status', {
    enum: ['pending', 'approved', 'rejected'],
  })
    .notNull()
    .default('pending'),
  reviewed_by_admin_id: integer('reviewed_by_admin_id').references(() => users.id),
  review_notes: text('review_notes'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export type TopupRequest = typeof topupRequests.$inferSelect;
export type NewTopupRequest = typeof topupRequests.$inferInsert;