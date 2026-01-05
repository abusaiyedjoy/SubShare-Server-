import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_COMMISSION_PERCENTAGE: string;
  JWT_EXPIRY: string;
  ENCRYPTION_KEY: string;
};

export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

export type Database = ReturnType<typeof getDb>;

export * from './schema';