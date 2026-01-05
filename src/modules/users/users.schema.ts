import { ValidationRule } from '../../middlewares/validation.middleware';

export const updateProfileSchema: ValidationRule[] = [
  {
    field: 'name',
    rules: [
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
      { type: 'maxLength', value: 100, message: 'Name must not exceed 100 characters' },
    ],
  },
];

export const updatePasswordSchema: ValidationRule[] = [
  {
    field: 'currentPassword',
    rules: [
      { type: 'required', message: 'Current password is required' },
    ],
  },
  {
    field: 'newPassword',
    rules: [
      { type: 'required', message: 'New password is required' },
      { type: 'minLength', value: 6, message: 'New password must be at least 6 characters' },
    ],
  },
];