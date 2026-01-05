export type UserRole = 'user' | 'admin';

export type TransactionType = 'topup' | 'purchase' | 'earning' | 'refund' | 'commission';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type AccessStatus = 'active' | 'expired' | 'cancelled';

export type TopupStatus = 'pending' | 'approved' | 'rejected';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}