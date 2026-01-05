import { ValidationRule } from '../../middlewares/validation.middleware';

export const registerSchema: ValidationRule[] = [
  {
    field: 'name',
    rules: [
      { type: 'required', message: 'Name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
      { type: 'maxLength', value: 100, message: 'Name must not exceed 100 characters' },
    ],
  },
  {
    field: 'email',
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Invalid email format' },
    ],
  },
  {
    field: 'password',
    rules: [
      { type: 'required', message: 'Password is required' },
      { type: 'minLength', value: 6, message: 'Password must be at least 6 characters' },
    ],
  },
];

export const loginSchema: ValidationRule[] = [
  {
    field: 'email',
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Invalid email format' },
    ],
  },
  {
    field: 'password',
    rules: [
      { type: 'required', message: 'Password is required' },
    ],
  },
];