import { Router } from 'express';
import { BlockchainController } from '../controllers/blockchainController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/records', requireAuth, BlockchainController.registerRecord);
router.get('/records/:id', BlockchainController.getRecordById);
router.get('/verify/:transactionHash', BlockchainController.verifyTransaction);

export default router;
