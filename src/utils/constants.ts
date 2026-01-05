export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const TRANSACTION_TYPES = {
  TOPUP: 'topup',
  PURCHASE: 'purchase',
  EARNING: 'earning',
  REFUND: 'refund',
  COMMISSION: 'commission',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const ACCESS_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export const TOPUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const REPORT_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const;

export const DEFAULT_COMMISSION_PERCENTAGE = 10;

export const MIN_TOPUP_AMOUNT = 10;
export const MAX_TOPUP_AMOUNT = 10000;

export const MIN_SUBSCRIPTION_HOURS = 1;
export const MAX_SUBSCRIPTION_HOURS = 720; // 30 days

export const PLATFORM_SETTINGS_KEYS = {
  ADMIN_COMMISSION_PERCENTAGE: 'admin_commission_percentage',
  MIN_TOPUP_AMOUNT: 'min_topup_amount',
  MAX_TOPUP_AMOUNT: 'max_topup_amount',
  PLATFORM_NAME: 'platform_name',
  PLATFORM_EMAIL: 'platform_email',
} as const;