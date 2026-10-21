import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getDbPool } from '../src/config/db';
import { AuthService } from '../src/services/authService';
import { createExpressApp } from '../src/app';

test('PostgreSQL Connection & Schema: connects to database and verifies public.users table', async () => {
  const pool = await getDbPool();
  assert.ok(pool, 'Database pool must be created');

  // Verify connection with standard PostgreSQL query
  const ping = await pool.query('SELECT 1 as alive');
  assert.equal(ping.rows[0].alive, 1, 'SELECT 1 must succeed');

  // Verify public.users table exists
  const tableCheck = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
  );
  assert.ok(tableCheck.rows.length > 0, 'public.users table must exist');

  // Verify table columns
  const colCheck = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'"
  );
  const columnNames = colCheck.rows.map((r: any) => (r.column_name || r.COLUMN_NAME).toLowerCase());
  assert.ok(columnNames.includes('id'), 'public.users must have id column');
  assert.ok(columnNames.includes('full_name'), 'public.users must have full_name column');
  assert.ok(columnNames.includes('email'), 'public.users must have email column');
  assert.ok(columnNames.includes('password_hash'), 'public.users must have password_hash column');
  assert.ok(columnNames.includes('role'), 'public.users must have role column');
  assert.ok(columnNames.includes('account_status'), 'public.users must have account_status column');
  assert.ok(columnNames.includes('created_at'), 'public.users must have created_at column');
});

