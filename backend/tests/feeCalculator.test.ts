import test from 'node:test';
import assert from 'node:assert/strict';
import { FeeCalculatorService } from '../src/services/feeCalculatorService';

test('FeeCalculator: rejects negative or zero amounts', () => {
  const zeroCheck = FeeCalculatorService.validateAmount(0);
  assert.equal(zeroCheck.valid, false);

  const negCheck = FeeCalculatorService.validateAmount(-50);
  assert.equal(negCheck.valid, false);

  const invalidCheck = FeeCalculatorService.validateAmount('invalid');
  assert.equal(invalidCheck.valid, false);
});

test('FeeCalculator: enforces minimum and maximum amount bounds', () => {
  const belowMin = FeeCalculatorService.validateAmount(5);
  assert.equal(belowMin.valid, false);

  const aboveMax = FeeCalculatorService.validateAmount(250000);
  assert.equal(aboveMax.valid, false);

  const validAmount = FeeCalculatorService.validateAmount(1500);
  assert.equal(validAmount.valid, true);
});

test('FeeCalculator: calculates transparent USD to INR conversion accurately', () => {
  const quote = FeeCalculatorService.calculateQuote({
    sourceAmount: 1000,
    sourceCurrency: 'USD',
    destinationCurrency: 'INR',
  });

  // 1000 USD * 83.50 = 83500 INR gross
  assert.equal(quote.sourceAmount, 1000);
  assert.equal(quote.exchangeRate, 83.50);
  assert.equal(quote.grossDestinationAmount, 83500);

  // Fixed service fee is $2.50 USD
  assert.equal(quote.serviceFeeSource, 2.50);

  // Conversion fee is 0.35% of gross destination amount: 83500 * 0.0035 = 292.25 INR
  assert.equal(quote.conversionFeeDestination, 292.25);

  // Total fees in INR: ($2.50 * 83.50) + 292.25 = 208.75 + 292.25 = 501.00 INR
  // Estimated recipient amount: 83500 - 501 = 82999.00 INR
  assert.equal(quote.estimatedRecipientAmount, 82999.00);

  // Recipient amount must strictly equal gross minus all itemized fees
  const totalDeductions = (quote.serviceFeeSource * quote.exchangeRate) + quote.conversionFeeDestination;
  assert.equal(quote.grossDestinationAmount - totalDeductions, quote.estimatedRecipientAmount);
});
