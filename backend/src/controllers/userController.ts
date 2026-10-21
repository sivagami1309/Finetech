import { Response } from 'express';
import { getDbPool } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class UserController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pool = await getDbPool();
      const result = await pool.query(
        'SELECT id, name, email, role, country, business_name, default_source_currency, default_destination_currency, wallet_address, created_at FROM users WHERE id = $1',
        [req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      res.json({ success: true, profile: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, businessName, walletAddress, defaultSourceCurrency, defaultDestinationCurrency } = req.body;
      const pool = await getDbPool();

      await pool.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             business_name = COALESCE($2, business_name),
             wallet_address = COALESCE($3, wallet_address),
             default_source_currency = COALESCE($4, default_source_currency),
             default_destination_currency = COALESCE($5, default_destination_currency),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [name, businessName, walletAddress, defaultSourceCurrency, defaultDestinationCurrency, req.user!.id]
      );

      const updated = await pool.query(
        'SELECT id, name, email, role, country, business_name, default_source_currency, default_destination_currency, wallet_address, updated_at FROM users WHERE id = $1',
        [req.user!.id]
      );

      res.json({
        success: true,
        message: 'Profile updated successfully.',
        profile: updated.rows[0],
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to update user profile.' });
    }
  }
}
