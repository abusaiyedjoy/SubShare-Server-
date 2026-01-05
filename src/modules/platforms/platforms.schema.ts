import { ValidationRule } from '../../middlewares/validation.middleware';

export const createPlatformSchema: ValidationRule[] = [
  {
    field: 'name',
    rules: [
      { type: 'required', message: 'Platform name is required' },
      { type: 'minLength', value: 2, message: 'Platform name must be at least 2 characters' },
      { type: 'maxLength', value: 100, message: 'Platform name must not exceed 100 characters' },
    ],
  },
];

export const updatePlatformSchema: ValidationRule[] = [
  {
    field: 'name',
    rules: [
      { type: 'minLength', value: 2, message: 'Platform name must be at least 2 characters' },
      { type: 'maxLength', value: 100, message: 'Platform name must not exceed 100 characters' },
    ],
  },
];