import { Response } from 'express';
import { getDbPool } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { FeeCalculatorService } from '../services/feeCalculatorService';
import { TransactionStateMachine } from '../services/transactionService';

export class PaymentController {
  public static async createRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        clientName,
        clientEmail,
        clientCountry,
        invoiceNumber,
        projectTitle,
        description,
        sourceAmount,
        sourceCurrency = 'USD',
        destinationCurrency = 'INR',
      } = req.body;

      if (!clientName || !clientName.trim()) {
        res.status(400).json({ success: false, error: 'Client name is required.' });
        return;
      }

      if (!clientEmail || !clientEmail.trim()) {
        res.status(400).json({ success: false, error: 'Client email is required.' });
        return;
      }

      if (!projectTitle || !projectTitle.trim()) {
        res.status(400).json({ success: false, error: 'Project title or invoice description is required.' });
        return;
      }

      const numAmount = Number(sourceAmount);
      const validation = FeeCalculatorService.validateAmount(numAmount);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }

      const pool = await getDbPool();

      // 1. Calculate transparent fee quote
      const quoteData = FeeCalculatorService.calculateQuote({
        sourceAmount: numAmount,
        sourceCurrency,
        destinationCurrency,
      });

      const quoteId = 'qte_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      await pool.query(
        `INSERT INTO payment_quotes (
          id, user_id, source_currency, destination_currency, source_amount, exchange_rate,
          gross_destination_amount, service_fee_source, conversion_fee_destination,
          partner_fee_destination, total_fee_source_equivalent, estimated_recipient_amount,
          formula_description, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          quoteId,
          req.user!.id,
          quoteData.sourceCurrency,
          quoteData.destinationCurrency,
          quoteData.sourceAmount,
          quoteData.exchangeRate,
          quoteData.grossDestinationAmount,
          quoteData.serviceFeeSource,
          quoteData.conversionFeeDestination,
          quoteData.partnerFeeDestination,
          quoteData.totalFeeSourceEquivalent,
          quoteData.estimatedRecipientAmount,
          quoteData.formulaDescription,
          quoteData.expiresAt,
        ]
      );

      // 2. Create payment request record
      const requestId = 'req_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      await pool.query(
        `INSERT INTO payment_requests (
          id, user_id, quote_id, client_name, client_email, client_country, invoice_number,
          project_title, description, source_amount, source_currency, destination_currency, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'DRAFT')`,
        [
          requestId,
          req.user!.id,
          quoteId,
          clientName.trim(),
          clientEmail.trim(),
          clientCountry || 'United States',
          invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          projectTitle.trim(),
          description || '',
          quoteData.sourceAmount,
          quoteData.sourceCurrency,
          quoteData.destinationCurrency,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Payment request created and fee quote generated.',
        paymentRequest: {
          id: requestId,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientCountry: clientCountry || 'United States',
          invoiceNumber: invoiceNumber || null,
          projectTitle: projectTitle.trim(),
          sourceAmount: quoteData.sourceAmount,
          sourceCurrency: quoteData.sourceCurrency,
          destinationCurrency: quoteData.destinationCurrency,
          status: 'DRAFT',
          quote: quoteData,
        },
      });
    } catch (err: any) {
      console.error('[Create Payment Request Error]', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to create payment request.' });
    }
  }

  public static async listRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const pool = await getDbPool();
      const countRes = await pool.query(
        'SELECT COUNT(*) as total FROM payment_requests WHERE user_id = $1',
        [req.user!.id]
      );
      const total = parseInt(countRes.rows[0].total, 10) || 0;

      const result = await pool.query(
        `SELECT pr.*, pq.exchange_rate, pq.gross_destination_amount, pq.estimated_recipient_amount, pq.total_fee_source_equivalent
         FROM payment_requests pr
         LEFT JOIN payment_quotes pq ON pr.quote_id = pq.id
         WHERE pr.user_id = $1
         ORDER BY pr.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user!.id, limit, offset]
      );

      res.json({
        success: true,
        requests: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to list payment requests.' });
    }
  }

  public static async getRequestById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = await getDbPool();

      const result = await pool.query(
        `SELECT pr.*, pq.exchange_rate, pq.gross_destination_amount, pq.service_fee_source,
                pq.conversion_fee_destination, pq.partner_fee_destination, pq.total_fee_source_equivalent,
                pq.estimated_recipient_amount, pq.formula_description, pq.expires_at as quote_expires_at
         FROM payment_requests pr
         LEFT JOIN payment_quotes pq ON pr.quote_id = pq.id
         WHERE pr.id = $1 AND pr.user_id = $2`,
        [id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Payment request not found.' });
        return;
      }

      res.json({ success: true, paymentRequest: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to retrieve payment request.' });
    }
  }

  public static async getQuote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sourceAmount, sourceCurrency = 'USD', destinationCurrency = 'INR' } = req.body;
      const quote = FeeCalculatorService.calculateQuote({
        sourceAmount: Number(sourceAmount),
        sourceCurrency,
        destinationCurrency,
      });

      res.json({ success: true, quote });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to calculate quote.' });
    }
  }

  public static async confirmRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = await getDbPool();

      // Retrieve payment request
      const reqRes = await pool.query(
        `SELECT pr.*, pq.gross_destination_amount, pq.estimated_recipient_amount, pq.exchange_rate, pq.total_fee_source_equivalent
         FROM payment_requests pr
         JOIN payment_quotes pq ON pr.quote_id = pq.id
         WHERE pr.id = $1 AND pr.user_id = $2`,
        [id, req.user!.id]
      );

      if (reqRes.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Payment request or associated quote not found.' });
        return;
      }

      const pReq = reqRes.rows[0];

      // Generate reference code
      const refCode = TransactionStateMachine.generateReferenceCode(pReq.source_currency, pReq.destination_currency);
      const txId = 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      // Begin transaction record
      await pool.query(
        `UPDATE payment_requests SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );

      await pool.query(
        `INSERT INTO transactions (
          id, payment_request_id, user_id, reference_code, source_amount, source_currency,
          destination_amount, destination_currency, exchange_rate, total_fees, status,
          payment_method, recipient_beneficiary_name, recipient_account_hint
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', $11, $12, $13)`,
        [
          txId,
          id,
          req.user!.id,
          refCode,
          pReq.source_amount,
          pReq.source_currency,
          pReq.estimated_recipient_amount,
          pReq.destination_currency,
          pReq.exchange_rate,
          pReq.total_fee_source_equivalent,
          'Cross-Border Wire (Simulated)',
          req.user!.name,
          'HDFC Bank - ••••4821',
        ]
      );

      // Status history entry
      await pool.query(
        `INSERT INTO transaction_status_history (
          id, transaction_id, from_status, to_status, actor_id, actor_role, reason, is_simulated
        ) VALUES ($1, $2, 'DRAFT', 'PENDING', $3, 'freelancer', 'Payment request verified and confirmed by user', TRUE)`,
        ['tsh_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5), txId, req.user!.id]
      );

      res.status(201).json({
        success: true,
        message: 'Payment request confirmed. Transaction created in PENDING state.',
        transaction: {
          id: txId,
          paymentRequestId: id,
          referenceCode: refCode,
          status: 'PENDING',
          sourceAmount: pReq.source_amount,
          sourceCurrency: pReq.source_currency,
          destinationAmount: pReq.estimated_recipient_amount,
          destinationCurrency: pReq.destination_currency,
          exchangeRate: pReq.exchange_rate,
          totalFees: pReq.total_fee_source_equivalent,
        },
      });
    } catch (err: any) {
      console.error('[Confirm Payment Request Error]', err);
      res.status(500).json({ success: false, error: 'Failed to confirm payment request.' });
    }
  }
}
