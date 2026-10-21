import test from 'node:test';
import assert from 'node:assert/strict';
import { TransactionStateMachine } from '../src/services/transactionService';

test('StateMachine: permits valid lifecycle progressions', () => {
  assert.equal(TransactionStateMachine.canTransition('DRAFT', 'PENDING'), true);
  assert.equal(TransactionStateMachine.canTransition('PENDING', 'PROCESSING'), true);
  assert.equal(TransactionStateMachine.canTransition('PROCESSING', 'COMPLETED'), true);
  assert.equal(TransactionStateMachine.canTransition('PROCESSING', 'FAILED'), true);
  assert.equal(TransactionStateMachine.canTransition('PENDING', 'CANCELLED'), true);
});

test('StateMachine: forbids invalid backwards or jump transitions', () => {
  assert.equal(TransactionStateMachine.canTransition('DRAFT', 'COMPLETED'), false);
  assert.equal(TransactionStateMachine.canTransition('COMPLETED', 'PENDING'), false);
  assert.equal(TransactionStateMachine.canTransition('COMPLETED', 'PROCESSING'), false);
  assert.equal(TransactionStateMachine.canTransition('FAILED', 'COMPLETED'), false);
  assert.equal(TransactionStateMachine.canTransition('CANCELLED', 'PENDING'), false);
});

test('StateMachine: generateReferenceCode formats compliant payment refs', () => {
  const ref = TransactionStateMachine.generateReferenceCode('USD', 'INR');
  assert.match(ref, /^FG-\d{4}-USDINR-\d+$/);
});
