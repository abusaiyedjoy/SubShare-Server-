export interface CommissionConfig {
  percentage: number;
}

export function getCommissionConfig(env: { ADMIN_COMMISSION_PERCENTAGE: string }): CommissionConfig {
  const percentage = parseFloat(env.ADMIN_COMMISSION_PERCENTAGE || '10');
  
  if (isNaN(percentage) || percentage < 0 || percentage > 100) {
    throw new Error('Invalid commission percentage');
  }

  return {
    percentage,
  };
}

export function calculateCommissionAmount(amount: number, percentage: number): number {
  return parseFloat(((amount * percentage) / 100).toFixed(2));
}

export function calculateNetAmount(amount: number, percentage: number): number {
  const commission = calculateCommissionAmount(amount, percentage);
  return parseFloat((amount - commission).toFixed(2));
}