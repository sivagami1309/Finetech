import { Request, Response } from 'express';
import { getDbPool } from '../config/db';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { config } from '../config/env';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, country, businessName } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, error: 'Full name is required.' });
        return;
      }

      if (!email || !AuthService.validateEmail(email)) {
        res.status(400).json({ success: false, error: 'A valid email address is required.' });
        return;
      }

      if (!password || password.length < 8) {
        res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
        return;
      }

      const pool = await getDbPool();

      // Check duplicate registration
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
      if (existing.rows.length > 0) {
        res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
        return;
      }

      const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      const passwordHash = await AuthService.hashPassword(password);

      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, country, business_name, default_source_currency, default_destination_currency)
         VALUES ($1, $2, $3, $4, 'freelancer', $5, $6, 'USD', 'INR')`,
        [userId, name.trim(), email.trim().toLowerCase(), passwordHash, country || 'India', businessName || null]
      );

      // Audit log
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['aud_' + Date.now(), userId, 'USER_REGISTERED', 'users', userId, JSON.stringify({ email: email.trim().toLowerCase() })]
      );

      const token = AuthService.generateToken({
        id: userId,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: 'freelancer',
      });

      res.cookie('finguard_token', token, config.cookieSettings);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: 'freelancer',
          country: country || 'India',
          businessName: businessName || null,
          defaultSourceCurrency: 'USD',
          defaultDestinationCurrency: 'INR',
        },
      });
    } catch (err: any) {
      console.error('[Register Error]', err);
      res.status(500).json({ success: false, error: 'An unexpected error occurred during registration.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const pool = await getDbPool();
      const result = await pool.query(
        'SELECT id, name, email, password_hash, role, country, business_name, default_source_currency, default_destination_currency, wallet_address FROM users WHERE email = $1',
        [email.trim().toLowerCase()]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const user = result.rows[0];
      const passwordMatch = await AuthService.comparePassword(password, user.password_hash);

      if (!passwordMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const token = AuthService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      res.cookie('finguard_token', token, config.cookieSettings);

      // Audit log
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['aud_' + Date.now(), user.id, 'USER_LOGIN', 'users', user.id, JSON.stringify({ ip: req.ip })]
      );

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          country: user.country,
          businessName: user.business_name,
          defaultSourceCurrency: user.default_source_currency || 'USD',
          defaultDestinationCurrency: user.default_destination_currency || 'INR',
          walletAddress: user.wallet_address,
        },
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      res.status(500).json({ success: false, error: 'An unexpected error occurred during login.' });
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('finguard_token');
    res.json({ success: true, message: 'Logged out successfully.' });
  }

  public static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const pool = await getDbPool();
      const result = await pool.query(
        'SELECT id, name, email, role, country, business_name, default_source_currency, default_destination_currency, wallet_address, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'User profile not found.' });
        return;
      }

      const user = result.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          country: user.country,
          businessName: user.business_name,
          defaultSourceCurrency: user.default_source_currency || 'USD',
          defaultDestinationCurrency: user.default_destination_currency || 'INR',
          walletAddress: user.wallet_address,
          createdAt: user.created_at,
        },
      });
    } catch (err: any) {
      console.error('[Me Error]', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve user profile.' });
    }
  }
}
