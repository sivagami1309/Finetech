export type TransactionStatus =
  | 'DRAFT'
  | 'QUOTED'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export const ALLOWED_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  DRAFT: ['QUOTED', 'PENDING', 'CANCELLED'],
  QUOTED: ['PENDING', 'CANCELLED'],
  PENDING: ['PROCESSING', 'CANCELLED', 'FAILED'],
  PROCESSING: ['COMPLETED', 'FAILED'],
  COMPLETED: [], // Terminal
  FAILED: [], // Terminal
  CANCELLED: [], // Terminal
};

export class TransactionStateMachine {
  /**
   * Checks whether a status transition is permitted
   */
  public static canTransition(currentStatus: TransactionStatus, targetStatus: TransactionStatus): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  /**
   * Asserts valid state transition or throws descriptive error
   */
  public static assertTransition(currentStatus: TransactionStatus, targetStatus: TransactionStatus): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new Error(
        `Invalid transaction state transition from '${currentStatus}' to '${targetStatus}'. Permitted targets: [${(
          ALLOWED_TRANSITIONS[currentStatus] || []
        ).join(', ') || 'None (Terminal state)'}]`
      );
    }
  }

  /**
   * Generates a unique, professional payment reference code
   */
  public static generateReferenceCode(sourceCurrency: string = 'USD', destinationCurrency: string = 'INR'): string {
    const timestamp = Date.now().toString().slice(-5);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `FG-${new Date().getFullYear()}-${sourceCurrency}${destinationCurrency}-${timestamp}${randomSuffix}`;
  }
}
