import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../src/services/authService';

test('AuthLogic: validates email formats correctly', () => {
  assert.equal(AuthService.validateEmail('freelancer@domain.com'), true);
  assert.equal(AuthService.validateEmail('invalid-email'), false);
  assert.equal(AuthService.validateEmail('missing@domain'), false);
});

test('AuthLogic: hashes passwords and generates verifiable tokens', async () => {
  const password = 'StrongPassword123!';
  const hash = await AuthService.hashPassword(password);
  assert.notEqual(hash, password);
  assert.match(hash, /^\$2[aby]\$\d+\$/);

  const isMatch = await AuthService.comparePassword(password, hash);
  assert.equal(isMatch, true);

  const isWrong = await AuthService.comparePassword('WrongPassword!', hash);
  assert.equal(isWrong, false);

  const token = AuthService.generateToken({
    id: 'usr_test_123',
    email: 'freelancer@test.com',
    role: 'freelancer',
    name: 'Test Freelancer',
  });

  assert.ok(token);
  const decoded = AuthService.verifyToken(token);
  assert.equal(decoded.id, 'usr_test_123');
  assert.equal(decoded.email, 'freelancer@test.com');
});
