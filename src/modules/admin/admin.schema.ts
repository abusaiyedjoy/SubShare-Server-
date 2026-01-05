import { ValidationRule } from '../../middlewares/validation.middleware';

export const verifySubscriptionSchema: ValidationRule[] = [
  {
    field: 'is_verified',
    rules: [
      { type: 'required', message: 'Verification status is required' },
    ],
  },
];

export const adjustBalanceSchema: ValidationRule[] = [
  {
    field: 'amount',
    rules: [
      { type: 'required', message: 'Amount is required' },
      { type: 'numeric', message: 'Amount must be a number' },
    ],
  },
  {
    field: 'notes',
    rules: [
      { type: 'required', message: 'Notes are required' },
      { type: 'minLength', value: 5, message: 'Notes must be at least 5 characters' },
    ],
  },
];

export const updateSettingSchema: ValidationRule[] = [
  {
    field: 'key',
    rules: [
      { type: 'required', message: 'Setting key is required' },
    ],
  },
  {
    field: 'value',
    rules: [
      { type: 'required', message: 'Setting value is required' },
    ],
  },
];