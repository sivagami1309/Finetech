export interface QuoteCalculationRequest {
  sourceAmount: number;
  sourceCurrency: string;
  destinationCurrency: string;
}

export interface QuoteCalculationResult {
  sourceAmount: number;
  sourceCurrency: string;
  destinationCurrency: string;
  exchangeRate: number;
  grossDestinationAmount: number;
  serviceFeeSource: number;
  conversionFeeDestination: number;
  partnerFeeDestination: number;
  totalFeeSourceEquivalent: number;
  estimatedRecipientAmount: number;
  formulaDescription: string;
  expiresAt: string;
}

// Configured demonstration rate oracle with transparent markup
const DEMO_RATES: Record<string, Record<string, number>> = {
  USD: {
    INR: 83.500000,
    EUR: 0.920000,
    GBP: 0.780000,
  },
  EUR: {
    INR: 90.750000,
    USD: 1.087000,
  },
  GBP: {
    INR: 106.800000,
    USD: 1.282000,
  },
};

export class FeeCalculatorService {
  /**
   * Decimal-safe rounding to specified decimal places
   */
  public static round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Retrieves exchange rate for currency pair
   */
  public static getExchangeRate(source: string, destination: string): number {
    const src = source.toUpperCase();
    const dst = destination.toUpperCase();
    if (src === dst) return 1.0;
    if (DEMO_RATES[src] && DEMO_RATES[src][dst]) {
      return DEMO_RATES[src][dst];
    }
    // Default fallback rate for USD->INR
    return 83.500000;
  }

  /**
   * Validates amount according to financial constraints
   */
  public static validateAmount(amount: any): { valid: boolean; error?: string } {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, error: 'Amount must be a valid numeric value.' };
    }
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than zero.' };
    }
    if (amount < 10) {
      return { valid: false, error: 'Minimum cross-border payment request is $10.00 USD.' };
    }
    if (amount > 100000) {
      return { valid: false, error: 'Maximum cross-border demonstration limit is $100,000.00 USD.' };
    }
    return { valid: true };
  }

  /**
   * Calculates transparent fee breakdown
   */
  public static calculateQuote(req: QuoteCalculationRequest): QuoteCalculationResult {
    const validation = this.validateAmount(req.sourceAmount);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const sourceAmount = this.round(req.sourceAmount, 2);
    const sourceCurrency = req.sourceCurrency.toUpperCase();
    const destinationCurrency = req.destinationCurrency.toUpperCase();
    const exchangeRate = this.getExchangeRate(sourceCurrency, destinationCurrency);

    // 1. Gross destination amount
    const grossDestinationAmount = this.round(sourceAmount * exchangeRate, 2);

    // 2. Fixed transparent service fee in source currency: $2.50 USD
    const serviceFeeSource = 2.50;

    // 3. Transparent foreign exchange conversion fee: 0.35% of gross destination amount
    const conversionFeeDestination = this.round(grossDestinationAmount * 0.0035, 2);

    // 4. Zero partner bank fee (no hidden intermediary markups)
    const partnerFeeDestination = 0.00;

    // 5. Total fee converted to source currency equivalent
    const serviceFeeInDest = serviceFeeSource * exchangeRate;
    const totalFeesInDest = serviceFeeInDest + conversionFeeDestination + partnerFeeDestination;
    const totalFeeSourceEquivalent = this.round(totalFeesInDest / exchangeRate, 2);

    // 6. Final recipient amount in destination currency
    const estimatedRecipientAmount = this.round(grossDestinationAmount - totalFeesInDest, 2);

    // 7. Formula breakdown description for full auditability
    const formulaDescription = 
      `Gross (${destinationCurrency}) = ${sourceAmount.toFixed(2)} ${sourceCurrency} × ${exchangeRate.toFixed(4)} = ${grossDestinationAmount.toFixed(2)} ${destinationCurrency}. ` +
      `Deductions: Fixed Service Fee = ${serviceFeeSource.toFixed(2)} ${sourceCurrency} (${serviceFeeInDest.toFixed(2)} ${destinationCurrency}) + ` +
      `Conversion Network Fee (0.35%) = ${conversionFeeDestination.toFixed(2)} ${destinationCurrency}. ` +
      `Net Recipient Amount = ${estimatedRecipientAmount.toFixed(2)} ${destinationCurrency}.`;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute guaranteed rate window

    return {
      sourceAmount,
      sourceCurrency,
      destinationCurrency,
      exchangeRate,
      grossDestinationAmount,
      serviceFeeSource,
      conversionFeeDestination,
      partnerFeeDestination,
      totalFeeSourceEquivalent,
      estimatedRecipientAmount,
      formulaDescription,
      expiresAt,
    };
  }
}
