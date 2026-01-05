export interface CommissionCalculation {
  originalAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netAmount: number;
}

export class CommissionService {
  /**
   * Calculate commission from an amount
   */
  static calculateCommission(
    amount: number,
    commissionPercentage: number
  ): CommissionCalculation {
    const commissionAmount = (amount * commissionPercentage) / 100;
    const netAmount = amount - commissionAmount;

    return {
      originalAmount: amount,
      commissionPercentage,
      commissionAmount: parseFloat(commissionAmount.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
    };
  }

  /**
   * Calculate earnings for subscription owner
   */
  static calculateOwnerEarnings(
    totalAmount: number,
    commissionPercentage: number
  ): number {
    const calculation = this.calculateCommission(totalAmount, commissionPercentage);
    return calculation.netAmount;
  }

  /**
   * Calculate admin commission
   */
  static calculateAdminCommission(
    totalAmount: number,
    commissionPercentage: number
  ): number {
    const calculation = this.calculateCommission(totalAmount, commissionPercentage);
    return calculation.commissionAmount;
  }

  /**
   * Split payment between owner and admin
   */
  static splitPayment(
    totalAmount: number,
    commissionPercentage: number
  ): {
    ownerAmount: number;
    adminAmount: number;
    commissionPercentage: number;
  } {
    const calculation = this.calculateCommission(totalAmount, commissionPercentage);
    return {
      ownerAmount: calculation.netAmount,
      adminAmount: calculation.commissionAmount,
      commissionPercentage,
    };
  }
}