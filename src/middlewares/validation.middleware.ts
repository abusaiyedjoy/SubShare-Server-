import { Context, Next } from 'hono';
import { validationErrorResponse } from '../utils/response';

export interface ValidationRule {
  field: string;
  rules: Array<{
    type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'numeric' | 'positive';
    value?: any;
    message: string;
  }>;
}

export function validateRequest(rules: ValidationRule[]) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => ({}));
    const errors: Record<string, string[]> = {};

    for (const rule of rules) {
      const fieldValue = body[rule.field];
      const fieldErrors: string[] = [];

      for (const validation of rule.rules) {
        switch (validation.type) {
          case 'required':
            if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
              fieldErrors.push(validation.message);
            }
            break;

          case 'email':
            if (fieldValue && !isValidEmail(fieldValue)) {
              fieldErrors.push(validation.message);
            }
            break;

          case 'min':
            if (fieldValue !== undefined && fieldValue < validation.value) {
              fieldErrors.push(validation.message);
            }
            break;

          case 'max':
            if (fieldValue !== undefined && fieldValue > validation.value) {
              fieldErrors.push(validation.message);
            }
            break;

          case 'minLength':
            if (fieldValue && fieldValue.length < validation.value) {
              fieldErrors.push(validation.message);
            }
            break;

          case 'maxLength':
            if (fieldValue && fieldValue.length > validation.value) {
              fieldErrors.push(validation.message);
            }
            break;

          case 'numeric':
            if (fieldValue && isNaN(Number(fieldValue))) {
              fieldErrors.push(validation.message);
            }
            break;

          case 'positive':
            if (fieldValue !== undefined && Number(fieldValue) <= 0) {
              fieldErrors.push(validation.message);
            }
            break;
        }
      }

      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(c, errors);
    }

    await next();
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}