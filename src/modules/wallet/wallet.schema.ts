import { ValidationRule } from '../../middlewares/validation.middleware';

export const topupRequestSchema: ValidationRule[] = [
  {
    field: 'amount',
    rules: [
      { type: 'required', message: 'Amount is required' },
      { type: 'numeric', message: 'Amount must be a number' },
      { type: 'positive', message: 'Amount must be positive' },
      { type: 'min', value: 10, message: 'Minimum topup amount is 10' },
      { type: 'max', value: 10000, message: 'Maximum topup amount is 10000' },
    ],
  },
  {
    field: 'transaction_id',
    rules: [
      { type: 'required', message: 'Transaction ID is required' },
      { type: 'minLength', value: 3, message: 'Transaction ID must be at least 3 characters' },
    ],
  },
];