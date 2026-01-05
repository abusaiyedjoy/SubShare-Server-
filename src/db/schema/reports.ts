import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { sharedSubscriptions } from './sharedSubscriptions';

export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reported_by_user_id: integer('reported_by_user_id')
    .notNull()
    .references(() => users.id),
  shared_subscription_id: integer('shared_subscription_id')
    .notNull()
    .references(() => sharedSubscriptions.id),
  reason: text('reason').notNull(),
  status: text('status', {
    enum: ['pending', 'resolved', 'dismissed'],
  })
    .notNull()
    .default('pending'),
  resolved_by_admin_id: integer('resolved_by_admin_id').references(() => users.id),
  resolution_notes: text('resolution_notes'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;