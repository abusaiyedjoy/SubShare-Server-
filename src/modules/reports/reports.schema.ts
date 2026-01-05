import { ValidationRule } from '../../middlewares/validation.middleware';

export const createReportSchema: ValidationRule[] = [
  {
    field: 'shared_subscription_id',
    rules: [
      { type: 'required', message: 'Subscription ID is required' },
      { type: 'numeric', message: 'Subscription ID must be a number' },
      { type: 'positive', message: 'Subscription ID must be positive' },
    ],
  },
  {
    field: 'reason',
    rules: [
      { type: 'required', message: 'Reason is required' },
      { type: 'minLength', value: 10, message: 'Reason must be at least 10 characters' },
      { type: 'maxLength', value: 1000, message: 'Reason must not exceed 1000 characters' },
    ],
  },
];

export const resolveReportSchema: ValidationRule[] = [
  {
    field: 'status',
    rules: [
      { type: 'required', message: 'Status is required' },
    ],
  },
];