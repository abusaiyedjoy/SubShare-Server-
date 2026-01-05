export interface CreateTransactionParams {
  userId: number;
  amount: number;
  transactionType: 'topup' | 'purchase' | 'earning' | 'refund' | 'commission';
  referenceId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  adminCommissionPercentage?: number;
  adminCommissionAmount?: number;
  relatedSubscriptionAccessId?: number;
  notes?: string;
  processedByAdminId?: number;
}

export interface TransactionFilters {
  userId?: number;
  transactionType?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
}