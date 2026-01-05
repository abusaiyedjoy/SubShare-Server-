import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { Env } from '../db';

export function initializeDatabase(env: Env) {
  return drizzle(env.DB, { schema });
}