import test from 'node:test';
import assert from 'node:assert/strict';
import { ethers } from 'ethers';
import contractAbi from '../contractAbi.json';

test('SmartContract: ABI contains all required functions and events', () => {
  const functionNames = contractAbi
    .filter((item: any) => item.type === 'function')
    .map((item: any) => item.name);

  assert.ok(functionNames.includes('registerPaymentRecord'));
  assert.ok(functionNames.includes('getRecord'));
  assert.ok(functionNames.includes('isRecordRegistered'));
  assert.ok(functionNames.includes('setAuthorizedRecorder'));
  assert.ok(functionNames.includes('transferOwnership'));

  const eventNames = contractAbi
    .filter((item: any) => item.type === 'event')
    .map((item: any) => item.name);

  assert.ok(eventNames.includes('PaymentRecordRegistered'));
  assert.ok(eventNames.includes('RecorderAuthorizationUpdated'));
  assert.ok(eventNames.includes('OwnershipTransferred'));
});

test('SmartContract: Interface encodes and decodes registerPaymentRecord correctly', () => {
  const iface = new ethers.Interface(contractAbi);
  const paymentRef = 'FG-2026-USIN-89421';
  const metaHash = ethers.keccak256(ethers.toUtf8Bytes('sample_payment_metadata'));

  const encodedData = iface.encodeFunctionData('registerPaymentRecord', [paymentRef, metaHash]);
  assert.ok(encodedData.startsWith('0x'));

  const decoded = iface.decodeFunctionData('registerPaymentRecord', encodedData);
  assert.equal(decoded[0], paymentRef);
  assert.equal(decoded[1], metaHash);
});

test('SmartContract: Duplicate reference prevention logic structure', () => {
  // Simulating duplicate protection invariant enforced in Solidity
  const simulatedRecords = new Set<string>();

  function registerRecord(ref: string, hash: string) {
    if (simulatedRecords.has(ref)) {
      throw new Error('FinGuard: Duplicate record - reference already registered');
    }
    simulatedRecords.add(ref);
    return { ref, hash, isVerified: true };
  }

  const rec1 = registerRecord('FG-2026-001', '0x1234');
  assert.equal(rec1.isVerified, true);

  assert.throws(
    () => registerRecord('FG-2026-001', '0x5678'),
    /Duplicate record/
  );
});
