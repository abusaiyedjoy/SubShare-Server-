import { ValidationRule } from '../../middlewares/validation.middleware';

export const createSubscriptionSchema: ValidationRule[] = [
  {
    field: 'platform_id',
    rules: [
      { type: 'required', message: 'Platform ID is required' },
      { type: 'numeric', message: 'Platform ID must be a number' },
      { type: 'positive', message: 'Platform ID must be positive' },
    ],
  },
  {
    field: 'credentials_username',
    rules: [
      { type: 'required', message: 'Username is required' },
      { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
    ],
  },
  {
    field: 'credentials_password',
    rules: [
      { type: 'required', message: 'Password is required' },
      { type: 'minLength', value: 3, message: 'Password must be at least 3 characters' },
    ],
  },
  {
    field: 'price_per_hour',
    rules: [
      { type: 'required', message: 'Price per hour is required' },
      { type: 'numeric', message: 'Price must be a number' },
      { type: 'positive', message: 'Price must be positive' },
    ],
  },
];

export const updateSubscriptionSchema: ValidationRule[] = [
  {
    field: 'credentials_username',
    rules: [
      { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
    ],
  },
  {
    field: 'credentials_password',
    rules: [
      { type: 'minLength', value: 3, message: 'Password must be at least 3 characters' },
    ],
  },
  {
    field: 'price_per_hour',
    rules: [
      { type: 'numeric', message: 'Price must be a number' },
      { type: 'positive', message: 'Price must be positive' },
    ],
  },
];

export const unlockSubscriptionSchema: ValidationRule[] = [
  {
    field: 'hours',
    rules: [
      { type: 'required', message: 'Hours is required' },
      { type: 'numeric', message: 'Hours must be a number' },
      { type: 'positive', message: 'Hours must be positive' },
      { type: 'min', value: 1, message: 'Minimum 1 hour required' },
      { type: 'max', value: 720, message: 'Maximum 720 hours (30 days) allowed' },
    ],
  },
];