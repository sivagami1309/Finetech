import test from 'node:test';
import assert from 'node:assert/strict';
import { BlockchainService } from '../src/services/blockchainService';

test('BlockchainLogic: generates deterministic Keccak-256 metadata hash', () => {
  const hash1 = BlockchainService.generateMetadataHash({
    paymentRef: 'FG-2026-USIN-89421',
    sourceAmount: 1200.00,
    sourceCurrency: 'USD',
    destinationAmount: 99850.00,
    destinationCurrency: 'INR',
    recipientName: 'Arjun Mehta',
  });

  const hash2 = BlockchainService.generateMetadataHash({
    paymentRef: 'FG-2026-USIN-89421',
    sourceAmount: 1200.00,
    sourceCurrency: 'USD',
    destinationAmount: 99850.00,
    destinationCurrency: 'INR',
    recipientName: 'Arjun Mehta',
  });

  // Must be deterministic
  assert.equal(hash1, hash2);
  assert.match(hash1, /^0x[0-9a-fA-F]{64}$/);

  // Altered data must generate different hash
  const hash3 = BlockchainService.generateMetadataHash({
    paymentRef: 'FG-2026-USIN-89421',
    sourceAmount: 1250.00, // Different amount
    sourceCurrency: 'USD',
    destinationAmount: 99850.00,
    destinationCurrency: 'INR',
    recipientName: 'Arjun Mehta',
  });
  assert.notEqual(hash1, hash3);
});

test('BlockchainLogic: verifies payment record payload structure', async () => {
  const res = await BlockchainService.verifyRecord('FG-2026-USIN-89421');
  assert.equal(res.paymentRef, 'FG-2026-USIN-89421');
  assert.equal(res.chainId, 80002);
  assert.equal(res.networkName, 'Polygon Amoy Testnet');
  assert.equal(res.isVerified, true);
});
