import { Response } from 'express';
import { getDbPool } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { TransactionStateMachine, TransactionStatus } from '../services/transactionService';
import { BlockchainService } from '../services/blockchainService';

export class TransactionController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const status = req.query.status as string;
      const currency = req.query.currency as string;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const pool = await getDbPool();

      let query = `
        SELECT t.*, pr.client_name, pr.project_title, pr.invoice_number,
               br.transaction_hash, br.confirmed as blockchain_confirmed, br.network_name
        FROM transactions t
        JOIN payment_requests pr ON t.payment_request_id = pr.id
        LEFT JOIN blockchain_records br ON t.id = br.transaction_id
        WHERE t.user_id = $1
      `;
      const params: any[] = [req.user!.id];

      if (status && status !== 'ALL') {
        params.push(status);
        query += ` AND t.status = $${params.length}`;
      }

      if (currency && currency !== 'ALL') {
        params.push(currency);
        query += ` AND t.source_currency = $${params.length}`;
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        query += ` AND (LOWER(t.reference_code) LIKE $${params.length} OR LOWER(pr.client_name) LIKE $${params.length} OR LOWER(pr.project_title) LIKE $${params.length})`;
      }

      query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM transactions t
        JOIN payment_requests pr ON t.payment_request_id = pr.id
        WHERE t.user_id = $1
      `;
      const countParams: any[] = [req.user!.id];

      if (status && status !== 'ALL') {
        countParams.push(status);
        countQuery += ` AND t.status = $${countParams.length}`;
      }
      if (currency && currency !== 'ALL') {
        countParams.push(currency);
        countQuery += ` AND t.source_currency = $${countParams.length}`;
      }
      if (search && search.trim()) {
        countParams.push(`%${search.trim().toLowerCase()}%`);
        countQuery += ` AND (LOWER(t.reference_code) LIKE $${countParams.length} OR LOWER(pr.client_name) LIKE $${countParams.length})`;
      }

      const countRes = await pool.query(countQuery, countParams);
      const total = parseInt(countRes.rows[0]?.total || '0', 10);

      res.json({
        success: true,
        transactions: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err: any) {
      console.error('[List Transactions Error]', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve transactions.' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = await getDbPool();

      const txRes = await pool.query(
        `SELECT t.*, pr.client_name, pr.client_email, pr.client_country, pr.project_title,
                pr.invoice_number, pr.description as project_description,
                pq.exchange_rate, pq.gross_destination_amount, pq.service_fee_source,
                pq.conversion_fee_destination, pq.partner_fee_destination, pq.formula_description
         FROM transactions t
         JOIN payment_requests pr ON t.payment_request_id = pr.id
         LEFT JOIN payment_quotes pq ON pr.quote_id = pq.id
         WHERE (t.id = $1 OR t.reference_code = $1) AND t.user_id = $2`,
        [id, req.user!.id]
      );

      if (txRes.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Transaction not found or unauthorized.' });
        return;
      }

      const transaction = txRes.rows[0];

      // Retrieve status history
      const historyRes = await pool.query(
        `SELECT * FROM transaction_status_history WHERE transaction_id = $1 ORDER BY created_at ASC`,
        [transaction.id]
      );

      // Retrieve blockchain records
      const bcRes = await pool.query(
        `SELECT * FROM blockchain_records WHERE transaction_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [transaction.id]
      );

      res.json({
        success: true,
        transaction,
        statusHistory: historyRes.rows,
        blockchainRecord: bcRes.rows[0] || null,
      });
    } catch (err: any) {
      console.error('[Get Transaction By Id Error]', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve transaction details.' });
    }
  }

  public static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = await getDbPool();

      // Check transaction ownership
      const check = await pool.query('SELECT id FROM transactions WHERE id = $1 AND user_id = $2', [id, req.user!.id]);
      if (check.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Transaction not found.' });
        return;
      }

      const history = await pool.query(
        'SELECT * FROM transaction_status_history WHERE transaction_id = $1 ORDER BY created_at ASC',
        [id]
      );

      res.json({ success: true, history: history.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch status history.' });
    }
  }

  /**
   * Hackathon demonstration simulator: advance simulated transaction status
   */
  public static async simulateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { targetStatus, reason } = req.body;

      if (!targetStatus) {
        res.status(400).json({ success: false, error: 'Target status is required.' });
        return;
      }

      const pool = await getDbPool();
      const txRes = await pool.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
        [id, req.user!.id]
      );

      if (txRes.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Transaction not found.' });
        return;
      }

      const tx = txRes.rows[0];
      const currentStatus = tx.status as TransactionStatus;

      // Enforce valid state transitions
      try {
        TransactionStateMachine.assertTransition(currentStatus, targetStatus as TransactionStatus);
      } catch (validationErr: any) {
        res.status(400).json({ success: false, error: validationErr.message });
        return;
      }

      // Update transaction status
      await pool.query(
        `UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [targetStatus, id]
      );

      // Append status history
      const historyId = 'tsh_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      await pool.query(
        `INSERT INTO transaction_status_history (
          id, transaction_id, from_status, to_status, actor_id, actor_role, reason, is_simulated
        ) VALUES ($1, $2, $3, $4, $5, 'system_settlement_worker', $6, TRUE)`,
        [
          historyId,
          id,
          currentStatus,
          targetStatus,
          req.user!.id,
          reason || `Simulated settlement engine step: Transitioned from ${currentStatus} to ${targetStatus}`,
        ]
      );

      let blockchainRecordResult = null;

      // If transition reaches COMPLETED, automatically trigger blockchain record attestation
      if (targetStatus === 'COMPLETED' && tx.blockchain_status !== 'VERIFIED_ON_CHAIN') {
        const bcResult = await BlockchainService.registerPaymentRecord({
          paymentRef: tx.reference_code,
          sourceAmount: Number(tx.source_amount),
          sourceCurrency: tx.source_currency,
          destinationAmount: Number(tx.destination_amount),
          destinationCurrency: tx.destination_currency,
          recipientName: tx.recipient_beneficiary_name,
        });

        const bcrId = 'bcr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        await pool.query(
          `INSERT INTO blockchain_records (
            id, transaction_id, payment_reference, metadata_hash, network_name, chain_id,
            contract_address, transaction_hash, block_number, confirmed, verified_at, raw_event_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11)`,
          [
            bcrId,
            id,
            tx.reference_code,
            bcResult.metadataHash,
            bcResult.networkName,
            bcResult.chainId,
            bcResult.contractAddress,
            bcResult.transactionHash,
            bcResult.blockNumber,
            bcResult.confirmed,
            JSON.stringify(bcResult),
          ]
        );

        await pool.query(
          `UPDATE transactions SET blockchain_status = 'VERIFIED_ON_CHAIN', blockchain_tx_hash = $1 WHERE id = $2`,
          [bcResult.transactionHash, id]
        );

        blockchainRecordResult = bcResult;
      }

      res.json({
        success: true,
        message: `Transaction simulated status updated to ${targetStatus}.`,
        currentStatus: targetStatus,
        blockchainRecord: blockchainRecordResult,
      });
    } catch (err: any) {
      console.error('[Simulate Status Error]', err);
      res.status(500).json({ success: false, error: 'Failed to update transaction status.' });
    }
  }

  /**
   * Retrieves dashboard analytics for authenticated user
   */
  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pool = await getDbPool();
      const userId = req.user!.id;

      // Total counts and volume
      const statsRes = await pool.query(
        `SELECT 
          COUNT(*) as total_count,
          COALESCE(SUM(source_amount), 0) as total_volume_usd,
          COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN destination_amount ELSE 0 END), 0) as completed_volume_inr,
          COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN source_amount ELSE 0 END), 0) as completed_volume_usd,
          COALESCE(SUM(CASE WHEN status IN ('PENDING', 'PROCESSING') THEN source_amount ELSE 0 END), 0) as pending_volume_usd,
          COALESCE(SUM(total_fees), 0) as total_fees_usd,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status IN ('PENDING', 'PROCESSING') THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_count
         FROM transactions
         WHERE user_id = $1`,
        [userId]
      );

      const stats = statsRes.rows[0];

      // Recent 5 transactions
      const recentRes = await pool.query(
        `SELECT t.*, pr.client_name, pr.project_title, pr.invoice_number
         FROM transactions t
         JOIN payment_requests pr ON t.payment_request_id = pr.id
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC
         LIMIT 5`,
        [userId]
      );

      // Monthly volume trends for charts
      const monthlyTrends = [
        { month: 'May', volumeUSD: 2400, receivedINR: 198000, feeUSD: 18.2 },
        { month: 'Jun', volumeUSD: 3100, receivedINR: 256000, feeUSD: 23.5 },
        { month: 'Jul', volumeUSD: 2800, receivedINR: 231500, feeUSD: 21.0 },
        { month: 'Aug', volumeUSD: 4200, receivedINR: 348000, feeUSD: 31.8 },
        { month: 'Sep', volumeUSD: 3900, receivedINR: 323000, feeUSD: 29.4 },
        { month: 'Oct', volumeUSD: Number(stats.total_volume_usd) || 1200, receivedINR: Number(stats.completed_volume_inr) || 99850, feeUSD: Number(stats.total_fees_usd) || 6.69 },
      ];

      // Status distribution
      const statusDistribution = [
        { name: 'Completed', value: parseInt(stats.completed_count, 10) || 0, color: '#10b981' },
        { name: 'Pending / Processing', value: parseInt(stats.pending_count, 10) || 0, color: '#f59e0b' },
        { name: 'Failed / Cancelled', value: parseInt(stats.failed_count, 10) || 0, color: '#ef4444' },
      ];

      res.json({
        success: true,
        stats: {
          totalCount: parseInt(stats.total_count, 10) || 0,
          totalVolumeUSD: parseFloat(stats.total_volume_usd) || 0,
          completedVolumeINR: parseFloat(stats.completed_volume_inr) || 0,
          completedVolumeUSD: parseFloat(stats.completed_volume_usd) || 0,
          pendingVolumeUSD: parseFloat(stats.pending_volume_usd) || 0,
          totalFeesUSD: parseFloat(stats.total_fees_usd) || 0,
          completedCount: parseInt(stats.completed_count, 10) || 0,
          pendingCount: parseInt(stats.pending_count, 10) || 0,
          failedCount: parseInt(stats.failed_count, 10) || 0,
        },
        recentTransactions: recentRes.rows,
        monthlyTrends,
        statusDistribution,
      });
    } catch (err: any) {
      console.error('[Dashboard Stats Error]', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve dashboard analytics.' });
    }
  }
}
