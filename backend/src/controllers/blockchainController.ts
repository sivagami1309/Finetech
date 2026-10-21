import { Request, Response } from 'express';
import { getDbPool } from '../config/db';
import { BlockchainService } from '../services/blockchainService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class BlockchainController {
  /**
   * Registers a payment record onto Polygon Amoy
   */
  public static async registerRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { transactionId, paymentRef, sourceAmount, sourceCurrency, destinationAmount, destinationCurrency, recipientName } = req.body;

      if (!paymentRef) {
        res.status(400).json({ success: false, error: 'Payment reference is required.' });
        return;
      }

      const result = await BlockchainService.registerPaymentRecord({
        paymentRef,
        sourceAmount: Number(sourceAmount) || 100,
        sourceCurrency: sourceCurrency || 'USD',
        destinationAmount: Number(destinationAmount) || 8350,
        destinationCurrency: destinationCurrency || 'INR',
        recipientName: recipientName || 'Freelancer',
      });

      if (transactionId) {
        const pool = await getDbPool();
        const bcrId = 'bcr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        await pool.query(
          `INSERT INTO blockchain_records (
            id, transaction_id, payment_reference, metadata_hash, network_name, chain_id,
            contract_address, transaction_hash, block_number, confirmed, verified_at, raw_event_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11)`,
          [
            bcrId,
            transactionId,
            paymentRef,
            result.metadataHash,
            result.networkName,
            result.chainId,
            result.contractAddress,
            result.transactionHash,
            result.blockNumber,
            result.confirmed,
            JSON.stringify(result),
          ]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Blockchain payment reference recorded.',
        record: result,
      });
    } catch (err: any) {
      console.error('[Blockchain Register Error]', err);
      res.status(500).json({ success: false, error: 'Failed to record on blockchain.' });
    }
  }

  /**
   * Retrieves stored blockchain record by ID or Transaction ID
   */
  public static async getRecordById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = await getDbPool();

      const result = await pool.query(
        `SELECT * FROM blockchain_records WHERE id = $1 OR transaction_id = $1 OR payment_reference = $1 LIMIT 1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Blockchain record not found.' });
        return;
      }

      res.json({ success: true, record: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to retrieve blockchain record.' });
    }
  }

  /**
   * Verifies a transaction hash or payment reference on Polygon Amoy
   */
  public static async verifyTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionHash } = req.params;
      const pool = await getDbPool();

      // Check database for matching transaction hash or payment reference
      const dbMatch = await pool.query(
        `SELECT br.*, t.source_amount, t.source_currency, t.destination_amount, t.destination_currency,
                t.recipient_beneficiary_name, t.status as payment_status
         FROM blockchain_records br
         JOIN transactions t ON br.transaction_id = t.id
         WHERE br.transaction_hash = $1 OR br.payment_reference = $1
         LIMIT 1`,
        [transactionHash]
      );

      let paymentRef = transactionHash;
      let existingRecord = null;

      if (dbMatch.rows.length > 0) {
        existingRecord = dbMatch.rows[0];
        paymentRef = existingRecord.payment_reference;
      }

      const verification = await BlockchainService.verifyRecord(paymentRef, transactionHash);

      res.json({
        success: true,
        verification: {
          ...verification,
          transactionData: existingRecord,
        },
      });
    } catch (err: any) {
      console.error('[Verify Transaction Error]', err);
      res.status(500).json({ success: false, error: 'Failed to verify blockchain transaction.' });
    }
  }
}