test('PostgreSQL Auth Flow: Register user, verify in PostgreSQL via SELECT query, and login', async () => {
  const pool = await getDbPool();
  const app = createExpressApp();

  const testEmail = `freelancer.${Date.now()}@trustflow.dev`;
  const testFullName = 'Elena Rostova';
  const testPassword = 'FinGuardSecurePassword2026!';

  // Helper function to dispatch mock requests through express app
  async function makeRequest(
    method: 'GET' | 'POST',
    path: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<{ status: number; body: any; headers: any }> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.listen(0, () => {
        const port = (server.address() as any).port;
        const postData = body ? JSON.stringify(body) : '';
        const reqHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        };
        if (body) {
          reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
        }

        const req = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path,
            method,
            headers: reqHeaders,
          },
          (res: any) => {
            let resData = '';
            res.on('data', (chunk: any) => (resData += chunk));
            res.on('end', () => {
              server.close();
              let parsedBody;
              try {
                parsedBody = JSON.parse(resData);
              } catch {
                parsedBody = resData;
              }
              resolve({
                status: res.statusCode,
                body: parsedBody,
                headers: res.headers,
              });
            });
          }
        );
        req.on('error', (err: any) => {
          server.close();
          reject(err);
        });
        if (body) {
          req.write(postData);
        }
        req.end();
      });
    });
  }

  // 1. Validation test: Missing full_name
  const missingNameRes = await makeRequest('POST', '/api/auth/register', {
    email: testEmail,
    password: testPassword,
  });
  assert.equal(missingNameRes.status, 400, 'Missing full_name should return HTTP 400');

  // 2. Validation test: Invalid email
  const invalidEmailRes = await makeRequest('POST', '/api/auth/register', {
    full_name: testFullName,
    email: 'not-an-email',
    password: testPassword,
  });
  assert.equal(invalidEmailRes.status, 400, 'Invalid email format should return HTTP 400');

  // 3. Validation test: Short password
  const shortPassRes = await makeRequest('POST', '/api/auth/register', {
    full_name: testFullName,
    email: testEmail,
    password: 'short',
  });
  assert.equal(shortPassRes.status, 400, 'Password < 8 chars should return HTTP 400');

  // 4. Successful Registration
  const regRes = await makeRequest('POST', '/api/auth/register', {
    full_name: testFullName,
    email: testEmail,
    password: testPassword,
  });
  assert.equal(regRes.status, 201, 'Registration should return HTTP 201 Created');
  assert.equal(regRes.body.success, true);
  assert.ok(regRes.body.token, 'Should return JWT token upon registration');
  assert.equal(regRes.body.user.full_name, testFullName);
  assert.equal(regRes.body.user.email, testEmail.toLowerCase());
  assert.equal(regRes.body.user.role, 'user');
  assert.equal(regRes.body.user.account_status, 'active');
  assert.equal(regRes.body.user.password_hash, undefined, 'password_hash must NEVER be returned');

  // 5. Verification requirement: Run the exact specified query:
  //    SELECT id, full_name, email, role, account_status, created_at FROM public.users ORDER BY id DESC;
  const selectQuery = await pool.query(
    'SELECT id, full_name, email, role, account_status, created_at FROM public.users ORDER BY id DESC;'
  );
  assert.ok(selectQuery.rows.length > 0, 'Users query must return accounts');
  const foundUser = selectQuery.rows.find((u: any) => u.email === testEmail.toLowerCase());
  assert.ok(foundUser, 'Registered user must be saved in PostgreSQL public.users');
  assert.equal(foundUser.full_name, testFullName);
  assert.equal(foundUser.role, 'user');
  assert.equal(foundUser.account_status, 'active');
  assert.ok(foundUser.created_at, 'created_at timestamp must be present');

  // Verify password hash is stored safely in PostgreSQL and matches bcrypt format
  const hashQuery = await pool.query('SELECT password_hash FROM public.users WHERE email = $1', [
    testEmail.toLowerCase(),
  ]);
  const storedHash = hashQuery.rows[0].password_hash;
  assert.notEqual(storedHash, testPassword, 'Stored password must not be plain text');
  assert.ok(storedHash.startsWith('$2'), 'Stored password must be a bcrypt hash ($2...)');
  const isValidBcrypt = await AuthService.comparePassword(testPassword, storedHash);
  assert.equal(isValidBcrypt, true, 'Bcrypt compare must verify original password');

  // 6. Duplicate Email Registration check
  const duplicateRes = await makeRequest('POST', '/api/auth/register', {
    full_name: 'Another Freelancer',
    email: testEmail,
    password: 'AnotherPassword123!',
  });
  assert.equal(duplicateRes.status, 409, 'Duplicate email registration must return HTTP 409 Conflict');

  // 7. Login: Invalid password check
  const wrongPassRes = await makeRequest('POST', '/api/auth/login', {
    email: testEmail,
    password: 'WrongPassword456!',
  });
  assert.equal(wrongPassRes.status, 401, 'Invalid password must return HTTP 401 Unauthorized');

  // 8. Login: Non-existent email check
  const wrongEmailRes = await makeRequest('POST', '/api/auth/login', {
    email: 'nonexistent@trustflow.dev',
    password: testPassword,
  });
  assert.equal(wrongEmailRes.status, 401, 'Non-existent email must return HTTP 401 Unauthorized');

  // 9. Login: Suspended account rejection check
  await pool.query("UPDATE public.users SET account_status = 'suspended' WHERE email = $1", [
    testEmail.toLowerCase(),
  ]);
  const suspendedRes = await makeRequest('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  assert.equal(suspendedRes.status, 403, 'Suspended user must return HTTP 403 Forbidden');
  assert.match(suspendedRes.body.error, /suspended/i);

  // Restore account status to active
  await pool.query("UPDATE public.users SET account_status = 'active' WHERE email = $1", [
    testEmail.toLowerCase(),
  ]);

  // 10. Login: Successful authentication
  const loginRes = await makeRequest('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  assert.equal(loginRes.status, 200, 'Successful login must return HTTP 200 OK');
  assert.equal(loginRes.body.success, true);
  assert.ok(loginRes.body.token, 'Must return JWT token');
  assert.equal(loginRes.body.user.email, testEmail.toLowerCase());
  assert.equal(loginRes.body.user.password_hash, undefined, 'password_hash must NEVER be returned');

  // 11. Protected route verification with requireAuth
  const token = loginRes.body.token;

  // Protected route without token -> 401
  const unauthRes = await makeRequest('GET', '/api/auth/me');
  assert.equal(unauthRes.status, 401, 'Protected route without token must return HTTP 401');

  // Protected route with valid Bearer token -> 200
  const authRes = await makeRequest('GET', '/api/auth/me', undefined, {
    Authorization: `Bearer ${token}`,
  });
  assert.equal(authRes.status, 200, 'Protected route with valid Bearer token must return HTTP 200');
  assert.equal(authRes.body.user.email, testEmail.toLowerCase());

  // 12. Health check endpoint verification
  const healthRes = await makeRequest('GET', '/api/health');
  assert.equal(healthRes.status, 200, 'Health check must return HTTP 200');
  assert.equal(healthRes.body.database_connected, true, 'database_connected must be true');
  assert.equal(healthRes.body.database.connected, true);
  // Ensure no sensitive credentials in health check response
  const healthStr = JSON.stringify(healthRes.body);
  assert.ok(!healthStr.includes('password'), 'Database credentials must not be exposed in health response');
  assert.ok(!healthStr.includes('secret'), 'Secrets must not be exposed in health response');
});
