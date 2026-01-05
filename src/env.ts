export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_COMMISSION_PERCENTAGE: string;
  JWT_EXPIRY: string;
  ENCRYPTION_KEY: string;
}