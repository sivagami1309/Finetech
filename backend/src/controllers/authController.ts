import { Request, Response } from 'express';
import { getDbPool } from '../config/db';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { config } from '../config/env';

export class AuthController {
  /**
   * POST /api/auth/register
   * Inserts into public.users: full_name, email, password_hash, role='user', account_status='active'
   */
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { full_name, name, email, password, phone_number } = req.body;

      // Accept full_name or name
      const resolvedName = (full_name || name || '').trim();

      if (!resolvedName) {
        res.status(400).json({ success: false, error: 'Full name is required.' });
        return;
      }

      if (resolvedName.length < 2 || resolvedName.length > 150) {
        res.status(400).json({ success: false, error: 'Full name must be between 2 and 150 characters.' });
        return;
      }

      if (!email || typeof email !== 'string') {
        res.status(400).json({ success: false, error: 'A valid email address is required.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!AuthService.validateEmail(normalizedEmail)) {
        res.status(400).json({ success: false, error: 'Invalid email address format.' });
        return;
      }

      if (!password || typeof password !== 'string') {
        res.status(400).json({ success: false, error: 'Password is required.' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
        return;
      }

      const pool = await getDbPool();

      // Check duplicate registration
      const existing = await pool.query(
        'SELECT id FROM public.users WHERE email = $1',
        [normalizedEmail]
      );

      if (existing.rows.length > 0) {
        res.status(409).json({
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.',
        });
        return;
      }

      // Hash password using bcrypt
      const passwordHash = await AuthService.hashPassword(password);

      // Parameterized INSERT into public.users
      const insertResult = await pool.query(
        `INSERT INTO public.users (
          full_name,
          email,
          password_hash,
          phone_number,
          role,
          account_status,
          email_verified
        ) VALUES ($1, $2, $3, $4, 'user', 'active', FALSE)
        RETURNING id, full_name, email, role, account_status, email_verified, created_at`,
        [resolvedName, normalizedEmail, passwordHash, phone_number || null]
      );

      const newUser = insertResult.rows[0];

      // Audit log
      try {
        await pool.query(
          `INSERT INTO public.audit_logs (id, user_id, action, resource_type, resource_id, details)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'aud_' + Date.now(),
            newUser.id,
            'USER_REGISTERED',
            'users',
            String(newUser.id),
            JSON.stringify({ email: normalizedEmail }),
          ]
        );
      } catch (auditErr) {
        // Non-blocking audit log
      }

      // Generate signed JWT token
      const token = AuthService.generateToken({
        id: String(newUser.id),
        email: newUser.email,
        name: newUser.full_name,
        role: newUser.role,
      });

      // Secure HTTP-only cookie
      res.cookie('finguard_token', token, config.cookieSettings);

      // Return safe response (NEVER return password_hash)
      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          name: newUser.full_name, // alias for frontend backward compatibility
          email: newUser.email,
          role: newUser.role,
          account_status: newUser.account_status,
          email_verified: newUser.email_verified,
          created_at: newUser.created_at,
        },
      });
    } catch (err: any) {
      console.error('[Register Error]', err.message);
      if (err.code === '23505' || err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
        res.status(409).json({ success: false, error: 'An account with this email address already exists. Please sign in instead.' });
        return;
      }
      res.status(500).json({ success: false, error: 'An unexpected database error occurred during registration.' });
    }
  }

  /**
   * POST /api/auth/login
   * Validates credentials against public.users with bcrypt, checks account_status
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const pool = await getDbPool();

      // Parameterized query finding account by email
      const result = await pool.query(
        `SELECT id, full_name, email, password_hash, role, account_status, email_verified, created_at
         FROM public.users
         WHERE email = $1`,
        [normalizedEmail]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const user = result.rows[0];

      // Reject suspended or closed accounts
      if (user.account_status && user.account_status !== 'active') {
        res.status(403).json({
          success: false,
          error: `Your account is currently ${user.account_status}. Please contact support for assistance.`,
        });
        return;
      }

      // Verify password with bcrypt
      const passwordMatch = await AuthService.comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      // Issue JWT
      const token = AuthService.generateToken({
        id: String(user.id),
        email: user.email,
        name: user.full_name,
        role: user.role,
      });

      res.cookie('finguard_token', token, config.cookieSettings);

      // Audit log
      try {
        await pool.query(
          `INSERT INTO public.audit_logs (id, user_id, action, resource_type, resource_id, details)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'aud_' + Date.now(),
            user.id,
            'USER_LOGIN',
            'users',
            String(user.id),
            JSON.stringify({ ip: req.ip }),
          ]
        );
      } catch (auditErr) {
        // Non-blocking audit log
      }

      // Return safe response (NEVER return password_hash)
      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          name: user.full_name, // alias for frontend backward compatibility
          email: user.email,
          role: user.role,
          account_status: user.account_status,
          email_verified: user.email_verified,
          created_at: user.created_at,
        },
      });
    } catch (err: any) {
      console.error('[Login Error]', err.message);
      res.status(500).json({ success: false, error: 'An unexpected database error occurred during login.' });
    }
  }

  /**
   * POST /api/auth/logout
   */
  public static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('finguard_token');
    res.json({ success: true, message: 'Logged out successfully.' });
  }

  /**
   * GET /api/auth/me
   */
  public static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const pool = await getDbPool();
      const result = await pool.query(
        `SELECT id, full_name, email, role, phone_number, account_status, email_verified, created_at
         FROM public.users
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'User account not found.' });
        return;
      }

      const user = result.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          name: user.full_name,
          email: user.email,
          role: user.role,
          phone_number: user.phone_number,
          account_status: user.account_status,
          email_verified: user.email_verified,
          created_at: user.created_at,
        },
      });
    } catch (err: any) {
      console.error('[Me Error]', err.message);
      res.status(500).json({ success: false, error: 'Failed to retrieve user profile.' });
    }
  }
}
